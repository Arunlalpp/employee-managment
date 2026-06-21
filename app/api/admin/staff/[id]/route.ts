import { NextRequest, NextResponse }
    from "next/server";
import { createServerSupabaseClient }
    from "@/lib/supabase-server";
import { createClient } from "@supabase/supabase-js";

const serviceSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

export async function PATCH(
    req: NextRequest,
    { params }: Props
) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    try {
        const body = await req.json();
        const updates: Record<string, any> = {};

        if (body.name !== undefined) updates.name = String(body.name).trim();
        if (body.salary !== undefined) updates.salary = Number(body.salary);
        if (body.is_active !== undefined) updates.is_active = Boolean(body.is_active);

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: "No fields to update" }, { status: 400 });
        }

        const { data, error } = await serviceSupabase
            .from("profiles")
            .update(updates)
            .eq("id", params.id)
            .select()
            .single();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ staff: data });
    } catch {
        return NextResponse.json({ error: "Failed to update staff" }, { status: 500 });
    }
}
