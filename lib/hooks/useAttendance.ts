"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase";

export interface Attendance {
  id: string;
  staff_id: string;
  date: string;
  is_present: boolean;
  [key: string]: any;
}

export const useAttendance = (date: string) => {
  const supabase = createClient();

  return useQuery<Attendance[]>({
    queryKey: ["attendance", date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .eq("date", date)
        .eq("is_present", true);

      if (error) throw error;
      return data || [];
    },
    enabled: !!date,
    staleTime: 2 * 60 * 1000, // 2 minutes for today's data
    gcTime: 5 * 60 * 1000,
  });
};

export const useStaffAttendance = (staffId: string, date: string) => {
  const supabase = createClient();

  return useQuery<Attendance | null>({
    queryKey: ["attendance", staffId, date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .eq("staff_id", staffId)
        .eq("date", date)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!staffId && !!date,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};
