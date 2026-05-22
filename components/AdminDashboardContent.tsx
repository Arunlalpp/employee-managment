"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Users,
  IndianRupee,
  UserCheck,
  Wallet,
} from "lucide-react";
import { useDashboard } from "@/lib/hooks/use-dashboard";

export function AdminDashboardContent() {
  const router = useRouter();
  const {
    data,
    isLoading,
    error,
  } = useDashboard();

  useEffect(() => {
    if ((error as any)?.message === "Unauthorized") {
      router.push("/login");
      return;
    }

    if ((error as any)?.message === "Forbidden") {
      router.push("/staff/dashboard");
    }
  }, [error, router]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-black text-white p-6">
        <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-5">
          Failed to load dashboard
        </div>
      </main>
    );
  }

  const staff = data.staff || [];
  const attendance = data.attendance || [];
  const stats = data.stats;

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Admin Dashboard</h1>
        <p className="text-zinc-400 mt-2">Employee management overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm">Total Staff</p>
              <h2 className="text-3xl font-bold mt-2">{staff?.length || 0}</h2>
            </div>
            <div className="bg-zinc-800 p-3 rounded-2xl">
              <Users size={28} />
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm">Present Today</p>
              <h2 className="text-3xl font-bold mt-2">{attendance?.length || 0}</h2>
            </div>
            <div className="bg-zinc-800 p-3 rounded-2xl">
              <UserCheck size={28} />
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm">Monthly Salary</p>
              <h2 className="text-3xl font-bold mt-2">₹{stats.monthlySalary.toLocaleString()}</h2>
            </div>
            <div className="bg-zinc-800 p-3 rounded-2xl">
              <IndianRupee size={28} />
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm">Advances</p>
              <h2 className="text-3xl font-bold mt-2">₹{stats.totalAdvances.toLocaleString()}</h2>
            </div>
            <div className="bg-zinc-800 p-3 rounded-2xl">
              <Wallet size={28} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
          <p className="text-zinc-400 text-sm">Net Payroll</p>
          <h2 className="text-3xl font-bold mt-2 text-green-400">₹{stats.netPayroll.toLocaleString()}</h2>
        </div>

        <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
          <p className="text-zinc-400 text-sm">Absent Today</p>
          <h2 className="text-3xl font-bold mt-2 text-red-400">{stats.absentToday}</h2>
        </div>

        <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
          <p className="text-zinc-400 text-sm">Today's Allowance</p>
          <h2 className="text-3xl font-bold mt-2 text-yellow-400">₹{stats.todayAllowance}</h2>
        </div>

        <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
          <p className="text-zinc-400 text-sm">Highest Salary</p>
          <h2 className="text-2xl font-bold mt-2">{stats.highestSalaryStaff?.name}</h2>
          <p className="text-yellow-400 mt-2">₹{stats.highestSalaryStaff?.salary}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
          <h2 className="text-xl font-semibold mb-4">Attendance Rate</h2>
          <div className="flex items-center justify-center h-52">
            <div className="relative w-40 h-40 rounded-full border-[12px] border-zinc-800 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-4xl font-bold">{stats.attendancePercentage}%</h2>
                <p className="text-zinc-400 text-sm mt-1">Present</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
          <h2 className="text-xl font-semibold mb-4">Total Deductions</h2>
          <div className="h-52 flex items-center justify-center">
            <h1 className="text-5xl font-bold text-red-500">₹{stats.totalDeductions.toLocaleString()}</h1>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
          <h2 className="text-xl font-semibold mb-4">Staff Members</h2>
          <div className="space-y-3 max-h-56 overflow-y-auto">
            {staff?.map((item: any) => (
              <div key={item.id} className="bg-zinc-800 rounded-2xl p-4">
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-zinc-400 text-sm">{item.email}</p>
                <p className="text-yellow-400 mt-2">₹{item.salary}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
