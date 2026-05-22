"use client";

import { getReports } from "@/app/api/admin/reports/reports.service";
import { useQuery }
    from "@tanstack/react-query";

export function useReports() {

    return useQuery({
        queryKey: [
            "reports",
        ],

        queryFn:
            getReports,

        staleTime:
            1000 * 60 * 10,

        refetchOnWindowFocus:
            false,
    });
}