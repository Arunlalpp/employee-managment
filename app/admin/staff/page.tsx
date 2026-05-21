import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import StaffDashboardUI from "@/components/StaffDashboardUI";
import Link from "next/link";

export default async function StaffDashboard() {
    const supabase =
        await createServerSupabaseClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: profile } =
        await supabase
            .from("profiles")
            .select("*")
            .eq("auth_id", user.id)
            .single();

    if (!profile) {
        redirect("/login");
    }

    const today = new Date()
        .toISOString()
        .split("T")[0];

    const { data: attendance } =
        await supabase
            .from("attendance")
            .select("*")
            .eq("staff_id", profile.id)
            .eq("date", today)
            .maybeSingle();

    // TOTAL STAFF
    const { count: totalStaff } =
        await supabase
            .from("profiles")
            .select("*", {
                count: "exact",
                head: true,
            })
            .eq("role", "staff");

    // PRESENT TODAY
    const { count: presentToday } =
        await supabase
            .from("attendance")
            .select("*", {
                count: "exact",
                head: true,
            })
            .eq("date", today)
            .eq("is_present", true);

    // DEDUCTIONS
    const { data: deductions } =
        await supabase
            .from("deductions")
            .select("amount")
            .eq("staff_id", profile.id);

    const totalDeduction =
        deductions?.reduce(
            (sum, item) =>
                sum + item.amount,
            0
        ) || 0;

    return (
        <main>

            <StaffDashboardUI
                profile={profile}
                attendance={attendance}
                stats={{
                    totalStaff:
                        totalStaff || 0,
                    presentToday:
                        presentToday || 0,
                    totalDeduction,
                }}
            />
            <Link
                href="/admin/staff/add"
                className="fixed bottom-28 right-5 z-50 bg-yellow-500 text-black shadow-2xl rounded-full px-5 py-4 font-semibold flex items-center gap-2 active:scale-95 transition-all"
            >
                <span className="text-2xl leading-none">
                    +
                </span>

                Add Staff
            </Link> 
        </main>
    );
}