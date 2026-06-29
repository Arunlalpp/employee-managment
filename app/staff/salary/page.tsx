"use client";

import { useState, useEffect, useRef } from "react";
import { addMonths, format, parseISO, subMonths, startOfWeek } from "date-fns";
import {
    TrendingDown,
    CalendarDays,
    Clock3,
    ChevronLeft,
    ChevronRight,
    Banknote,
    CircleCheck,
    Wallet,
    PackageOpen,
} from "lucide-react";
import { formatTime } from "@/lib/utils";
import { toast } from "sonner";
import Loading from "@/components/Loading";
import { useAddAdvanceRequest } from "@/lib/hooks/use-advance-mutations";
import { useStaffSalary } from "@/lib/hooks/use-staff-salary";

export default function StaffSalary() {
    const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
    const [showAdvanceModal, setShowAdvanceModal] = useState(false);
    const [advanceAmount, setAdvanceAmount] = useState("");
    const [advanceReason, setAdvanceReason] = useState("");
    const [advanceLoading, setAdvanceLoading] = useState(false);

    const addAdvanceRequestMutation = useAddAdvanceRequest();
    const { data, isLoading, error } = useStaffSalary(selectedMonth);

    const handleAdvanceRequest = async () => {
        setAdvanceLoading(true);
        try {
            if (!data?.profile?.id) throw new Error("Profile not loaded");
            await addAdvanceRequestMutation.mutateAsync({
                staffId: data.profile.id,
                amount: advanceAmount,
                reason: advanceReason,
            });
            setShowAdvanceModal(false);
            setAdvanceAmount("");
            setAdvanceReason("");
            toast.success("Advance request submitted");
        } catch (error: any) {
            toast.error(error?.message || "Failed to submit advance request");
        } finally {
            setAdvanceLoading(false);
        }
    };

    if (isLoading) return <Loading className="p-6 text-white" />;
    if (error || !data) return <div className="p-6 text-white">Failed to load salary</div>;

    const stats = data.stats;
    const attendance = data.attendance || [];
    const advanceRequests = data.advanceRequests || [];

    const prevMonth = format(subMonths(parseISO(`${selectedMonth}-01`), 1), "yyyy-MM");
    const nextMonth = format(addMonths(parseISO(`${selectedMonth}-01`), 1), "yyyy-MM");
    const currentMonth = format(new Date(), "yyyy-MM");
    const daysInMonth = new Date(...(selectedMonth.split("-").map(Number) as [number, number])).getDate();
    const progressPct = Math.round((stats.daysPresent / daysInMonth) * 100);

    return (
        <div className="px-4 pt-14 pb-28 text-white bg-black min-h-screen">
            <h1 className="text-3xl font-bold mb-5">My Salary</h1>

            {/* ── MONTH NAVIGATOR ─────────────────────────────── */}
            <div className="flex items-center gap-2 mb-5">
                <button
                    onClick={() => setSelectedMonth(prevMonth)}
                    className="w-11 h-11 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all active:scale-95"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex-1 h-11 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                    <p className="font-semibold">{format(parseISO(`${selectedMonth}-01`), "MMMM yyyy")}</p>
                </div>
                <button
                    disabled={nextMonth > currentMonth}
                    onClick={() => setSelectedMonth(nextMonth)}
                    className="w-11 h-11 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-30"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* ── HERO: NET SALARY ────────────────────────────── */}
            <div className="relative rounded-3xl overflow-hidden mb-5 bg-gradient-to-br from-yellow-900/50 via-zinc-900 to-zinc-900 border border-yellow-500/20 p-6">
                {/* Glow */}
                <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-yellow-500/10 blur-3xl pointer-events-none" />

                <p className="text-yellow-500/80 text-xs uppercase tracking-widest font-semibold mb-1">
                    Net Salary
                </p>
                <h2 className="text-5xl font-light text-yellow-400 mb-1">
                    ₹{stats.netSalary.toLocaleString("en-IN")}
                </h2>
                <p className="text-zinc-500 text-sm mb-5">
                    ₹{stats.salary.toLocaleString("en-IN")} base
                    {stats.allowance > 0 && <span className="text-emerald-500"> + ₹{stats.allowance} allowance</span>}
                    {stats.advanceTotal > 0 && <span className="text-red-400"> − ₹{stats.advanceTotal} advance</span>}
                </p>

                {/* Attendance progress bar */}
                <div className="mb-5">
                    <div className="flex items-center justify-between mb-1.5">
                        <p className="text-xs text-zinc-500">Attendance</p>
                        <p className="text-xs text-zinc-400 font-medium">
                            {stats.daysPresent} / {daysInMonth} days
                        </p>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full transition-all duration-700"
                            style={{ width: `${progressPct}%` }}
                        />
                    </div>
                </div>

                <button
                    onClick={() => setShowAdvanceModal(true)}
                    className="w-full bg-yellow-500 hover:bg-yellow-400 active:scale-[0.98] transition-all text-black font-semibold rounded-2xl py-3.5 text-sm"
                >
                    Request Advance
                </button>
            </div>

            {/* ── QUICK STATS ─────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-3 mb-5">
                <StatBox
                    label="Days Present"
                    value={String(stats.daysPresent)}
                    sub={`of ${daysInMonth} days`}
                    color="emerald"
                    icon={<CalendarDays className="w-4 h-4" />}
                />
                <StatBox
                    label="Allowance"
                    value={`₹${stats.allowance}`}
                    sub="@₹40/day"
                    color="green"
                    icon={<CircleCheck className="w-4 h-4" />}
                />
                <StatBox
                    label="Overtime"
                    value={`₹${stats.overtimeBonus}`}
                    sub="bonus earned"
                    color="blue"
                    icon={<Clock3 className="w-4 h-4" />}
                />
                <StatBox
                    label="Advances"
                    value={`₹${stats.advanceTotal}`}
                    sub="deducted"
                    color="red"
                    icon={<TrendingDown className="w-4 h-4" />}
                />
            </div>

            {/* ── SALARY BREAKDOWN ────────────────────────────── */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 mb-5">
                <div className="flex items-center gap-2.5 mb-5">
                    <div className="w-8 h-8 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                        <Wallet className="w-4 h-4 text-yellow-400" />
                    </div>
                    <h2 className="font-semibold text-lg">Salary Breakdown</h2>
                </div>

                <div className="space-y-1">
                    <BreakdownRow
                        icon={<Banknote className="w-3.5 h-3.5" />}
                        label="Base Salary"
                        value={`₹${stats.salary.toLocaleString("en-IN")}`}
                        color="zinc"
                    />
                    <div className="h-px bg-zinc-800 my-2" />
                    <BreakdownRow
                        icon={<CalendarDays className="w-3.5 h-3.5" />}
                        label={`Daily Allowance (${stats.daysPresent}d)`}
                        value={`+₹${stats.allowance}`}
                        color="emerald"
                    />
                    <BreakdownRow
                        icon={<Clock3 className="w-3.5 h-3.5" />}
                        label="Overtime Bonus"
                        value={`+₹${stats.overtimeBonus}`}
                        color={stats.overtimeBonus > 0 ? "blue" : "zinc"}
                    />
                    <div className="h-px bg-zinc-800 my-2" />
                    <BreakdownRow
                        icon={<TrendingDown className="w-3.5 h-3.5" />}
                        label="Advance Deduction"
                        value={`−₹${stats.advanceTotal}`}
                        color={stats.advanceTotal > 0 ? "red" : "zinc"}
                    />
                    <div className="h-px bg-zinc-800 my-2" />
                    <div className="flex items-center justify-between py-2">
                        <p className="font-semibold text-white">Net Payable</p>
                        <p className="font-bold text-xl text-yellow-400">
                            ₹{stats.netSalary.toLocaleString("en-IN")}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── ADVANCE REQUESTS ────────────────────────────── */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 mb-5">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="font-semibold text-lg">Advance Requests</h2>
                    {advanceRequests.length > 0 && (
                        <span className="text-xs text-zinc-500 bg-zinc-800 px-2.5 py-1 rounded-full">
                            {advanceRequests.length}
                        </span>
                    )}
                </div>

                {advanceRequests.length === 0 ? (
                    <div className="flex flex-col items-center py-8 text-zinc-600">
                        <PackageOpen className="w-8 h-8 mb-2" />
                        <p className="text-sm">No requests this month</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {advanceRequests.map((item: any) => (
                            <AdvanceCard key={item.id} item={item} />
                        ))}
                    </div>
                )}
            </div>

            {/* ── ATTENDANCE HISTORY ──────────────────────────── */}
            <AttendanceHistory attendance={attendance} />

            {/* ── ADVANCE MODAL ───────────────────────────────── */}
            {showAdvanceModal && (
                <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-end">
                    <div className="bg-zinc-900 rounded-t-3xl p-6 pb-8 w-full border-t border-zinc-800">
                        <div className="w-10 h-1 rounded-full bg-zinc-700 mx-auto mb-6" />
                        <h2 className="text-2xl font-bold mb-5">Request Advance</h2>
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-zinc-500 mb-1.5 ml-1">Amount (₹)</p>
                                <input
                                    type="number"
                                    placeholder="e.g. 2000"
                                    value={advanceAmount}
                                    onChange={(e) => setAdvanceAmount(e.target.value)}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-3.5 text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-500/50"
                                />
                            </div>
                            <div>
                                <p className="text-xs text-zinc-500 mb-1.5 ml-1">Reason</p>
                                <textarea
                                    placeholder="Brief reason for advance..."
                                    value={advanceReason}
                                    onChange={(e) => setAdvanceReason(e.target.value)}
                                    rows={3}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-3.5 text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-500/50 resize-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3 pt-1">
                                <button
                                    onClick={() => setShowAdvanceModal(false)}
                                    className="bg-zinc-800 rounded-2xl py-3.5 text-zinc-300 font-medium active:scale-95 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAdvanceRequest}
                                    disabled={advanceLoading || !advanceAmount}
                                    className="bg-yellow-500 text-black font-semibold rounded-2xl py-3.5 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {advanceLoading ? "Submitting…" : "Submit"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── SUB-COMPONENTS ──────────────────────────────────────────────────────────

const COLOR_MAP: Record<string, { bg: string; text: string; iconBg: string }> = {
    emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", iconBg: "bg-emerald-500/15" },
    green:   { bg: "bg-green-500/10",   text: "text-green-400",   iconBg: "bg-green-500/15"   },
    blue:    { bg: "bg-blue-500/10",    text: "text-blue-400",    iconBg: "bg-blue-500/15"    },
    red:     { bg: "bg-red-500/10",     text: "text-red-400",     iconBg: "bg-red-500/15"     },
    purple:  { bg: "bg-purple-500/10",  text: "text-purple-400",  iconBg: "bg-purple-500/15"  },
    zinc:    { bg: "bg-zinc-800",       text: "text-zinc-400",    iconBg: "bg-zinc-700"       },
};

function StatBox({ label, value, sub, color, icon }: {
    label: string; value: string; sub: string; color: string; icon: React.ReactNode;
}) {
    const c = COLOR_MAP[color] || COLOR_MAP.zinc;
    return (
        <div className={`${c.bg} rounded-3xl p-4 border border-white/5`}>
            <div className={`w-8 h-8 rounded-xl ${c.iconBg} flex items-center justify-center mb-3 ${c.text}`}>
                {icon}
            </div>
            <p className={`text-2xl font-bold ${c.text}`}>{value}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
            <p className="text-xs text-zinc-600 mt-0.5">{sub}</p>
        </div>
    );
}

function BreakdownRow({ icon, label, value, color }: {
    icon: React.ReactNode; label: string; value: string; color: string;
}) {
    const c = COLOR_MAP[color] || COLOR_MAP.zinc;
    return (
        <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-lg ${c.iconBg} flex items-center justify-center ${c.text} shrink-0`}>
                    {icon}
                </div>
                <p className="text-sm text-zinc-400">{label}</p>
            </div>
            <p className={`text-sm font-semibold ${c.text}`}>{value}</p>
        </div>
    );
}

function AdvanceCard({ item }: { item: any }) {
    const statusMap: Record<string, { label: string; cls: string }> = {
        pending:  { label: "Pending",  cls: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20" },
        approved: { label: "Approved", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
        rejected: { label: "Rejected", cls: "bg-red-500/15 text-red-400 border-red-500/20" },
    };
    const s = statusMap[item.status] || statusMap.pending;

    return (
        <div className="bg-zinc-800/60 rounded-2xl p-4 border border-zinc-700/30">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-lg">₹{Number(item.amount).toLocaleString("en-IN")}</p>
                    {item.reason && (
                        <p className="text-sm text-zinc-400 mt-0.5 line-clamp-2">{item.reason}</p>
                    )}
                    {item.requested_at && (
                        <p className="text-xs text-zinc-600 mt-1.5">
                            {format(parseISO(item.requested_at), "dd MMM yyyy")}
                        </p>
                    )}
                </div>
                <span className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-full border ${s.cls}`}>
                    {s.label}
                </span>
            </div>
        </div>
    );
}

// ── ATTENDANCE HISTORY (infinite scroll) ────────────────────────────────────

function timeToMins(t: string | null | undefined): number {
    if (!t) return 0;
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
}

function minsToHM(mins: number): string {
    if (mins <= 0) return "";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h${m > 0 ? ` ${m}m` : ""}` : `${m}m`;
}

function AttendanceHistory({ attendance }: { attendance: any[] }) {
    const [visibleWeeks, setVisibleWeeks] = useState(2);
    const sentinelRef = useRef<HTMLDivElement>(null);

    if (attendance.length === 0) {
        return (
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
                <h2 className="text-xl font-semibold mb-2">Attendance History</h2>
                <p className="text-center text-zinc-500 py-8">No attendance records</p>
            </div>
        );
    }

    const presentDays = attendance.filter((a) => a.is_present).length;
    const totalAllowance = attendance.reduce((s, a) => s + Number(a.allowance_earned || 0), 0);

    const weekMap = new Map<string, any[]>();
    [...attendance].reverse().forEach((item) => {
        const weekKey = format(startOfWeek(parseISO(item.date), { weekStartsOn: 1 }), "yyyy-MM-dd");
        if (!weekMap.has(weekKey)) weekMap.set(weekKey, []);
        weekMap.get(weekKey)!.push(item);
    });
    const weeks = Array.from(weekMap.entries()).reverse();
    const visibleData = weeks.slice(0, visibleWeeks);
    const hasMore = visibleWeeks < weeks.length;
    const shownDays = visibleData.reduce((s, [, days]) => s + days.length, 0);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        if (!sentinelRef.current || !hasMore) return;
        const observer = new IntersectionObserver(
            (entries) => { if (entries[0].isIntersecting) setVisibleWeeks((p) => p + 2); },
            { rootMargin: "120px" }
        );
        observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, [hasMore, visibleWeeks]);

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
            <div className="flex items-center justify-between mb-1">
                <h2 className="text-xl font-semibold">Attendance History</h2>
                <span className="text-sm text-zinc-500 bg-zinc-800 px-3 py-1 rounded-full">
                    {presentDays} days
                </span>
            </div>
            <p className="text-zinc-500 text-sm mb-5">Total allowance earned: ₹{totalAllowance}</p>

            <div className="space-y-5">
                {visibleData.map(([weekStart, days]) => {
                    const weekPresent = days.filter((d: any) => d.is_present).length;
                    const weekAllowance = days.reduce((s: number, d: any) => s + Number(d.allowance_earned || 0), 0);

                    return (
                        <div key={weekStart}>
                            <div className="flex items-center justify-between mb-2 px-1">
                                <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
                                    Week of {format(parseISO(weekStart), "dd MMM")}
                                </p>
                                <p className="text-xs text-zinc-500">
                                    {weekPresent}d · +₹{weekAllowance}
                                </p>
                            </div>

                            <div className="space-y-2">
                                {days.map((item: any) => {
                                    const isPresent = item.is_present;
                                    const duration =
                                        item.check_in && item.check_out
                                            ? minsToHM(timeToMins(item.check_out) - timeToMins(item.check_in))
                                            : "";
                                    const dayLabel = format(parseISO(item.date), "EEE").toUpperCase();
                                    const hasOT = Number(item.overtime_bonus || 0) > 0;

                                    return (
                                        <div
                                            key={item.id}
                                            className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${
                                                isPresent ? "bg-zinc-800/60" : "bg-red-500/5"
                                            }`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                                isPresent ? "bg-emerald-500/15" : "bg-red-500/10"
                                            }`}>
                                                <span className={`text-[10px] font-bold ${
                                                    isPresent ? "text-emerald-400" : "text-red-400"
                                                }`}>
                                                    {dayLabel}
                                                </span>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-medium">
                                                        {format(parseISO(item.date), "dd MMM yyyy")}
                                                    </p>
                                                    {hasOT && (
                                                        <span className="text-[10px] font-semibold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded-full">
                                                            OT
                                                        </span>
                                                    )}
                                                </div>
                                                {isPresent && item.check_in ? (
                                                    <p className="text-xs text-zinc-500 mt-0.5">
                                                        {formatTime(item.check_in)}
                                                        {item.check_out
                                                            ? ` → ${formatTime(item.check_out)}`
                                                            : " → Active"}
                                                    </p>
                                                ) : !isPresent ? (
                                                    <p className="text-xs text-red-400/70 mt-0.5">Absent</p>
                                                ) : null}
                                            </div>

                                            <div className="text-right shrink-0">
                                                {duration && (
                                                    <p className="text-xs text-zinc-500 mb-0.5">{duration}</p>
                                                )}
                                                <p className={`text-sm font-semibold ${
                                                    isPresent ? "text-emerald-400" : "text-zinc-600"
                                                }`}>
                                                    {isPresent ? `+₹${item.allowance_earned || 0}` : "₹0"}
                                                </p>
                                                {hasOT && (
                                                    <p className="text-xs text-blue-400">+₹{item.overtime_bonus}</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {hasMore ? (
                <div ref={sentinelRef} className="pt-5 flex items-center justify-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-700 animate-pulse" />
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-700 animate-pulse [animation-delay:150ms]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-700 animate-pulse [animation-delay:300ms]" />
                </div>
            ) : (
                <p className="pt-5 text-center text-xs text-zinc-600">
                    Showing all {shownDays} records
                </p>
            )}
        </div>
    );
}
