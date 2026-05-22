"use client";

import {
    useEffect,
    useState,
} from "react";

import {
    addDays,
    format,
    parseISO,
    subDays,
} from "date-fns";

import {
    ChevronLeft,
    ChevronRight,
    Clock,
    Loader2,
    Save,
} from "lucide-react";

import {
    formatDate,
    getCurrentDate,
} from "@/lib/utils";
import { AttendanceEntry } from "@/lib/hooks/services/attendance.service";
import { useAttendance } from "@/lib/hooks/services/use-attendance";
import { useSaveAttendance } from "@/lib/hooks/use-admin-mutations";

export default function AdminAttendance() {
    const saveAttendanceMutation =
        useSaveAttendance();

    const [
        selectedDate,
        setSelectedDate,
    ] =
        useState(
            getCurrentDate()
        );

    const [
        attendance,
        setAttendance,
    ] =
        useState<
            Record<
                string,
                AttendanceEntry
            >
        >({});

    const [
        saving,
        setSaving,
    ] =
        useState(false);

    const [
        saved,
        setSaved,
    ] =
        useState(false);

    const {
        staffList,
        attendanceMap,
        isLoading,
        error,
    } =
        useAttendance(
            selectedDate
        );

    useEffect(() => {

        setAttendance(
            attendanceMap
        );

    }, [attendanceMap]);

    const toggle = (
        staffId: string
    ) => {

        setAttendance(
            (prev) => {

                const cur =
                    prev[
                    staffId
                    ];

                const isPresent =
                    !cur.is_present;

                return {
                    ...prev,

                    [staffId]:
                    {
                        ...cur,

                        is_present:
                            isPresent,

                        allowance_earned:
                            isPresent
                                ? 30
                                : 0,
                    },
                };
            }
        );

        setSaved(false);
    };

    const updateTime = (
        staffId: string,
        field:
            | "check_in"
            | "check_out",
        value: string
    ) => {

        setAttendance(
            (prev) => ({
                ...prev,

                [staffId]:
                {
                    ...prev[
                    staffId
                    ],

                    [field]:
                        value,
                },
            })
        );

        setSaved(false);
    };

    const saveAttendance =
        async () => {

            setSaving(true);

            try {

                await saveAttendanceMutation
                    .mutateAsync({
                        date:
                            selectedDate,
                        entries:
                            Object.values(
                                attendance
                            ),
                    });

                setSaved(true);

                setTimeout(
                    () =>
                        setSaved(
                            false
                        ),
                    2000
                );

            } catch (
            err
            ) {

                console.error(
                    err
                );

            } finally {

                setSaving(
                    false
                );
            }
        };

    const presentCount =
        Object.values(
            attendance
        ).filter(
            (a) =>
                a.is_present
        ).length;

    const isToday =
        selectedDate ===
        getCurrentDate();

    return (
        <div className="px-4 pt-14 pb-32">

            {/* HEADER */}
            <div className="flex items-center justify-between mb-5">

                <div>

                    <h1 className="text-2xl font-semibold text-white">
                        Attendance
                    </h1>

                    <p className="text-zinc-500 text-sm">
                        {presentCount}
                        /
                        {staffList.length}
                        {" "}
                        present
                    </p>

                </div>

                <button
                    onClick={
                        saveAttendance
                    }
                    disabled={
                        saving
                    }
                    className={`px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-all ${saved
                        ? "bg-green-500 text-black"
                        : "bg-yellow-500 text-black"
                        }`}
                >

                    {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}

                    {saving
                        ? "Saving..."
                        : saved
                            ? "Saved"
                            : "Save"}

                </button>

            </div>

            {/* DATE */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 flex items-center justify-between mb-5">

                <button
                    onClick={() =>
                        setSelectedDate(
                            format(
                                subDays(
                                    parseISO(
                                        selectedDate
                                    ),
                                    1
                                ),
                                "yyyy-MM-dd"
                            )
                        )
                    }
                >
                    <ChevronLeft className="w-5 h-5 text-white" />
                </button>

                <div className="text-center">

                    <p className="text-white font-medium">
                        {formatDate(
                            selectedDate
                        )}
                    </p>

                    {isToday && (
                        <p className="text-yellow-400 text-xs">
                            TODAY
                        </p>
                    )}

                </div>

                <button
                    disabled={
                        isToday
                    }
                    onClick={() =>
                        setSelectedDate(
                            format(
                                addDays(
                                    parseISO(
                                        selectedDate
                                    ),
                                    1
                                ),
                                "yyyy-MM-dd"
                            )
                        )
                    }
                >
                    <ChevronRight className="w-5 h-5 text-white" />
                </button>

            </div>

            {/* LOADING */}
            {isLoading ? (

                <div className="text-center text-zinc-500 py-20">
                    Loading...
                </div>

            ) : (

                <div className="space-y-4">

                    {staffList.map(
                        (
                            staff
                        ) => {

                            const entry =
                                attendance[
                                staff.id
                                ];

                            if (
                                !entry
                            ) {
                                return null;
                            }

                            return (

                                <div
                                    key={
                                        staff.id
                                    }
                                    className={`rounded-2xl border p-4 transition-all ${entry.is_present
                                        ? "bg-green-500/5 border-green-500/20"
                                        : "bg-zinc-900 border-zinc-800"
                                        }`}
                                >

                                    <div className="flex items-center justify-between mb-3">

                                        <div className="flex items-center gap-3">

                                            <div
                                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${entry.is_present
                                                    ? "bg-green-500/20 text-green-400"
                                                    : "bg-yellow-500/20 text-yellow-400"
                                                    }`}
                                            >
                                                {staff?.full_name
                                                    ? staff.full_name
                                                        .trim()
                                                        .charAt(
                                                            0
                                                        )
                                                        .toUpperCase()
                                                    : "?"}
                                            </div>

                                            <div>

                                                <p className="text-white font-medium">
                                                    {staff.full_name ||
                                                        "Unknown"}
                                                </p>

                                                {entry.is_present && (
                                                    <p className="text-green-400 text-xs">
                                                        ₹30 allowance earned
                                                    </p>
                                                )}

                                            </div>

                                        </div>

                                        {/* TOGGLE */}
                                        <button
                                            onClick={() =>
                                                toggle(
                                                    staff.id
                                                )
                                            }
                                            className={`w-14 h-7 rounded-full relative transition-all ${entry.is_present
                                                ? "bg-green-500"
                                                : "bg-zinc-700"
                                                }`}
                                        >

                                            <span
                                                className={`absolute top-0.5 w-6 h-6 rounded-full bg-white transition-all ${entry.is_present
                                                    ? "left-7"
                                                    : "left-0.5"
                                                    }`}
                                            />

                                        </button>

                                    </div>

                                    {entry.is_present && (

                                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-800">

                                            <div>

                                                <label className="text-zinc-500 text-xs flex items-center gap-1 mb-1">
                                                    <Clock className="w-3 h-3" />
                                                    Check In
                                                </label>

                                                <input
                                                    type="time"
                                                    value={
                                                        entry.check_in
                                                    }
                                                    onChange={(
                                                        e
                                                    ) =>
                                                        updateTime(
                                                            staff.id,
                                                            "check_in",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-white"
                                                />

                                            </div>

                                            <div>

                                                <label className="text-zinc-500 text-xs flex items-center gap-1 mb-1">
                                                    <Clock className="w-3 h-3" />
                                                    Check Out
                                                </label>

                                                <input
                                                    type="time"
                                                    value={
                                                        entry.check_out
                                                    }
                                                    onChange={(
                                                        e
                                                    ) =>
                                                        updateTime(
                                                            staff.id,
                                                            "check_out",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-white"
                                                />

                                            </div>

                                        </div>

                                    )}

                                </div>
                            );
                        }
                    )}

                </div>

            )}

            {error && (
                <div className="mt-5 text-red-400 text-sm">
                    Error loading attendance
                </div>
            )}

        </div>
    );
}
