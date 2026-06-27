"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useProfile } from "@/lib/hooks/useProfile";
import { useStaff } from "@/lib/hooks/useStaff";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Plus, ChevronRight, Users } from "lucide-react";
import Loading from "@/components/Loading";

export default function StaffPage() {
    const router = useRouter();
    const { data: user, isLoading: userLoading } = useAuth();
    const { data: profile, isLoading: profileLoading } = useProfile(user?.id);
    const { data: staffList = [] } = useStaff();

    useEffect(() => {
        if (!userLoading && !user) { router.push("/login"); return; }
        if (!profileLoading && profile && profile.role !== "admin") router.push("/staff/dashboard");
    }, [user, profile, userLoading, profileLoading, router]);

    if (userLoading || profileLoading) return <Loading className="p-6 text-white" />;
    if (!user || !profile) return null;

    return (
        <main className="px-4 pt-14 pb-28 text-white">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Staff Members</h1>
                    <p className="text-zinc-500 text-sm mt-0.5">{staffList.length} members</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-400" />
                </div>
            </div>

            {staffList.length === 0 ? (
                <div className="flex flex-col items-center py-20 text-zinc-600">
                    <Users className="w-10 h-10 mb-3" />
                    <p className="text-sm">No staff members yet</p>
                    <Link href="/admin/staff/add" className="mt-4 text-yellow-400 text-sm font-medium">
                        + Add your first staff member
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {staffList.map((staff) => (
                        <Link
                            key={staff.id}
                            href={`/admin/staff/${staff.id}`}
                            className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-3xl p-4 hover:border-zinc-700 active:scale-[0.98] transition-all"
                        >
                            {/* Avatar */}
                            <div className="w-12 h-12 rounded-2xl bg-yellow-500/15 flex items-center justify-center text-yellow-400 font-bold text-lg shrink-0">
                                {staff.name?.charAt(0)?.toUpperCase() || "?"}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold truncate">{staff.name}</p>
                                <p className="text-zinc-500 text-sm truncate">{staff.email}</p>
                            </div>

                            {/* Salary + arrow */}
                            <div className="text-right shrink-0">
                                <p className="font-bold text-yellow-400">
                                    ₹{Number(staff.salary).toLocaleString("en-IN")}
                                </p>
                                <p className="text-zinc-600 text-xs mt-0.5">monthly</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-zinc-700 shrink-0" />
                        </Link>
                    ))}
                </div>
            )}

            {/* FAB */}
            <Link
                href="/admin/staff/add"
                className="fixed right-5 bottom-24 z-20 h-14 w-14 rounded-full bg-yellow-500 text-black shadow-2xl shadow-yellow-500/20 flex items-center justify-center hover:bg-yellow-400 active:scale-95 transition-all"
                aria-label="Add staff"
            >
                <Plus className="w-6 h-6" />
            </Link>
        </main>
    );
}
