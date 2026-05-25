"use client";

import { useQuery }
    from "@tanstack/react-query";
import { getDashboardData }
    from "./services/dashboard.service";

export function useDashboard() {
    return useQuery({
        queryKey: [
            "dashboard",
        ],
        queryFn:
            getDashboardData,
        staleTime:
            1000 * 30,
        refetchOnWindowFocus:
            true,
        refetchInterval:
            1000 * 30,
    });
}
