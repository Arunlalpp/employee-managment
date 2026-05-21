"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import PageWrapper from "@/components/page-wrapper";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        const { data, error } =
            await supabase.auth.signInWithPassword({
                email,
                password,
            });

        if (error) {
            alert(error.message);
            return;
        }

        const user = data.user;

        if (!user) {
            alert("No user found");
            return;
        }

        const { data: profile, error: profileError } =
            await supabase
                .from("profiles")
                .select("*")
                .eq("auth_id", user.id)
                .single();

        console.log(profile);

        if (profileError) {
            console.log(profileError);
            alert("Profile error");
            return;
        }

        if (!profile) {
            alert("Profile not found");
            return;
        }

        if (profile.role === "admin") {
            router.push("/admin");
        } else {
            router.push("/staff");
        }

        router.refresh();
    };

    return (
        <PageWrapper>

            <main className="min-h-screen flex items-center justify-center bg-zinc-100">
                <motion.div
                    initial={{
                        opacity: 0,
                        scale: 0.9,
                        y: 30,
                    }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                        y: 0,
                    }}
                    transition={{
                        duration: 0.4,
                    }}
                    className="w-full max-w-sm bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-xl"
                >
                    <h1 className="text-2xl font-bold mb-6 text-center">
                        Employee Login
                    </h1>

                    <div className="space-y-4">
                        <input
                            type="email"
                            placeholder="Email"
                            className="w-full border p-3 rounded-xl"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full border p-3 rounded-xl"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                        />

                        <button
                            onClick={handleLogin}
                            className="w-full bg-black text-white p-3 rounded-xl"
                        >
                            Login
                        </button>
                    </div>
                </motion.div>
            </main>
        </PageWrapper>
    );
}