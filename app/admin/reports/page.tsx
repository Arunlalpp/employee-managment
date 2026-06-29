"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import ReportsTabs from "@/components/reports-tabs";
import { format, parseISO, startOfMonth } from "date-fns";
import {
    TrendingUp,
    TrendingDown,
    Users,
    Plus,
    CalendarDays,
} from "lucide-react";

async function fetchReports() {
    const res = await fetch("/api/admin/reports");
    if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
    return res.json();
}

async function fetchDailySales(month: string) {
    const res = await fetch(`/api/admin/daily-sales?month=${month}`);
    if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
    return res.json();
}

export default function ReportsPage() {
    const queryClient = useQueryClient();
    const currentMonth = format(new Date(), "yyyy-MM");

    // Sales entry modal state
    const [saleOpen, setSaleOpen] = useState(false);
    const [saleDate, setSaleDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [saleAmount, setSaleAmount] = useState("");
    const [saleNotes, setSaleNotes] = useState("");
    const [saleSaving, setSaleSaving] = useState(false);

    // Search
    const [nameSearch, setNameSearch] = useState("");

    const { data: reportsData, isLoading: reportsLoading, error: reportsError } = useQuery({
        queryKey: ["reports"],
        queryFn: fetchReports,
        staleTime: 2 * 60 * 1000,
    });

    const { data: salesData } = useQuery({
        queryKey: ["daily-sales", currentMonth],
        queryFn: () => fetchDailySales(currentMonth),
        staleTime: 60 * 1000,
    });

    const handleSaveSale = async () => {
        if (!saleAmount) { toast.error("Enter sales amount"); return; }
        setSaleSaving(true);
        try {
            const res = await fetch("/api/admin/daily-sales", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date: saleDate, total_sales: Number(saleAmount), notes: saleNotes || null }),
            });
            if (!res.ok) throw new Error((await res.json()).error);
            queryClient.invalidateQueries({ queryKey: ["reports"] });
            queryClient.invalidateQueries({ queryKey: ["daily-sales"] });
            setSaleOpen(false);
            setSaleAmount("");
            setSaleNotes("");
            toast.success("Sales recorded");
        } catch (err: any) {
            toast.error(err?.message ?? "Failed to save");
        } finally {
            setSaleSaving(false);
        }
    };

    const openSaleModal = (date?: string) => {
        setSaleDate(date ?? format(new Date(), "yyyy-MM-dd"));
        // Pre-fill if already recorded
        const existing = (salesData?.sales || []).find((s: any) => s.date === (date ?? format(new Date(), "yyyy-MM-dd")));
        setSaleAmount(existing ? String(existing.total_sales) : "");
        setSaleNotes(existing?.notes ?? "");
        setSaleOpen(true);
    };

    // Combine daily breakdown from reports + sales
    const dailyBreakdown: any[] = reportsData?.dailyBreakdown || [];
    const summary = reportsData?.summary || { totalRevenue: 0, totalStaffCost: 0, totalNetProfit: 0 };

    const filtered = useMemo(() => {
        const staff = reportsData?.staff || [];
        const q = nameSearch.toLowerCase();
        const filtered = q ? staff.filter((s: any) => s.name?.toLowerCase().includes(q)) : staff;
        return {
            payrollData: filtered.map((s: any) => ({ name: s.name || "Unknown", salary: s.netSalary })),
            detailedData: filtered.map((s: any) => ({
                id: s.id,
                name: s.name || "Unknown",
                presentDays: s.presentDays,
                baseSalary: Number(s.salary || 0),
                allowance: s.allowance,
                overtimeBonus: s.overtimeBonus,
                advanceTotal: s.advanceTotal,
                netSalary: s.netSalary,
            })),
        };
    }, [reportsData?.staff, nameSearch]);

    const totalStaff = (reportsData?.staff || []).length;
    const totalPresentDays = (reportsData?.staff || []).reduce((s: number, st: any) => s + (st.presentDays || 0), 0);
    const daysElapsed = new Date().getDate();
    const totalAbsentDays = Math.max(0, totalStaff * daysElapsed - totalPresentDays);
    const totalPayroll = (reportsData?.staff || []).reduce((s: number, st: any) => s + st.netSalary, 0);
    const reportMonthLabel = format(new Date(), "MMMM yyyy");

    if (reportsLoading) {
        return (
            <main className="px-4 pt-14 pb-28 text-white">
                <div className="space-y-4 animate-pulse">
                    <div className="h-10 w-40 bg-zinc-800 rounded-xl" />
                    <div className="h-32 bg-zinc-900 rounded-3xl" />
                    <div className="h-48 bg-zinc-900 rounded-3xl" />
                </div>
            </main>
        );
    }

    if (reportsError || !reportsData) {
        return (
            <main className="px-4 pt-14 pb-28 text-white">
                <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-5 text-red-400">
                    Failed to load reports
                </div>
            </main>
        );
    }

    return (
        <main className="px-4 pt-14 pb-28 text-white">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Reports</h1>
                    <p className="text-zinc-500 text-sm mt-0.5">{reportMonthLabel}</p>
                </div>
                <button
                    onClick={() => openSaleModal()}
                    className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 active:scale-95 transition-all text-black font-semibold text-sm px-4 py-2.5 rounded-2xl"
                >
                    <Plus className="w-4 h-4" />
                    Record Sales
                </button>
            </div>

            {/* ── MONTHLY SUMMARY ─────────────────────────────── */}
            <div className="grid grid-cols-3 gap-3 mb-5">
                <SummaryChip
                    label="Revenue"
                    value={`₹${summary.totalRevenue.toLocaleString("en-IN")}`}
                    icon={<TrendingUp className="w-4 h-4" />}
                    color="emerald"
                />
                <SummaryChip
                    label="Staff Cost"
                    value={`₹${summary.totalStaffCost.toLocaleString("en-IN")}`}
                    icon={<Users className="w-4 h-4" />}
                    color="blue"
                />
                <SummaryChip
                    label="Net Profit"
                    value={`₹${summary.totalNetProfit.toLocaleString("en-IN")}`}
                    icon={summary.totalNetProfit >= 0
                        ? <TrendingUp className="w-4 h-4" />
                        : <TrendingDown className="w-4 h-4" />}
                    color={summary.totalNetProfit >= 0 ? "yellow" : "red"}
                />
            </div>

            {/* ── DAILY CALENDAR BREAKDOWN ────────────────────── */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 mb-5">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-lg">Daily Breakdown</h2>
                    <span className="text-xs text-zinc-500 bg-zinc-800 px-2.5 py-1 rounded-full">
                        {reportMonthLabel}
                    </span>
                </div>
                <DailyCalendar
                    breakdown={dailyBreakdown}
                    onTap={openSaleModal}
                />
            </div>

            {/* ── SEARCH ──────────────────────────────────────── */}
            <input
                type="text"
                placeholder="Search staff..."
                value={nameSearch}
                onChange={(e) => setNameSearch(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 text-white placeholder-zinc-600 text-sm mb-5 focus:outline-none focus:border-zinc-700"
            />

            {/* ── STAFF CHARTS + PAYROLL DETAILS ──────────────── */}
            <ReportsTabs
                attendanceData={[
                    { name: "Present", value: totalPresentDays },
                    { name: "Absent", value: totalAbsentDays },
                ]}
                payrollData={filtered.payrollData}
                detailedData={filtered.detailedData}
                reportMonthLabel={reportMonthLabel}
                revenueData={[...dailyBreakdown].reverse()}
            />

            {/* ── TOTAL PAYROLL ────────────────────────────────── */}
            <div className="mt-5 bg-yellow-500/10 border border-yellow-500/20 rounded-3xl p-5">
                <p className="text-yellow-500 text-xs uppercase tracking-widest font-semibold">Total Payroll</p>
                <h2 className="text-4xl font-light text-yellow-400 mt-1">
                    ₹{totalPayroll.toLocaleString("en-IN")}
                </h2>
                <p className="text-zinc-600 text-sm mt-1">{totalStaff} staff · {reportMonthLabel}</p>
            </div>

            {/* ── SALES ENTRY MODAL ───────────────────────────── */}
            {saleOpen && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end">
                    <div className="bg-zinc-900 rounded-t-3xl p-6 pb-safe w-full border-t border-zinc-800" style={{ paddingBottom: "max(2rem, env(safe-area-inset-bottom, 0px) + 5rem)" }}>
                        <div className="w-10 h-1 rounded-full bg-zinc-700 mx-auto mb-6" />
                        <h2 className="text-2xl font-bold mb-1">Record Sales</h2>
                        <p className="text-zinc-500 text-sm mb-5">Enter the total sales amount for the day</p>

                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-zinc-500 mb-1.5 block ml-1">Date</label>
                                <input
                                    type="date"
                                    value={saleDate}
                                    max={format(new Date(), "yyyy-MM-dd")}
                                    onChange={(e) => setSaleDate(e.target.value)}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-3.5 text-white focus:outline-none focus:border-yellow-500/50"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-zinc-500 mb-1.5 block ml-1">Total Sales (₹)</label>
                                <input
                                    type="number"
                                    placeholder="e.g. 45000"
                                    value={saleAmount}
                                    onChange={(e) => setSaleAmount(e.target.value)}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-3.5 text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-500/50"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="text-xs text-zinc-500 mb-1.5 block ml-1">Notes (optional)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. busy weekend"
                                    value={saleNotes}
                                    onChange={(e) => setSaleNotes(e.target.value)}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-3.5 text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-500/50"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-1">
                                <button
                                    onClick={() => setSaleOpen(false)}
                                    className="bg-zinc-800 rounded-2xl py-3.5 text-zinc-300 font-medium active:scale-95 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveSale}
                                    disabled={saleSaving || !saleAmount}
                                    className="bg-yellow-500 text-black font-semibold rounded-2xl py-3.5 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {saleSaving ? "Saving…" : "Save"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

// ── DAILY CALENDAR ──────────────────────────────────────────────────────────

function formatK(n: number) {
    const abs = Math.abs(n);
    if (abs >= 1000) return `${(abs / 1000).toFixed(1)}k`;
    return String(abs);
}

function DailyCalendar({
    breakdown,
    onTap,
}: {
    breakdown: any[];
    onTap: (date: string) => void;
}) {
    const [selected, setSelected] = useState<string | null>(null);
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const dataMap = new Map<string, any>(breakdown.map((b) => [b.date, b]));

    // Build calendar cells (Mon-first)
    const firstDay = startOfMonth(new Date(year, month, 1));
    const startOffset = (firstDay.getDay() + 6) % 7;
    const totalDays = today.getDate();

    const cells: ({ day: number; dateStr: string } | null)[] = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= totalDays; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        cells.push({ day: d, dateStr });
    }
    while (cells.length % 7 !== 0) cells.push(null);

    const selectedData = selected ? dataMap.get(selected) : null;

    const toggleSelect = (dateStr: string) => {
        setSelected((prev) => (prev === dateStr ? null : dateStr));
    };

    if (breakdown.length === 0 && dataMap.size === 0) {
        return (
            <div className="text-center py-10 text-zinc-600">
                <CalendarDays className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">No data yet. Mark attendance and record sales.</p>
            </div>
        );
    }

    return (
        <div>
            {/* Day-name headers */}
            <div className="grid grid-cols-7 mb-1.5">
                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                    <span key={i} className="text-center text-[11px] font-medium text-zinc-600">
                        {d}
                    </span>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
                {cells.map((cell, i) => {
                    if (!cell) return <div key={i} className="aspect-square" />;
                    const { day, dateStr } = cell;
                    const data = dataMap.get(dateStr);
                    const isToday = day === today.getDate();
                    const isSelected = selected === dateStr;
                    const hasRevenue = data?.revenue !== null && data?.revenue !== undefined;
                    const profit = hasRevenue ? data.revenue - data.staffCost : null;
                    const isProfit = profit !== null && profit >= 0;
                    const hasStaff = (data?.presentCount ?? 0) > 0;

                    let bg = "bg-zinc-800/30";
                    let numColor = "text-zinc-500";
                    if (hasStaff && !hasRevenue) { bg = "bg-amber-500/10"; numColor = "text-amber-400"; }
                    if (hasRevenue && isProfit)  { bg = "bg-emerald-500/15"; numColor = "text-emerald-400"; }
                    if (hasRevenue && !isProfit) { bg = "bg-red-500/15"; numColor = "text-red-400"; }

                    return (
                        <button
                            key={dateStr}
                            onClick={() => toggleSelect(dateStr)}
                            className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95
                                ${bg}
                                ${isToday ? "ring-2 ring-yellow-500" : ""}
                                ${isSelected ? "ring-2 ring-white/30" : ""}`}
                        >
                            <span className={`text-xs font-bold leading-none ${numColor}`}>{day}</span>
                            {hasRevenue && profit !== null && (
                                <span className={`text-[8px] leading-none opacity-80 ${numColor}`}>
                                    {isProfit ? "+" : "-"}₹{formatK(profit)}
                                </span>
                            )}
                            {!hasRevenue && hasStaff && (
                                <div className="w-1 h-1 rounded-full bg-amber-400/60 mt-0.5" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Selected day detail panel */}
            {selected && (
                <div className="mt-3 bg-zinc-800/60 rounded-2xl p-4 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div>
                        <p className="font-semibold text-sm">
                            {format(parseISO(selected), "EEEE, d MMMM")}
                        </p>
                        {selectedData ? (
                            <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {selectedData.presentCount} present · ₹{selectedData.staffCost} cost
                            </p>
                        ) : (
                            <p className="text-xs text-zinc-600 mt-0.5">No attendance recorded</p>
                        )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        {selectedData?.revenue !== null && selectedData?.revenue !== undefined ? (
                            <div className="text-right">
                                <p className={`text-sm font-bold ${selectedData.revenue - selectedData.staffCost >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                    ₹{Number(selectedData.revenue).toLocaleString("en-IN")}
                                </p>
                                <p className={`text-[10px] ${selectedData.revenue - selectedData.staffCost >= 0 ? "text-emerald-400/70" : "text-red-400/70"}`}>
                                    {selectedData.revenue - selectedData.staffCost >= 0 ? "+" : ""}
                                    ₹{(selectedData.revenue - selectedData.staffCost).toLocaleString("en-IN")} net
                                </p>
                            </div>
                        ) : null}
                        <button
                            onClick={() => onTap(selected)}
                            className="bg-yellow-500 text-black text-xs font-semibold px-3 py-2 rounded-xl active:scale-95 transition-all"
                        >
                            {selectedData?.revenue !== null && selectedData?.revenue !== undefined ? "Edit" : "Add Sales"}
                        </button>
                    </div>
                </div>
            )}

            {/* Legend */}
            <div className="flex items-center gap-4 mt-3 flex-wrap">
                {[
                    { bg: "bg-emerald-500/15", color: "text-emerald-400", label: "Profit" },
                    { bg: "bg-red-500/15",     color: "text-red-400",     label: "Loss"   },
                    { bg: "bg-amber-500/10",   color: "text-amber-400",   label: "No sales entry" },
                ].map(({ bg, color, label }) => (
                    <div key={label} className="flex items-center gap-1.5">
                        <div className={`w-3 h-3 rounded-sm ${bg}`} />
                        <span className={`text-[11px] ${color}`}>{label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── SUMMARY CHIP ─────────────────────────────────────────────────────────────

const COLOR_MAP: Record<string, { bg: string; text: string }> = {
    emerald: { bg: "bg-emerald-500/10 border-emerald-500/20", text: "text-emerald-400" },
    blue:    { bg: "bg-blue-500/10 border-blue-500/20",       text: "text-blue-400"    },
    yellow:  { bg: "bg-yellow-500/10 border-yellow-500/20",   text: "text-yellow-400"  },
    red:     { bg: "bg-red-500/10 border-red-500/20",         text: "text-red-400"     },
};

function SummaryChip({ label, value, icon, color }: {
    label: string; value: string; icon: React.ReactNode; color: string;
}) {
    const c = COLOR_MAP[color] || COLOR_MAP.yellow;
    return (
        <div className={`border rounded-3xl p-3.5 ${c.bg}`}>
            <div className={`mb-2 ${c.text}`}>{icon}</div>
            <p className={`text-lg font-bold leading-none ${c.text}`}>{value}</p>
            <p className="text-xs text-zinc-600 mt-1">{label}</p>
        </div>
    );
}
