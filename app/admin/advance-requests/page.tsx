"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAdvanceRequestsWithProfiles } from "@/lib/hooks/useMonthAdvances";
import { useUpdateAdvanceRequest } from "@/lib/hooks/use-advance-mutations";
import Loading from "@/components/Loading";

type ConfirmState = {
    item: any;
    action: "approved" | "rejected";
} | null;

export default function AdminAdvanceRequests() {
    const {
        data: requests = [],
        isLoading: loading,
    } = useAdvanceRequestsWithProfiles();

    const updateRequestMutation = useUpdateAdvanceRequest();
    const [confirm, setConfirm] = useState<ConfirmState>(null);

    const handleConfirm = async () => {
        if (!confirm) return;
        const { item, action } = confirm;
        setConfirm(null);

        try {
            await updateRequestMutation.mutateAsync({
                request: item,
                status: action,
            });

            if (action === "approved") {
                toast.success("Advance request approved");
            } else {
                toast.success("Advance request rejected");
            }
        } catch (error: any) {
            toast.error(error?.message || `Failed to ${action} request`);
        }
    };

    if (loading) {
        return <Loading className="p-6 text-white" />;
    }

    return (
        <div className="px-4 pt-14 pb-4 text-white">
            <h1 className="text-3xl font-bold mb-6">Advance Requests</h1>

            <div className="space-y-4">
                {requests.map((item) => (
                    <div
                        key={item.id}
                        className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5"
                    >
                        {/* HEADER */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold">
                                    {item?.profile?.name}
                                </h2>
                                <p className="text-zinc-500 text-sm">
                                    {item?.profile?.email}
                                </p>
                            </div>

                            <div>
                                {item.status === "pending" && (
                                    <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-xs">
                                        Pending
                                    </span>
                                )}
                                {item.status === "approved" && (
                                    <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs">
                                        Approved
                                    </span>
                                )}
                                {item.status === "rejected" && (
                                    <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs">
                                        Rejected
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* BODY */}
                        <div className="mt-5">
                            <p className="text-4xl font-light text-yellow-400">
                                ₹{item.amount}
                            </p>
                            <p className="text-zinc-400 mt-3">{item.reason}</p>
                        </div>

                        {/* BUTTONS */}
                        {item.status === "pending" && (
                            <div className="grid grid-cols-2 gap-3 mt-6">
                                <button
                                    onClick={() =>
                                        setConfirm({ item, action: "rejected" })
                                    }
                                    className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl py-4"
                                >
                                    Reject
                                </button>
                                <button
                                    onClick={() =>
                                        setConfirm({ item, action: "approved" })
                                    }
                                    className="bg-green-500 text-black font-semibold rounded-2xl py-4"
                                >
                                    Approve
                                </button>
                            </div>
                        )}
                    </div>
                ))}

                {requests.length === 0 && (
                    <div className="text-center text-zinc-500 py-20">
                        No requests found
                    </div>
                )}
            </div>

            {/* CONFIRMATION SHEET */}
            {confirm && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center">
                    <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-t-[32px] p-6 animate-in slide-in-from-bottom duration-200">
                        <h2 className="text-xl font-bold mb-2">
                            {confirm.action === "approved"
                                ? "Approve Request?"
                                : "Reject Request?"}
                        </h2>
                        <p className="text-zinc-400 text-sm mb-1">
                            {confirm.item?.profile?.name} —{" "}
                            <span className="text-yellow-400 font-semibold">
                                ₹{confirm.item?.amount}
                            </span>
                        </p>
                        <p className="text-zinc-500 text-sm mb-6">
                            {confirm.item?.reason}
                        </p>

                        {confirm.action === "approved" && (
                            <p className="text-zinc-400 text-xs bg-zinc-800 rounded-xl px-4 py-3 mb-6">
                                This will deduct ₹{confirm.item?.amount} from their
                                monthly salary.
                            </p>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setConfirm(null)}
                                className="border border-zinc-700 text-white rounded-2xl py-4"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={updateRequestMutation.isPending}
                                className={`rounded-2xl py-4 font-semibold disabled:opacity-50 ${
                                    confirm.action === "approved"
                                        ? "bg-green-500 text-black"
                                        : "bg-red-500/20 border border-red-500/30 text-red-400"
                                }`}
                            >
                                {updateRequestMutation.isPending
                                    ? "Processing…"
                                    : confirm.action === "approved"
                                    ? "Yes, Approve"
                                    : "Yes, Reject"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
