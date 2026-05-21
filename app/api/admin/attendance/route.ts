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
        ]);

        return NextResponse.json({
            staff: staff || [],
            attendance:
                attendance || [],
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
                        ? entry.check_in
                        : null,
                check_out:
                    entry.is_present
                        ? entry.check_out
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