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

        staleTime: 0,

        gcTime: 0,

        refetchOnMount: true,

        refetchOnWindowFocus: true,
    });
}