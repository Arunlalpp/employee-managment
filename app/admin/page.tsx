import PageWrapper from "@/components/page-wrapper";
import StatCard from "@/components/stat-card";
import { createClient } from "@/lib/supabase-server";

export default async function AdminPage() {
    const supabase = await createClient();

    // TOTAL STAFF
    const { count: totalStaff } = await supabase
        .from("profiles")
        .select("*", {
            count: "exact",
            head: true,
        })
        .eq("role", "staff");

    // PRESENT TODAY
    const today = new Date()
        .toISOString()
        .split("T")[0];

    const { count: presentToday } =
        await supabase
            .from("attendance")
            .select("*", {
                count: "exact",
                head: true,
            })
            .eq("date", today);

    // MONTHLY SALARY
    const { data: salaries } =
        await supabase
            .from("profiles")
            .select("salary")
            .eq("role", "staff");

    const monthlySalary =
        salaries?.reduce(
            (acc, item) =>
                acc + Number(item.salary || 0),
            0
        ) || 0;

    // ADVANCES
    const { data: advancesData } =
        await supabase
            .from("advances")
            .select("amount");

    const advances =
        advancesData?.reduce(
            (acc, item) =>
                acc + Number(item.amount || 0),
            0
        ) || 0;

    // DEDUCTIONS
    const { data: deductionsData } =
        await supabase
            .from("deductions")
            .select("amount");

    const deductions =
        deductionsData?.reduce(
            (acc, item) =>
                acc +
                Number(item.amount || 0),
            0
        ) || 0;

    // PENDING SALARY
    const pendingSalary =
        monthlySalary -
        advances -
        deductions;

    return (
        <PageWrapper>
            <main>
                <h1 className="text-3xl font-bold mb-6">
                    Admin Dashboard
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard
                        title="Total Staff"
                        value={totalStaff || 0}
                    />

                    <StatCard
                        title="Present Today"
                        value={
                            presentToday || 0
                        }
                    />

                    <StatCard
                        title="Monthly Salary"
                        value={`₹${monthlySalary}`}
                    />

                    <StatCard
                        title="Pending Salary"
                        value={`₹${pendingSalary}`}
                    />

                    <StatCard
                        title="Advances"
                        value={`₹${advances}`}
                    />

                    <StatCard
                        title="Deductions"
                        value={`₹${deductions}`}
                    />
                </div>
            </main>
        </PageWrapper>
    );
}