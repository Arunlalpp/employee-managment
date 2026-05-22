import { NextResponse }
    from "next/server";

import {
    createClient,
} from "@supabase/supabase-js";

const supabase =
    createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

export async function GET(
    req: Request
) {

    try {

        const {
            searchParams,
        } =
            new URL(req.url);

        const month =
            searchParams.get(
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

        const [y, m] =
            month.split("-");

        const monthStart =
            `${y}-${m}-01`;

        const monthEnd =
            `${y}-${m}-${new Date(
                Number(y),
                Number(m),
                0
            ).getDate()}`;

        // PARALLEL FETCH
        const [
            staffRes,
            advancesRes,
            attendanceRes,
        ] =
            await Promise.all([

                supabase
                    .from("profiles")
                    .select("*")
                    .eq(
                        "role",
                        "staff"
                    ),

                supabase
                    .from("advances")
                    .select("*")
                    .gte(
                        "date",
                        monthStart
                    )
                    .lte(
                        "date",
                        monthEnd
                    ),

                supabase
                    .from("attendance")
                    .select("*")
                    .gte(
                        "date",
                        monthStart
                    )
                    .lte(
                        "date",
                        monthEnd
                    ),
            ]);

        const staff =
            staffRes.data || [];

        const advances =
            advancesRes.data || [];

        const attendance =
            attendanceRes.data || [];

        const salaryData =
            staff.map(
                (item) => {

                    const staffAttendance =
                        attendance.filter(
                            (a) =>
                                a.staff_id ===
                                item.id
                        );

                    const daysPresent =
                        staffAttendance.filter(
                            (d) =>
                                d.is_present
                        ).length;

                    const allowance =
                        daysPresent * 30;

                    const staffAdvances =
                        advances.filter(
                            (a) =>
                                a.staff_id ===
                                item.id
                        );

                    const advanceDeduction =
                        staffAdvances.reduce(
                            (
                                sum,
                                item
                            ) =>
                                sum +
                                Number(
                                    item.amount
                                ),
                            0
                        );

                    const netSalary =
                        Number(
                            item.salary || 0
                        ) +
                        allowance -
                        advanceDeduction;

                    return {
                        ...item,

                        daysPresent,

                        allowance,

                        advanceDeduction,

                        netSalary,

                        advances:
                            staffAdvances,
                    };
                }
            );

        const totalPayroll =
            salaryData.reduce(
                (
                    sum,
                    item
                ) =>
                    sum +
                    item.netSalary,
                0
            );

        return NextResponse.json({
            salaryData,
            totalPayroll,
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