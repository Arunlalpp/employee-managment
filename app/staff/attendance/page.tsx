import { createClient } from "@/lib/supabase-server";

export default async function AttendancePage() {
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

    const { data: attendance } =
        await supabase
            .from("attendance")
            .select("*")
            .eq("user_id", profile.id)
            .order("created_at", {
                ascending: false,
            });

    return (
        <main>
            <h1 className="text-3xl font-bold mb-6">
                Attendance History
            </h1>

            <div className="bg-white rounded-2xl shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-zinc-100">
                        <tr>
                            <th className="p-4 text-left">
                                Date
                            </th>

                            <th className="p-4 text-left">
                                Check In
                            </th>

                            <th className="p-4 text-left">
                                Check Out
                            </th>

                            <th className="p-4 text-left">
                                Hours
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {attendance?.map(
                            (item) => (
                                <tr
                                    key={item.id}
                                    className="border-t"
                                >
                                    <td className="p-4">
                                        {
                                            item.date
                                        }
                                    </td>

                                    <td className="p-4">
                                        {item.check_in
                                            ? new Date(
                                                item.check_in
                                            ).toLocaleTimeString()
                                            : "-"}
                                    </td>

                                    <td className="p-4">
                                        {item.check_out
                                            ? new Date(
                                                item.check_out
                                            ).toLocaleTimeString()
                                            : "-"}
                                    </td>

                                    <td className="p-4">
                                        {
                                            item.working_hours
                                        }
                                    </td>
                                </tr>
                            )
                        )}
                    </tbody>
                </table>
            </div>
        </main>
    );
}