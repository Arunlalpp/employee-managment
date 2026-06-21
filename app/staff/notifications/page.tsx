"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Loading from "@/components/Loading";

async function fetchStaffNotifications() {
    const res = await fetch("/api/staff/notifications");
    if (!res.ok) throw new Error("Failed to load notifications");
    const data = await res.json();
    return data.notifications ?? [];
}

export default function StaffNotificationsPage() {
    const queryClient = useQueryClient();

    const { data: notifications = [], isLoading } = useQuery({
        queryKey: ["staff-notifications"],
        queryFn: fetchStaffNotifications,
    });

    const clearMutation = useMutation({
        mutationFn: () =>
            fetch("/api/staff/notifications", { method: "DELETE" }).then((r) => r.json()),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ["staff-notifications"] }),
    });

    if (isLoading) {
        return <Loading className="px-4 pt-14 pb-4 text-white" />;
    }

    return (
        <main className="px-4 pt-14 pb-4 text-white">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Notifications</h1>
                <button
                    onClick={() => clearMutation.mutate()}
                    disabled={clearMutation.isPending || notifications.length === 0}
                    className="text-sm text-red-400 disabled:opacity-30"
                >
                    {clearMutation.isPending ? "Clearing..." : "Clear All"}
                </button>
            </div>

            <div className="space-y-4">
                {notifications.map((item: any) => (
                    <div
                        key={item.id}
                        className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1 pr-3">
                                <h2 className="text-lg font-semibold">{item.title}</h2>
                                <p className="text-zinc-400 mt-2 text-sm">{item.message}</p>
                                <p className="text-xs text-zinc-600 mt-3">
                                    {new Date(item.created_at).toLocaleString("en-IN")}
                                </p>
                            </div>
                            {!item.is_read && (
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 mt-2 shrink-0" />
                            )}
                        </div>
                    </div>
                ))}

                {notifications.length === 0 && (
                    <div className="text-center text-zinc-500 py-20">No notifications</div>
                )}
            </div>
        </main>
    );
}
