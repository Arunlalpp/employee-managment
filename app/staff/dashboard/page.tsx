"use client";

import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase";

import {
    CheckCircle,
    XCircle,
    TrendingDown,
} from "lucide-react";

import {
    format,
    startOfWeek,
    endOfWeek,
} from "date-fns";

import {
    formatDate,
    formatTime,
    getCurrentDate,
    getCurrentMonth,
    getMonthLabel,
} from "@/lib/utils";
import StaffAttendanceBlock from "@/components/StaffAttendanceBlock";

export default function StaffDashboard() {
    const [profile, setProfile] =
        useState<any>(null);

    const [todayRecord, setTodayRecord] =
        useState<any>(null);

    const [weekRecords, setWeekRecords] =
        useState<any[]>([]);

    const [monthAdvances, setMonthAdvances] =
        useState<any[]>([]);

    const [monthPresent, setMonthPresent] =
        useState(0);

    const [loading, setLoading] =
        useState(true);

    const today = getCurrentDate();

    const month = getCurrentMonth();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            const supabase =
                createClient();

            // AUTH USER
            const {
                data: { user },
            } =
                await supabase.auth.getUser();

            if (!user) return;

            // PROFILE
            const { data: prof } =
                await supabase
                    .from("profiles")
                    .select("*")
                    .eq(
                        "auth_id",
                        user.id
                    )
                    .single();

            if (!prof) return;

            setProfile(prof);

            // WEEK RANGE
            const weekStart = format(
                startOfWeek(
                    new Date(),
                    {
                        weekStartsOn: 1,
                    }
                ),
                "yyyy-MM-dd"
            );

            const weekEnd = format(
                endOfWeek(
                    new Date(),
                    {
                        weekStartsOn: 1,
                    }
                ),
                "yyyy-MM-dd"
            );

            // MONTH RANGE
            const [y, m] =
                month.split("-");

            const monthStart = `${y}-${m}-01`;

            const monthEnd = `${y}-${m}-${new Date(
                Number(y),
                Number(m),
                0
            ).getDate()}`;

            // FETCH DATA
            const [
                { data: todayAtt },
                { data: weekAtt },
                { data: monthAtt },
                { data: advances },
            ] = await Promise.all([
                // TODAY
                supabase
                    .from("attendance")
                    .select("*")
                    .eq(
                        "staff_id",
                        prof.id
                    )
                    .eq("date", today)
                    .maybeSingle(),

                // WEEK
                supabase
                    .from("attendance")
                    .select("*")
                    .eq(
                        "staff_id",
                        prof.id
                    )
                    .gte(
                        "date",
                        weekStart
                    )
                    .lte(
                        "date",
                        weekEnd
                    ),

                // MONTH
                supabase
                    .from("attendance")
                    .select("*")
                    .eq(
                        "staff_id",
                        prof.id
                    )
                    .gte(
                        "date",
                        monthStart
                    )
                    .lte(
                        "date",
                        monthEnd
                    ),

                // ADVANCES
                supabase
                    .from("advances")
                    .select("*")
                    .eq(
                        "staff_id",
                        prof.id
                    )
                    .gte(
                        "date",
                        monthStart
                    )
                    .lte(
                        "date",
                        monthEnd
                    ),
            ]);

            setTodayRecord(todayAtt);

            setWeekRecords(
                weekAtt || []
            );

            setMonthPresent(
                (monthAtt || []).filter(
                    (a: any) =>
                        a.is_present
                ).length
            );

            setMonthAdvances(
                advances || []
            );
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !profile) {
        return (
            <div className="p-6 text-white">
                Loading...
            </div>
        );
    }

    // SALARY CALCULATIONS
    const totalAllowance =
        monthPresent * 30;

    const totalAdvances =
        monthAdvances.reduce(
            (sum, item) =>
                sum + Number(item.amount),
            0
        );

    const netSalary =
        Number(profile.salary) +
        totalAllowance -
        totalAdvances;

    const isPresent =
        !!todayRecord;

    return (
        <div className="px-4 pt-14 pb-44 text-white">
            {/* HEADER */}
            <h1 className="text-4xl font-bold mb-2">
                Hello {profile.name}
            </h1>

            <p className="text-zinc-400 mb-6">
                {formatDate(today)}
            </p>
            <StaffAttendanceBlock
                staffId={profile.id}
            />
            {/* TODAY STATUS */}
            <div className="bg-zinc-900 rounded-3xl p-5 mb-5 border border-zinc-800">
                <div className="flex items-center gap-3">
                    {isPresent ? (
                        <CheckCircle className="text-green-500" />
                    ) : (
                        <XCircle className="text-red-500" />
                    )}

                    <div>
                        <h2 className="font-semibold text-lg">
                            {isPresent
                                ? "Present Today"
                                : "Absent Today"}
                        </h2>

                        <p className="text-sm text-zinc-400">
                            Daily allowance:
                            {isPresent
                                ? " ₹30"
                                : " ₹0"}
                        </p>
                    </div>
                </div>

                {isPresent && (
                    <div className="flex gap-8 mt-5">
                        <div>
                            <p className="text-zinc-500 text-xs">
                                Check In
                            </p>

                            <p className="text-lg">
                                {formatTime(
                                    todayRecord?.check_in
                                )}
                            </p>
                        </div>

                        <div>
                            <p className="text-zinc-500 text-xs">
                                Check Out
                            </p>

                            <p className="text-lg">
                                {todayRecord?.check_out
                                    ? formatTime(
                                        todayRecord.check_out
                                    )
                                    : "--"}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* MONTH CARD */}
            <div className="bg-zinc-900 rounded-3xl p-5 border border-zinc-800">
                <h2 className="text-2xl font-semibold mb-5">
                    {getMonthLabel(
                        month
                    )}
                </h2>

                <div className="grid grid-cols-2 gap-5">
                    {/* DAYS */}
                    <div>
                        <p className="text-zinc-500 text-sm">
                            Days Present
                        </p>

                        <h3 className="text-4xl font-bold">
                            {monthPresent}
                        </h3>
                    </div>

                    {/* ALLOWANCE */}
                    <div>
                        <p className="text-zinc-500 text-sm">
                            Allowance
                        </p>

                        <h3 className="text-4xl font-bold text-green-500">
                            ₹
                            {
                                totalAllowance
                            }
                        </h3>
                    </div>

                    {/* BASE SALARY */}
                    <div>
                        <p className="text-zinc-500 text-sm">
                            Salary
                        </p>

                        <h3 className="text-4xl font-bold">
                            ₹
                            {
                                profile.salary
                            }
                        </h3>
                    </div>

                    {/* NET SALARY */}
                    <div>
                        <p className="text-zinc-500 text-sm">
                            Net Salary
                        </p>

                        <h3 className="text-4xl font-bold text-yellow-400">
                            ₹
                            {netSalary}
                        </h3>
                    </div>
                </div>

                {/* ADVANCE */}
                {totalAdvances >
                    0 && (
                        <div className="mt-5 border-t border-zinc-800 pt-5 flex items-center gap-2 text-red-500">
                            <TrendingDown size={18} />

                            <p>
                                Advance deducted:
                                ₹
                                {
                                    totalAdvances
                                }
                            </p>
                        </div>
                    )}
            </div>
            {/* WEEK ATTENDANCE */}
            <div className="mt-5 bg-zinc-900 rounded-3xl p-5 border border-zinc-800">
                <h2 className="text-xl font-semibold mb-4">
                    Weekly Attendance
                </h2>

                <div className="space-y-3">
                    {weekRecords.map(
                        (
                            item: any
                        ) => (
                            <div
                                key={
                                    item.id
                                }
                                className="flex items-center justify-between bg-zinc-800 rounded-2xl px-4 py-3"
                            >
                                <div>
                                    <p className="font-medium">
                                        {formatDate(
                                            item.date
                                        )}
                                    </p>

                                    <p className="text-xs text-zinc-500">
                                        {item.check_in
                                            ? formatTime(
                                                item.check_in
                                            )
                                            : "--"}
                                        {" - "}
                                        {item.check_out
                                            ? formatTime(
                                                item.check_out
                                            )
                                            : "--"}
                                    </p>
                                </div>

                                <div className="text-green-500 font-semibold">
                                    +₹
                                    {item.allowance_earned ||
                                        0}
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}