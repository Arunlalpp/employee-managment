"use client";

import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import { createClient }
    from "@/lib/supabase";

const ADVANCE_LIMIT_PERCENT =
    0.1;

async function validateAdvanceAmount({
    supabase,
    staffId,
    amount,
}: {
    supabase: ReturnType<
        typeof createClient
    >;
    staffId: string;
    amount: number | string;
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

    const maxAdvance =
        Math.floor(
            salary *
                ADVANCE_LIMIT_PERCENT
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
            if (
                status ===
                "approved"
            ) {
                await addAdvance.mutateAsync({
                    staffId:
                        request.staff_id,
                    amount:
                        request.amount,
                    reason:
                        request.reason,
                });
            }

            const { error } =
                await supabase
                    .from("advance_requests")
                    .update({
                        status,
                        ...(status ===
                        "approved"
                            ? {
                                  approved_at:
                                      new Date().toISOString(),
                              }
                            : {}),
                    })
                    .eq(
                        "id",
                        request.id
                    );

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
