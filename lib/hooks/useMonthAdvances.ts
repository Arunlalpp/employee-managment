"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase";

export interface MonthlyAdvance {
  id: string;
  staff_id: string;
  amount: number;
  reason?: string;
  date: string;
  [key: string]: any;
}

export const useMonthAdvances = (staffId: string, monthStart: string, monthEnd: string) => {
  const supabase = createClient();

  return useQuery<MonthlyAdvance[]>({
    queryKey: ["advances", staffId, "month", monthStart, monthEnd],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("advances")
        .select("*")
        .eq("staff_id", staffId)
        .gte("date", monthStart)
        .lte("date", monthEnd);

      if (error) throw error;
      return data || [];
    },
    enabled: !!staffId && !!monthStart && !!monthEnd,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useAdvanceRequests = (staffId?: string) => {
  const supabase = createClient();

  return useQuery<MonthlyAdvance[]>({
    queryKey: ["advance_requests", staffId],
    queryFn: async () => {
      let query = supabase.from("advance_requests").select("*").order("requested_at", { ascending: false });

      if (staffId) {
        query = query.eq("staff_id", staffId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
