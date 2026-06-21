import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

async function getStaffProfile() {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

    const { data: profile } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("auth_id", user.id)
        .single();

    if (!profile || profile.role !== "staff") {
        return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
    }

    return { supabase, profileId: profile.id };
}

export async function GET() {
    const auth = await getStaffProfile();
    if (auth.error) return auth.error;

    const { data, error } = await auth.supabase!
        .from("notifications")
        .select("*")
        .eq("user_id", auth.profileId)
        .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ notifications: data || [] });
}

export async function DELETE() {
    const auth = await getStaffProfile();
    if (auth.error) return auth.error;

    const { error } = await auth.supabase!
        .from("notifications")
        .delete()
        .eq("user_id", auth.profileId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}
