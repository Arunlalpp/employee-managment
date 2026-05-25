"use client";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import {
    Coffee,
    Play,
    Square,
} from "lucide-react";

import { createClient }
    from "@/lib/supabase";
import { getCurrentDate }
    from "@/lib/utils";

type Props = {
    staffId: string;
};

export default function StaffAttendanceBlock({
    staffId,
}: Props) {

    const supabase =
        createClient();

    const queryClient =
        useQueryClient();

    const today =
        getCurrentDate();

    // STATUS
    const {
        data: status,
    } =
        useQuery({

            queryKey: [
                "attendance-status",
                staffId,
            ],

            queryFn:
                async () => {

                    const {
                        data,
                    } =
                        await supabase
                            .from(
                                "staff_attendance_status"
                            )
                            .select("*")
                            .eq(
                                "staff_id",
                                staffId
                            )
                            .single();

                    return data;
                },
            enabled:
                !!staffId,
        });

    // SESSIONS
    const {
        data: sessions = [],
    } =
        useQuery({

            queryKey: [
                "attendance-sessions",
                staffId,
                today,
            ],

            queryFn:
                async () => {

                    const {
                        data,
                    } =
                        await supabase
                            .from(
                                "attendance_sessions"
                            )
                            .select("*")
                            .eq(
                                "staff_id",
                                staffId
                            )
                            .eq(
                                "attendance_date",
                                today
                            )
                            .order(
                                "created_at",
                                {
                                    ascending: true,
                                }
                            );

                    return (
                        data || []
                    );
                },
            enabled:
                !!staffId,
        });

    const refresh = () => {

        queryClient.invalidateQueries({
            queryKey: [
                "attendance-status",
            ],
        });

        queryClient.invalidateQueries({
            queryKey: [
                "attendance-sessions",
            ],
        });
    };

    const postStaffAction =
        async (url: string) => {
            const response =
                await fetch(
                    url,
                    {
                        method:
                            "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify(
                            {
                                staffId,
                            }
                        ),
                    }
                );

            if (!response.ok) {
                const result =
                    await response
                        .json()
                        .catch(
                            () => ({})
                        );

                throw new Error(
                    result.error ||
                        "Attendance action failed"
                );
            }
        };

    // CHECK IN
    const checkInMutation =
        useMutation({

            mutationFn:
                async () => {

                    await postStaffAction(
                        "/api/staff/check-in"
                    );
                },

            onSuccess:
                refresh,
        });

    // BREAK
    const breakMutation =
        useMutation({

            mutationFn:
                async () => {

                    await postStaffAction(
                        "/api/staff/break"
                    );
                },

            onSuccess:
                refresh,
        });

    // RESUME
    const resumeMutation =
        useMutation({

            mutationFn:
                async () => {

                    await postStaffAction(
                        "/api/staff/resume"
                    );
                },

            onSuccess:
                refresh,
        });

    // FINAL CHECKOUT
    const finalCheckoutMutation =
        useMutation({

            mutationFn:
                async () => {

                    await postStaffAction(
                        "/api/staff/final-checkout"
                    );
                },

            onSuccess:
                refresh,
        });

    // TOTAL WORK TIME
    const getWorkedMs =
        () => {

            let total = 0;

            sessions.forEach(
                (session: any) => {

                    if (
                        !session.start_time
                    ) {
                        return;
                    }

                    const start =
                        new Date(
                            session.start_time
                        ).getTime();

                    const end =
                        session.end_time
                            ? new Date(
                                session.end_time
                            ).getTime()
                            : new Date().getTime();

                    total +=
                        end - start;
                }
            );

            return total;
        };

    const [
        elapsed,
        setElapsed,
    ] =
        useState("00:00:00");

    useEffect(() => {

        const update =
            () => {

                const diff =
                    getWorkedMs();

                const hrs =
                    Math.floor(
                        diff /
                        1000 /
                        60 /
                        60
                    );

                const mins =
                    Math.floor(
                        (
                            diff /
                            1000 /
                            60
                        ) % 60
                    );

                const secs =
                    Math.floor(
                        (
                            diff /
                            1000
                        ) % 60
                    );

                setElapsed(
                    `${String(
                        hrs
                    ).padStart(
                        2,
                        "0"
                    )}:${String(
                        mins
                    ).padStart(
                        2,
                        "0"
                    )}:${String(
                        secs
                    ).padStart(
                        2,
                        "0"
                    )}`
                );
            };

        update();

        const interval =
            setInterval(
                update,
                1000
            );

        return () =>
            clearInterval(
                interval
            );

    }, [sessions]);

    const [
        hh,
        mm,
        ss,
    ] =
        elapsed.split(":");

    const currentStatus =
        status?.current_status ||
        "offline";

    const loading =
        checkInMutation.isPending ||
        breakMutation.isPending ||
        resumeMutation.isPending ||
        finalCheckoutMutation.isPending;

    const totalHours =
        getWorkedMs() /
        1000 /
        60 /
        60;

    const overtime =
        totalHours >= 8;

    const currentSession =
        sessions.find(
            (s: any) =>
                !s.end_time
        );

    return (
        <div className="mb-5 bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 rounded-[28px] p-4 shadow-2xl">

            {/* TIMER */}
            <div className="flex items-center justify-center gap-2">

                {[hh, mm, ss].map(
                    (
                        value,
                        index
                    ) => (

                        <div
                            key={
                                index
                            }
                            className="flex items-center gap-2"
                        >

                            <div className="w-14 h-14 rounded-2xl bg-zinc-700/80 flex items-center justify-center">

                                <span className="text-3xl font-light text-white">
                                    {
                                        value
                                    }
                                </span>

                            </div>

                            {index <
                                2 && (
                                    <span className="text-3xl text-zinc-500">
                                        :
                                    </span>
                                )}

                        </div>
                    )
                )}

            </div>

            {/* STATUS */}
            <div className="mt-5 flex items-center justify-between">

                <div>

                    {currentStatus ===
                        "offline" && (
                            <p className="text-red-500 text-2xl font-bold">
                                Offline
                            </p>
                        )}

                    {currentStatus ===
                        "active" && (
                            <p className="text-green-500 text-2xl font-bold">
                                Working
                            </p>
                        )}

                    {currentStatus ===
                        "break" && (
                            <p className="text-yellow-400 text-2xl font-bold">
                                On Break
                            </p>
                        )}

                    <p className="text-zinc-500 text-sm mt-1">

                        {sessions.length}
                        {" "}
                        session(s)
                        today

                    </p>

                </div>

                {/* ACTIONS */}
                <div className="flex gap-2">

                    {currentStatus ===
                        "offline" && (

                            <button
                                onClick={() =>
                                    checkInMutation.mutate()
                                }
                                disabled={
                                    loading
                                }
                                className="h-11 px-5 rounded-2xl bg-emerald-500 text-white font-semibold"
                            >

                                Check In

                            </button>
                        )}

                    {currentStatus ===
                        "active" && (

                            <>
                                <button
                                    onClick={() =>
                                        breakMutation.mutate()
                                    }
                                    disabled={
                                        loading
                                    }
                                    className="h-11 px-4 rounded-2xl bg-yellow-500 text-black font-semibold flex items-center gap-2"
                                >

                                    <Coffee className="w-4 h-4" />

                                    Break

                                </button>

                                <button
                                    onClick={() =>
                                        finalCheckoutMutation.mutate()
                                    }
                                    disabled={
                                        loading
                                    }
                                    className="h-11 px-4 rounded-2xl bg-orange-500 text-white font-semibold flex items-center gap-2"
                                >

                                    <Square className="w-4 h-4" />

                                    Checkout

                                </button>
                            </>
                        )}

                    {currentStatus ===
                        "break" && (

                            <button
                                onClick={() =>
                                    resumeMutation.mutate()
                                }
                                disabled={
                                    loading
                                }
                                className="h-11 px-5 rounded-2xl bg-blue-500 text-white font-semibold flex items-center gap-2"
                            >

                                <Play className="w-4 h-4" />

                                Resume

                            </button>
                        )}

                </div>

            </div>

            {/* SUMMARY */}
            <div className="mt-5 pt-5 border-t border-zinc-800 grid grid-cols-2 gap-4">

                <div>

                    <p className="text-zinc-500 text-xs mb-1">
                        Started
                    </p>

                    <p className="text-white font-semibold">

                        {sessions[0]
                            ?.start_time
                            ? new Date(
                                sessions[0]
                                    .start_time
                            ).toLocaleTimeString(
                                [],
                                {
                                    hour:
                                        "2-digit",

                                    minute:
                                        "2-digit",
                                }
                            )
                            : "--"}

                    </p>

                </div>

                <div>

                    <p className="text-zinc-500 text-xs mb-1">
                        Overtime
                    </p>

                    <p
                        className={`font-semibold ${overtime
                                ? "text-green-400"
                                : "text-zinc-400"
                            }`}
                    >

                        {overtime
                            ? "Eligible"
                            : "No"}

                    </p>

                </div>

            </div>

            {/* SESSION HISTORY */}
            {sessions.length >
                0 && (

                    <div className="mt-5 pt-5 border-t border-zinc-800 space-y-3">

                        {sessions.map(
                            (
                                session: any,
                                index
                            ) => (

                                <div
                                    key={
                                        session.id
                                    }
                                    className="bg-zinc-800 rounded-2xl p-3 flex items-center justify-between"
                                >

                                    <div>

                                        <p className="text-sm text-zinc-400">
                                            Session{" "}
                                            {index +
                                                1}
                                        </p>

                                        <p className="text-white font-medium">

                                            {new Date(
                                                session.start_time
                                            ).toLocaleTimeString(
                                                [],
                                                {
                                                    hour:
                                                        "2-digit",

                                                    minute:
                                                        "2-digit",
                                                }
                                            )}

                                            {" - "}

                                            {session.end_time
                                                ? new Date(
                                                    session.end_time
                                                ).toLocaleTimeString(
                                                    [],
                                                    {
                                                        hour:
                                                            "2-digit",

                                                        minute:
                                                            "2-digit",
                                                    }
                                                )
                                                : "Running"}

                                        </p>

                                    </div>

                                    <div className="text-green-400 text-sm font-semibold">

                                        {(
                                            (
                                                (
                                                    session.end_time
                                                        ? new Date(
                                                            session.end_time
                                                        ).getTime()
                                                        : new Date().getTime()
                                                ) -
                                                new Date(
                                                    session.start_time
                                                ).getTime()
                                            ) /
                                            1000 /
                                            60 /
                                            60
                                        ).toFixed(
                                            1
                                        )}
                                        h

                                    </div>

                                </div>
                            )
                        )}

                    </div>
                )}

        </div>
    );
}
