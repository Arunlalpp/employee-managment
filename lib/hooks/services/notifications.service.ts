export async function getNotifications() {
    const response = await fetch(
        "/api/admin/notifications"
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.error ??
                "Failed to load notifications"
        );
    }

    return result.notifications || [];
}

export async function clearNotifications() {
    const response = await fetch(
        "/api/admin/notifications",
        {
            method: "DELETE",
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.error ??
                "Failed to clear notifications"
        );
    }

    return result;
}
