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

    if (!user) {
        return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
    }

    const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("role")
        .eq("auth_id", user.id)
        .single();

    if (!profile || profile.role !== "admin") {
        return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
    }

    return {};
}

function calculateOvertimeBonus(attendance: any[]) {
    return attendance.reduce((sum: number, a: any) => {
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

        const [reportRes, staffRes, attendanceRes, sessionsRes, advancesRes, trendRes] =
            await Promise.all([
                // Current month's report only — bonus must match the month being displayed
                supabaseAdmin
                    .from("monthly_store_reports")
                    .select("id, month, year, profit_amount, bonus_per_staff")
                    .eq("month", month)
                    .eq("year", year)
                    .maybeSingle(),

                supabaseAdmin
                    .from("profiles")
                    .select("id, name, salary")
                    .eq("role", "staff"),

                // Manual attendance records saved by admin
                supabaseAdmin
                    .from("attendance")
                    .select("staff_id, date, is_present, allowance_earned, check_out")
                    .gte("date", startDate)
                    .lte("date", endDate),

                // Session-based check-ins (staff self check-in)
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

                // Last 12 months trend
                supabaseAdmin
                    .from("monthly_store_reports")
                    .select("month, year, profit_amount")
                    .gte("year", year - 1)
                    .order("year", { ascending: true })
                    .order("month", { ascending: true })
                    .limit(12),
            ]);

        const reportData = reportRes.data;
        const staff = staffRes.data || [];
        const attendance = attendanceRes.data || [];
        const sessions = sessionsRes.data || [];
        const advances = advancesRes.data || [];
        const reports = trendRes.data || [];

        // Build attendance map from manual records
        const attendanceMap = new Map<string, any[]>();
        for (const a of attendance) {
            if (!attendanceMap.has(a.staff_id)) attendanceMap.set(a.staff_id, []);
            attendanceMap.get(a.staff_id)!.push(a);
        }

        // Build session day sets per staff (unique dates from session check-ins)
        const sessionDaysMap = new Map<string, Set<string>>();
        for (const s of sessions) {
            if (!sessionDaysMap.has(s.staff_id)) sessionDaysMap.set(s.staff_id, new Set());
            sessionDaysMap.get(s.staff_id)!.add(s.attendance_date);
        }

        const advancesMap = new Map<string, any[]>();
        for (const a of advances) {
            if (!advancesMap.has(a.staff_id)) advancesMap.set(a.staff_id, []);
            advancesMap.get(a.staff_id)!.push(a);
        }

        const bonusPerStaff = reportData?.bonus_per_staff || 0;
        const DAILY_ALLOWANCE = 40;

        const staffWithCalcs = staff.map((s: any) => {
            const staffAtt = attendanceMap.get(s.id) || [];
            const staffAdv = advancesMap.get(s.id) || [];
            const sessionDays = sessionDaysMap.get(s.id) || new Set<string>();

            // Union of days present: manual attendance records + session-based days
            const manualPresentDates = new Set(
                staffAtt.filter((a: any) => a.is_present).map((a: any) => a.date)
            );
            const allPresentDates = new Set([...Array.from(manualPresentDates), ...Array.from(sessionDays)]);
            const presentDays = allPresentDates.size;

            // Use stored allowance_earned when available, fall back to session count × daily rate
            const allowanceFromRecords = staffAtt.reduce(
                (sum: number, a: any) => sum + (a.allowance_earned || 0),
                0
            );
            const sessionOnlyDays = Array.from(sessionDays).filter(
                (d) => !manualPresentDates.has(d)
            ).length;
            const allowance = allowanceFromRecords + sessionOnlyDays * DAILY_ALLOWANCE;

            const overtimeBonus = calculateOvertimeBonus(staffAtt);
            const advanceTotal = staffAdv.reduce(
                (sum: number, a: any) => sum + Number(a.amount || 0),
                0
            );
            const baseSalary = Number(s.salary || 0);
            const netSalary =
                baseSalary + allowance + overtimeBonus + bonusPerStaff - advanceTotal;

            return {
                id: s.id,
                name: s.name,
                salary: s.salary,
                presentDays,
                allowance,
                overtimeBonus,
                advanceTotal,
                profitBonus: bonusPerStaff,
                netSalary,
            };
        });

        const trendData = reports.map((r: any) => ({
            month: new Date(r.year, r.month - 1, 1).toLocaleString("en-US", {
                month: "short",
            }),
            profit: r.profit_amount || 0,
        }));

        return NextResponse.json({
            report: reportData || null,
            staff: staffWithCalcs,
            trendData,
        });
    } catch (error) {
        console.error("[reports] GET error:", error);
        return NextResponse.json(
            { error: "Failed to load reports" },
            { status: 500 }
        );
    }
}
