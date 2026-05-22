"use client";

import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import {
    createStaff,
    saveAttendanceData,
} from "./services/admin.service";
import type { AttendanceEntry }
    from "./services/attendance.service";

export function useSaveAttendance() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: ({
            date,
            entries,
        }: {
            date: string;
            entries: AttendanceEntry[];
        }) =>
            saveAttendanceData(
                date,
                entries
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [
                    "attendance",
                ],
            });
            queryClient.invalidateQueries({
                queryKey: [
                    "admin_attendance",
                ],
            });
            queryClient.invalidateQueries({
                queryKey: [
                    "salary",
                ],
            });
            queryClient.invalidateQueries({
                queryKey: [
                    "reports",
                ],
            });
            queryClient.invalidateQueries({
                queryKey: [
                    "dashboard",
                ],
            });
        },
    });
}

export function useCreateStaff() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn:
            createStaff,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [
                    "staff",
                ],
            });
            queryClient.invalidateQueries({
                queryKey: [
                    "salary",
                ],
            });
            queryClient.invalidateQueries({
                queryKey: [
                    "reports",
                ],
            });
            queryClient.invalidateQueries({
                queryKey: [
                    "dashboard",
                ],
            });
        },
    });
}
