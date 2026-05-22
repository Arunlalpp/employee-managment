"use client";

import { useQuery }
    from "@tanstack/react-query";
import { getStaffDetails }
    from "./services/staff-details.service";

export function useStaffDetails(
    staffId: string
) {
    return useQuery({
        queryKey: [
            "staff_details",
            staffId,
        ],
        queryFn: () =>
            getStaffDetails(
                staffId
            ),
        enabled:
            !!staffId,
        staleTime:
            1000 * 60 * 5,
        refetchOnWindowFocus:
            false,
    });
}
