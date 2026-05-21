"use client";

import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase";

type Props = {
    staffId: string;
};

export default function StaffAttendanceBlock({
    staffId,
}: Props) {
    const supabase = createClient();

    const [attendance, setAttendance] =
        useState<any>(null);

    const [loading, setLoading] =
        useState(false);

    const [elapsed, setElapsed] =
        useState("00:00:00");

    // LOAD ATTENDANCE
    useEffect(() => {
        fetchAttendance();
    }, []);

    // TIMER
    useEffect(() => {
        if (
            !attendance?.check_in ||
            attendance?.check_out
        ) {
            return;
        }

        const interval = setInterval(() => {
            updateElapsed();
        }, 1000);

        updateElapsed();

        return () =>
            clearInterval(interval);
    }, [attendance]);

    const updateElapsed = () => {
        if (!attendance?.check_in)
            return;

        const start = new Date(
            attendance.check_in
        ).getTime();

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

    const fetchAttendance =
        async () => {
            const today = new Date()
                .toISOString()
                .split("T")[0];

            const { data } =
                await supabase
                    .from(
                        "attendance"
                    )
                    .select("*")
                    .eq(
                        "staff_id",
                        staffId
                    )
                    .eq(
                        "date",
                        today
                    )
                    .maybeSingle();

            setAttendance(data);
        };

    // CHECK IN
    const handleCheckIn =
        async () => {
            try {
                setLoading(true);

                const today = new Date()
                    .toISOString()
                    .split("T")[0];

                const {
                    error,
                } =
                    await supabase
                        .from(
                            "attendance"
                        )
                        .insert({
                            staff_id:
                                staffId,
                            date: today,
                            is_present: true,
                            check_in:
                                new Date().toISOString(),
                            allowance_earned: 30,
                        });

                if (error) {
                    alert(
                        error.message
                    );
                    return;
                }

                await fetchAttendance();
            } finally {
                setLoading(false);
            }
        };

    // CHECK OUT
    const handleCheckOut =
        async () => {
            try {
                setLoading(true);

                const {
                    error,
                } =
                    await supabase
                        .from(
                            "attendance"
                        )
                        .update({
                            check_out:
                                new Date().toISOString(),
                        })
                        .eq(
                            "id",
                            attendance.id
                        );

                if (error) {
                    alert(
                        error.message
                    );
                    return;
                }

                await fetchAttendance();
            } finally {
                setLoading(false);
            }
        };

    // TIME BOXES
    const [hh, mm, ss] =
        elapsed.split(":");

    return (
        <div className="mb-5 bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 rounded-[32px] p-5 shadow-2xl">
            <div className="flex items-center justify-between">
                {/* LEFT */}
                <div>
                    {/* TIMER */}
                    <div className="flex items-center gap-2">
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

                    {/* STATUS */}
                    <div className="mt-4">
                        {!attendance && (
                            <p className="text-red-500 text-2xl font-bold">
                                Out
                            </p>
                        )}

                        {attendance &&
                            !attendance.check_out && (
                                <p className="text-green-500 text-2xl font-bold">
                                    Working
                                </p>
                            )}

                        {attendance?.check_out && (
                            <p className="text-yellow-400 text-2xl font-bold">
                                Completed
                            </p>
                        )}
                    </div>
                </div>

                {/* RIGHT */}
                <div>
                    {!attendance ? (
                        <button
                            onClick={
                                handleCheckIn
                            }
                            disabled={
                                loading
                            }
                            className="bg-emerald-500 hover:bg-emerald-400 active:scale-95 transition-all text-white text-xl font-semibold px-6 py-5 rounded-[26px] min-w-[140px]"
                        >
                            {loading
                                ? "..."
                                : "Check-in"}
                        </button>
                    ) : !attendance.check_out ? (
                        <button
                            onClick={
                                handleCheckOut
                            }
                            disabled={
                                loading
                            }
                            className="bg-orange-500 hover:bg-orange-400 active:scale-95 transition-all text-white text-xl font-semibold px-6 py-5 rounded-[26px] min-w-[140px]"
                        >
                            {loading
                                ? "..."
                                : "Check-out"}
                        </button>
                    ) : (
                        <div className="bg-zinc-800 text-zinc-300 text-xl font-semibold px-6 py-5 rounded-[26px] min-w-[140px] text-center">
                            Finished
                        </div>
                    )}
                </div>
            </div>

            {/* TIMES */}
            {attendance && (
                <div className="mt-5 pt-5 border-t border-zinc-800 flex items-center justify-between">
                    <div>
                        <p className="text-zinc-500 text-xs mb-1">
                            Check In
                        </p>

                        <p className="text-white font-semibold">
                            {new Date(
                                attendance.check_in
                            ).toLocaleTimeString(
                                [],
                                {
                                    hour: "2-digit",
                                    minute:
                                        "2-digit",
                                }
                            )}
                        </p>
                    </div>

                    <div>
                        <p className="text-zinc-500 text-xs mb-1">
                            Check Out
                        </p>

                        <p className="text-white font-semibold">
                            {attendance.check_out
                                ? new Date(
                                    attendance.check_out
                                ).toLocaleTimeString(
                                    [],
                                    {
                                        hour: "2-digit",
                                        minute:
                                            "2-digit",
                                    }
                                )
                                : "--"}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}