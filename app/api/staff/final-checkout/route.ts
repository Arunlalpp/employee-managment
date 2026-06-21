import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase-server";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function toISTDate(): string {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date());
}

function toISTTime(): string {
    const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    }).formatToParts(new Date());
    const v = Object.fromEntries(parts.map((p) => [p.type, p.value]));
    return `${v.hour}:${v.minute}:${v.second}`;
}

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

        const istDate = toISTDate();
        const istTime = toISTTime();

        const { data: status } = await supabase
            .from("staff_attendance_status")
            .select("*")
            .eq("staff_id", staffId)
            .single();

        if (status?.current_session_id) {
            await supabase
                .from("attendance_sessions")
                .update({ end_time: new Date().toISOString() })
                .eq("id", status.current_session_id);
        }

        // Update attendance record with final checkout time
        await supabase
            .from("attendance")
            .update({ check_out: istTime })
            .eq("staff_id", staffId)
            .eq("date", istDate);

        await supabase
            .from("staff_attendance_status")
            .update({
                current_status: "offline",
                current_session_id: null,
                updated_at: new Date().toISOString(),
            })
            .eq("staff_id", staffId);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: "Checkout failed" },
            { status: 500 }
        );
    }
}
