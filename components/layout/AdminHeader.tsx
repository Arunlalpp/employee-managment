"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useNotifications } from "@/lib/hooks/use-notifications";

export default function AdminHeader() {
    const { data: notifications = [] } = useNotifications();
    const unreadCount = notifications.filter((n: any) => !n.is_read).length;

    return (
        <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border px-5 h-14 flex items-center justify-between">
            <span className="text-white font-bold text-lg tracking-widest">OGGI</span>
            <Link
                href="/admin/notifications"
                className="relative p-2 rounded-xl hover:bg-zinc-800 transition-colors"
            >
                <Bell className="w-5 h-5 text-white" strokeWidth={1.8} />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-yellow-400 text-black text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </Link>
        </header>
    );
}
