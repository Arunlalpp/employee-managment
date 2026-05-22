import {
    AttendanceRecord,
    Profile,
} from "@/types";

export interface AttendanceEntry {
    staff_id: string;
    is_present: boolean;
    check_in: string;
    check_out: string;
    allowance_earned: number;
}

export interface AttendanceDashboardResponse {
    staff: Profile[];
    attendance: AttendanceRecord[];
}

export async function getAttendanceData(
    selectedDate: string
) {

    const response =
        await fetch(
            `/api/admin/attendance?date=${selectedDate}`,
            {
                cache: "no-store",
            }
        );

    const result =
        await response.json();

    if (!response.ok) {
        throw new Error(
            result.error ??
            "Failed to load attendance"
        );
    }

    return result as AttendanceDashboardResponse;
}