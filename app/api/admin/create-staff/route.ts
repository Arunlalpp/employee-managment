export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase-server";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function requireAdmin() {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
    }

    const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("role")
        .eq("auth_id", user.id)
        .single();

    if (!profile || profile.role !== "admin") {
        return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
    }

    return {};
}

export async function POST(req: Request) {
    try {
        const auth = await requireAdmin();
        if (auth.error) return auth.error;

        const body = await req.json();
        const { name, email, password, salary } = body;

        const { data: authData, error: authError } =
            await supabaseAdmin.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
            });

        if (authError) {
            return NextResponse.json(
                { error: authError.message },
                { status: 400 }
            );
        }

        const { error: profileError } = await supabaseAdmin
            .from("profiles")
            .insert({
                auth_id: authData.user.id,
                name,
                email,
                salary,
                role: "staff",
            });

        if (profileError) {
            return NextResponse.json(
                { error: profileError.message },
                { status: 400 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to create staff" },
            { status: 500 }
        );
    }
}
