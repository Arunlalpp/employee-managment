"use client";

import { useMemo }
    from "react";

import { useQuery }
    from "@tanstack/react-query";
import { AttendanceEntry, getAttendanceData } from "./attendance.service";
import { getCurrentDate }
    from "@/lib/utils";

export function useAttendance(
    selectedDate: string,
    options?: {
        enabled?: boolean;
    }
) {
    const enabled =
        options?.enabled ?? true;
    const isToday =
        selectedDate ===
        getCurrentDate();

    const query =
        useQuery({
            queryKey: [
                "admin_attendance",
                selectedDate,
            ],

            queryFn: () =>
                getAttendanceData(
                    selectedDate
                ),

            staleTime:
                isToday
                    ? 1000 * 30
                    : 5 * 60 * 1000,

            refetchOnWindowFocus:
                enabled && isToday,

            refetchInterval:
                enabled && isToday
                    ? 1000 * 30
                    : false,

            enabled,
        });

    const attendanceMap =
        useMemo(() => {

            const map:
                Record<
                    string,
                    AttendanceEntry
                > = {};

            if (
                !query.data
            ) {
                return map;
            }

            for (
                const staff
                of query.data.staff
            ) {

                const rec =
                    query.data.attendance.find(
                        (r) =>
                            r.staff_id ===
                            staff.id
                    );

                map[staff.id] = {
                    staff_id:
                        staff.id,

                    is_present:
                        rec?.is_present ??
                        false,

                    check_in:
                        rec?.check_in?.slice(
                            0,
                            5
                        ) ?? "",

                    check_out:
                        rec?.check_out?.slice(
                            0,
                            5
                        ) ?? "",

                    allowance_earned:
                        rec?.allowance_earned ??
                        0,
                };
            }

            return map;

        }, [query.data]);

    return {
        ...query,

        staffList:
            query.data?.staff ?? [],

        attendanceMap,
    };
}
