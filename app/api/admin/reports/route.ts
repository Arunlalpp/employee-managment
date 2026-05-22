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

export async function GET() {

    try {

        const currentDate =
            new Date();

        const month =
            currentDate.getMonth() + 1;

        const year =
            currentDate.getFullYear();

        const startDate =
            `${year}-${String(month).padStart(2, "0")}-01`;

        const endDate =
            `${year}-${String(month).padStart(2, "0")}-31`;

        // ONLY CURRENT MONTH DATA
        const [
            reportRes,
            staffRes,
            attendanceRes,
            advancesRes,
        ] =
            await Promise.all([

                supabase
                    .from(
                        "monthly_store_reports"
                    )
                    .select("*")
                    .eq(
                        "month",
                        month
                    )
                    .eq(
                        "year",
                        year
                    )
                    .single(),

                supabase
                    .from("profiles")
                    .select("*")
                    .eq(
                        "role",
                        "staff"
                    ),

                supabase
                    .from("attendance")
                    .select("*")
                    .gte(
                        "date",
                        startDate
                    )
                    .lte(
                        "date",
                        endDate
                    ),

                supabase
                    .from("advances")
                    .select("*")
                    .gte(
                        "date",
                        startDate
                    )
                    .lte(
                        "date",
                        endDate
                    ),
            ]);

        return NextResponse.json({

            report:
                reportRes.data || null,

            staff:
                staffRes.data || [],

            attendance:
                attendanceRes.data || [],

            advances:
                advancesRes.data || [],
        });

    } catch (error) {

        return NextResponse.json(
            {
                error:
                    "Failed to load reports",
            },
            {
                status: 500,
            }
        );
    }
}