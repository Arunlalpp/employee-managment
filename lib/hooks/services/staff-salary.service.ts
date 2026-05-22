export async function getStaffSalaryData(
    month: string
) {
    const response = await fetch(
        `/api/staff/salary?month=${month}`
    );

    const result =
        await response.json();

    if (!response.ok) {
        throw new Error(
            result.error ??
                "Failed to load salary"
        );
    }

    return result;
}
