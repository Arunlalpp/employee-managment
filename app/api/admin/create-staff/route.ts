import { NextResponse }
    from "next/server";

import { createClient }
    from "@supabase/supabase-js";

const supabaseAdmin =
    createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

export async function POST(
    req: Request
) {
    try {

        const body =
            await req.json();

        const {
            name,
            email,
            password,
            salary,
        } = body;

        // CREATE AUTH USER
        const {
            data: authData,
            error: authError,
        } =
            await supabaseAdmin.auth.admin.createUser(
                {
                    email,
                    password,

                    email_confirm: true,
                }
            );

        if (authError) {
            return NextResponse.json(
                {
                    error:
                        authError.message,
                },
                {
                    status: 400,
                }
            );
        }

        // CREATE PROFILE
        const {
            error: profileError,
        } =
            await supabaseAdmin
                .from("profiles")
                .insert({
                    auth_id:
                        authData.user.id,

                    name,

                    email,

                    salary,

                    role: "staff",
                });

        if (profileError) {
            return NextResponse.json(
                {
                    error:
                        profileError.message,
                },
                {
                    status: 400,
                }
            );
        }

        return NextResponse.json({
            success: true,
        });

    } catch (error) {

        return NextResponse.json(
            {
                error:
                    "Failed to create staff",
            },
            {
                status: 500,
            }
        );
    }
}