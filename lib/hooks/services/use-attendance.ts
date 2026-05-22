"use client";

import { useMemo }
    from "react";

import { useQuery }
    from "@tanstack/react-query";
import { AttendanceEntry, getAttendanceData } from "./attendance.service";

export function useAttendance(
    selectedDate: string
) {

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
                1000 * 60 * 5,

            refetchOnWindowFocus:
                false,
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
                        ) ?? "09:30",

                    check_out:
                        rec?.check_out?.slice(
                            0,
                            5
                        ) ?? "22:30",

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
