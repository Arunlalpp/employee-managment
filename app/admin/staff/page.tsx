import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import StaffDashboardUI from "@/components/StaffDashboardUI";

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
    );
}