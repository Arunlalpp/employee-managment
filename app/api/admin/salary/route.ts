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

export async function GET(req: Request) {
    try {
        const auth = await requireAdmin();
        if (auth.error) return auth.error;

        const { searchParams } = new URL(req.url);
        const month = searchParams.get("month");

        if (!month) {
            return NextResponse.json(
                { error: "Month required" },
                { status: 400 }
            );
        }

        const [y, m] = month.split("-");
        const monthStart = `${y}-${m}-01`;
        const monthEnd = `${y}-${m}-${new Date(Number(y), Number(m), 0).getDate()}`;

        const [staffRes, advancesRes, attendanceRes] = await Promise.all([
            supabaseAdmin.from("profiles").select("*").eq("role", "staff"),
            supabaseAdmin
                .from("advances")
                .select("*")
                .gte("date", monthStart)
                .lte("date", monthEnd),
            supabaseAdmin
                .from("attendance")
                .select("*")
                .gte("date", monthStart)
                .lte("date", monthEnd),
        ]);

        const staff = staffRes.data || [];
        const advances = advancesRes.data || [];
        const attendance = attendanceRes.data || [];

        const salaryData = staff.map((item) => {
            const staffAttendance = attendance.filter(
                (a) => a.staff_id === item.id
            );
            const daysPresent = staffAttendance.filter(
                (d) => d.is_present
            ).length;

            // Use stored allowance_earned rather than recalculating
            const allowance = staffAttendance.reduce(
                (sum, a) => sum + Number(a.allowance_earned || 0),
                0
            );

            const staffAdvances = advances.filter(
                (a) => a.staff_id === item.id
            );
            const advanceDeduction = staffAdvances.reduce(
                (sum, a) => sum + Number(a.amount),
                0
            );

            const netSalary =
                Number(item.salary || 0) + allowance - advanceDeduction;

            return {
                ...item,
                daysPresent,
                allowance,
                advanceDeduction,
                netSalary,
                advances: staffAdvances,
            };
        });

        const totalPayroll = salaryData.reduce(
            (sum, item) => sum + item.netSalary,
            0
        );

        return NextResponse.json({ salaryData, totalPayroll });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to load salary" },
            { status: 500 }
        );
    }
}
