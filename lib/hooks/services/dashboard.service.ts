export async function getDashboardData() {
    const response = await fetch(
        "/api/admin/dashboard"
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.error ??
                "Failed to load dashboard"
        );
    }

    return result;
}
