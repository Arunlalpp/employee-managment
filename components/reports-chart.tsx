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
    LineChart,
    Line,
} from "recharts";

const COLORS = [
    "#22c55e",
    "#ef4444",
];

interface Props {
    attendanceData: any[];
    payrollData: any[];
    trendData: any[];
}

export default function ReportsChart({
    attendanceData,
    payrollData,
    trendData,
}: Props) {
    return (
        <>
            {/* ATTENDANCE */}
            <div className="bg-zinc-900 rounded-3xl p-5 mb-6 border border-zinc-800">
                <h2 className="text-white font-semibold mb-4">
                    Attendance Overview
                </h2>

                <div className="h-64">
                    <ResponsiveContainer
                        width="100%"
                        height="100%"
                    >
                        <PieChart>
                            <Pie
                                data={
                                    attendanceData
                                }
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {attendanceData.map(
                                    (
                                        entry,
                                        index
                                    ) => (
                                        <Cell
                                            key={
                                                index
                                            }
                                            fill={
                                                COLORS[
                                                index
                                                ]
                                            }
                                        />
                                    )
                                )}
                            </Pie>

                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="flex items-center justify-center gap-6 mt-2">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />

                        <p className="text-zinc-400 text-sm">
                            Present
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />

                        <p className="text-zinc-400 text-sm">
                            Absent
                        </p>
                    </div>
                </div>
            </div>

            {/* PAYROLL */}
            <div className="bg-zinc-900 rounded-3xl p-5 mb-6 border border-zinc-800">
                <h2 className="text-white font-semibold mb-4">
                    Staff Payroll
                </h2>

                <div className="h-72">
                    <ResponsiveContainer
                        width="100%"
                        height="100%"
                    >
                        <BarChart
                            data={payrollData}
                        >
                            <XAxis
                                dataKey="name"
                            />

                            <Tooltip />

                            <Bar
                                dataKey="salary"
                                fill="#eab308"
                                radius={[
                                    8,
                                    8,
                                    0,
                                    0,
                                ]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* TREND */}
            <div className="bg-zinc-900 rounded-3xl p-5 border border-zinc-800">
                <h2 className="text-white font-semibold mb-4">
                    Payroll Trend
                </h2>

                <div className="h-72">
                    <ResponsiveContainer
                        width="100%"
                        height="100%"
                    >
                        <LineChart
                            data={trendData}
                        >
                            <XAxis
                                dataKey="month"
                            />

                            <Tooltip />

                            <Line
                                type="monotone"
                                dataKey="payroll"
                                stroke="#22c55e"
                                strokeWidth={3}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </>
    );
}