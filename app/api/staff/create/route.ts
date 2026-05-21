import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// This route uses the service role key to create auth users
// Add SUPABASE_SERVICE_ROLE_KEY to your .env.local
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: NextRequest) {
  try {
    const { full_name, email, password, phone, monthly_salary, joining_date } = await req.json();

    // 1. Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (authError) return NextResponse.json({ error: authError.message }, { status: 400 });

    // 2. Create profile row
    const { error: profileError } = await supabaseAdmin.from("profiles").insert({
      id: authData.user.id,
      full_name,
      email,
      phone: phone || null,
      role: "staff",
      monthly_salary: Number(monthly_salary),
      daily_allowance: 30,
      joining_date,
      is_active: true,
    });

    if (profileError) {
      // Rollback auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
