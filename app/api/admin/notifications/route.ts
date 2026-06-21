export const dynamic = "force-dynamic";

import { NextResponse }
    from "next/server";
import { createServerSupabaseClient }
    from "@/lib/supabase-server";

async function getProfile() {
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

    if (!profile) {
        return {
            supabase,
            error: NextResponse.json(
                {
                    error:
                        "Profile not found",
                },
                {
                    status: 404,
                }
            ),
        };
    }

    return {
        supabase,
        profile,
    };
}

export async function GET() {
    const auth =
        await getProfile();

    if (auth.error) {
        return auth.error;
    }

    const { data, error } =
        await auth.supabase
            .from("notifications")
            .select("*")
            .eq(
                "user_id",
                auth.profile.id
            )
            .order("created_at", {
                ascending: false,
            });

    if (error) {
        return NextResponse.json(
            {
                error:
                    error.message,
            },
            {
                status: 500,
            }
        );
    }

    return NextResponse.json({
        notifications:
            data || [],
    });
}

export async function DELETE() {
    const auth =
        await getProfile();

    if (auth.error) {
        return auth.error;
    }

    const { error } =
        await auth.supabase
            .from("notifications")
            .delete()
            .eq(
                "user_id",
                auth.profile.id
            );

    if (error) {
        return NextResponse.json(
            {
                error:
                    error.message,
            },
            {
                status: 500,
            }
        );
    }

    return NextResponse.json({
        success: true,
    });
}
