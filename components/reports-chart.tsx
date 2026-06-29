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
    CartesianGrid,
    ComposedChart,
    Line,
    ReferenceLine,
} from "recharts";
import { format, parseISO } from "date-fns";

interface Props {
    attendanceData: { name: string; value: number }[];
    payrollData: { name: string; salary: number }[];
    revenueData: any[];
}

export default function ReportsChart({ attendanceData, payrollData, revenueData }: Props) {
    const hasAttendance = attendanceData.some((d) => d.value > 0);
    const hasPayroll = payrollData.some((d) => d.salary > 0);

    const revenueChartData = revenueData
        .filter((d) => d.revenue !== null && d.revenue !== undefined)
        .map((d) => ({
            day: format(parseISO(d.date), "d"),
            revenue: Number(d.revenue),
            profit: d.netProfit ?? d.revenue - d.staffCost,
        }));
    const hasRevenue = revenueChartData.length > 0;

    return (
        <>
            {/* ATTENDANCE PIE */}
            <div className="bg-zinc-900 rounded-3xl p-5 mb-5 border border-zinc-800">
                <h2 className="text-white font-semibold mb-4">Attendance Overview</h2>
                {hasAttendance ? (
                    <>
                        <div className="h-56">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={attendanceData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={58}
                                        outerRadius={88}
                                        paddingAngle={4}
                                        dataKey="value"
                                        startAngle={90}
                                        endAngle={-270}
                                    >
                                        <Cell fill="#22c55e" />
                                        <Cell fill="#3f3f46" />
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            background: "#18181b",
                                            border: "1px solid #3f3f46",
                                            borderRadius: "12px",
                                            color: "#fff",
                                        }}
                                        formatter={(v, name) => [`${v} days`, name]}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex items-center justify-center gap-6 -mt-2">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                <p className="text-zinc-400 text-sm">
                                    Present <span className="text-white font-semibold">{attendanceData[0]?.value ?? 0}</span> days
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-zinc-600" />
                                <p className="text-zinc-400 text-sm">
                                    Absent <span className="text-white font-semibold">{attendanceData[1]?.value ?? 0}</span> days
                                </p>
                            </div>
                        </div>
                    </>
                ) : (
                    <EmptyState message="No attendance data this month" />
                )}
            </div>

            {/* PAYROLL BAR */}
            <div className="bg-zinc-900 rounded-3xl p-5 mb-5 border border-zinc-800">
                <h2 className="text-white font-semibold mb-4">Staff Payroll</h2>
                {hasPayroll ? (
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={payrollData} margin={{ left: 0, right: 8 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fill: "#a1a1aa", fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fill: "#a1a1aa", fontSize: 10 }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                                    width={42}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: "#18181b",
                                        border: "1px solid #3f3f46",
                                        borderRadius: "12px",
                                        color: "#fff",
                                    }}
                                    formatter={(v) => [`₹${Number(v).toLocaleString("en-IN")}`, "Net Salary"]}
                                />
                                <Bar dataKey="salary" fill="#eab308" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <EmptyState message="No payroll data available" />
                )}
            </div>

            {/* DAILY REVENUE & PROFIT */}
            <div className="bg-zinc-900 rounded-3xl p-5 border border-zinc-800">
                <h2 className="text-white font-semibold mb-1">Daily Revenue</h2>
                <p className="text-zinc-600 text-xs mb-4">Revenue vs net profit per day</p>
                {hasRevenue ? (
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={revenueChartData} margin={{ left: 0, right: 8 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                                <XAxis
                                    dataKey="day"
                                    tick={{ fill: "#a1a1aa", fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fill: "#a1a1aa", fontSize: 10 }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                                    width={42}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: "#18181b",
                                        border: "1px solid #3f3f46",
                                        borderRadius: "12px",
                                        color: "#fff",
                                    }}
                                    formatter={(v, name) => [
                                        `₹${Number(v).toLocaleString("en-IN")}`,
                                        name === "revenue" ? "Revenue" : "Net Profit",
                                    ]}
                                />
                                <ReferenceLine y={0} stroke="#52525b" strokeDasharray="3 3" />
                                <Bar dataKey="revenue" fill="#22c55e" fillOpacity={0.25} radius={[4, 4, 0, 0]} />
                                <Line
                                    type="monotone"
                                    dataKey="profit"
                                    stroke="#eab308"
                                    strokeWidth={2.5}
                                    dot={{ fill: "#eab308", r: 3, strokeWidth: 0 }}
                                    activeDot={{ r: 5 }}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <EmptyState message="Record daily sales to see the revenue chart" />
                )}
            </div>
        </>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="h-36 flex items-center justify-center">
            <p className="text-zinc-600 text-sm text-center">{message}</p>
        </div>
    );
}
