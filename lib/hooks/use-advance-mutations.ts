"use client";

import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import { createClient }
    from "@/lib/supabase";

const MAX_MONTHLY_ADVANCE_PERCENT =
    1;

function getCurrentMonthRange() {
    const now =
        new Date();
    const year =
        now.getFullYear();
    const month =
        now.getMonth();
    const monthNumber =
        String(month + 1).padStart(
            2,
            "0"
        );
    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();

    return {
        monthStart:
            `${year}-${monthNumber}-01`,
        monthEnd:
            `${year}-${monthNumber}-${String(
                daysInMonth
            ).padStart(2, "0")}`,
        daysInMonth,
    };
}

function sumAmounts(
    rows: { amount?: number | string }[] = []
) {
    return rows.reduce(
        (sum, item) =>
            sum +
            Number(
                item.amount || 0
            ),
        0
    );
}

async function validateAdvanceAmount({
    supabase,
    staffId,
    amount,
    excludeRequestId,
}: {
    supabase: ReturnType<
        typeof createClient
    >;
    staffId: string;
    amount: number | string;
    excludeRequestId?: string;
}) {
    const advanceAmount =
        Number(amount);

    if (
        !Number.isFinite(
            advanceAmount
        ) ||
        advanceAmount <= 0
    ) {
        throw new Error(
            "Enter a valid advance amount"
        );
    }

    const { data, error } =
        await supabase
            .from("profiles")
            .select("*")
            .eq("id", staffId)
            .single();

    if (error || !data) {
        throw new Error(
            error?.message ||
                "Staff profile not found"
        );
    }

    const salary =
        Number(
            data.salary ??
                data.monthly_salary ??
                0
        );

    const {
        monthStart,
        monthEnd,
    } =
        getCurrentMonthRange();

    const [
        attendanceRes,
        advancesRes,
        requestsRes,
    ] =
        await Promise.all([
            supabase
                .from("attendance")
                .select(
                    "is_present,allowance_earned,overtime_bonus"
                )
                .eq(
                    "staff_id",
                    staffId
                )
                .gte(
                    "date",
                    monthStart
                )
                .lte(
                    "date",
                    monthEnd
                ),

            supabase
                .from("advances")
                .select("amount")
                .eq(
                    "staff_id",
                    staffId
                )
                .gte(
                    "date",
                    monthStart
                )
                .lte(
                    "date",
                    monthEnd
                ),

            supabase
                .from(
                    "advance_requests"
                )
                .select(
                    "id,amount,status,requested_at"
                )
                .eq(
                    "staff_id",
                    staffId
                )
                .eq(
                    "status",
                    "pending"
                )
                .gte(
                    "requested_at",
                    `${monthStart}T00:00:00`
                )
                .lte(
                    "requested_at",
                    `${monthEnd}T23:59:59`
                ),
        ]);

    if (
        attendanceRes.error ||
        advancesRes.error ||
        requestsRes.error
    ) {
        throw new Error(
            attendanceRes.error?.message ||
                advancesRes.error?.message ||
                requestsRes.error?.message ||
                "Failed to calculate advance limit"
        );
    }

    const attendance =
        attendanceRes.data || [];
    const earnedAdditions =
        attendance.reduce(
            (sum, item) =>
                sum +
                Number(
                    item.allowance_earned ||
                        0
                ) +
                Number(
                    item.overtime_bonus ||
                        0
                ),
            0
        );
    const monthlyPayable =
        Math.floor(
            (salary +
                earnedAdditions) *
                MAX_MONTHLY_ADVANCE_PERCENT
        );
    const approvedAdvanceTotal =
        sumAmounts(
            advancesRes.data || []
        );
    const pendingRequestTotal =
        sumAmounts(
            (requestsRes.data || []).filter(
                (request) =>
                    request.id !==
                    excludeRequestId
            )
        );
    const maxAdvance =
        Math.max(
            0,
            Math.floor(
                monthlyPayable -
                    approvedAdvanceTotal -
                    pendingRequestTotal
            )
        );

    if (
        salary <= 0 ||
        advanceAmount >
            maxAdvance
    ) {
        throw new Error(
            `Advance cannot exceed ₹${maxAdvance.toLocaleString()}`
        );
    }

    return advanceAmount;
}

export function useAddAdvance() {
    const queryClient =
        useQueryClient();
    const supabase =
        createClient();

    return useMutation({
        mutationFn: async ({
            staffId,
            amount,
            reason,
            excludeRequestId,
        }: {
            staffId: string;
            amount: number | string;
            reason?: string;
            excludeRequestId?: string;
        }) => {
            const advanceAmount =
                await validateAdvanceAmount({
                    supabase,
                    staffId,
                    amount,
                    excludeRequestId,
                });

            const { error } =
                await supabase
                    .from("advances")
                    .insert({
                        staff_id:
                            staffId,
                        amount:
                            advanceAmount,
                        reason,
                        date: new Date()
                            .toISOString()
                            .split("T")[0],
                    });

            if (error) {
                throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [
                    "advances",
                ],
            });
            queryClient.invalidateQueries({
                queryKey: [
                    "salary",
                ],
            });
            queryClient.invalidateQueries({
                queryKey: [
                    "reports",
                ],
            });
            queryClient.invalidateQueries({
                queryKey: [
                    "dashboard",
                ],
            });
        },
    });
}

export function useAddAdvanceRequest() {
    const queryClient =
        useQueryClient();
    const supabase =
        createClient();

    return useMutation({
        mutationFn: async ({
            staffId,
            amount,
            reason,
        }: {
            staffId: string;
            amount: number | string;
            reason?: string;
        }) => {
            const advanceAmount =
                await validateAdvanceAmount({
                    supabase,
                    staffId,
                    amount,
                });

            const { error } =
                await supabase
                    .from("advance_requests")
                    .insert({
                        staff_id:
                            staffId,
                        amount:
                            advanceAmount,
                        reason,
                        status:
                            "pending",
                    });

            if (error) {
                throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [
                    "advance_requests",
                ],
            });
            queryClient.invalidateQueries({
                queryKey: [
                    "staff_salary",
                ],
            });
        },
    });
}

export function useUpdateAdvanceRequest() {
    const queryClient =
        useQueryClient();
    const supabase =
        createClient();
    const addAdvance =
        useAddAdvance();

    return useMutation({
        mutationFn: async ({
            request,
            status,
        }: {
            request: any;
            status: "approved" | "rejected";
        }) => {
            if (status === "approved") {
                // Mark approved FIRST to prevent double-approval race
                const { error: statusError } = await supabase
                    .from("advance_requests")
                    .update({
                        status: "approved",
                        approved_at: new Date().toISOString(),
                    })
                    .eq("id", request.id);

                if (statusError) throw statusError;

                try {
                    // excludeRequestId not needed — request is already "approved" so
                    // validation won't count it as pending anymore
                    await addAdvance.mutateAsync({
                        staffId: request.staff_id,
                        amount: request.amount,
                        reason: request.reason,
                    });
                } catch (advanceError) {
                    // Revert status so admin can retry
                    await supabase
                        .from("advance_requests")
                        .update({ status: "pending", approved_at: null })
                        .eq("id", request.id);
                    throw advanceError;
                }

                // Notify staff of approval
                fetch("/api/admin/send-notification", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        staffId: request.staff_id,
                        title: "Advance Request Approved",
                        message: `Your advance request of ₹${request.amount} has been approved.`,
                        type: "success",
                    }),
                }).catch(() => {}); // fire-and-forget

                return;
            }

            const { error } = await supabase
                .from("advance_requests")
                .update({ status })
                .eq("id", request.id);

            if (error) throw error;

            // Notify staff of rejection
            fetch("/api/admin/send-notification", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    staffId: request.staff_id,
                    title: "Advance Request Rejected",
                    message: `Your advance request of ₹${request.amount} was not approved${request.reason ? ` (${request.reason})` : ""}.`,
                    type: "error",
                }),
            }).catch(() => {}); // fire-and-forget
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [
                    "advance_requests",
                ],
            });
            queryClient.invalidateQueries({
                queryKey: [
                    "advances",
                ],
            });
            queryClient.invalidateQueries({
                queryKey: [
                    "salary",
                ],
            });
            queryClient.invalidateQueries({
                queryKey: [
                    "reports",
                ],
            });
            queryClient.invalidateQueries({
                queryKey: [
                    "dashboard",
                ],
            });
        },
    });
}
