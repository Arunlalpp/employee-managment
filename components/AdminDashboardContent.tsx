"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Users,
  UserCheck,
  Wallet,
  LogOut,
} from "lucide-react";
import { useDashboard } from "@/lib/hooks/use-dashboard";
import { createClient } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";

export function AdminDashboardContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
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

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    queryClient.clear();
    router.push("/login");
    router.refresh();
  };

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
  const stats = data.stats;

  return (
    <main className="min-h-screen bg-black text-white p-6 pb-40">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Admin Dashboard</h1>
        <p className="text-zinc-400 mt-2">Employee management overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
          <p className="text-zinc-400 text-sm mb-6">Attendance</p>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserCheck size={24} className="text-green-400" />
                <span>Present Today</span>
              </div>
              <h3 className="text-2xl font-bold">{stats.presentToday}</h3>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-red-400">●</span>
                <span>Absent Today</span>
              </div>
              <h3 className="text-2xl font-bold text-red-400">{stats.absentToday}</h3>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
          <p className="text-zinc-400 text-sm mb-6">Salary Information</p>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wallet size={24} className="text-yellow-400" />
                <span>Monthly Salary</span>
              </div>
              <h3 className="text-xl font-bold">₹{stats.monthlySalary.toLocaleString()}</h3>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wallet size={24} className="text-blue-400" />
                <span>Advances</span>
              </div>
              <h3 className="text-xl font-bold">₹{stats.totalAdvances.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
          <p className="text-zinc-400 text-sm">Net Payroll</p>
          <h2 className="text-3xl font-bold mt-4 text-green-400">₹{stats.netPayroll.toLocaleString()}</h2>
        </div>
      </div>

      <div className="mt-12 mb-6">
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </main>
  );
}
