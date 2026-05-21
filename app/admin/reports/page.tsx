import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/supabase-server";
import ReportsChart from "@/components/reports-chart";
import ReportsTabs from "@/components/reports-tabs";

export default async function ReportsPage() {
    const supabase =
        await createServerSupabaseClient();

    // USER
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // PROFILE
    const { data: profile } =
        await supabase
            .from("profiles")
            .select("*")
            .eq("auth_id", user.id)
            .single();

    if (!profile) {
        redirect("/login");
    }

    if (profile.role !== "admin") {
        redirect("/staff/dashboard");
    }

    // DATE
    const currentDate = new Date();

    const month =
        currentDate.getMonth() + 1;

    const year =
        currentDate.getFullYear();

    const startDate =
        `${year}-${String(month).padStart(2, "0")}-01`;

    const endDate =
        `${year}-${String(month).padStart(2, "0")}-31`;

    // REPORT
    const { data: report } =
        await supabase
            .from("monthly_store_reports")
            .select("*")
            .eq("month", month)
            .eq("year", year)
            .single();

    // STAFF
    const { data: staff } =
        await supabase
            .from("profiles")
            .select("*")
            .eq("role", "staff");

    // ATTENDANCE
    const { data: attendance } =
        await supabase
            .from("attendance")
            .select("*")
            .gte("date", startDate)
            .lte("date", endDate);

    // ADVANCES
    const { data: advances } =
        await supabase
            .from("advances")
            .select("*")
            .gte("date", startDate)
            .lte("date", endDate);

    // VALUES
    const profitBonus =
        report?.bonus_per_staff || 0;

    const storeProfit =
        report?.profit_amount || 0;

    const totalStaff =
        staff?.length || 0;

    const presentStaff =
        attendance?.filter(
            (a) => a.is_present
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
        staff?.map((item) => {
            const staffAttendance =
                attendance?.filter(
                    (a) =>
                        a.staff_id === item.id
                ) || [];

            const allowance =
                staffAttendance.reduce(
                    (sum, a) =>
                        sum +
                        (a.allowance_earned ||
                            0),
                    0
                );

            const overtimeBonus =
                staffAttendance.reduce(
                    (sum, a) => {
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
                    (a) =>
                        a.staff_id === item.id
                ) || [];

            const advanceTotal =
                staffAdvances.reduce(
                    (sum, a) =>
                        sum +
                        Number(a.amount || 0),
                    0
                );

            const netSalary =
                Number(item.salary || 0) +
                allowance +
                overtimeBonus +
                profitBonus -
                advanceTotal;

            return {
                name: item.name,
                salary: netSalary,
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
            payroll: payrollData.reduce(
                (sum, item) =>
                    sum + item.salary,
                0
            ),
        },
    ];

    // TOTAL PAYROLL
    const totalPayroll =
        payrollData.reduce(
            (sum, item) =>
                sum + item.salary,
            0
        );

    const detailedData =
        staff?.map((item) => {
            const staffAttendance =
                attendance?.filter(
                    (a) =>
                        a.staff_id === item.id
                ) || [];

            const presentDays =
                staffAttendance.filter(
                    (a) => a.is_present
                ).length;

            const allowance =
                staffAttendance.reduce(
                    (sum, a) =>
                        sum +
                        (a.allowance_earned ||
                            0),
                    0
                );

            const overtimeBonus =
                staffAttendance.reduce(
                    (sum, a) => {
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
                    (a) =>
                        a.staff_id === item.id
                ) || [];

            const advanceTotal =
                staffAdvances.reduce(
                    (sum, a) =>
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
                name: item.name,
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
                            ₹{profitBonus}
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
                trendData={trendData}
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