"use client";

import { useAdvanceRequestsWithProfiles } from "@/lib/hooks/useMonthAdvances";
import { useUpdateAdvanceRequest }
    from "@/lib/hooks/use-advance-mutations";

export default function AdminAdvanceRequests() {
    const {
        data: requests = [],
        isLoading: loading,
    } =
        useAdvanceRequestsWithProfiles();

    const updateRequestMutation =
        useUpdateAdvanceRequest();

    // APPROVE
    const approveRequest =
        async (
            item: any
        ) => {
            try {
                await updateRequestMutation
                    .mutateAsync({
                        request:
                            item,
                        status:
                            "approved",
                    });
            } catch (error) {
                alert(
                    "Failed to approve request"
                );
                console.log(
                    error
                );
            }
        };

    // REJECT
    const rejectRequest =
        async (
            id: string
        ) => {
            try {
                await updateRequestMutation
                    .mutateAsync({
                        request: {
                            id,
                        },
                        status:
                            "rejected",
                    });
            } catch (error) {
                alert(
                    "Failed to reject request"
                );
                console.log(
                    error
                );
            }
        };

    if (loading) {
        return (
            <div className="p-6 text-white">
                Loading...
            </div>
        );
    }

    return (
        <div className="px-4 pt-14 pb-32 text-white">
            <h1 className="text-3xl font-bold mb-6">
                Advance Requests
            </h1>

            <div className="space-y-4">
                {requests.map(
                    (item) => (
                        <div
                            key={
                                item.id
                            }
                            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5"
                        >
                            {/* HEADER */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold">
                                        {
                                            item
                                                ?.profile
                                                ?.name
                                        }
                                    </h2>

                                    <p className="text-zinc-500 text-sm">
                                        {
                                            item
                                                ?.profile
                                                ?.email
                                        }
                                    </p>
                                </div>

                                <div>
                                    {item.status ===
                                        "pending" && (
                                            <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-xs">
                                                Pending
                                            </span>
                                        )}

                                    {item.status ===
                                        "approved" && (
                                            <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs">
                                                Approved
                                            </span>
                                        )}

                                    {item.status ===
                                        "rejected" && (
                                            <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs">
                                                Rejected
                                            </span>
                                        )}
                                </div>
                            </div>

                            {/* BODY */}
                            <div className="mt-5">
                                <p className="text-4xl font-light text-yellow-400">
                                    ₹
                                    {
                                        item.amount
                                    }
                                </p>

                                <p className="text-zinc-400 mt-3">
                                    {
                                        item.reason
                                    }
                                </p>
                            </div>

                            {/* BUTTONS */}
                            {item.status ===
                                "pending" && (
                                    <div className="grid grid-cols-2 gap-3 mt-6">
                                        <button
                                            onClick={() =>
                                                rejectRequest(
                                                    item.id
                                                )
                                            }
                                            className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl py-4"
                                        >
                                            Reject
                                        </button>

                                        <button
                                            onClick={() =>
                                                approveRequest(
                                                    item
                                                )
                                            }
                                            className="bg-green-500 text-black font-semibold rounded-2xl py-4"
                                        >
                                            Approve
                                        </button>
                                    </div>
                                )}
                        </div>
                    )
                )}

                {requests.length ===
                    0 && (
                        <div className="text-center text-zinc-500 py-20">
                            No requests found
                        </div>
                    )}
            </div>
        </div>
    );
}
