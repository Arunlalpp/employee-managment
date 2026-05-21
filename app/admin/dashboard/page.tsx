import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";

import {
    Users,
    IndianRupee,
    UserCheck,
    Wallet,
} from "lucide-react";

export default async function AdminDashboard() {
    const supabase =
        await createServerSupabaseClient();

    // AUTH
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // ADMIN PROFILE
    const { data: profile } =
        await supabase
            .from("profiles")
            .select("*")
            .eq("auth_id", user.id)
            .single();

    if (!profile) {
        redirect("/login");
    }

    // ROLE CHECK
    if (profile.role !== "admin") {
        redirect("/staff/dashboard");
    }

    // STAFF
    const { data: staff } =
        await supabase
            .from("profiles")
            .select("*")
            .eq("role", "staff");

    // TODAY
    const today = new Date()
        .toISOString()
        .split("T")[0];

    // ATTENDANCE
    const { data: attendance } =
        await supabase
            .from("attendance")
            .select("*")
            .eq("date", today)
            .eq("is_present", true);

    // ADVANCES
    const { data: advances } =
        await supabase
            .from("advances")
            .select("*");

    // DEDUCTIONS
    const { data: deductions } =
        await supabase
            .from("deductions")
            .select("*");

    // TOTAL SALARY
    const monthlySalary =
        staff?.reduce(
            (sum, item) =>
                sum +
                (item.salary || 0),
            0
        ) || 0;

    // TOTAL ADVANCES
    const totalAdvances =
        advances?.reduce(
            (sum, item) =>
                sum +
                (item.amount || 0),
            0
        ) || 0;

    // TOTAL DEDUCTIONS
    const totalDeductions =
        deductions?.reduce(
            (sum, item) =>
                sum +
                (item.amount || 0),
            0
        ) || 0;

    // NET PAYROLL
    const netPayroll =
        monthlySalary -
        totalAdvances -
        totalDeductions;

    // ABSENT STAFF
    const absentToday =
        (staff?.length || 0) -
        (attendance?.length || 0);

    // TODAY ALLOWANCE
    const todayAllowance =
        (attendance?.length || 0) * 30;

    // ATTENDANCE %
    const attendancePercentage =
        staff?.length
            ? Math.round(
                ((attendance?.length ||
                    0) /
                    staff.length) *
                100
            )
            : 0;

    // HIGHEST SALARY STAFF
    const highestSalaryStaff =
        [...(staff || [])].sort(
            (a, b) =>
                (b.salary || 0) -
                (a.salary || 0)
        )[0];

    return (
        <main className="min-h-screen bg-black text-white p-6">
            {/* HEADER */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold">
                    Admin Dashboard
                </h1>

                <p className="text-zinc-400 mt-2">
                    Employee management overview
                </p>
            </div>

            {/* MAIN CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
                {/* TOTAL STAFF */}
                <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-zinc-400 text-sm">
                                Total Staff
                            </p>

                            <h2 className="text-3xl font-bold mt-2">
                                {staff?.length || 0}
                            </h2>
                        </div>

                        <div className="bg-zinc-800 p-3 rounded-2xl">
                            <Users size={28} />
                        </div>
                    </div>
                </div>

                {/* PRESENT */}
                <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-zinc-400 text-sm">
                                Present Today
                            </p>

                            <h2 className="text-3xl font-bold mt-2">
                                {attendance?.length || 0}
                            </h2>
                        </div>

                        <div className="bg-zinc-800 p-3 rounded-2xl">
                            <UserCheck size={28} />
                        </div>
                    </div>
                </div>

                {/* SALARY */}
                <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-zinc-400 text-sm">
                                Monthly Salary
                            </p>

                            <h2 className="text-3xl font-bold mt-2">
                                ₹
                                {monthlySalary.toLocaleString()}
                            </h2>
                        </div>

                        <div className="bg-zinc-800 p-3 rounded-2xl">
                            <IndianRupee size={28} />
                        </div>
                    </div>
                </div>

                {/* ADVANCES */}
                <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-zinc-400 text-sm">
                                Advances
                            </p>

                            <h2 className="text-3xl font-bold mt-2">
                                ₹
                                {totalAdvances.toLocaleString()}
                            </h2>
                        </div>

                        <div className="bg-zinc-800 p-3 rounded-2xl">
                            <Wallet size={28} />
                        </div>
                    </div>
                </div>
            </div>

            {/* EXTRA STATS */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
                {/* NET PAYROLL */}
                <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
                    <p className="text-zinc-400 text-sm">
                        Net Payroll
                    </p>

                    <h2 className="text-3xl font-bold mt-2 text-green-400">
                        ₹
                        {netPayroll.toLocaleString()}
                    </h2>
                </div>

                {/* ABSENT */}
                <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
                    <p className="text-zinc-400 text-sm">
                        Absent Today
                    </p>

                    <h2 className="text-3xl font-bold mt-2 text-red-400">
                        {absentToday}
                    </h2>
                </div>

                {/* ALLOWANCE */}
                <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
                    <p className="text-zinc-400 text-sm">
                        Today's Allowance
                    </p>

                    <h2 className="text-3xl font-bold mt-2 text-yellow-400">
                        ₹{todayAllowance}
                    </h2>
                </div>

                {/* TOP STAFF */}
                <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
                    <p className="text-zinc-400 text-sm">
                        Highest Salary
                    </p>

                    <h2 className="text-2xl font-bold mt-2">
                        {highestSalaryStaff?.name}
                    </h2>

                    <p className="text-yellow-400 mt-2">
                        ₹
                        {highestSalaryStaff?.salary}
                    </p>
                </div>
            </div>

            {/* SECOND ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ATTENDANCE */}
                <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
                    <h2 className="text-xl font-semibold mb-4">
                        Attendance Rate
                    </h2>

                    <div className="flex items-center justify-center h-52">
                        <div className="relative w-40 h-40 rounded-full border-[12px] border-zinc-800 flex items-center justify-center">
                            <div className="text-center">
                                <h2 className="text-4xl font-bold">
                                    {attendancePercentage}
                                    %
                                </h2>

                                <p className="text-zinc-400 text-sm mt-1">
                                    Present
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* DEDUCTIONS */}
                <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
                    <h2 className="text-xl font-semibold mb-4">
                        Total Deductions
                    </h2>

                    <div className="h-52 flex items-center justify-center">
                        <h1 className="text-5xl font-bold text-red-500">
                            ₹
                            {totalDeductions.toLocaleString()}
                        </h1>
                    </div>
                </div>

                {/* STAFF LIST */}
                <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
                    <h2 className="text-xl font-semibold mb-4">
                        Staff Members
                    </h2>

                    <div className="space-y-3 max-h-56 overflow-y-auto">
                        {staff?.map((item) => (
                            <div
                                key={item.id}
                                className="bg-zinc-800 rounded-2xl p-4"
                            >
                                <h3 className="font-semibold">
                                    {item.name}
                                </h3>

                                <p className="text-zinc-400 text-sm">
                                    {item.email}
                                </p>

                                <p className="text-yellow-400 mt-2">
                                    ₹{item.salary}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}