"use client";

import {
    useEffect,
    useMemo,
} from "react";
import { useRouter }
    from "next/navigation";
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
    eachDayOfInterval,
    parseISO,
} from "date-fns";

import {
    formatDate,
    formatTime,
    getCurrentDate,
    getCurrentMonth,
    getMonthLabel,
} from "@/lib/utils";
import StaffAttendanceBlock from "@/components/StaffAttendanceBlock";
import {
    useStaffAttendance,
    useStaffAttendanceRange,
} from "@/lib/hooks/useAttendance";
import { useMonthAttendance } from "@/lib/hooks/useMonthAttendance";
import { useMonthAdvances } from "@/lib/hooks/useMonthAdvances";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase";

function sessionToIST(isoStr: string): string {
    return new Date(isoStr).toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
}

export default function StaffDashboard() {
    const router =
        useRouter();
    const today = getCurrentDate();
    const month = getCurrentMonth();

    const { data: user, isLoading: userLoading } = useAuth();
    const { data: profile, isLoading: profileLoading } = useProfile(user?.id);

    useEffect(() => {
        if (
            !userLoading &&
            !user
        ) {
            router.push("/login");
            return;
        }

        if (
            !profileLoading &&
            profile?.role ===
            "admin"
        ) {
            router.push(
                "/admin/dashboard"
            );
        }
    }, [
        user,
        profile,
        userLoading,
        profileLoading,
        router,
    ]);

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
    const { data: todayRecord } = useStaffAttendance(
        profile?.id || "",
        today
    );

    // Live session status — fallback for "present today" when attendance table
    // hasn't been written yet (staff checked in but no record exists)
    const supabase = createClient();
    const { data: attendanceStatus } = useQuery({
        queryKey: ["attendance-status", profile?.id],
        queryFn: async () => {
            const { data } = await supabase
                .from("staff_attendance_status")
                .select("current_status")
                .eq("staff_id", profile!.id)
                .single();
            return data;
        },
        enabled: !!profile?.id,
        staleTime: 30 * 1000,
    });

    // Today sessions — used as fallback for check_in time when attendance record is stale
    const { data: todaySessions = [] } = useQuery({
        queryKey: ["attendance-sessions", profile?.id, today],
        queryFn: async () => {
            const { data } = await supabase
                .from("attendance_sessions")
                .select("start_time, end_time")
                .eq("staff_id", profile!.id)
                .eq("attendance_date", today)
                .order("created_at", { ascending: true });
            return data || [];
        },
        enabled: !!profile?.id,
        staleTime: 30 * 1000,
    });

    // WEEK ATTENDANCE
    const { data: weekRecords = [] } = useStaffAttendanceRange(
        profile?.id || "",
        "week",
        weekStart,
        weekEnd
    );

    // MONTH ATTENDANCE
    const { data: monthAttendance = [] } = useMonthAttendance(
        profile?.id || "",
        monthStart,
        monthEnd
    );

    // MONTH ADVANCES
    const { data: monthAdvances = [] } = useMonthAdvances(
        profile?.id || "",
        monthStart,
        monthEnd
    );

    const stats = useMemo(() => {
        const monthPresent = monthAttendance.filter(
            (a: any) => a.is_present
        ).length;
        // Use stored allowance_earned to match what admin sees
        const totalAllowance = monthAttendance.reduce(
            (sum: number, a: any) => sum + Number(a.allowance_earned || 0),
            0
        );
        const totalAdvances = monthAdvances.reduce(
            (sum, item) => sum + Number(item.amount),
            0
        );
        const netSalary =
            Number(profile?.salary || 0) +
            totalAllowance -
            totalAdvances;
        // Present if attendance table says so, OR if currently active/on break via sessions
        const liveStatus = attendanceStatus?.current_status;
        const isPresent =
            todayRecord?.is_present ||
            liveStatus === "active" ||
            liveStatus === "break";

        return {
            monthPresent,
            totalAllowance,
            totalAdvances,
            netSalary,
            isPresent,
        };
    }, [monthAttendance, monthAdvances, profile?.salary, todayRecord, attendanceStatus]);

    if (userLoading || profileLoading || !profile) {
        return (
            <div className="p-6 text-white">
                Loading...
            </div>
        );
    }

    return (
        <div className="px-4 pt-14 pb-0 text-white">
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
                                ? " ₹40"
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
                                {todayRecord?.check_in
                                    ? formatTime(todayRecord.check_in)
                                    : (todaySessions as any[])[0]?.start_time
                                        ? sessionToIST((todaySessions as any[])[0].start_time)
                                        : "--"}
                            </p>
                        </div>

                        <div>
                            <p className="text-zinc-500 text-xs">
                                Check Out
                            </p>

                            <p className="text-lg">
                                {todayRecord?.check_out
                                    ? formatTime(todayRecord.check_out)
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
            {(() => {
                const weekDays = eachDayOfInterval({
                    start: parseISO(weekStart),
                    end: parseISO(weekEnd),
                }).filter((d) => format(d, "yyyy-MM-dd") <= today);

                const recordMap = new Map(
                    (weekRecords as any[]).map((r) => [r.date, r])
                );

                return (
                    <div className="mt-5 bg-zinc-900 rounded-3xl p-5 border border-zinc-800">
                        <h2 className="text-xl font-semibold mb-4">
                            Weekly Attendance
                        </h2>

                        <div className="space-y-3">
                            {weekDays.map((day) => {
                                const dateStr = format(day, "yyyy-MM-dd");
                                const record = recordMap.get(dateStr);
                                const isPresent = record?.is_present ?? false;
                                const isToday = dateStr === today;

                                return (
                                    <div
                                        key={dateStr}
                                        className={`flex items-center justify-between rounded-2xl px-4 py-3 ${
                                            isPresent
                                                ? "bg-zinc-800"
                                                : "bg-zinc-800/50"
                                        }`}
                                    >
                                        <div>
                                            <p className="font-medium flex items-center gap-2">
                                                {format(day, "EEE, dd MMM")}
                                                {isToday && (
                                                    <span className="text-xs text-yellow-400 font-normal">Today</span>
                                                )}
                                            </p>
                                            <p className="text-xs mt-0.5">
                                                {isPresent ? (
                                                    <span className="text-zinc-400">
                                                        {record?.check_in ? formatTime(record.check_in) : "--"}
                                                        {" – "}
                                                        {record?.check_out ? formatTime(record.check_out) : "--"}
                                                    </span>
                                                ) : (
                                                    <span className="text-red-400">Absent</span>
                                                )}
                                            </p>
                                        </div>

                                        <div className={`font-semibold text-sm ${isPresent ? "text-green-500" : "text-zinc-600"}`}>
                                            {isPresent ? `+₹${record?.allowance_earned || 0}` : "₹0"}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}