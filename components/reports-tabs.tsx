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
    profitBonus: number;
    advanceTotal: number;
    netSalary: number;
}

interface Props {
    attendanceData: { name: string; value: number }[];
    payrollData: { name: string; salary: number }[];
    trendData: { month: string; profit: number }[];
    detailedData: StaffDetail[];
    reportMonthLabel: string;
}

export default function ReportsTabs({
    attendanceData,
    payrollData,
    trendData,
    detailedData,
    reportMonthLabel,
}: Props) {
    const [tab, setTab] = useState<"graphs" | "details">("graphs");

    return (
        <>
            {/* TABS */}
            <div className="flex bg-zinc-900 border border-zinc-800 rounded-2xl p-1 mb-6">
                <button
                    onClick={() => setTab("graphs")}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                        tab === "graphs"
                            ? "bg-yellow-500 text-black"
                            : "text-zinc-400"
                    }`}
                >
                    Graphs
                </button>
                <button
                    onClick={() => setTab("details")}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                        tab === "details"
                            ? "bg-yellow-500 text-black"
                            : "text-zinc-400"
                    }`}
                >
                    Details
                </button>
            </div>

            {tab === "graphs" && (
                <ReportsChart
                    attendanceData={attendanceData}
                    payrollData={payrollData}
                    trendData={trendData}
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
                        <div
                            key={item.id}
                            className="bg-zinc-900 rounded-3xl p-5 border border-zinc-800"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-white">
                                        {item.name}
                                    </h2>
                                    <p className="text-zinc-500 text-sm">
                                        {item.presentDays} days present
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-yellow-400 text-2xl font-bold">
                                        ₹{item.netSalary.toLocaleString()}
                                    </p>
                                    <p className="text-zinc-500 text-sm">Net Salary</p>
                                </div>
                            </div>

                            <div className="space-y-3 mt-6 border-t border-zinc-800 pt-5">
                                <Row
                                    label="Base Salary"
                                    value={`₹${item.baseSalary.toLocaleString()}`}
                                />
                                <Row
                                    label="Allowance"
                                    value={`+₹${item.allowance.toLocaleString()}`}
                                    color="text-green-400"
                                />
                                <Row
                                    label="OT Bonus"
                                    value={`+₹${item.overtimeBonus.toLocaleString()}`}
                                    color="text-blue-400"
                                />
                                <Row
                                    label="Profit Bonus"
                                    value={`+₹${item.profitBonus.toLocaleString()}`}
                                    color="text-emerald-400"
                                />
                                <Row
                                    label="Advances"
                                    value={`-₹${item.advanceTotal.toLocaleString()}`}
                                    color="text-red-400"
                                />
                                <div className="border-t border-zinc-800 pt-4">
                                    <Row
                                        label="Final Salary"
                                        value={`₹${item.netSalary.toLocaleString()}`}
                                        color="text-yellow-400"
                                        bold
                                    />
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
                                                profitBonus: item.profitBonus,
                                                advances: item.advanceTotal,
                                                netSalary: item.netSalary,
                                                presentDays: item.presentDays,
                                            })
                                        }
                                        className="bg-yellow-500 hover:bg-yellow-400 transition-all text-black rounded-2xl py-3 font-semibold text-sm"
                                    >
                                        Download PDF
                                    </button>
                                    <button
                                        onClick={() => {
                                            const message = `Salary Slip\n\nEmployee: ${item.name}\nMonth: ${reportMonthLabel}\n\nBase Salary: ₹${item.baseSalary.toLocaleString()}\nAllowance: ₹${item.allowance.toLocaleString()}\nOT Bonus: ₹${item.overtimeBonus.toLocaleString()}\nProfit Bonus: ₹${item.profitBonus.toLocaleString()}\nAdvances: ₹${item.advanceTotal.toLocaleString()}\n\nNet Salary: ₹${item.netSalary.toLocaleString()}`;
                                            window.open(
                                                `https://wa.me/?text=${encodeURIComponent(message)}`
                                            );
                                        }}
                                        className="bg-green-500 hover:bg-green-400 transition-all text-black rounded-2xl py-3 font-semibold text-sm"
                                    >
                                        WhatsApp
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}

function Row({
    label,
    value,
    color,
    bold,
}: {
    label: string;
    value: string;
    color?: string;
    bold?: boolean;
}) {
    return (
        <div className="flex items-center justify-between">
            <span className={bold ? "text-white font-semibold" : "text-zinc-400"}>
                {label}
            </span>
            <span className={`font-semibold ${color}`}>{value}</span>
        </div>
    );
}
