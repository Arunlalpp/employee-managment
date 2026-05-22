import { NextResponse }
    from "next/server";
import { createServerSupabaseClient }
    from "@/lib/supabase-server";

async function requireAdmin() {
    const supabase =
        await createServerSupabaseClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return {
            supabase,
            error: NextResponse.json(
                {
                    error:
                        "Unauthorized",
                },
                {
                    status: 401,
                }
            ),
        };
    }

    const { data: profile } =
        await supabase
            .from("profiles")
            .select("*")
            .eq("auth_id", user.id)
            .single();

    if (
        !profile ||
        profile.role !== "admin"
    ) {
        return {
            supabase,
            error: NextResponse.json(
                {
                    error:
                        "Forbidden",
                },
                {
                    status: 403,
                }
            ),
        };
    }

    return {
        supabase,
        profile,
    };
}

export async function GET() {
    try {
        const auth =
            await requireAdmin();

        if (auth.error) {
            return auth.error;
        }

        const today =
            new Date()
                .toISOString()
                .split("T")[0];

        const [
            staffRes,
            attendanceRes,
            advancesRes,
            deductionsRes,
        ] = await Promise.all([
            auth.supabase
                .from("profiles")
                .select("*")
                .eq("role", "staff"),

            auth.supabase
                .from("attendance")
                .select("*")
                .eq("date", today)
                .eq(
                    "is_present",
                    true
                ),

            auth.supabase
                .from("advances")
                .select("*"),

            auth.supabase
                .from("deductions")
                .select("*"),
        ]);

        if (
            staffRes.error ||
            attendanceRes.error ||
            advancesRes.error ||
            deductionsRes.error
        ) {
            return NextResponse.json(
                {
                    error:
                        staffRes.error?.message ||
                        attendanceRes.error?.message ||
                        advancesRes.error?.message ||
                        deductionsRes.error?.message,
                },
                {
                    status: 500,
                }
            );
        }

        const staff =
            staffRes.data || [];

        const attendance =
            attendanceRes.data || [];

        const advances =
            advancesRes.data || [];

        const deductions =
            deductionsRes.data || [];

        const monthlySalary =
            staff.reduce(
                (sum, item) =>
                    sum +
                    Number(
                        item.salary || 0
                    ),
                0
            );

        const totalAdvances =
            advances.reduce(
                (sum, item) =>
                    sum +
                    Number(
                        item.amount || 0
                    ),
                0
            );

        const totalDeductions =
            deductions.reduce(
                (sum, item) =>
                    sum +
                    Number(
                        item.amount || 0
                    ),
                0
            );

        const presentToday =
            attendance.length;

        const absentToday =
            staff.length -
            presentToday;

        const highestSalaryStaff =
            [...staff].sort(
                (a, b) =>
                    Number(
                        b.salary || 0
                    ) -
                    Number(
                        a.salary || 0
                    )
            )[0] || null;

        return NextResponse.json({
            staff,
            attendance,
            today,
            stats: {
                monthlySalary,
                totalAdvances,
                totalDeductions,
                netPayroll:
                    monthlySalary -
                    totalAdvances -
                    totalDeductions,
                absentToday,
                presentToday,
                todayAllowance:
                    presentToday * 30,
                attendancePercentage:
                    staff.length
                        ? Math.round(
                              (presentToday /
                                  staff.length) *
                                  100
                          )
                        : 0,
                highestSalaryStaff,
            },
        });
    } catch (error) {
        return NextResponse.json(
            {
                error:
                    "Failed to load dashboard",
            },
            {
                status: 500,
            }
        );
    }
}
