"use client";

import { useState } from "react";

import { useRouter }
    from "next/navigation";
import { useCreateStaff }
    from "@/lib/hooks/use-admin-mutations";

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

    const createStaffMutation =
        useCreateStaff();

    const handleCreate =
        async () => {

            try {
                await createStaffMutation
                    .mutateAsync({
                        name,
                        email,
                        password,
                        salary:
                            Number(
                                salary
                            ),
                    });

                router.push(
                    "/admin/staff"
                );

            } catch (error: any) {
                alert(
                    error.message ||
                    "Failed to create staff"
                );
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
                    disabled={
                        createStaffMutation.isPending
                    }
                    className="w-full bg-yellow-500 text-black font-semibold rounded-2xl py-4"
                >
                    {createStaffMutation.isPending
                        ? "Creating..."
                        : "Create Staff"}
                </button>

            </div>

        </main>
    );
}
