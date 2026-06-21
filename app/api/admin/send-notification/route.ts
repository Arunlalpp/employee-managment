export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { sendNotification } from "@/lib/send-notification";

export async function POST(req: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("auth_id", user.id)
            .single();

        if (!profile || profile.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { staffId, title, message, type } = await req.json();
        if (!staffId || !title || !message) {
            return NextResponse.json({ error: "staffId, title, and message are required" }, { status: 400 });
        }

        await sendNotification({ userId: staffId, title, message, type: type ?? "info" });
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
    }
}
