export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase-server";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function requireAdmin() {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
    const { data: profile } = await supabaseAdmin.from("profiles").select("role").eq("auth_id", user.id).single();
    if (!profile || profile.role !== "admin") return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
    return {};
}

function calculateOvertimeBonus(attendance: any[]) {
    return attendance.reduce((sum, a) => {
        if (a.check_out && a.check_out > "22:30") return sum + 50;
        return sum;
    }, 0);
}

export async function GET() {
    try {
        const auth = await requireAdmin();
        if (auth.error) return auth.error;

        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        const day = now.getDate();

        const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
        const endDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        const [staffRes, attendanceRes, sessionsRes, advancesRes, dailySalesRes] = await Promise.all([
            supabaseAdmin.from("profiles").select("id, name, salary").eq("role", "staff"),

            supabaseAdmin
                .from("attendance")
                .select("staff_id, date, is_present, allowance_earned, check_out")
                .gte("date", startDate)
                .lte("date", endDate),

            supabaseAdmin
                .from("attendance_sessions")
                .select("staff_id, attendance_date")
                .gte("attendance_date", startDate)
                .lte("attendance_date", endDate),

            supabaseAdmin
                .from("advances")
                .select("staff_id, amount")
                .gte("date", startDate)
                .lte("date", endDate),

            supabaseAdmin
                .from("daily_sales")
                .select("date, total_sales, notes")
                .gte("date", startDate)
                .lte("date", endDate)
                .order("date", { ascending: true }),
        ]);

        const staff = staffRes.data || [];
        const attendance = attendanceRes.data || [];
        const sessions = sessionsRes.data || [];
        const advances = advancesRes.data || [];
        const dailySales = dailySalesRes.data || [];

        // Per-staff maps
        const attendanceMap = new Map<string, any[]>();
        for (const a of attendance) {
            if (!attendanceMap.has(a.staff_id)) attendanceMap.set(a.staff_id, []);
            attendanceMap.get(a.staff_id)!.push(a);
        }
        const sessionDaysMap = new Map<string, Set<string>>();
        for (const s of sessions) {
            if (!sessionDaysMap.has(s.staff_id)) sessionDaysMap.set(s.staff_id, new Set());
            sessionDaysMap.get(s.staff_id)!.add(s.attendance_date);
        }
        const advancesMap = new Map<string, number>();
        for (const a of advances) {
            advancesMap.set(a.staff_id, (advancesMap.get(a.staff_id) || 0) + Number(a.amount || 0));
        }

        const DAILY_ALLOWANCE = 40;

        const staffWithCalcs = staff.map((s: any) => {
            const staffAtt = attendanceMap.get(s.id) || [];
            const sessionDays = sessionDaysMap.get(s.id) || new Set<string>();
            const manualPresentDates = new Set(staffAtt.filter((a) => a.is_present).map((a) => a.date));
            const allPresentDates = new Set([...Array.from(manualPresentDates), ...Array.from(sessionDays)]);
            const presentDays = allPresentDates.size;
            const allowanceFromRecords = staffAtt.reduce((sum, a) => sum + (a.allowance_earned || 0), 0);
            const sessionOnlyDays = Array.from(sessionDays).filter((d) => !manualPresentDates.has(d)).length;
            const allowance = allowanceFromRecords + sessionOnlyDays * DAILY_ALLOWANCE;
            const overtimeBonus = calculateOvertimeBonus(staffAtt);
            const advanceTotal = advancesMap.get(s.id) || 0;
            const baseSalary = Number(s.salary || 0);
            const netSalary = baseSalary + allowance + overtimeBonus - advanceTotal;

            return { id: s.id, name: s.name, salary: s.salary, presentDays, allowance, overtimeBonus, advanceTotal, netSalary };
        });

        // Daily breakdown: only count admin-verified attendance records (is_present = true)
        // Sessions are used for per-staff salary but not for the daily overview count
        const dailyAttendanceMap = new Map<string, { presentCount: number; cost: number }>();
        for (const a of attendance) {
            if (!a.is_present) continue;
            const existing = dailyAttendanceMap.get(a.date) || { presentCount: 0, cost: 0 };
            dailyAttendanceMap.set(a.date, {
                presentCount: existing.presentCount + 1,
                cost: existing.cost + Number(a.allowance_earned || DAILY_ALLOWANCE),
            });
        }

        // Merge with daily sales
        const salesMap = new Map(dailySales.map((s) => [s.date, s]));
        const allDates = new Set([...Array.from(dailyAttendanceMap.keys()), ...Array.from(salesMap.keys())]);
        const dailyBreakdown = Array.from(allDates).sort().map((date) => {
            const att = dailyAttendanceMap.get(date) || { presentCount: 0, cost: 0 };
            const sale = salesMap.get(date);
            const revenue = sale ? Number(sale.total_sales) : null;
            return {
                date,
                presentCount: att.presentCount,
                staffCost: att.cost,
                revenue,
                netProfit: revenue !== null ? revenue - att.cost : null,
                notes: sale?.notes || null,
            };
        }).reverse(); // most recent first

        // Monthly totals
        const totalRevenue = dailySales.reduce((s, r) => s + Number(r.total_sales), 0);
        const totalStaffCost = staffWithCalcs.reduce((s, st) => s + st.allowance, 0);
        const totalNetProfit = totalRevenue - totalStaffCost;

        return NextResponse.json({
            staff: staffWithCalcs,
            dailyBreakdown,
            summary: { totalRevenue, totalStaffCost, totalNetProfit, month, year },
        });
    } catch (error) {
        console.error("[reports] GET error:", error);
        return NextResponse.json({ error: "Failed to load reports" }, { status: 500 });
    }
}
