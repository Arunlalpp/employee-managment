export async function getStaffDetails(
    staffId: string
) {
    const response = await fetch(
        `/api/admin/staff/${staffId}`
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.error ??
                "Failed to load staff details"
        );
    }

    return result;
}
