import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const {
            name,
            email,
            password,
            salary,
        } = body;

        const { data, error } =
            await admin.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
            });

        if (error) {
            return NextResponse.json({
                error: error.message,
            });
        }

        const user = data.user;

        await admin.from("profiles").insert({
            auth_id: user.id,
            name,
            email,
            role: "staff",
            salary,
        });

        return NextResponse.json({
            success: true,
        });
    } catch (error) {
        return NextResponse.json({
            error: "Something went wrong",
        });
    }
}