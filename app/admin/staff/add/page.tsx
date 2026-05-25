"use client";

import { useState } from "react";
import Link from "next/link";

import {
    useRouter,
    useSearchParams,
}
    from "next/navigation";
import { ArrowLeft }
    from "lucide-react";
import { toast } from "sonner";
import { useCreateStaff }
    from "@/lib/hooks/use-admin-mutations";

export default function CreateStaffPage() {

    const router =
        useRouter();
    const searchParams =
        useSearchParams();
    const backHref =
        searchParams.get("from") ===
            "attendance-staff"
            ? "/admin/attendance?tab=staff"
            : "/admin/staff";

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
                    backHref
                );
                toast.success(
                    "Staff created"
                );

            } catch (error: any) {
                toast.error(
                    error?.message ||
                        "Failed to create staff"
                );
            }
        };

    return (
        <main className="px-4 pt-14 pb-32 text-white">

            <div className="flex items-center justify-between gap-4 mb-6">
                <h1 className="text-3xl font-bold">
                    Create Staff
                </h1>

                <Link
                    href={backHref}
                    className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Link>
            </div>

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
