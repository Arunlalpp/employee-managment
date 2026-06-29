"use client";

import { useState } from "react";
import ReportsChart from "./reports-chart";
import { generateSalaryPDF } from "@/lib/generate-salary-pdf";

interface StaffDetail {
    id: string;
    name: string;
    presentDays: number;
    baseSalary: number;
    allowance: number;
    overtimeBonus: number;
    advanceTotal: number;
    netSalary: number;
}

interface Props {
    attendanceData: { name: string; value: number }[];
    payrollData: { name: string; salary: number }[];
    detailedData: StaffDetail[];
    reportMonthLabel: string;
    revenueData: any[];
}

export default function ReportsTabs({ attendanceData, payrollData, detailedData, reportMonthLabel, revenueData }: Props) {
    const [tab, setTab] = useState<"graphs" | "details">("graphs");

    return (
        <>
            <div className="flex bg-zinc-900 border border-zinc-800 rounded-2xl p-1 mb-5">
                {(["graphs", "details"] as const).map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all capitalize ${
                            tab === t ? "bg-yellow-500 text-black" : "text-zinc-400"
                        }`}
                    >
                        {t === "graphs" ? "Graphs" : "Payroll"}
                    </button>
                ))}
            </div>

            {tab === "graphs" && (
                <ReportsChart
                    attendanceData={attendanceData}
                    payrollData={payrollData}
                    revenueData={revenueData}
                />
            )}

            {tab === "details" && (
                <div className="space-y-4">
                    {detailedData.length === 0 && (
                        <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800 text-center">
                            <p className="text-zinc-500">No staff found</p>
                        </div>
                    )}
                    {detailedData.map((item) => (
                        <div key={item.id} className="bg-zinc-900 rounded-3xl p-5 border border-zinc-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-white">{item.name}</h2>
                                    <p className="text-zinc-500 text-sm">{item.presentDays} days present</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-yellow-400 text-2xl font-bold">
                                        ₹{item.netSalary.toLocaleString("en-IN")}
                                    </p>
                                    <p className="text-zinc-500 text-sm">Net Salary</p>
                                </div>
                            </div>

                            <div className="space-y-2 mt-5 border-t border-zinc-800 pt-4">
                                <Row label="Base Salary" value={`₹${item.baseSalary.toLocaleString("en-IN")}`} />
                                <Row label={`Allowance (${item.presentDays}d)`} value={`+₹${item.allowance.toLocaleString("en-IN")}`} color="text-emerald-400" />
                                <Row label="OT Bonus" value={`+₹${item.overtimeBonus.toLocaleString("en-IN")}`} color={item.overtimeBonus > 0 ? "text-blue-400" : "text-zinc-600"} />
                                <Row label="Advance Deduction" value={`−₹${item.advanceTotal.toLocaleString("en-IN")}`} color={item.advanceTotal > 0 ? "text-red-400" : "text-zinc-600"} />
                                <div className="border-t border-zinc-800 pt-3 mt-1">
                                    <Row label="Net Salary" value={`₹${item.netSalary.toLocaleString("en-IN")}`} color="text-yellow-400" bold />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-5">
                                <button
                                    onClick={() =>
                                        generateSalaryPDF({
                                            name: item.name,
                                            month: reportMonthLabel,
                                            baseSalary: item.baseSalary,
                                            allowance: item.allowance,
                                            overtimeBonus: item.overtimeBonus,
                                            advances: item.advanceTotal,
                                            netSalary: item.netSalary,
                                            presentDays: item.presentDays,
                                        })
                                    }
                                    className="bg-yellow-500 hover:bg-yellow-400 active:scale-[0.98] transition-all text-black rounded-2xl py-3 font-semibold text-sm"
                                >
                                    Download PDF
                                </button>
                                <button
                                    onClick={() => {
                                        const msg = `Salary Slip\n\nEmployee: ${item.name}\nMonth: ${reportMonthLabel}\n\nBase Salary: ₹${item.baseSalary.toLocaleString("en-IN")}\nAllowance: ₹${item.allowance.toLocaleString("en-IN")}\nOT Bonus: ₹${item.overtimeBonus.toLocaleString("en-IN")}\nAdvances: ₹${item.advanceTotal.toLocaleString("en-IN")}\n\nNet Salary: ₹${item.netSalary.toLocaleString("en-IN")}`;
                                        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`);
                                    }}
                                    className="bg-green-500 hover:bg-green-400 active:scale-[0.98] transition-all text-black rounded-2xl py-3 font-semibold text-sm"
                                >
                                    WhatsApp
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}

function Row({ label, value, color, bold }: { label: string; value: string; color?: string; bold?: boolean }) {
    return (
        <div className="flex items-center justify-between py-1">
            <span className={bold ? "text-white font-semibold" : "text-zinc-400 text-sm"}>{label}</span>
            <span className={`font-semibold text-sm ${color || "text-white"}`}>{value}</span>
        </div>
    );
}
