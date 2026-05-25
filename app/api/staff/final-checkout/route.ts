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

function getLocalAttendanceStamp() {
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
                hour:
                    "2-digit",
                minute:
                    "2-digit",
                second:
                    "2-digit",
                hour12:
                    false,
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

    return {
        date:
            `${values.year}-${values.month}-${values.day}`,
        time:
            `${values.hour}:${values.minute}:${values.second}`,
    };
}

export async function POST(
    req: Request
) {

    try {

        const {
            staffId,
        } =
            await req.json();

        const attendanceStamp =
            getLocalAttendanceStamp();

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
            !status ||
            status.current_status ===
                "offline"
        ) {
            return NextResponse.json(
                {
                    error:
                        "No active attendance to checkout",
                },
                {
                    status: 400,
                }
            );
        }

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

        await supabase
            .from(
                "attendance"
            )
            .update({
                check_out:
                    attendanceStamp.time,
            })
            .eq(
                "staff_id",
                staffId
            )
            .eq(
                "date",
                attendanceStamp.date
            );

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
