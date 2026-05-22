"use client";

import Link from "next/link";
import { useParams }
    from "next/navigation";
import { useStaffDetails }
    from "@/lib/hooks/use-staff-details";

export default function StaffDetailsPage() {
    const params =
        useParams<{
            id: string;
        }>();

    const {
        data,
        isLoading,
        error,
    } =
        useStaffDetails(
            params.id
        );

    if (isLoading) {
        return (
            <main className="px-4 pt-14 pb-32 text-white">
                Loading...
            </main>
        );
    }

    if (error || !data?.staff) {
        return (
            <main className="px-4 pt-14 pb-32 text-white">
                <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-5">
                    Failed to load staff details
                </div>
            </main>
        );
    }

    const {
        staff,
        attendance = [],
        advances = [],
    } = data;

    return (
        <main className="px-4 pt-14 pb-32 text-white">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold">
                        {staff.name}
                    </h1>

                    <p className="text-zinc-400 mt-1">
                        {staff.email}
                    </p>
                </div>

                <Link
                    href="/admin/staff"
                    className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl"
                >
                    Back
                </Link>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-5">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-zinc-500 text-sm">
                            Monthly Salary
                        </p>

                        <h2 className="text-2xl font-bold text-yellow-400 mt-1">
                            ₹{staff.salary}
                        </h2>
                    </div>

                    <div>
                        <p className="text-zinc-500 text-sm">
                            Role
                        </p>

                        <h2 className="text-2xl font-bold mt-1 capitalize">
                            {staff.role}
                        </h2>
                    </div>
                </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-5">
                <h2 className="text-xl font-semibold mb-5">
                    Recent Attendance
                </h2>

                <div className="space-y-3">
                    {attendance.map(
                        (item: any) => (
                            <div
                                key={item.id}
                                className="bg-zinc-800 rounded-2xl p-4 flex items-center justify-between"
                            >
                                <div>
                                    <p className="font-medium">
                                        {item.date}
                                    </p>

                                    <p className="text-zinc-500 text-sm mt-1">
                                        {item.is_present
                                            ? "Present"
                                            : "Absent"}
                                    </p>
                                </div>

                                <div className="text-right">
                                    <p className="text-green-400 font-semibold">
                                        ₹
                                        {item.allowance_earned ||
                                            0}
                                    </p>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
                <h2 className="text-xl font-semibold mb-5">
                    Advances
                </h2>

                <div className="space-y-3">
                    {advances.map(
                        (item: any) => (
                            <div
                                key={item.id}
                                className="bg-zinc-800 rounded-2xl p-4 flex items-center justify-between"
                            >
                                <div>
                                    <p className="font-medium">
                                        ₹{item.amount}
                                    </p>

                                    <p className="text-zinc-500 text-sm mt-1">
                                        {item.reason}
                                    </p>
                                </div>

                                <p className="text-zinc-400 text-sm">
                                    {item.date}
                                </p>
                            </div>
                        )
                    )}

                    {advances.length ===
                        0 && (
                            <div className="text-center text-zinc-500 py-8">
                                No advances found
                            </div>
                        )}
                </div>
            </div>
        </main>
    );
}
