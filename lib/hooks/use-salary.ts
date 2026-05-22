"use client";

import { useQuery }
    from "@tanstack/react-query";
import { getSalaryData } from "./services/salary.service";

export function useSalary(
    month: string
) {

    return useQuery({
        queryKey: [
            "salary",
            month,
        ],

        queryFn: () =>
            getSalaryData(
                month
            ),

        staleTime:
            1000 * 60 * 5,

        refetchOnWindowFocus:
            false,
    });
}