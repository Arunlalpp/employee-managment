"use client";

import { useState } from "react";

import ReportsChart from "./reports-chart";
import { generateSalaryPDF } from "@/lib/generate-salary-pdf";

export default function ReportsTabs({
    attendanceData,
    payrollData,
    trendData,
    detailedData,
}: any) {
    const [tab, setTab] =
        useState<
            "graphs" | "details"
        >("graphs");

    return (
        <>
            {/* TABS */}
            <div className="flex bg-zinc-900 border border-zinc-800 rounded-2xl p-1 mb-6">
                <button
                    onClick={() =>
                        setTab(
                            "graphs"
                        )
                    }
                    className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${tab ===
                        "graphs"
                        ? "bg-yellow-500 text-black"
                        : "text-zinc-400"
                        }`}
                >
                    Graphs
                </button>

                <button
                    onClick={() =>
                        setTab(
                            "details"
                        )
                    }
                    className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${tab ===
                        "details"
                        ? "bg-yellow-500 text-black"
                        : "text-zinc-400"
                        }`}
                >
                    Details
                </button>
            </div>


            {/* GRAPH VIEW */}
            {tab === "graphs" && (
                <ReportsChart
                    attendanceData={
                        attendanceData
                    }
                    payrollData={
                        payrollData
                    }
                    trendData={
                        trendData
                    }
                />
            )}

            {/* DETAIL VIEW */}
            {tab === "details" && (
                <div className="space-y-4">
                    {detailedData.map(
                        (
                            item: any
                        ) => (
                            <div
                                key={
                                    item.id
                                }
                                className="bg-zinc-900 rounded-3xl p-5 border border-zinc-800"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-semibold text-white">
                                            {
                                                item.name
                                            }
                                        </h2>

                                        <p className="text-zinc-500 text-sm">
                                            {
                                                item.presentDays
                                            }{" "}
                                            days present
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-yellow-400 text-2xl font-bold">
                                            ₹
                                            {
                                                item.netSalary
                                            }
                                        </p>

                                        <p className="text-zinc-500 text-sm">
                                            Net Salary
                                        </p>
                                    </div>
                                </div>

                                {/* BREAKDOWN */}
                                <div className="space-y-3 mt-6 border-t border-zinc-800 pt-5">
                                    <Row
                                        label="Base Salary"
                                        value={`₹${item.baseSalary}`}
                                    />

                                    <Row
                                        label="Allowance"
                                        value={`+₹${item.allowance}`}
                                        color="text-green-400"
                                    />

                                    <Row
                                        label="OT Bonus"
                                        value={`+₹${item.overtimeBonus}`}
                                        color="text-blue-400"
                                    />

                                    <Row
                                        label="Profit Bonus"
                                        value={`+₹${item.profitBonus}`}
                                        color="text-emerald-400"
                                    />

                                    <Row
                                        label="Advances"
                                        value={`-₹${item.advanceTotal}`}
                                        color="text-red-400"
                                    />

                                    <div className="border-t border-zinc-800 pt-4">
                                        <Row
                                            label="Final Salary"
                                            value={`₹${item.netSalary}`}
                                            color="text-yellow-400"
                                            bold
                                        />
                                    </div>
                                    {/* ACTION BUTTONS */}
                                    <div className="grid grid-cols-2 gap-3 mt-5">
                                        {/* PDF */}
                                        <button
                                            onClick={() =>
                                                generateSalaryPDF({
                                                    name: item.name,

                                                    month: "May 2026",

                                                    baseSalary:
                                                        item.baseSalary,

                                                    allowance:
                                                        item.allowance,

                                                    overtimeBonus:
                                                        item.overtimeBonus,

                                                    profitBonus:
                                                        item.profitBonus,

                                                    advances:
                                                        item.advanceTotal,

                                                    netSalary:
                                                        item.netSalary,

                                                    presentDays:
                                                        item.presentDays,
                                                })
                                            }
                                            className="bg-yellow-500 hover:bg-yellow-400 transition-all text-black rounded-2xl py-3 font-semibold"
                                        >
                                            Download PDF
                                        </button>

                                        {/* WHATSAPP */}
                                        <button
                                            onClick={() => {
                                                const message = `
Salary Slip

Employee: ${item.name}

Base Salary: ₹${item.baseSalary}

Allowance: ₹${item.allowance}

OT Bonus: ₹${item.overtimeBonus}

Profit Bonus: ₹${item.profitBonus}

Advances: ₹${item.advanceTotal}

Net Salary: ₹${item.netSalary}
`;

                                                window.open(
                                                    `https://wa.me/?text=${encodeURIComponent(
                                                        message
                                                    )}`
                                                );
                                            }}
                                            className="bg-green-500 hover:bg-green-400 transition-all text-black rounded-2xl py-3 font-semibold"
                                        >
                                            WhatsApp
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    )}
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
}: any) {
    return (
        <div className="flex items-center justify-between">
            <span
                className={`${bold
                    ? "text-white font-semibold"
                    : "text-zinc-400"
                    }`}
            >
                {label}
            </span>

            <span
                className={`font-semibold ${color}`}
            >
                {value}
            </span>
        </div>
    );
}