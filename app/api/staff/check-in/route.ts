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

const DAILY_ALLOWANCE = 40;

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
                .select(
                    "current_status"
                )
                .eq(
                    "staff_id",
                    staffId
                )
                .maybeSingle();

        if (
            status?.current_status ===
            "active"
        ) {
            return NextResponse.json(
                {
                    error:
                        "Already checked in",
                },
                {
                    status: 409,
                }
            );
        }

        if (
            status?.current_status ===
            "break"
        ) {
            return NextResponse.json(
                {
                    error:
                        "Resume from break instead",
                },
                {
                    status: 409,
                }
            );
        }

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
                        attendanceStamp.date,

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

        const {
            data: attendance,
        } =
            await supabase
                .from(
                    "attendance"
                )
                .select(
                    "check_in"
                )
                .eq(
                    "staff_id",
                    staffId
                )
                .eq(
                    "date",
                    attendanceStamp.date
                )
                .maybeSingle();

        // Keep the first check-in time of the day, but make the admin row visible immediately.
        await supabase
            .from(
                "attendance"
            )
            .upsert(
                {
                    staff_id:
                        staffId,

                    date:
                        attendanceStamp.date,

                    is_present:
                        true,

                    check_in:
                        attendance?.check_in ||
                        attendanceStamp.time,

                    allowance_earned:
                        DAILY_ALLOWANCE,
                },
                {
                    onConflict:
                        "staff_id,date",
                }
            );

        // UPDATE STATUS
        await supabase
            .from(
                "staff_attendance_status"
            )
            .upsert({
                staff_id:
                    staffId,

                current_status:
                    "active",

                current_session_id:
                    session.id,

                updated_at:
                    new Date()
                        .toISOString(),
            });

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
