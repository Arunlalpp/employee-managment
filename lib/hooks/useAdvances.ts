"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase";

export interface Advance {
    id: string;
    staff_id: string;
    amount: number;
    date?: string;
    [key: string]: any;
}

export const useAdvances = (options?: {
    staffId?: string;
    monthStart?: string;
    monthEnd?: string;
}) => {
    const supabase = createClient();
    const { staffId, monthStart, monthEnd } = options || {};

    return useQuery<Advance[]>({
        queryKey: ["advances", staffId, monthStart, monthEnd],
        queryFn: async () => {
            let query = supabase
                .from("advances")
                .select("*");

            if (staffId) {
                query = query.eq("staff_id", staffId);
            }

            if (monthStart) {
                query = query.gte("date", monthStart);
            }

            if (monthEnd) {
                query = query.lte("date", monthEnd);
            }

            const { data, error } = await query;

            if (error) throw error;
            return data || [];
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });
};
