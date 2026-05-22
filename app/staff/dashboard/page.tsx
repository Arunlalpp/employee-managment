"use client";

import { useMemo } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useProfile } from "@/lib/hooks/useProfile";
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
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase";

export default function StaffDashboard() {
    const today = getCurrentDate();
    const month = getCurrentMonth();

    const { data: user, isLoading: userLoading } = useAuth();
    const { data: profile, isLoading: profileLoading } = useProfile(user?.id);

    const supabase = createClient();

    const [y, m] = month.split("-");
    const monthStart = `${y}-${m}-01`;
    const monthEnd = `${y}-${m}-${new Date(
        Number(y),
        Number(m),
        0
    ).getDate()}`;

    const weekStart = format(
        startOfWeek(new Date(), { weekStartsOn: 1 }),
        "yyyy-MM-dd"
    );
    const weekEnd = format(
        endOfWeek(new Date(), { weekStartsOn: 1 }),
        "yyyy-MM-dd"
    );

    // TODAY ATTENDANCE
    const { data: todayRecord } = useQuery({
        queryKey: ["attendance", profile?.id, today],
        queryFn: async () => {
            const { data } = await supabase
                .from("attendance")
                .select("*")
                .eq("staff_id", profile!.id)
                .eq("date", today)
                .maybeSingle();
            return data;
        },
        enabled: !!profile?.id,
        staleTime: 2 * 60 * 1000,
    });

    // WEEK ATTENDANCE
    const { data: weekRecords = [] } = useQuery({
        queryKey: ["attendance", profile?.id, "week", weekStart, weekEnd],
        queryFn: async () => {
            const { data } = await supabase
                .from("attendance")
                .select("*")
                .eq("staff_id", profile!.id)
                .gte("date", weekStart)
                .lte("date", weekEnd);
            return data || [];
        },
        enabled: !!profile?.id,
        staleTime: 2 * 60 * 1000,
    });

    // MONTH ATTENDANCE
    const { data: monthAttendance = [] } = useQuery({
        queryKey: ["attendance", profile?.id, "month", monthStart, monthEnd],
        queryFn: async () => {
            const { data } = await supabase
                .from("attendance")
                .select("*")
                .eq("staff_id", profile!.id)
                .gte("date", monthStart)
                .lte("date", monthEnd);
            return data || [];
        },
        enabled: !!profile?.id,
        staleTime: 5 * 60 * 1000,
    });

    // MONTH ADVANCES
    const { data: monthAdvances = [] } = useQuery({
        queryKey: ["advances", profile?.id, monthStart, monthEnd],
        queryFn: async () => {
            const { data } = await supabase
                .from("advances")
                .select("*")
                .eq("staff_id", profile!.id)
                .gte("date", monthStart)
                .lte("date", monthEnd);
            return data || [];
        },
        enabled: !!profile?.id,
        staleTime: 5 * 60 * 1000,
    });

    const stats = useMemo(() => {
        const monthPresent = monthAttendance.filter(
            (a: any) => a.is_present
        ).length;
        const totalAllowance = monthPresent * 30;
        const totalAdvances = monthAdvances.reduce(
            (sum, item) => sum + Number(item.amount),
            0
        );
        const netSalary =
            Number(profile?.salary || 0) +
            totalAllowance -
            totalAdvances;
        const isPresent = !!todayRecord;

        return {
            monthPresent,
            totalAllowance,
            totalAdvances,
            netSalary,
            isPresent,
        };
    }, [monthAttendance, monthAdvances, profile?.salary, todayRecord]);

    if (userLoading || profileLoading || !profile) {
        return (
            <div className="p-6 text-white">
                Loading...
            </div>
        );
    }

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
                    {stats.isPresent ? (
                        <CheckCircle className="text-green-500" />
                    ) : (
                        <XCircle className="text-red-500" />
                    )}

                    <div>
                        <h2 className="font-semibold text-lg">
                            {stats.isPresent
                                ? "Present Today"
                                : "Absent Today"}
                        </h2>

                        <p className="text-sm text-zinc-400">
                            Daily allowance:
                            {stats.isPresent
                                ? " ₹30"
                                : " ₹0"}
                        </p>
                    </div>
                </div>

                {stats.isPresent && (
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
                            {stats.monthPresent}
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
                                stats.totalAllowance
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
                            {stats.netSalary}
                        </h3>
                    </div>
                </div>

                {/* ADVANCE */}
                {stats.totalAdvances >
                    0 && (
                        <div className="mt-5 border-t border-zinc-800 pt-5 flex items-center gap-2 text-red-500">
                            <TrendingDown size={18} />

                            <p>
                                Advance deducted:
                                ₹
                                {
                                    stats.totalAdvances
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