"use client";

import { useState } from "react";

import { useRouter }
    from "next/navigation";

export default function CreateStaffPage() {

    const router =
        useRouter();

    const [name, setName] =
        useState("");

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [salary, setSalary] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const handleCreate =
        async () => {

            try {

                setLoading(true);

                const response =
                    await fetch(
                        "/api/admin/create-staff",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",
                            },

                            body: JSON.stringify({
                                name,
                                email,
                                password,
                                salary:
                                    Number(
                                        salary
                                    ),
                            }),
                        }
                    );

                const data =
                    await response.json();

                if (!response.ok) {
                    alert(
                        data.error
                    );

                    return;
                }

                router.push(
                    "/admin/staff"
                );

            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };

    return (
        <main className="px-4 pt-14 pb-32 text-white">

            <h1 className="text-3xl font-bold mb-6">
                Create Staff
            </h1>

            <div className="space-y-4">

                <input
                    placeholder="Name"
                    value={name}
                    onChange={(e) =>
                        setName(
                            e.target.value
                        )
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4"
                />

                <input
                    placeholder="Email"
                    value={email}
                    onChange={(e) =>
                        setEmail(
                            e.target.value
                        )
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4"
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) =>
                        setPassword(
                            e.target.value
                        )
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4"
                />

                <input
                    type="number"
                    placeholder="Monthly Salary"
                    value={salary}
                    onChange={(e) =>
                        setSalary(
                            e.target.value
                        )
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4"
                />

                <button
                    onClick={handleCreate}
                    disabled={loading}
                    className="w-full bg-yellow-500 text-black font-semibold rounded-2xl py-4"
                >
                    {loading
                        ? "Creating..."
                        : "Create Staff"}
                </button>

            </div>

        </main>
    );
}