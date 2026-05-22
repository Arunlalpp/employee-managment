"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createClient } from "@/lib/supabase";
import { useStaffAttendance } from "@/lib/hooks/useAttendance";
import { getCurrentDate } from "@/lib/utils";

type Props = {
    staffId: string;
};

export default function StaffAttendanceBlock({
    staffId,
}: Props) {
    const supabase = createClient();
    const queryClient = useQueryClient();
    const today = getCurrentDate();

    const { data: attendance } =
        useStaffAttendance(
            staffId,
            today
        );

    const [elapsed, setElapsed] =
        useState("00:00:00");

    const checkedIn =
        !!attendance?.is_present &&
        !!attendance?.check_in;

    const checkedOut =
        checkedIn &&
        !!attendance?.check_out;

    const getTimeValue = (
        value?: string | null
    ) => {
        if (!value) {
            return null;
        }

        const date =
            value.includes("T")
                ? new Date(value)
                : new Date(
                      `${today}T${value}`
                  );

        return Number.isNaN(
            date.getTime()
        )
            ? null
            : date;
    };

    const formatAttendanceTime = (
        value?: string | null
    ) => {
        const date =
            getTimeValue(value);

        if (!date) {
            return "--";
        }

        return date.toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit",
            }
        );
    };

    // TIMER
    useEffect(() => {
        if (
            !checkedIn ||
            checkedOut
        ) {
            setElapsed("00:00:00");
            return;
        }

        const interval = setInterval(() => {
            updateElapsed();
        }, 1000);

        updateElapsed();

        return () =>
            clearInterval(interval);
    }, [attendance, checkedIn, checkedOut]);

    const updateElapsed = () => {
        const startDate =
            getTimeValue(
                attendance?.check_in
            );

        if (!startDate) {
            return;
        }

        const start =
            startDate.getTime();

        const now = new Date().getTime();

        const diff = now - start;

        const hrs = Math.floor(
            diff / 1000 / 60 / 60
        );

        const mins = Math.floor(
            (diff / 1000 / 60) % 60
        );

        const secs = Math.floor(
            (diff / 1000) % 60
        );

        setElapsed(
            `${String(hrs).padStart(
                2,
                "0"
            )}:${String(mins).padStart(
                2,
                "0"
            )}:${String(secs).padStart(
                2,
                "0"
            )}`
        );
    };

    const refreshAttendance = () => {
        queryClient.invalidateQueries({
            queryKey: [
                "attendance",
            ],
        });
        queryClient.invalidateQueries({
            queryKey: [
                "admin_attendance",
            ],
        });
    };

    const checkInMutation =
        useMutation({
            mutationFn:
                async () => {
                    const payload = {
                        staff_id:
                            staffId,
                        date: today,
                        is_present:
                            true,
                        check_in:
                            new Date().toISOString(),
                        check_out:
                            null,
                        allowance_earned:
                            30,
                        overtime_bonus:
                            0,
                    };

                    const {
                        error,
                    } =
                        attendance?.id
                            ? await supabase
                                  .from(
                                      "attendance"
                                  )
                                  .update(
                                      payload
                                  )
                                  .eq(
                                      "id",
                                      attendance.id
                                  )
                            : await supabase
                                  .from(
                                      "attendance"
                                  )
                                  .insert(
                                      payload
                                  );

                    if (error) {
                        throw error;
                    }
                },
            onSuccess:
                refreshAttendance,
        });

    const checkOutMutation =
        useMutation({
            mutationFn:
                async () => {
                    if (
                        !attendance?.id ||
                        !checkedIn
                    ) {
                        throw new Error(
                            "Please check in first"
                        );
                    }

                    const now =
                        new Date();

                    const shiftEnd =
                        new Date();

                    shiftEnd.setHours(
                        22,
                        30,
                        0,
                        0
                    );

                    const {
                        error,
                    } =
                        await supabase
                            .from(
                                "attendance"
                            )
                            .update({
                                check_out:
                                    now.toISOString(),

                                overtime_bonus:
                                    now >
                                        shiftEnd
                                        ? 50
                                        : 0,
                            })
                            .eq(
                                "id",
                                attendance.id
                            );

                    if (error) {
                        throw error;
                    }
                },
            onSuccess:
                refreshAttendance,
        });

    // CHECK IN
    const handleCheckIn =
        async () => {
            try {
                await checkInMutation
                    .mutateAsync();
            } catch (error: any) {
                alert(
                    error.message
                );
            }
        };

    // CHECK OUT
    const handleCheckOut = async () => {
        try {
            await checkOutMutation
                .mutateAsync();
        } catch (error: any) {
            alert(
                error.message
            );
        }
    };
    const loading =
        checkInMutation.isPending ||
        checkOutMutation.isPending;
    // TIME BOXES
    const [hh, mm, ss] =
        elapsed.split(":");

    return (
        <div className="mb-5 bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 rounded-[28px] p-4 shadow-2xl">
            <div className="flex flex-col gap-4">
                {/* TIMER */}
                <div className="flex items-center justify-center gap-2">
                    <div className="w-14 h-14 rounded-2xl bg-zinc-700/80 flex items-center justify-center">
                        <span className="text-3xl font-light text-white">
                            {hh}
                        </span>
                    </div>

                    <span className="text-3xl text-zinc-500">
                        :
                    </span>

                    <div className="w-14 h-14 rounded-2xl bg-zinc-700/80 flex items-center justify-center">
                        <span className="text-3xl font-light text-white">
                            {mm}
                        </span>
                    </div>

                    <span className="text-3xl text-zinc-500">
                        :
                    </span>

                    <div className="w-14 h-14 rounded-2xl bg-zinc-700/80 flex items-center justify-center">
                        <span className="text-3xl font-light text-white">
                            {ss}
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                        {!checkedIn && (
                            <p className="text-red-500 text-2xl font-bold">
                                Out
                            </p>
                        )}

                        {checkedIn &&
                            !checkedOut && (
                                <p className="text-green-500 text-2xl font-bold">
                                    Working
                                </p>
                            )}

                        {checkedOut && (
                            <p className="text-yellow-400 text-2xl font-bold">
                                Completed
                            </p>
                        )}
                    </div>

                    <div className="shrink-0">
                        {!checkedIn ? (
                            <button
                                onClick={
                                    handleCheckIn
                                }
                                disabled={
                                    loading
                                }
                                className="h-11 w-[112px] rounded-2xl bg-emerald-500 text-sm font-semibold text-white transition-all hover:bg-emerald-400 active:scale-95 disabled:opacity-60"
                            >
                                {loading
                                    ? "..."
                                    : "Check In"}
                            </button>
                        ) : !checkedOut ? (
                            <button
                                onClick={
                                    handleCheckOut
                                }
                                disabled={
                                    loading
                                }
                                className="h-11 w-[112px] rounded-2xl bg-orange-500 text-sm font-semibold text-white transition-all hover:bg-orange-400 active:scale-95 disabled:opacity-60"
                            >
                                {loading
                                    ? "..."
                                    : "Check Out"}
                            </button>
                        ) : (
                            <div className="h-11 w-[112px] rounded-2xl bg-zinc-800 text-sm font-semibold text-zinc-300 flex items-center justify-center">
                                Finished
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* TIMES */}
            {checkedIn && (
                <div className="mt-5 pt-5 border-t border-zinc-800 flex items-center justify-between">
                    <div>
                        <p className="text-zinc-500 text-xs mb-1">
                            Check In
                        </p>

                        <p className="text-white font-semibold">
                            {formatAttendanceTime(
                                attendance?.check_in
                            )}
                        </p>
                    </div>

                    <div>
                        <p className="text-zinc-500 text-xs mb-1">
                            Check Out
                        </p>

                        <p className="text-white font-semibold">
                            {formatAttendanceTime(
                                attendance?.check_out
                            )}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
