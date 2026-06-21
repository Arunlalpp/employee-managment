"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowLeft, Pencil, PowerOff, Power } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useStaffDetails } from "@/lib/hooks/use-staff-details";
import Loading from "@/components/Loading";

export default function StaffDetailsPage() {
    const params = useParams<{ id: string }>();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();

    const backHref =
        searchParams.get("from") === "attendance-staff"
            ? "/admin/attendance?tab=staff"
            : "/admin/staff";

    const { data, isLoading, error } = useStaffDetails(params.id);

    const [editOpen, setEditOpen] = useState(false);
    const [editName, setEditName] = useState("");
    const [editSalary, setEditSalary] = useState("");
    const [editLoading, setEditLoading] = useState(false);
    const [deactivateLoading, setDeactivateLoading] = useState(false);

    if (isLoading) {
        return <Loading className="px-4 pt-14 pb-4 text-white" />;
    }

    if (error || !data?.staff) {
        return (
            <main className="px-4 pt-14 pb-4 text-white">
                <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-5">
                    Failed to load staff details
                </div>
            </main>
        );
    }

    const { staff, attendance = [], advances = [] } = data;

    const openEdit = () => {
        setEditName(staff.name ?? "");
        setEditSalary(String(staff.salary ?? ""));
        setEditOpen(true);
    };

    const handleEdit = async () => {
        if (!editName.trim() || !editSalary) {
            toast.error("Name and salary are required");
            return;
        }
        setEditLoading(true);
        try {
            const res = await fetch(`/api/admin/staff/${params.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: editName.trim(), salary: Number(editSalary) }),
            });
            if (!res.ok) throw new Error((await res.json()).error);
            queryClient.invalidateQueries({ queryKey: ["staff_details", params.id] });
            setEditOpen(false);
            toast.success("Staff updated");
        } catch (err: any) {
            toast.error(err?.message ?? "Failed to update staff");
        } finally {
            setEditLoading(false);
        }
    };

    const handleToggleActive = async () => {
        setDeactivateLoading(true);
        try {
            const res = await fetch(`/api/admin/staff/${params.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_active: !staff.is_active }),
            });
            if (!res.ok) throw new Error((await res.json()).error);
            queryClient.invalidateQueries({ queryKey: ["staff_details", params.id] });
            toast.success(staff.is_active ? "Staff deactivated" : "Staff activated");
        } catch (err: any) {
            toast.error(err?.message ?? "Failed to update status");
        } finally {
            setDeactivateLoading(false);
        }
    };

    return (
        <main className="px-4 pt-14 pb-4 text-white">
            {/* HEADER */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold">{staff.name}</h1>
                    <p className="text-zinc-400 mt-1">{staff.email}</p>
                </div>
                <Link
                    href={backHref}
                    className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Link>
            </div>

            {/* STATUS BADGE */}
            {staff.is_active === false && (
                <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3 text-red-400 text-sm font-medium">
                    This staff account is deactivated
                </div>
            )}

            {/* INFO CARD */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-5">
                <div className="grid grid-cols-2 gap-4 mb-5">
                    <div>
                        <p className="text-zinc-500 text-sm">Monthly Salary</p>
                        <h2 className="text-2xl font-bold text-yellow-400 mt-1">₹{staff.salary}</h2>
                    </div>
                    <div>
                        <p className="text-zinc-500 text-sm">Role</p>
                        <h2 className="text-2xl font-bold mt-1 capitalize">{staff.role}</h2>
                    </div>
                </div>

                {/* ACTIONS */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-zinc-800">
                    <button
                        onClick={openEdit}
                        className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl py-3 transition-colors"
                    >
                        <Pencil className="w-4 h-4" />
                        Edit
                    </button>
                    <button
                        onClick={handleToggleActive}
                        disabled={deactivateLoading}
                        className={`flex items-center justify-center gap-2 rounded-2xl py-3 font-medium transition-colors disabled:opacity-50 ${
                            staff.is_active === false
                                ? "bg-green-500/20 border border-green-500/30 text-green-400"
                                : "bg-red-500/10 border border-red-500/20 text-red-400"
                        }`}
                    >
                        {staff.is_active === false ? (
                            <>
                                <Power className="w-4 h-4" />
                                Activate
                            </>
                        ) : (
                            <>
                                <PowerOff className="w-4 h-4" />
                                Deactivate
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* RECENT ATTENDANCE */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-5">
                <h2 className="text-xl font-semibold mb-5">Recent Attendance</h2>
                <div className="space-y-3">
                    {attendance.map((item: any) => (
                        <div
                            key={item.id}
                            className="bg-zinc-800 rounded-2xl p-4 flex items-center justify-between"
                        >
                            <div>
                                <p className="font-medium">{item.date}</p>
                                <p className="text-zinc-500 text-sm mt-1">
                                    {item.is_present ? "Present" : "Absent"}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-green-400 font-semibold">
                                    ₹{item.allowance_earned || 0}
                                </p>
                            </div>
                        </div>
                    ))}
                    {attendance.length === 0 && (
                        <p className="text-center text-zinc-500 py-6">No attendance records</p>
                    )}
                </div>
            </div>

            {/* ADVANCES */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
                <h2 className="text-xl font-semibold mb-5">Advances</h2>
                <div className="space-y-3">
                    {advances.map((item: any) => (
                        <div
                            key={item.id}
                            className="bg-zinc-800 rounded-2xl p-4 flex items-center justify-between"
                        >
                            <div>
                                <p className="font-medium">₹{item.amount}</p>
                                <p className="text-zinc-500 text-sm mt-1">{item.reason}</p>
                            </div>
                            <p className="text-zinc-400 text-sm">{item.date}</p>
                        </div>
                    ))}
                    {advances.length === 0 && (
                        <div className="text-center text-zinc-500 py-8">No advances found</div>
                    )}
                </div>
            </div>

            {/* EDIT SHEET */}
            {editOpen && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end">
                    <div className="bg-zinc-900 rounded-t-3xl p-6 w-full border-t border-zinc-800">
                        <h2 className="text-2xl font-bold mb-6">Edit Staff</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-zinc-400 text-sm mb-2 block">Name</label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-3.5 text-white"
                                />
                            </div>
                            <div>
                                <label className="text-zinc-400 text-sm mb-2 block">Monthly Salary (₹)</label>
                                <input
                                    type="number"
                                    value={editSalary}
                                    onChange={(e) => setEditSalary(e.target.value)}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-3.5 text-white"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <button
                                    onClick={() => setEditOpen(false)}
                                    className="bg-zinc-800 rounded-2xl py-4 text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleEdit}
                                    disabled={editLoading}
                                    className="bg-yellow-500 text-black font-semibold rounded-2xl py-4 disabled:opacity-50"
                                >
                                    {editLoading ? "Saving..." : "Save"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
