"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useProfile } from "@/lib/hooks/useProfile";
import { useStaff } from "@/lib/hooks/useStaff";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function StaffPage() {
    const router = useRouter();
    const { data: user, isLoading: userLoading } = useAuth();
    const { data: profile, isLoading: profileLoading } = useProfile(user?.id);
    const { data: staffList = [] } = useStaff();

    useEffect(() => {
        if (!userLoading && !user) {
            router.push("/login");
            return;
        }
        if (!profileLoading && profile && profile.role !== "admin") {
            router.push("/staff/dashboard");
        }
    }, [user, profile, userLoading, profileLoading, router]);

    if (userLoading || profileLoading) {
        return (
            <div className="p-6 text-white">
                Loading...
            </div>
        );
    }

    if (!user || !profile) {
        return null;
    }

    return (
        <main className="px-4 py-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-white">Staff Members</h1>
                <Link
                    href="/admin/staff/add"
                    className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-semibold"
                >
                    + Add Staff
                </Link>
            </div>

            {staffList.length === 0 ? (
                <div className="text-center text-zinc-400 py-12">
                    No staff members found
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {staffList.map((staff) => (
                        <div
                            key={staff.id}
                            className="bg-zinc-900 border border-zinc-800 rounded-lg p-4"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 font-bold">
                                    {staff.name?.charAt(0) || "?"}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">{staff.name}</h3>
                                    <p className="text-zinc-400 text-sm">{staff.email}</p>
                                </div>
                            </div>
                            <p className="text-yellow-400 font-semibold">₹{staff.salary}</p>
                            <Link
                                href={`/admin/staff/${staff.id}`}
                                className="mt-3 block text-center bg-yellow-500/10 text-yellow-400 py-2 rounded hover:bg-yellow-500/20 transition"
                            >
                                View Details
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}