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

        const {
            data: status,
        } =
            await supabase
                .from(
                    "staff_attendance_status"
                )
                .select("*")
                .eq(
                    "staff_id",
                    staffId
                )
                .single();

        // CLOSE CURRENT SESSION
        if (
            status
                ?.current_session_id
        ) {

            await supabase
                .from(
                    "attendance_sessions"
                )
                .update({
                    end_time:
                        new Date()
                            .toISOString(),
                })
                .eq(
                    "id",
                    status.current_session_id
                );
        }

        // OFFLINE
        await supabase
            .from(
                "staff_attendance_status"
            )
            .update({
                current_status:
                    "offline",

                current_session_id:
                    null,

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
                    "Checkout failed",
            },
            {
                status: 500,
            }
        );
    }
}