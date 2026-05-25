"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase";
import { Profile } from "./useProfile";

export const useStaff = (
    options?: {
        enabled?: boolean;
    }
) => {
    const supabase = createClient();

    return useQuery<Profile[]>({
        queryKey: ["staff"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("role", "staff");

            if (error) throw error;
            return data || [];
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        enabled:
            options?.enabled ?? true,
    });
};
