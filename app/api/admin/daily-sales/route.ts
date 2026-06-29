export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function requireAdmin() {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
    const { data: profile } = await supabase.from("profiles").select("role").eq("auth_id", user.id).single();
    if (!profile || profile.role !== "admin") return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
    return {};
}

// GET /api/admin/daily-sales?month=2026-06
export async function GET(req: NextRequest) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const month = req.nextUrl.searchParams.get("month");
    if (!month) return NextResponse.json({ error: "month required" }, { status: 400 });

    const [year, mon] = month.split("-").map(Number);
    const startDate = `${year}-${String(mon).padStart(2, "0")}-01`;
    const lastDay = new Date(year, mon, 0).getDate();
    const endDate = `${year}-${String(mon).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

    const { data, error } = await supabaseAdmin
        .from("daily_sales")
        .select("*")
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ sales: data || [] });
}

// POST /api/admin/daily-sales  { date, total_sales, notes? }
export async function POST(req: NextRequest) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    try {
        const { date, total_sales, notes } = await req.json();
        if (!date || total_sales === undefined) {
            return NextResponse.json({ error: "date and total_sales required" }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from("daily_sales")
            .upsert(
                { date, total_sales: Number(total_sales), notes: notes || null, updated_at: new Date().toISOString() },
                { onConflict: "date" }
            )
            .select()
            .single();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ sale: data });
    } catch {
        return NextResponse.json({ error: "Failed to save" }, { status: 500 });
    }
}
