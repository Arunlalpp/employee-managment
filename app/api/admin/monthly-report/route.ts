export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createClient } from "@supabase/supabase-js";

const serviceSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function requireAdmin() {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("auth_id", user.id)
        .single();

    if (!profile || profile.role !== "admin") {
        return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
    }
    return {};
}

export async function POST(req: NextRequest) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    try {
        const { month, year, profitAmount, bonusPerStaff } = await req.json();
        if (!month || !year) {
            return NextResponse.json({ error: "month and year are required" }, { status: 400 });
        }

        const { data, error } = await serviceSupabase
            .from("monthly_store_reports")
            .upsert(
                {
                    month: Number(month),
                    year: Number(year),
                    profit_amount: Number(profitAmount ?? 0),
                    bonus_per_staff: Number(bonusPerStaff ?? 0),
                },
                { onConflict: "month,year" }
            )
            .select()
            .single();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ report: data });
    } catch {
        return NextResponse.json({ error: "Failed to save report" }, { status: 500 });
    }
}
