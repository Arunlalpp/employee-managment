"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase";

export interface MonthlyAttendance {
  id: string;
  staff_id: string;
  date: string;
  is_present: boolean;
  check_in?: string;
  check_out?: string;
  allowance_earned?: number;
  overtime_bonus?: number;
  [key: string]: any;
}

export const useMonthAttendance = (staffId: string, monthStart: string, monthEnd: string) => {
  const supabase = createClient();

  return useQuery<MonthlyAttendance[]>({
    queryKey: ["attendance", staffId, "month", monthStart, monthEnd],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .eq("staff_id", staffId)
        .gte("date", monthStart)
        .lte("date", monthEnd)
        .order("date", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!staffId && !!monthStart && !!monthEnd,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useMonthAttendanceRange = (monthStart: string, monthEnd: string) => {
  const supabase = createClient();

  return useQuery<MonthlyAttendance[]>({
    queryKey: ["attendance", "month", monthStart, monthEnd],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .gte("date", monthStart)
        .lte("date", monthEnd);

      if (error) throw error;
      return data || [];
    },
    enabled: !!monthStart && !!monthEnd,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
