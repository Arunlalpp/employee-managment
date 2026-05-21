import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function sendNotification({
    userId,
    title,
    message,
    type = "info",
}: {
    userId: string;
    title: string;
    message: string;
    type?: string;
}) {
    await supabase
        .from("notifications")
        .insert({
            user_id: userId,
            title,
            message,
            type,
        });
}