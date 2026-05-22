"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase";

export interface Advance {
  id: string;
  staff_id: string;
  amount: number;
  [key: string]: any;
}

export const useAdvances = () => {
  const supabase = createClient();

  return useQuery<Advance[]>({
    queryKey: ["advances"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("advances")
        .select("*");

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
