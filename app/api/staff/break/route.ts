export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase-server";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function requireStaffSelf(staffId: string) {
    const serverClient = await createServerSupabaseClient();
    const { data: { user } } = await serverClient.auth.getUser();

    if (!user) {
        return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
    }

    const { data: profile } = await serverClient
        .from("profiles")
        .select("id, role")
        .eq("auth_id", user.id)
        .single();

    if (!profile || profile.role !== "staff" || profile.id !== staffId) {
        return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
    }

    return {};
}

export async function POST(req: Request) {
    try {
        const { staffId } = await req.json();

        const auth = await requireStaffSelf(staffId);
        if (auth.error) return auth.error;

        const { data: status } = await supabase
            .from("staff_attendance_status")
            .select("*")
            .eq("staff_id", staffId)
            .single();

        if (!status?.current_session_id) {
            return NextResponse.json(
                { error: "No active session" },
                { status: 400 }
            );
        }

        await supabase
            .from("attendance_sessions")
            .update({ end_time: new Date().toISOString() })
            .eq("id", status.current_session_id);

        await supabase
            .from("staff_attendance_status")
            .update({
                current_status: "break",
                current_session_id: null,
                updated_at: new Date().toISOString(),
            })
            .eq("staff_id", staffId);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: "Break failed" },
            { status: 500 }
        );
    }
}
