"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase";

export interface MonthlyReport {
    id: string;
    month: string;
    bonus_per_staff: number;
    [key: string]: any;
}

export const useMonthlyReport = (month: string) => {
    const supabase = createClient();

    return useQuery<MonthlyReport | null>({
        queryKey: ["monthly_report", month],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("monthly_store_reports")
                .select("*")
                .eq("month", month)
                .maybeSingle();

            if (error) throw error;
            return data;
        },
        enabled: !!month,
        staleTime: 10 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
    });
};
