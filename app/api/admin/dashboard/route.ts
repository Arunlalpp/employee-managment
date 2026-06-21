export const dynamic = "force-dynamic";

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

function getLocalDate() {
    const parts =
        new Intl.DateTimeFormat(
            "en-CA",
            {
                timeZone:
                    "Asia/Kolkata",
                year:
                    "numeric",
                month:
                    "2-digit",
                day:
                    "2-digit",
            }
        ).formatToParts(
            new Date()
        );

    const values =
        Object.fromEntries(
            parts.map((part) => [
                part.type,
                part.value,
            ])
        );

    return `${values.year}-${values.month}-${values.day}`;
}

export async function GET() {
    try {
        const auth =
            await requireAdmin();

        if (auth.error) {
            return auth.error;
        }

        const today =
            getLocalDate();

        const now = new Date();
        const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
        const monthEnd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()).padStart(2, "0")}`;

        const [
            staffRes,
            attendanceRes,
            statusRes,
            advancesRes,
            deductionsRes,
        ] = await Promise.all([
            auth.supabase
                .from("profiles")
                .select("*")
                .eq("role", "staff")
                .eq(
                    "is_active",
                    true
                ),

            auth.supabase
                .from("attendance")
                .select("*")
                .eq("date", today)
                .eq(
                    "is_present",
                    true
                ),

            auth.supabase
                .from(
                    "staff_attendance_status"
                )
                .select(
                    "staff_id,current_status"
                )
                .in(
                    "current_status",
                    [
                        "active",
                        "break",
                    ]
                ),

            // Current month only — avoids accumulating all-time advances
            auth.supabase
                .from("advances")
                .select("*")
                .gte("date", monthStart)
                .lte("date", monthEnd),

            // Deductions table has no date column — fetch all
            auth.supabase
                .from("deductions")
                .select("*"),
        ]);

        if (
            staffRes.error ||
            attendanceRes.error ||
            statusRes.error ||
            advancesRes.error ||
            deductionsRes.error
        ) {
            return NextResponse.json(
                {
                    error:
                        staffRes.error?.message ||
                        attendanceRes.error?.message ||
                        statusRes.error?.message ||
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

        const statuses =
            statusRes.data || [];

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

        const staffIds =
            new Set(
                staff.map(
                    (item) =>
                        item.id
                )
            );

        const presentStaffIds =
            new Set<string>();

        attendance.forEach(
            (item) => {
                if (
                    staffIds.has(
                        item.staff_id
                    )
                ) {
                    presentStaffIds.add(
                        item.staff_id
                    );
                }
            }
        );

        statuses.forEach(
            (item) => {
                if (
                    staffIds.has(
                        item.staff_id
                    )
                ) {
                    presentStaffIds.add(
                        item.staff_id
                    );
                }
            }
        );

        const presentToday =
            presentStaffIds.size;

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
                    presentToday * 40,
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
