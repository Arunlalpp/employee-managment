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
                })
                .select()
                .single();

        // UPDATE STATUS
        await supabase
            .from(
                "staff_attendance_status"
            )
            .update({
                current_status:
                    "active",

                current_session_id:
                    session.id,

                updated_at:
                    new Date()
                        .toISOString(),
            })
            .eq(
                "staff_id",
                staffId
            );

        return NextResponse.json({
            success: true,
        });

    } catch (error) {

        return NextResponse.json(
            {
                error:
                    "Resume failed",
            },
            {
                status: 500,
            }
        );
    }
}