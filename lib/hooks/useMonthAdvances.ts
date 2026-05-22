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

export interface AdvanceRequest extends MonthlyAdvance {
    requested_at?: string;
    status?: "pending" | "approved" | "rejected";
    profile?: {
        id: string;
        name?: string;
        email?: string;
    };
    profiles?: {
        id: string;
        name?: string;
        email?: string;
    };
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

    return useQuery<AdvanceRequest[]>({
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

export const useAdvanceRequestsWithProfiles = () => {
    const supabase = createClient();

    return useQuery<AdvanceRequest[]>({
        queryKey: ["advance_requests", "with_profiles"],
        queryFn: async () => {
            const { data: requestsData, error } = await supabase
                .from("advance_requests")
                .select("*")
                .order("requested_at", {
                    ascending: false,
                });

            if (error) throw error;

            if (!requestsData?.length) {
                return [];
            }

            const staffIds = requestsData.map((item) => item.staff_id);

            const { data: profiles, error: profilesError } = await supabase
                .from("profiles")
                .select("id,name,email")
                .in("id", staffIds);

            if (profilesError) throw profilesError;

            return requestsData.map((item) => ({
                ...item,
                profile: profiles?.find((profile) => profile.id === item.staff_id),
            }));
        },
        staleTime: 2 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
    });
};
