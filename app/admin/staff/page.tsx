import { createClient } from "@/lib/supabase-server";

export default async function StaffPage() {
    const supabase = await createClient();

    const { data: staff } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "staff");

    return (
        <main className="p-6">
            <h1 className="text-3xl font-bold mb-6">
                Staff
            </h1>

            <div className="bg-white rounded-2xl shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-zinc-100">
                        <tr>
                            <th className="p-4 text-left">
                                Name
                            </th>
                            <th className="p-4 text-left">
                                Email
                            </th>
                            <th className="p-4 text-left">
                                Salary
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {staff?.map((item) => (
                            <tr
                                key={item.id}
                                className="border-t"
                            >
                                <td className="p-4">
                                    {item.name}
                                </td>

                                <td className="p-4">
                                    {item.email}
                                </td>

                                <td className="p-4">
                                    ₹{item.salary}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </main>
    );
}