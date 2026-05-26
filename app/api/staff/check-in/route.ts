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

export async function POST(
    req: Request
) {

    try {

        const {
            staffId,
        } =
            await req.json();

        // CREATE NEW SESSION
        const {
            data: session,
            error,
        } =
            await supabase
                .from(
                    "attendance_sessions"
                )
                .insert({
                    staff_id:
                        staffId,

                    attendance_date:
                        new Date()
                            .toISOString()
                            .split(
                                "T"
                            )[0],

                    start_time:
                        new Date()
                            .toISOString(),

                    is_break:
                        false,
                })
                .select()
                .single();

        if (error) {
            throw error;
        }

        // UPDATE STATUS
        await supabase
            .from(
                "staff_attendance_status"
            )
            .upsert(
                {
                    staff_id:
                        staffId,

                    current_status:
                        "active",

                    current_session_id:
                        session.id,

                    updated_at:
                        new Date()
                            .toISOString(),
                },
                {
                    onConflict:
                        "staff_id",
                }
            );

        return NextResponse.json({
            success: true,
        });

    } catch (error) {

        return NextResponse.json(
            {
                error:
                    "Check-in failed",
            },
            {
                status: 500,
            }
        );
    }
}