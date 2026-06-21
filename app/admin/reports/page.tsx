"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import ReportsTabs from "@/components/reports-tabs";
import { useReports } from "@/lib/hooks/use-reports";
import GlobalSearchFilter from "@/components/GlobalSearchFilter";

interface SearchFilters {
    employeeName: string;
    status: string;
    startDate: string;
    endDate: string;
}

export default function ReportsPage() {
    const queryClient = useQueryClient();

    const [searchFilters, setSearchFilters] = useState<SearchFilters>({
        employeeName: "",
        status: "",
        startDate: "",
        endDate: "",
    });

    const [reportOpen, setReportOpen] = useState(false);
    const [profitAmount, setProfitAmount] = useState("");
    const [bonusPerStaff, setBonusPerStaff] = useState("");
    const [reportSaving, setReportSaving] = useState(false);

    const { data, isLoading, error } = useReports();

    const openReportSheet = () => {
        setProfitAmount(String(data?.report?.profit_amount ?? ""));
        setBonusPerStaff(String(data?.report?.bonus_per_staff ?? ""));
        setReportOpen(true);
    };

    const handleSaveReport = async () => {
        setReportSaving(true);
        try {
            const now = new Date();
            const res = await fetch("/api/admin/monthly-report", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    month: now.getMonth() + 1,
                    year: now.getFullYear(),
                    profitAmount: Number(profitAmount) || 0,
                    bonusPerStaff: Number(bonusPerStaff) || 0,
                }),
            });
            if (!res.ok) throw new Error((await res.json()).error);
            queryClient.invalidateQueries({ queryKey: ["reports"] });
            setReportOpen(false);
            toast.success("Monthly report saved");
        } catch (err: any) {
            toast.error(err?.message ?? "Failed to save report");
        } finally {
            setReportSaving(false);
        }
    };

    const filtered = useMemo(() => {
        if (!data?.staff) return { payrollData: [], detailedData: [] };

        const nameQuery = searchFilters.employeeName.toLowerCase();

        const staff = nameQuery
            ? data.staff.filter((s: any) =>
                  s.name?.toLowerCase().includes(nameQuery)
              )
            : data.staff;

        return {
            payrollData: staff.map((s: any) => ({
                name: s.name || "Unknown",
                salary: s.netSalary,
            })),
            detailedData: staff.map((s: any) => ({
                id: s.id,
                name: s.name || "Unknown",
                presentDays: s.presentDays,
                baseSalary: Number(s.salary || 0),
                allowance: s.allowance,
                overtimeBonus: s.overtimeBonus,
                profitBonus: s.profitBonus,
                advanceTotal: s.advanceTotal,
                netSalary: s.netSalary,
            })),
        };
    }, [data?.staff, searchFilters.employeeName]);

    if (isLoading) {
        return (
            <main className="p-6 max-w-md mx-auto pb-4">
                <div className="space-y-4 animate-pulse">
                    <div className="h-10 w-40 bg-zinc-800 rounded-xl" />
                    <div className="h-40 bg-zinc-900 rounded-3xl" />
                    <div className="h-96 bg-zinc-900 rounded-3xl" />
                    <div className="h-32 bg-zinc-900 rounded-3xl" />
                </div>
            </main>
        );
    }

    if (error || !data) {
        return (
            <main className="p-6 max-w-md mx-auto pb-4">
                <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-5">
                    <h2 className="text-red-400 text-xl font-semibold">
                        Failed to load reports
                    </h2>
                    <p className="text-zinc-400 text-sm mt-2">
                        Please try again later
                    </p>
                </div>
            </main>
        );
    }

    const { report, staff, trendData } = data;

    const storeProfit = report?.profit_amount || 0;
    const profitBonus = report?.bonus_per_staff || 0;
    const totalStaff = staff?.length || 0;

    // Count unique staff who have at least 1 present day this month
    const presentStaff = staff?.filter((s: any) => s.presentDays > 0).length || 0;
    const absentStaff = totalStaff - presentStaff;

    const reportMonthLabel = report
        ? new Date(report.year, report.month - 1, 1).toLocaleString("en-US", {
              month: "long",
              year: "numeric",
          })
        : new Date().toLocaleString("en-US", { month: "long", year: "numeric" });

    const attendanceData = [
        { name: "Present", value: presentStaff },
        { name: "Absent", value: absentStaff },
    ];

    const totalPayroll = staff?.reduce(
        (sum: number, s: any) => sum + s.netSalary,
        0
    ) || 0;

    return (
        <main className="p-6 max-w-md mx-auto pb-4">
            <h1 className="text-3xl font-bold text-white mb-6">Reports</h1>

            <GlobalSearchFilter onFilterChange={setSearchFilters} />

            {/* SUMMARY */}
            <div className="bg-zinc-900 rounded-3xl p-5 border border-yellow-500/20 mb-6">
                <p className="text-zinc-400 text-sm">Store Profit</p>
                <h2 className="text-4xl font-bold text-yellow-400 mt-2">
                    ₹{storeProfit.toLocaleString()}
                </h2>
                <div className="grid grid-cols-2 gap-4 mt-5">
                    <div>
                        <p className="text-zinc-500 text-sm">Staff</p>
                        <p className="text-white text-xl font-semibold">{totalStaff}</p>
                    </div>
                    <div>
                        <p className="text-zinc-500 text-sm">Bonus / Staff</p>
                        <p className="text-green-400 text-xl font-semibold">
                            ₹{profitBonus.toLocaleString()}
                        </p>
                    </div>
                </div>
                {report && (
                    <p className="text-zinc-600 text-xs mt-3">
                        Data from {reportMonthLabel}
                    </p>
                )}
                <button
                    onClick={openReportSheet}
                    className="mt-4 w-full bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl py-3 text-sm font-medium transition-colors"
                >
                    {report ? "Update Monthly Report" : "Set Monthly Report"}
                </button>
            </div>

            {/* CHARTS + DETAILS */}
            <ReportsTabs
                attendanceData={attendanceData}
                payrollData={filtered.payrollData}
                trendData={trendData}
                detailedData={filtered.detailedData}
                reportMonthLabel={reportMonthLabel}
            />

            {/* TOTAL PAYROLL */}
            <div className="mt-6 bg-yellow-500/10 border border-yellow-500/20 rounded-3xl p-5">
                <p className="text-yellow-500 text-sm">TOTAL PAYROLL</p>
                <h2 className="text-4xl font-bold text-yellow-400 mt-2">
                    ₹{totalPayroll.toLocaleString()}
                </h2>
            </div>

            {/* MONTHLY REPORT SHEET */}
            {reportOpen && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end">
                    <div className="bg-zinc-900 rounded-t-3xl p-6 w-full border-t border-zinc-800">
                        <h2 className="text-2xl font-bold mb-1">Monthly Report</h2>
                        <p className="text-zinc-500 text-sm mb-6">
                            {new Date().toLocaleString("en-US", { month: "long", year: "numeric" })}
                        </p>
                        <div className="space-y-4">
                            <div>
                                <label className="text-zinc-400 text-sm mb-2 block">Store Profit (₹)</label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={profitAmount}
                                    onChange={(e) => setProfitAmount(e.target.value)}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-3.5 text-white"
                                />
                            </div>
                            <div>
                                <label className="text-zinc-400 text-sm mb-2 block">Bonus per Staff (₹)</label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={bonusPerStaff}
                                    onChange={(e) => setBonusPerStaff(e.target.value)}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-3.5 text-white"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <button
                                    onClick={() => setReportOpen(false)}
                                    className="bg-zinc-800 rounded-2xl py-4 text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveReport}
                                    disabled={reportSaving}
                                    className="bg-yellow-500 text-black font-semibold rounded-2xl py-4 disabled:opacity-50"
                                >
                                    {reportSaving ? "Saving..." : "Save"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
