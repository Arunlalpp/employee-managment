export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase-server";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DAILY_ALLOWANCE = 40;

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
        .select("id, role, is_active")
        .eq("auth_id", user.id)
        .single();

    if (!profile || profile.role !== "staff" || profile.id !== staffId) {
        return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
    }

    if (profile.is_active === false) {
        return { error: NextResponse.json({ error: "Account is deactivated" }, { status: 403 }) };
    }

    return {};
}

export async function POST(req: Request) {
    try {
        const { staffId } = await req.json();

        const auth = await requireStaffSelf(staffId);
        if (auth.error) return auth.error;

        const { data: existing } = await supabase
            .from("staff_attendance_status")
            .select("current_status, current_session_id")
            .eq("staff_id", staffId)
            .single();

        if (existing?.current_status === "active") {
            return NextResponse.json(
                { error: "Already checked in" },
                { status: 400 }
            );
        }

        const istDate = toISTDate();
        const istTime = toISTTime();

        const { data: session, error } = await supabase
            .from("attendance_sessions")
            .insert({
                staff_id: staffId,
                attendance_date: istDate,
                start_time: new Date().toISOString(),
                is_break: false,
            })
            .select()
            .single();

        if (error) throw error;

        // Preserve the original check_in time if the record already has one
        // (e.g. admin set it manually), but always mark is_present: true.
        const { data: existingAttendance } = await supabase
            .from("attendance")
            .select("check_in")
            .eq("staff_id", staffId)
            .eq("date", istDate)
            .maybeSingle();

        await supabase.from("attendance").upsert(
            {
                staff_id: staffId,
                date: istDate,
                is_present: true,
                check_in: existingAttendance?.check_in ?? istTime,
                allowance_earned: DAILY_ALLOWANCE,
            },
            { onConflict: "staff_id,date" }
        );

        await supabase
            .from("staff_attendance_status")
            .upsert(
                {
                    staff_id: staffId,
                    current_status: "active",
                    current_session_id: session.id,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: "staff_id" }
            );

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: "Check-in failed" },
            { status: 500 }
        );
    }
}
