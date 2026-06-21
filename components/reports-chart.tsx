"use client";

import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    LineChart,
    Line,
    CartesianGrid,
} from "recharts";

const ATTENDANCE_COLORS = ["#22c55e", "#ef4444"];

interface Props {
    attendanceData: { name: string; value: number }[];
    payrollData: { name: string; salary: number }[];
    trendData: { month: string; profit: number }[];
}

export default function ReportsChart({ attendanceData, payrollData, trendData }: Props) {
    const hasAttendance = attendanceData.some((d) => d.value > 0);
    const hasPayroll = payrollData.some((d) => d.salary > 0);
    const hasTrend = trendData.length > 0;

    return (
        <>
            {/* ATTENDANCE */}
            <div className="bg-zinc-900 rounded-3xl p-5 mb-6 border border-zinc-800">
                <h2 className="text-white font-semibold mb-4">Attendance Overview</h2>
                {hasAttendance ? (
                    <>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={attendanceData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {attendanceData.map((_, index) => (
                                            <Cell
                                                key={index}
                                                fill={ATTENDANCE_COLORS[index]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            background: "#18181b",
                                            border: "1px solid #3f3f46",
                                            borderRadius: "12px",
                                            color: "#fff",
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex items-center justify-center gap-6 mt-2">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                                <p className="text-zinc-400 text-sm">
                                    Present ({attendanceData[0]?.value ?? 0})
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                <p className="text-zinc-400 text-sm">
                                    Absent ({attendanceData[1]?.value ?? 0})
                                </p>
                            </div>
                        </div>
                    </>
                ) : (
                    <EmptyState message="No attendance data this month" />
                )}
            </div>

            {/* PAYROLL */}
            <div className="bg-zinc-900 rounded-3xl p-5 mb-6 border border-zinc-800">
                <h2 className="text-white font-semibold mb-4">Staff Payroll</h2>
                {hasPayroll ? (
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={payrollData} margin={{ left: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fill: "#a1a1aa", fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fill: "#a1a1aa", fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: "#18181b",
                                        border: "1px solid #3f3f46",
                                        borderRadius: "12px",
                                        color: "#fff",
                                    }}
                                    formatter={(v) => [`₹${Number(v).toLocaleString()}`, "Salary"]}
                                />
                                <Bar dataKey="salary" fill="#eab308" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <EmptyState message="No payroll data available" />
                )}
            </div>

            {/* PROFIT TREND */}
            <div className="bg-zinc-900 rounded-3xl p-5 border border-zinc-800">
                <h2 className="text-white font-semibold mb-4">Store Profit Trend</h2>
                {hasTrend ? (
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData} margin={{ left: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                                <XAxis
                                    dataKey="month"
                                    tick={{ fill: "#a1a1aa", fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fill: "#a1a1aa", fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: "#18181b",
                                        border: "1px solid #3f3f46",
                                        borderRadius: "12px",
                                        color: "#fff",
                                    }}
                                    formatter={(v) => [`₹${Number(v).toLocaleString()}`, "Profit"]}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="profit"
                                    stroke="#22c55e"
                                    strokeWidth={3}
                                    dot={{ fill: "#22c55e", r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <EmptyState message="No profit history available" />
                )}
            </div>
        </>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="h-40 flex items-center justify-center">
            <p className="text-zinc-600 text-sm">{message}</p>
        </div>
    );
}
