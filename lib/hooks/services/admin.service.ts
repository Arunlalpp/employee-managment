import { AttendanceEntry } from "./attendance.service";

export async function saveAttendanceData(
    date: string,
    entries: AttendanceEntry[]
) {
    const response = await fetch(
        "/api/admin/attendance",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                date,
                entries,
            }),
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.error ??
                "Failed to save attendance"
        );
    }

    return result;
}

export async function createStaff(data: {
    name: string;
    email: string;
    password: string;
    salary: number;
}) {
    const response = await fetch(
        "/api/admin/create-staff",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.error ??
                "Failed to create staff"
        );
    }

    return result;
}
