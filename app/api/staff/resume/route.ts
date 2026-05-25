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

function getLocalAttendanceDate() {
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

export async function POST(
    req: Request
) {

    try {

        const {
            staffId,
        } =
            await req.json();

        const attendanceDate =
            getLocalAttendanceDate();

        const {
            data: status,
        } =
            await supabase
                .from(
                    "staff_attendance_status"
                )
                .select(
                    "current_status"
                )
                .eq(
                    "staff_id",
                    staffId
                )
                .maybeSingle();

        if (
            status?.current_status !==
            "break"
        ) {
            return NextResponse.json(
                {
                    error:
                        "No break to resume",
                },
                {
                    status: 400,
                }
            );
        }

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
                        attendanceDate,

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
