"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export const useAuth = () => {
    const supabase = createClient();

    return useQuery<User | null>({
        queryKey: ["auth", "user"],
        queryFn: async () => {
            const { data, error } = await supabase.auth.getUser();
            if (error) throw error;
            return data?.user || null;
        },
        staleTime: 10 * 60 * 1000, // 10 minutes for auth
        gcTime: 15 * 60 * 1000,
    });
};
