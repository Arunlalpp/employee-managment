"use client";

import { useQuery }
    from "@tanstack/react-query";
import { getStaffSalaryData }
    from "./services/staff-salary.service";

export function useStaffSalary(
    month: string
) {
    return useQuery({
        queryKey: [
            "staff_salary",
            month,
        ],
        queryFn: () =>
            getStaffSalaryData(
                month
            ),
        enabled:
            !!month,
        staleTime:
            1000 * 60 * 5,
        refetchOnWindowFocus:
            false,
    });
}
