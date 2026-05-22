"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase";

export interface Deduction {
  id: string;
  staff_id: string;
  amount: number;
  [key: string]: any;
}

export const useDeductions = (staffId?: string) => {
  const supabase = createClient();

  return useQuery<Deduction[]>({
    queryKey: ["deductions", staffId],
    queryFn: async () => {
      let query = supabase.from("deductions").select("*");

      if (staffId) {
        query = query.eq("staff_id", staffId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    enabled: staffId ? true : true,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
