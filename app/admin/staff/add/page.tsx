"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AddStaffPage() {
    const router = useRouter();

    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        salary: "",
    });

    const handleAddStaff = async () => {
        setLoading(true);

        const response = await fetch("/api/create-staff", {
            method: "POST",
            headers: {
                "Content-Type":
                    "application/json",
            },
            body: JSON.stringify(form),
        });

        const result = await response.json();

        setLoading(false);

        if (result.error) {
            alert(result.error);
            return;
        }

        alert("Staff created");

        router.push("/admin/staff");
    };

    return (
        <main className="p-6">
            <h1 className="text-3xl font-bold mb-6">
                Add Staff
            </h1>

            <div className="bg-white rounded-2xl shadow p-6 max-w-xl space-y-4">
                <input
                    placeholder="Name"
                    className="w-full border p-3 rounded-xl"
                    value={form.name}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            name: e.target.value,
                        })
                    }
                />

                <input
                    placeholder="Email"
                    className="w-full border p-3 rounded-xl"
                    value={form.email}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            email: e.target.value,
                        })
                    }
                />

                <input
                    placeholder="Password"
                    type="password"
                    className="w-full border p-3 rounded-xl"
                    value={form.password}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            password:
                                e.target.value,
                        })
                    }
                />

                <input
                    placeholder="Salary"
                    type="number"
                    className="w-full border p-3 rounded-xl"
                    value={form.salary}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            salary:
                                e.target.value,
                        })
                    }
                />

                <button
                    onClick={handleAddStaff}
                    disabled={loading}
                    className="bg-black text-white px-6 py-3 rounded-xl"
                >
                    {loading
                        ? "Creating..."
                        : "Create Staff"}
                </button>
            </div>
        </main>
    );
}