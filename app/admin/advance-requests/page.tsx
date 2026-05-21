"use client";

import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase";

export default function AdminAdvanceRequests() {
    const [requests, setRequests] =
        useState<any[]>([]);

    const [loading, setLoading] =
        useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);

            const supabase = createClient();

            // GET REQUESTS
            const { data: requestsData, error } =
                await supabase
                    .from("advance_requests")
                    .select("*")
                    .order("requested_at", {
                        ascending: false,
                    });

            if (error) {
                console.log(error);
                return;
            }

            if (!requestsData || requestsData.length === 0) {
                setRequests([]);
                return;
            }

            // GET ALL STAFF IDS
            const staffIds = requestsData.map(
                (item) => item.staff_id
            );

            // GET PROFILES
            const { data: profiles } =
                await supabase
                    .from("profiles")
                    .select("id,name,email")
                    .in("id", staffIds);

            // MERGE DATA
            const merged =
                requestsData.map((item) => ({
                    ...item,
                    profile: profiles?.find(
                        (p) => p.id === item.staff_id
                    ),
                }));

            setRequests(merged);
        } finally {
            setLoading(false);
        }
    };

    // APPROVE
    const approveRequest =
        async (
            item: any
        ) => {
            try {
                const supabase =
                    createClient();

                // UPDATE REQUEST
                const {
                    error:
                    requestError,
                } =
                    await supabase
                        .from(
                            "advance_requests"
                        )
                        .update({
                            status:
                                "approved",

                            approved_at:
                                new Date().toISOString(),
                        })
                        .eq(
                            "id",
                            item.id
                        );

                if (
                    requestError
                ) {
                    alert(
                        requestError.message
                    );

                    return;
                }

                // INSERT INTO ADVANCES
                const {
                    error:
                    advanceError,
                } =
                    await supabase
                        .from(
                            "advances"
                        )
                        .insert({
                            staff_id:
                                item.staff_id,

                            amount:
                                item.amount,

                            reason:
                                item.reason,

                            date: new Date()
                                .toISOString()
                                .split(
                                    "T"
                                )[0],
                        });

                if (
                    advanceError
                ) {
                    alert(
                        advanceError.message
                    );

                    return;
                }

                fetchRequests();
            } catch (error) {
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
                const supabase =
                    createClient();

                const { error } =
                    await supabase
                        .from(
                            "advance_requests"
                        )
                        .update({
                            status:
                                "rejected",
                        })
                        .eq(
                            "id",
                            id
                        );

                if (error) {
                    alert(
                        error.message
                    );

                    return;
                }

                fetchRequests();
            } catch (error) {
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
                                                ?.profiles
                                                ?.name
                                        }
                                    </h2>

                                    <p className="text-zinc-500 text-sm">
                                        {
                                            item
                                                ?.profiles
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