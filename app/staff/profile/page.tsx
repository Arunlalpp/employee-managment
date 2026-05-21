import { createClient } from "@/lib/supabase-server";

export default async function ProfilePage() {
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

    return (
        <main>
            <h1 className="text-3xl font-bold mb-6">
                My Profile
            </h1>

            <div className="bg-white rounded-2xl shadow p-6 space-y-4">
                <div>
                    <p className="text-zinc-500">
                        Name
                    </p>

                    <h2 className="text-xl font-semibold">
                        {profile.name}
                    </h2>
                </div>

                <div>
                    <p className="text-zinc-500">
                        Email
                    </p>

                    <h2 className="text-xl font-semibold">
                        {profile.email}
                    </h2>
                </div>

                <div>
                    <p className="text-zinc-500">
                        Salary
                    </p>

                    <h2 className="text-xl font-semibold">
                        ₹
                        {profile.salary}
                    </h2>
                </div>
            </div>
        </main>
    );
}