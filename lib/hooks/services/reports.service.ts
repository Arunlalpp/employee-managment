export async function getReportsData() {

    const response =
        await fetch(
            "/api/admin/reports",
            {
                cache: "no-store",
            }
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