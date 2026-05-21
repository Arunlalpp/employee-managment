import { createClient } from "@/lib/supabase-server";
import StatCard from "@/components/stat-card";
import { redirect } from "next/navigation";

export default async function StaffPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/");
    }

    const { data: profile, error } =
        await supabase
            .from("profiles")
            .select("*")
            .eq("auth_id", user.id)
            .maybeSingle();

    console.log(profile);
    console.log(error);

    if (!profile) {
        return (
            <main className="p-6">
                <h1 className="text-2xl font-bold text-red-500">
                    Profile Not Found
                </h1>
            </main>
        );
    }

    const today = new Date()
        .toISOString()
        .split("T")[0];

    const { data: attendance } =
        await supabase
            .from("attendance")
            .select("*")
            .eq("user_id", profile.id)
            .eq("date", today)
            .maybeSingle();

    const { data: advances } =
        await supabase
            .from("advances")
            .select("amount")
            .eq("user_id", profile.id);

    const totalAdvance =
        advances?.reduce(
            (acc, item) =>
                acc + Number(item.amount),
            0
        ) || 0;

    return (
        <main>
            <h1 className="text-3xl font-bold mb-6">
                Welcome {profile.name}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    title="Salary"
                    value={`₹${profile.salary}`}
                />

                <StatCard
                    title="Today's Status"
                    value={
                        attendance
                            ? "Present"
                            : "Absent"
                    }
                />

                <StatCard
                    title="Total Advances"
                    value={`₹${totalAdvance}`}
                />
            </div>
        </main>
    );
}