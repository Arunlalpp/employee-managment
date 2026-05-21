import { redirect } from "next/navigation";

import { createServerSupabaseClient }
    from "@/lib/supabase-server";

export default async function AdminNotificationsPage() {

    const supabase =
        await createServerSupabaseClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: profile } =
        await supabase
            .from("profiles")
            .select("*")
            .eq("auth_id", user.id)
            .single();

    if (!profile) {
        redirect("/login");
    }

    const { data: notifications } =
        await supabase
            .from("notifications")
            .select("*")
            .eq("user_id", profile.id)
            .order("created_at", {
                ascending: false,
            });

    async function clearNotifications() {
        "use server";

        const supabase =
            await createServerSupabaseClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { data: profile } =
            await supabase
                .from("profiles")
                .select("*")
                .eq("auth_id", user.id)
                .single();

        if (!profile) return;

        await supabase
            .from("notifications")
            .delete()
            .eq("user_id", profile.id);
    }

    return (

        <main className="px-4 pt-14 pb-32 text-white">
            <div className="flex items-center justify-between mb-6">

                <h1 className="text-3xl font-bold">
                    Notifications
                </h1>

                <form
                    action={clearNotifications}
                >
                    <button className="text-sm text-red-400">
                        Clear All
                    </button>
                </form>

            </div>
            <div className="space-y-4">

                {notifications?.map((item) => (

                    <div
                        key={item.id}
                        className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5"
                    >
                        <div className="flex items-start justify-between">

                            <div>
                                <h2 className="text-lg font-semibold">
                                    {item.title}
                                </h2>

                                <p className="text-zinc-400 mt-2">
                                    {item.message}
                                </p>

                                <p className="text-xs text-zinc-600 mt-3">
                                    {new Date(
                                        item.created_at
                                    ).toLocaleString()}
                                </p>
                            </div>

                            {!item.is_read && (
                                <div className="w-3 h-3 rounded-full bg-yellow-400 mt-2" />
                            )}

                        </div>
                    </div>

                ))}

                {notifications?.length === 0 && (
                    <div className="text-center text-zinc-500 py-20">
                        No notifications
                    </div>
                )}

            </div>

        </main>
    );
}