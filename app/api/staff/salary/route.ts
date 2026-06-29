export const dynamic = "force-dynamic";

import { NextRequest, NextResponse }
    from "next/server";
import { createServerSupabaseClient }
    from "@/lib/supabase-server";

export async function GET(
    req: NextRequest
) {
    try {
        const month =
            req.nextUrl.searchParams.get(
                "month"
            );

        if (!month) {
            return NextResponse.json(
                {
                    error:
                        "Month required",
                },
                {
                    status: 400,
                }
            );
        }

        const supabase =
            await createServerSupabaseClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                {
                    error:
                        "Unauthorized",
                },
                {
                    status: 401,
                }
            );
        }

        const { data: profile } =
            await supabase
                .from("profiles")
                .select("*")
                .eq("auth_id", user.id)
                .single();

        if (!profile) {
            return NextResponse.json(
                {
                    error:
                        "Profile not found",
                },
                {
                    status: 404,
                }
            );
        }

        if (profile.role !== "staff") {
            return NextResponse.json(
                {
                    error:
                        "Forbidden",
                },
                {
                    status: 403,
                }
            );
        }

        const [year, monthNumber] =
            month.split("-");

        const monthStart =
            `${year}-${monthNumber}-01`;

        const monthEnd =
            `${year}-${monthNumber}-${new Date(
                Number(year),
                Number(monthNumber),
                0
            ).getDate()}`;

        const [
            attendanceRes,
            advancesRes,
            advanceRequestsRes,
        ] = await Promise.all([
            supabase
                .from("attendance")
                .select("*")
                .eq("staff_id", profile.id)
                .gte("date", monthStart)
                .lte("date", monthEnd)
                .order("date", {
                    ascending: false,
                }),

            supabase
                .from("advances")
                .select("*")
                .eq("staff_id", profile.id)
                .gte("date", monthStart)
                .lte("date", monthEnd),

            supabase
                .from("advance_requests")
                .select("*")
                .eq("staff_id", profile.id)
                .gte("requested_at", `${monthStart}T00:00:00`)
                .lte("requested_at", `${monthEnd}T23:59:59`)
                .order("requested_at", { ascending: false }),
        ]);

        if (attendanceRes.error || advancesRes.error || advanceRequestsRes.error) {
            return NextResponse.json(
                {
                    error:
                        attendanceRes.error?.message ||
                        advancesRes.error?.message ||
                        advanceRequestsRes.error?.message,
                },
                {
                    status: 500,
                }
            );
        }

        const attendance = attendanceRes.data || [];
        const advances = advancesRes.data || [];
        const advanceRequests = advanceRequestsRes.data || [];

        const daysPresent =
            attendance.filter(
                (item) =>
                    item.is_present
            ).length;

        const allowance =
            attendance.reduce(
                (sum, item) =>
                    sum +
                    Number(
                        item.allowance_earned ||
                            0
                    ),
                0
            );

        const overtimeBonus =
            attendance.reduce(
                (sum, item) =>
                    sum +
                    Number(
                        item.overtime_bonus ||
                            0
                    ),
                0
            );

        const advanceTotal =
            advances.reduce(
                (sum, item) =>
                    sum +
                    Number(
                        item.amount || 0
                    ),
                0
            );

        const salary =
            Number(
                profile.salary || 0
            );

        return NextResponse.json({
            profile,
            attendance,
            advances,
            advanceRequests,
            stats: {
                daysPresent,
                allowance,
                overtimeBonus,
                advanceTotal,
                salary,
                netSalary: salary + allowance + overtimeBonus - advanceTotal,
            },
        });
    } catch (error) {
        return NextResponse.json(
            {
                error:
                    "Failed to load salary",
            },
            {
                status: 500,
            }
        );
    }
}
