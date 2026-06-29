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
        staleTime: 5 * 60 * 1000,   // cached 5 min — middleware validates server-side on every request
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false, // middleware handles protection; no need to re-auth on every tab switch
        retry: false,
    });
};
