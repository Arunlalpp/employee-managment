import StatCard from "@/components/stat-card";
import { createClient } from "@/lib/supabase-server";

export default async function SalaryPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { data: profile } =
        await supabase
            .from("profiles")
            .select("*")
            .eq("auth_id", user?.id)
            .single();

    const { data: advances } =
        await supabase
            .from("advances")
            .select("amount")
            .eq("user_id", profile.id);

    const { data: deductions } =
        await supabase
            .from("deductions")
            .select("amount")
            .eq("user_id", profile.id);

    const totalAdvance =
        advances?.reduce(
            (acc, item) =>
                acc + Number(item.amount),
            0
        ) || 0;

    const totalDeduction =
        deductions?.reduce(
            (acc, item) =>
                acc + Number(item.amount),
            0
        ) || 0;

    const finalSalary =
        Number(profile.salary) -
        totalAdvance -
        totalDeduction;

    return (
        <main>
            <h1 className="text-3xl font-bold mb-6">
                Salary Details
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    title="Base Salary"
                    value={`₹${profile.salary}`}
                />

                <StatCard
                    title="Advances"
                    value={`₹${totalAdvance}`}
                />

                <StatCard
                    title="Deductions"
                    value={`₹${totalDeduction}`}
                />

                <StatCard
                    title="Final Salary"
                    value={`₹${finalSalary}`}
                />
            </div>
        </main>
    );
}