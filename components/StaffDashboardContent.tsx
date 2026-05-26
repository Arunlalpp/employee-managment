"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useProfile } from "@/lib/hooks/useProfile";
import { useStaffAttendance } from "@/lib/hooks/useAttendance";
import { useDeductions } from "@/lib/hooks/useDeductions";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import Loading from "@/components/Loading";
import StaffDashboardUI from "./StaffDashboardUI";
import { getCurrentDate } from "@/lib/utils";

export function StaffDashboardContent() {
  const router = useRouter();
  const { data: user, isLoading: userLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile(user?.id);

  const today = getCurrentDate();
  const { data: attendance } = useStaffAttendance(profile?.id || "", today);
  const { data: deductions = [] } = useDeductions(profile?.id);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/login");
    }
  }, [user, userLoading, router]);

  const stats = useMemo(() => {
    const totalDeduction = deductions?.reduce((sum, item) => sum + item.amount, 0) || 0;
    return {
      totalStaff: 1,
      presentToday: attendance?.is_present ? 1 : 0,
      totalDeduction,
    };
  }, [attendance?.is_present, deductions]);

  if (userLoading || profileLoading || !user || !profile) {
    return <Loading className="min-h-screen" />;
  }

  return (
    <main>
      <StaffDashboardUI
        profile={profile}
        attendance={attendance}
        stats={stats}
      />
    </main>
  );
}
