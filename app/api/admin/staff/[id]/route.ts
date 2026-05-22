import { NextRequest, NextResponse }
    from "next/server";
import { createServerSupabaseClient }
    from "@/lib/supabase-server";

interface Props {
    params: {
        id: string;
    };
}

async function requireAdmin() {
    const supabase =
        await createServerSupabaseClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return {
            supabase,
            error: NextResponse.json(
                {
                    error:
                        "Unauthorized",
                },
                {
                    status: 401,
                }
            ),
        };
    }

    const { data: profile } =
        await supabase
            .from("profiles")
            .select("*")
            .eq("auth_id", user.id)
            .single();

    if (
        !profile ||
        profile.role !== "admin"
    ) {
        return {
            supabase,
            error: NextResponse.json(
                {
                    error:
                        "Forbidden",
                },
                {
                    status: 403,
                }
            ),
        };
    }

    return {
        supabase,
    };
}

export async function GET(
    _req: NextRequest,
    { params }: Props
) {
    const auth =
        await requireAdmin();

    if (auth.error) {
        return auth.error;
    }

    const [
        staffRes,
        attendanceRes,
        advancesRes,
    ] = await Promise.all([
        auth.supabase
            .from("profiles")
            .select("*")
            .eq("id", params.id)
            .single(),

        auth.supabase
            .from("attendance")
            .select("*")
            .eq("staff_id", params.id)
            .order("date", {
                ascending: false,
            })
            .limit(10),

        auth.supabase
            .from("advances")
            .select("*")
            .eq("staff_id", params.id)
            .order("date", {
                ascending: false,
            }),
    ]);

    if (
        staffRes.error ||
        !staffRes.data
    ) {
        return NextResponse.json(
            {
                error:
                    staffRes.error?.message ||
                    "Staff not found",
            },
            {
                status: 404,
            }
        );
    }

    if (
        attendanceRes.error ||
        advancesRes.error
    ) {
        return NextResponse.json(
            {
                error:
                    attendanceRes.error?.message ||
                    advancesRes.error?.message,
            },
            {
                status: 500,
            }
        );
    }

    return NextResponse.json({
        staff:
            staffRes.data,
        attendance:
            attendanceRes.data || [],
        advances:
            advancesRes.data || [],
    });
}
