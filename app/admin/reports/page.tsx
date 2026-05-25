"use client";

import { useState } from "react";
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

    const [searchFilters, setSearchFilters] = useState<SearchFilters>({
        employeeName: "",
        status: "",
        startDate: "",
        endDate: "",
    });

    const {
        data,
        isLoading,
        error,
    } =
        useReports();

    if (isLoading) {
        return (
            <main className="p-6 max-w-md mx-auto pb-32">
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
            <main className="p-6 max-w-md mx-auto pb-32">

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

    const {
        report,
        staff,
        attendance,
        advances,
    } = data;

    // VALUES
    const profitBonus =
        report?.bonus_per_staff || 0;

    const storeProfit =
        report?.profit_amount || 0;

    const totalStaff =
        staff?.length || 0;

    const presentStaff =
        attendance?.filter(
            (a: any) => a.is_present
        ).length || 0;

    const absentStaff =
        totalStaff - presentStaff;

    // ATTENDANCE CHART
    const attendanceData = [
        {
            name: "Present",
            value: presentStaff,
        },
        {
            name: "Absent",
            value: absentStaff,
        },
    ];

    // PAYROLL CHART
    const payrollData =
        staff?.map((item: any) => {

            const staffAttendance =
                attendance?.filter(
                    (a: any) =>
                        a.staff_id === item.id
                ) || [];

            const allowance =
                staffAttendance.reduce(
                    (
                        sum: number,
                        a: any
                    ) =>
                        sum +
                        (
                            a.allowance_earned ||
                            0
                        ),
                    0
                );

            const overtimeBonus =
                staffAttendance.reduce(
                    (
                        sum: number,
                        a: any
                    ) => {

                        if (
                            a.check_out &&
                            a.check_out >
                            "22:30"
                        ) {
                            return sum + 50;
                        }

                        return sum;
                    },
                    0
                );

            const staffAdvances =
                advances?.filter(
                    (a: any) =>
                        a.staff_id === item.id
                ) || [];

            const advanceTotal =
                staffAdvances.reduce(
                    (
                        sum: number,
                        a: any
                    ) =>
                        sum +
                        Number(
                            a.amount || 0
                        ),
                    0
                );

            const netSalary =
                Number(
                    item.salary || 0
                ) +
                allowance +
                overtimeBonus +
                profitBonus -
                advanceTotal;

            return {
                name:
                    item.name ||
                    "Unknown",

                salary:
                    netSalary,
            };
        }) || [];

    // TREND DATA
    const trendData = [
        {
            month: "Jan",
            payroll: 45000,
        },
        {
            month: "Feb",
            payroll: 52000,
        },
        {
            month: "Mar",
            payroll: 48000,
        },
        {
            month: "Apr",
            payroll: 61000,
        },
        {
            month: "May",
            payroll:
                payrollData.reduce(
                    (
                        sum: number,
                        item: any
                    ) =>
                        sum +
                        item.salary,
                    0
                ),
        },
    ];

    // TOTAL PAYROLL
    const totalPayroll =
        payrollData.reduce(
            (
                sum: number,
                item: any
            ) =>
                sum +
                item.salary,
            0
        );

    // DETAILED DATA
    const detailedData =
        staff?.map((item: any) => {

            const staffAttendance =
                attendance?.filter(
                    (a: any) =>
                        a.staff_id === item.id
                ) || [];

            const presentDays =
                staffAttendance.filter(
                    (a: any) =>
                        a.is_present
                ).length;

            const allowance =
                staffAttendance.reduce(
                    (
                        sum: number,
                        a: any
                    ) =>
                        sum +
                        (
                            a.allowance_earned ||
                            0
                        ),
                    0
                );

            const overtimeBonus =
                staffAttendance.reduce(
                    (
                        sum: number,
                        a: any
                    ) => {

                        if (
                            a.check_out &&
                            a.check_out >
                            "22:30"
                        ) {
                            return sum + 50;
                        }

                        return sum;
                    },
                    0
                );

            const staffAdvances =
                advances?.filter(
                    (a: any) =>
                        a.staff_id === item.id
                ) || [];

            const advanceTotal =
                staffAdvances.reduce(
                    (
                        sum: number,
                        a: any
                    ) =>
                        sum +
                        Number(
                            a.amount || 0
                        ),
                    0
                );

            const baseSalary =
                Number(
                    item.salary || 0
                );

            const netSalary =
                baseSalary +
                allowance +
                overtimeBonus +
                profitBonus -
                advanceTotal;

            return {
                id: item.id,

                name:
                    item.name ||
                    "Unknown",

                presentDays,

                baseSalary,

                allowance,

                overtimeBonus,

                profitBonus,

                advanceTotal,

                netSalary,
            };
        }) || [];

    return (
        <main className="p-6 max-w-md mx-auto pb-32">

            <h1 className="text-3xl font-bold text-white mb-6">
                Reports
            </h1>

            <GlobalSearchFilter onFilterChange={setSearchFilters} />

            {/* SUMMARY */}
            <div className="bg-zinc-900 rounded-3xl p-5 border border-yellow-500/20 mb-6">

                <p className="text-zinc-400 text-sm">
                    Store Profit
                </p>

                <h2 className="text-4xl font-bold text-yellow-400 mt-2">
                    ₹
                    {storeProfit.toLocaleString()}
                </h2>

                <div className="grid grid-cols-2 gap-4 mt-5">

                    <div>

                        <p className="text-zinc-500 text-sm">
                            Staff
                        </p>

                        <p className="text-white text-xl font-semibold">
                            {totalStaff}
                        </p>

                    </div>

                    <div>

                        <p className="text-zinc-500 text-sm">
                            Bonus
                        </p>

                        <p className="text-green-400 text-xl font-semibold">
                            ₹
                            {profitBonus}
                        </p>

                    </div>

                </div>

            </div>

            {/* CHARTS */}
            <ReportsTabs
                attendanceData={
                    attendanceData
                }
                payrollData={
                    payrollData
                }
                trendData={
                    trendData
                }
                detailedData={
                    detailedData
                }
            />

            {/* TOTAL PAYROLL */}
            <div className="mt-6 bg-yellow-500/10 border border-yellow-500/20 rounded-3xl p-5">

                <p className="text-yellow-500 text-sm">
                    TOTAL PAYROLL
                </p>

                <h2 className="text-4xl font-bold text-yellow-400 mt-2">
                    ₹
                    {totalPayroll.toLocaleString()}
                </h2>

            </div>

        </main>
    );
}