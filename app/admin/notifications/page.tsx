"use client";

import {
    useClearNotifications,
    useNotifications,
} from "@/lib/hooks/use-notifications";

export default function AdminNotificationsPage() {
    const {
        data: notifications = [],
        isLoading,
    } = useNotifications();

    const clearMutation =
        useClearNotifications();

    if (isLoading) {
        return (
            <main className="px-4 pt-14 pb-4 text-white">
                Loading...
            </main>
        );
    }

    return (
        <main className="px-4 pt-14 pb-4 text-white">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">
                    Notifications
                </h1>

                <button
                    onClick={() =>
                        clearMutation.mutate()
                    }
                    disabled={
                        clearMutation.isPending
                    }
                    className="text-sm text-red-400 disabled:opacity-50"
                >
                    {clearMutation.isPending
                        ? "Clearing..."
                        : "Clear All"}
                </button>
            </div>

            <div className="space-y-4">
                {notifications.map(
                    (item: any) => (
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
                    )
                )}

                {notifications.length ===
                    0 && (
                        <div className="text-center text-zinc-500 py-20">
                            No notifications
                        </div>
                    )}
            </div>
        </main>
    );
}
