"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";

type Props = {
    profile: any;
    attendance: any;
    stats: {
        totalStaff: number;
        presentToday: number;
        totalDeduction: number;
    };
};

export default function StaffDashboardUI({
    profile,
    attendance,
    stats,
}: Props) {
    const chartData = [
        {
            name: "Present",
            value: stats.presentToday,
        },
        {
            name: "Absent",
            value:
                stats.totalStaff -
                stats.presentToday,
        },
    ];

    const salaryData = [
        {
            name: "Salary",
            amount: profile.salary,
        },
        {
            name: "Deduction",
            amount:
                stats.totalDeduction,
        },
    ];

    return (
        <main className="min-h-screen bg-black text-white p-5">
            <h1 className="text-3xl font-bold mb-2">
                Welcome {profile.name}
            </h1>

            <p className="text-zinc-400 mb-6">
                Staff Dashboard
            </p>

            {/* CARDS */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-zinc-900 rounded-2xl p-5">
                    <p className="text-zinc-400 text-sm">
                        Salary
                    </p>

                    <h2 className="text-2xl font-bold mt-2">
                        ₹{profile.salary}
                    </h2>
                </div>

                <div className="bg-zinc-900 rounded-2xl p-5">
                    <p className="text-zinc-400 text-sm">
                        Attendance
                    </p>

                    <h2 className="text-2xl font-bold mt-2">
                        {attendance
                            ? "Present"
                            : "Absent"}
                    </h2>
                </div>

                <div className="bg-zinc-900 rounded-2xl p-5">
                    <p className="text-zinc-400 text-sm">
                        Present Today
                    </p>

                    <h2 className="text-2xl font-bold mt-2">
                        {
                            stats.presentToday
                        }
                    </h2>
                </div>

                <div className="bg-zinc-900 rounded-2xl p-5">
                    <p className="text-zinc-400 text-sm">
                        Deductions
                    </p>

                    <h2 className="text-2xl font-bold mt-2">
                        ₹
                        {
                            stats.totalDeduction
                        }
                    </h2>
                </div>
            </div>

            {/* PIE CHART */}
            <div className="bg-zinc-900 rounded-2xl p-5 mb-6">
                <h2 className="text-lg font-semibold mb-4">
                    Staff Attendance
                </h2>

                <div className="h-64">
                    <ResponsiveContainer
                        width="100%"
                        height="100%"
                    >
                        <PieChart>
                            <Pie
                                data={
                                    chartData
                                }
                                dataKey="value"
                                outerRadius={
                                    80
                                }
                            >
                                <Cell fill="#22c55e" />
                                <Cell fill="#ef4444" />
                            </Pie>

                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* BAR CHART */}
            <div className="bg-zinc-900 rounded-2xl p-5">
                <h2 className="text-lg font-semibold mb-4">
                    Salary Overview
                </h2>

                <div className="h-64">
                    <ResponsiveContainer
                        width="100%"
                        height="100%"
                    >
                        <BarChart
                            data={
                                salaryData
                            }
                        >
                            <XAxis dataKey="name" />

                            <YAxis />

                            <Tooltip />

                            <Bar dataKey="amount" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </main>
    );
}