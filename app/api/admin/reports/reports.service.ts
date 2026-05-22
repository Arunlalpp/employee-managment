export async function getReports() {

    const response =
        await fetch(
            "/api/admin/reports"
        );

    const result =
        await response.json();

    if (!response.ok) {
        throw new Error(
            result.error
        );
    }

    return result;
}