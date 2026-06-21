"use client";

import { useQuery }
    from "@tanstack/react-query";
import { getReportsData } from "./services/reports.service";

export function useReports() {

    return useQuery({

        queryKey: [
            "reports",
        ],

        queryFn:
            getReportsData,

        staleTime: 5 * 60 * 1000,

        gcTime: 10 * 60 * 1000,

        refetchOnMount: true,

        refetchOnWindowFocus: true,
    });
}