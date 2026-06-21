export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase-server";

interface AttendanceEntry {
    staff_id: string;
    is_present: boolean;
    check_in: string | null;
    check_out: string | null;
    allowance_earned: number;
}

const datePattern =
    /^\d{4}-\d{2}-\d{2}$/;

const DAILY_ALLOWANCE = 40;

function formatLocalTime(
    value?: string | null
) {
    if (!value) {
        return null;
    }

    const parts =
        new Intl.DateTimeFormat(
            "en-GB",
            {
                timeZone:
                    "Asia/Kolkata",
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
            new Date(value)
        );

    const values =
        Object.fromEntries(
            parts.map((part) => [
                part.type,
                part.value,
            ])
        );

    return `${values.hour}:${values.minute}:${values.second}`;
}

function createAdminClient() {
    return createClient(
        process.env
            .NEXT_PUBLIC_SUPABASE_URL!,
        process.env
            .SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    );
}

async function requireAdmin() {
    const supabase =
        await createServerSupabaseClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return {
            error: NextResponse.json(
                {
                    error:
                        "Unauthorized",
                },
                { status: 401 }
            ),
        };
    }

    const adminClient =
        createAdminClient();

    // IMPORTANT FIX
    const { data: profile } =
        await adminClient
            .from("profiles")
            .select("*")
            .eq("auth_id", user.id)
            .single();

    if (
        !profile ||
        profile.role !== "admin"
    ) {
        return {
            error: NextResponse.json(
                {
                    error:
                        "Forbidden",
                },
                { status: 403 }
            ),
        };
    }

    return { adminClient };
}

// GET
export async function GET(
    req: NextRequest
) {
    try {
        const date =
            req.nextUrl.searchParams.get(
                "date"
            );

        if (
            !date ||
            !datePattern.test(date)
        ) {
            return NextResponse.json(
                {
                    error:
                        "Invalid date",
                },
                { status: 400 }
            );
        }

        const auth =
            await requireAdmin();

        if (auth.error) {
            return auth.error;
        }

        const [
            { data: staff },
            { data: attendance },
            { data: sessions },
        ] = await Promise.all([
            auth.adminClient
                .from("profiles")
                .select("*")
                .eq("role", "staff")
                .eq(
                    "is_active",
                    true
                ),

            auth.adminClient
                .from("attendance")
                .select("*")
                .eq("date", date),

            auth.adminClient
                .from(
                    "attendance_sessions"
                )
                .select("*")
                .eq(
                    "attendance_date",
                    date
                )
                .order(
                    "start_time",
                    {
                        ascending: true,
                    }
                ),
        ]);

        const attendanceMap =
            new Map(
                (attendance || []).map(
                    (item) => [
                        item.staff_id,
                        {
                            ...item,
                        },
                    ]
                )
            );

        for (const session of sessions || []) {
            const existing =
                attendanceMap.get(
                    session.staff_id
                );
            const checkIn =
                formatLocalTime(
                    session.start_time
                );
            const checkOut =
                formatLocalTime(
                    session.end_time
                );

            if (existing) {
                attendanceMap.set(
                    session.staff_id,
                    {
                        ...existing,
                        is_present:
                            true,
                        check_in:
                            existing.check_in ||
                            checkIn,
                        check_out:
                            existing.check_out ||
                            checkOut,
                        allowance_earned:
                            Number(
                                existing.allowance_earned ||
                                    0
                            ) ||
                            DAILY_ALLOWANCE,
                    }
                );
                continue;
            }

            attendanceMap.set(
                session.staff_id,
                {
                    id:
                        `session-${session.staff_id}-${date}`,
                    staff_id:
                        session.staff_id,
                    date,
                    is_present:
                        true,
                    check_in:
                        checkIn,
                    check_out:
                        checkOut,
                    allowance_earned:
                        DAILY_ALLOWANCE,
                }
            );
        }

        return NextResponse.json({
            staff: staff || [],
            attendance:
                Array.from(
                    attendanceMap.values()
                ),
        });
    } catch (error) {
        console.log(error);

        return NextResponse.json(
            {
                error:
                    "Server error",
            },
            { status: 500 }
        );
    }
}

// POST
export async function POST(
    req: NextRequest
) {
    try {
        const { date, entries } =
            await req.json();

        const auth =
            await requireAdmin();

        if (auth.error) {
            return auth.error;
        }

        const rows = entries.map(
            (
                entry: AttendanceEntry
            ) => ({
                staff_id:
                    entry.staff_id,
                date,
                is_present:
                    entry.is_present,
                check_in:
                    entry.is_present
                        ? entry.check_in ||
                          null
                        : null,
                check_out:
                    entry.is_present
                        ? entry.check_out ||
                          null
                        : null,
                allowance_earned:
                    entry.is_present
                        ? entry.allowance_earned
                        : 0,
            })
        );

        const { error } =
            await auth.adminClient
                .from("attendance")
                .upsert(rows, {
                    onConflict:
                        "staff_id,date",
                });

        if (error) {
            return NextResponse.json(
                {
                    error:
                        error.message,
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
        });
    } catch (error) {
        console.log(error);

        return NextResponse.json(
            {
                error:
                    "Failed to save",
            },
            { status: 500 }
        );
    }
}
