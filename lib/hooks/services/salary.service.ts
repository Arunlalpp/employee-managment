export async function getSalaryData(
    month: string
) {

    const response =
        await fetch(
            `/api/admin/salary?month=${month}`
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