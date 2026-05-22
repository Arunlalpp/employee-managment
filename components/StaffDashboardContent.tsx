"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useProfile } from "@/lib/hooks/useProfile";
import { useStaff } from "@/lib/hooks/useStaff";
import { useAttendance, useStaffAttendance } from "@/lib/hooks/useAttendance";
import { useDeductions } from "@/lib/hooks/useDeductions";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import StaffDashboardUI from "./StaffDashboardUI";
import Link from "next/link";

export function StaffDashboardContent() {
  const router = useRouter();
  const { data: user, isLoading: userLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile(user?.id);

  const today = new Date().toISOString().split("T")[0];
  const { data: attendance } = useStaffAttendance(profile?.id || "", today);
  const { data: totalStaffData = [] } = useStaff();
  const { data: deductions = [] } = useDeductions(profile?.id);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/login");
    }
  }, [user, userLoading, router]);

  const stats = useMemo(() => {
    const totalDeduction = deductions?.reduce((sum, item) => sum + item.amount, 0) || 0;
    return {
      totalStaff: totalStaffData?.length || 0,
      presentToday: totalStaffData?.filter(s => s.id === profile?.id)?.length || 0,
      totalDeduction,
    };
  }, [deductions, totalStaffData, profile?.id]);

  if (userLoading || profileLoading || !user || !profile) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <main>
      <StaffDashboardUI
        profile={profile}
        attendance={attendance}
        stats={stats}
      />
      <Link
        href="/admin/staff/add"
        className="fixed bottom-28 right-5 z-50 bg-yellow-500 text-black shadow-2xl rounded-full px-5 py-4 font-semibold flex items-center gap-2 active:scale-95 transition-all"
      >
        <span className="text-2xl leading-none">+</span>
        Add Staff
      </Link>
    </main>
  );
}
