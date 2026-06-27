"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useProfile } from "@/lib/hooks/useProfile";
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
import { useStaffAttendanceRange } from "@/lib/hooks/useAttendance";
import { useMonthAttendance } from "@/lib/hooks/useMonthAttendance";
import { useMonthAdvances } from "@/lib/hooks/useMonthAdvances";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase";
import { TrendingDown, CalendarDays } from "lucide-react";

function timeToMins(t: string): number {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
}

function minsToHM(mins: number): string {
    const h = Math.floor(Math.abs(mins) / 60);
    const m = Math.abs(mins) % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

const CAL_HEADERS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export default function StaffDashboard() {
    const router = useRouter();
    const today = getCurrentDate();
    const month = getCurrentMonth();

    const { data: user, isLoading: userLoading } = useAuth();
    const { data: profile, isLoading: profileLoading } = useProfile(user?.id);

    useEffect(() => {
        if (!userLoading && !user) {
            router.push("/login");
            return;
        }
        if (!profileLoading && profile?.role === "admin") {
            router.push("/admin/dashboard");
        }
    }, [user, profile, userLoading, profileLoading, router]);

    const [y, m] = month.split("-").map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();
    const monthStart = `${month}-01`;
    const monthEnd = `${month}-${String(daysInMonth).padStart(2, "0")}`;

    const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
    const weekEnd = format(endOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");

    const supabase = createClient();

    const { data: attendanceStatus } = useQuery({
        queryKey: ["attendance-status", profile?.id],
        queryFn: async () => {
            const { data } = await supabase
                .from("staff_attendance_status")
                .select("current_status")
                .eq("staff_id", profile!.id)
                .maybeSingle();
            return data;
        },
        enabled: !!profile?.id,
        staleTime: 30 * 1000,
    });

    const { data: weekRecords = [] } = useStaffAttendanceRange(
        profile?.id || "",
        "week",
        weekStart,
        weekEnd
    );

    const { data: monthAttendance = [] } = useMonthAttendance(
        profile?.id || "",
        monthStart,
        monthEnd
    );

    const { data: monthAdvances = [] } = useMonthAdvances(
        profile?.id || "",
        monthStart,
        monthEnd
    );

    const stats = useMemo(() => {
        const monthPresent = (monthAttendance as any[]).filter((a) => a.is_present).length;
        const totalAllowance = (monthAttendance as any[]).reduce(
            (sum, a) => sum + Number(a.allowance_earned || 0),
            0
        );
        const totalAdvances = (monthAdvances as any[]).reduce(
            (sum, item) => sum + Number(item.amount),
            0
        );
        const netSalary = Number(profile?.salary || 0) + totalAllowance - totalAdvances;
        const liveStatus = attendanceStatus?.current_status;
        const isPresent =
            (monthAttendance as any[]).find((a: any) => a.date === today)?.is_present ||
            liveStatus === "active" ||
            liveStatus === "break";

        return { monthPresent, totalAllowance, totalAdvances, netSalary, isPresent };
    }, [monthAttendance, monthAdvances, profile?.salary, today, attendanceStatus]);

    // Build month calendar grid (Monday-first)
    const firstDayOfMonth = new Date(y, m - 1, 1).getDay();
    const firstDayOffset = (firstDayOfMonth + 6) % 7;
    const attendanceMap = new Map((monthAttendance as any[]).map((a) => [a.date, a]));
    const calDays: (number | null)[] = [];
    for (let i = 0; i < firstDayOffset; i++) calDays.push(null);
    for (let d = 1; d <= daysInMonth; d++) calDays.push(d);

    // Week records map
    const recordMap = new Map((weekRecords as any[]).map((r) => [r.date, r]));
    const weekDays = eachDayOfInterval({ start: parseISO(weekStart), end: parseISO(weekEnd) });
    const pastWeekDays = weekDays.filter((d) => format(d, "yyyy-MM-dd") <= today);

    if (userLoading || profileLoading || !profile) {
        return <div className="p-6 text-white">Loading...</div>;
    }

    return (
        <div className="px-4 pt-14 pb-28 text-white">
            {/* HEADER */}
            <h1 className="text-4xl font-bold mb-1">Hello {profile.name}</h1>
            <p className="text-zinc-400 mb-6">{formatDate(today)}</p>

            {/* CHECK-IN WIDGET */}
            <StaffAttendanceBlock staffId={profile.id} />

            {/* ── THIS MONTH ─────────────────────────────────────────── */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 mb-5">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-semibold">{getMonthLabel(month)}</h2>
                        <p className="text-zinc-500 text-sm mt-0.5">
                            {stats.monthPresent} of {daysInMonth} days present
                        </p>
                    </div>
                    <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                        <CalendarDays className="w-5 h-5 text-emerald-400" />
                    </div>
                </div>

                {/* Dot calendar */}
                <div className="grid grid-cols-7 gap-1 mb-5">
                    {CAL_HEADERS.map((h) => (
                        <div key={h} className="text-center text-[11px] text-zinc-600 font-medium pb-1.5">
                            {h}
                        </div>
                    ))}
                    {calDays.map((d, i) => {
                        if (!d) return <div key={`e-${i}`} />;
                        const dateStr = `${month}-${String(d).padStart(2, "0")}`;
                        const rec = attendanceMap.get(dateStr);
                        const isFuture = dateStr > today;
                        const isToday = dateStr === today;
                        const isPresent = rec?.is_present;

                        let bg = "";
                        let text = "text-zinc-700";
                        if (isPresent) {
                            bg = "bg-emerald-500/20";
                            text = "text-emerald-400";
                        } else if (!isFuture && rec) {
                            bg = "bg-red-500/15";
                            text = "text-red-400";
                        } else if (!isFuture && !rec && dateStr < today) {
                            bg = "bg-zinc-800/60";
                            text = "text-zinc-500";
                        }

                        return (
                            <div
                                key={dateStr}
                                className={`aspect-square flex items-center justify-center rounded-full text-[11px] font-medium transition-colors ${bg} ${text} ${
                                    isToday ? "ring-1 ring-white/30 ring-offset-1 ring-offset-zinc-900" : ""
                                }`}
                            >
                                {d}
                            </div>
                        );
                    })}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 mb-5 text-xs text-zinc-500">
                    <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                        Present
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                        Absent
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
                        Future
                    </span>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 divide-x divide-zinc-800 border-t border-zinc-800 pt-4">
                    <div className="text-center pr-2">
                        <p className="text-2xl font-bold">{stats.monthPresent}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">Days Present</p>
                    </div>
                    <div className="text-center px-2">
                        <p className="text-2xl font-bold text-emerald-400">₹{stats.totalAllowance}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">Allowance</p>
                    </div>
                    <div className="text-center pl-2">
                        <p className="text-2xl font-bold text-yellow-400">₹{stats.netSalary}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">Net Salary</p>
                    </div>
                </div>

                {stats.totalAdvances > 0 && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-red-400 bg-red-500/10 rounded-xl px-3 py-2.5">
                        <TrendingDown className="w-4 h-4 shrink-0" />
                        <span>₹{stats.totalAdvances} advance deducted</span>
                    </div>
                )}
            </div>

            {/* ── THIS WEEK ──────────────────────────────────────────── */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
                <h2 className="text-lg font-semibold mb-4">This Week</h2>

                {/* Day pill strip — all 7 days */}
                <div className="grid grid-cols-7 gap-1.5 mb-4">
                    {weekDays.map((day) => {
                        const dateStr = format(day, "yyyy-MM-dd");
                        const rec = recordMap.get(dateStr);
                        const isFuture = dateStr > today;
                        const isToday = dateStr === today;
                        const isPresent = rec?.is_present;

                        return (
                            <div
                                key={dateStr}
                                className={`flex flex-col items-center py-2.5 rounded-2xl ${
                                    isToday
                                        ? "bg-white text-black"
                                        : isPresent
                                        ? "bg-emerald-500/15 text-emerald-300"
                                        : isFuture
                                        ? "bg-zinc-800/40 text-zinc-700"
                                        : "bg-red-500/10 text-red-400"
                                }`}
                            >
                                <span className="text-[10px] font-semibold uppercase tracking-wide">
                                    {format(day, "EEE")[0]}
                                </span>
                                <span className="text-sm font-bold mt-0.5">{format(day, "d")}</span>
                                <div
                                    className={`w-1 h-1 rounded-full mt-1.5 ${
                                        isToday
                                            ? "bg-black"
                                            : isPresent
                                            ? "bg-emerald-400"
                                            : isFuture
                                            ? "bg-zinc-700"
                                            : "bg-red-400"
                                    }`}
                                />
                            </div>
                        );
                    })}
                </div>

                {/* Detailed rows — past days only */}
                <div className="space-y-2">
                    {pastWeekDays.map((day) => {
                        const dateStr = format(day, "yyyy-MM-dd");
                        const rec = recordMap.get(dateStr);
                        const isPresent = rec?.is_present;
                        const isToday = dateStr === today;

                        let durationStr = "";
                        if (isPresent && rec?.check_in && rec?.check_out) {
                            const mins = timeToMins(rec.check_out) - timeToMins(rec.check_in);
                            if (mins > 0) durationStr = minsToHM(mins);
                        }

                        return (
                            <div
                                key={dateStr}
                                className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${
                                    isToday
                                        ? "bg-zinc-800 border border-zinc-700"
                                        : "bg-zinc-800/40"
                                }`}
                            >
                                <div
                                    className={`w-1 h-9 rounded-full shrink-0 ${
                                        isPresent ? "bg-emerald-500" : "bg-red-500/40"
                                    }`}
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium">{format(day, "EEE, dd MMM")}</p>
                                        {isToday && (
                                            <span className="text-[10px] font-semibold text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded-full">
                                                TODAY
                                            </span>
                                        )}
                                    </div>
                                    {isPresent ? (
                                        <p className="text-xs text-zinc-400 mt-0.5">
                                            {rec.check_in ? formatTime(rec.check_in) : "--"}
                                            {" – "}
                                            {rec.check_out ? (
                                                formatTime(rec.check_out)
                                            ) : (
                                                <span className="text-emerald-400">Active</span>
                                            )}
                                        </p>
                                    ) : (
                                        <p className="text-xs text-red-400 mt-0.5">Absent</p>
                                    )}
                                </div>
                                <div className="text-right shrink-0">
                                    {durationStr && (
                                        <p className="text-xs text-zinc-500 mb-0.5">{durationStr}</p>
                                    )}
                                    <p
                                        className={`text-sm font-semibold ${
                                            isPresent ? "text-emerald-400" : "text-zinc-600"
                                        }`}
                                    >
                                        {isPresent ? `+₹${rec?.allowance_earned || 40}` : "₹0"}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
