"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import {
    Eye,
    EyeOff,
    Lock,
    Mail,
    Loader2,
} from "lucide-react";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [showPassword, setShowPassword] =
        useState(false);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const handleLogin = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        setLoading(true);
        setError("");

        try {
            const supabase =
                createClient();

            const {
                data,
                error: authError,
            } =
                await supabase.auth.signInWithPassword(
                    {
                        email,
                        password,
                    }
                );

            if (authError)
                throw authError;

            const user = data.user;

            if (!user) {
                throw new Error(
                    "User not found"
                );
            }

            // IMPORTANT FIX
            const {
                data: profile,
                error: profileError,
            } = await supabase
                .from("profiles")
                .select("*")
                .eq(
                    "auth_id",
                    user.id
                )
                .single();

            console.log(profile);
            console.log(profileError);

            if (
                profileError ||
                !profile
            ) {
                throw new Error(
                    "Profile not found"
                );
            }

            // ROLE BASED REDIRECT
            if (
                profile.role ===
                "admin"
            ) {
                router.push(
                    "/admin/dashboard"
                );
            } else {
                router.push(
                    "/staff/dashboard"
                );
            }

            router.refresh();
        } catch (err: unknown) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Login failed";

            setError(
                message ===
                    "Invalid login credentials"
                    ? "Wrong email or password."
                    : message
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-dvh bg-base flex flex-col items-center justify-center px-6 pt-safe pb-safe">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-gold/5 blur-3xl" />

                <div className="absolute bottom-1/4 right-0 w-64 h-64 rounded-full bg-gold/3 blur-3xl" />
            </div>

            <div className="relative w-full max-w-sm page-enter">
                {/* Brand */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gold/10 border border-gold/20 mb-5">
                        <span className="text-2xl">
                            👔
                        </span>
                    </div>

                    <h1
                        className="text-4xl font-light tracking-widest text-gold mb-1"
                        style={{
                            fontFamily:
                                "var(--font-cormorant)",
                        }}
                    >
                        GENTS
                    </h1>

                    <p className="text-ink-secondary text-sm tracking-[0.3em] uppercase font-light">
                        Store Manager
                    </p>
                </div>

                {/* Form card */}
                <div className="glass rounded-3xl p-6">
                    <h2
                        className="text-xl font-medium text-ink-primary mb-1"
                        style={{
                            fontFamily:
                                "var(--font-cormorant)",
                        }}
                    >
                        Welcome back
                    </h2>

                    <p className="text-ink-secondary text-sm mb-6">
                        Sign in to
                        continue
                    </p>

                    {error && (
                        <div className="bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl px-4 py-3 mb-4">
                            {error}
                        </div>
                    )}

                    <form
                        onSubmit={
                            handleLogin
                        }
                        className="space-y-4"
                    >
                        {/* Email */}
                        <div>
                            <label className="text-ink-secondary text-xs tracking-wider uppercase font-medium mb-2 block">
                                Email
                            </label>

                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />

                                <input
                                    type="email"
                                    value={
                                        email
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setEmail(
                                            e
                                                .target
                                                .value
                                        )
                                    }
                                    required
                                    placeholder="you@example.com"
                                    className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-3.5 text-ink-primary text-sm placeholder:text-ink-muted transition-all"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="text-ink-secondary text-xs tracking-wider uppercase font-medium mb-2 block">
                                Password
                            </label>

                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />

                                <input
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={
                                        password
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setPassword(
                                            e
                                                .target
                                                .value
                                        )
                                    }
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-surface border border-border rounded-xl pl-10 pr-11 py-3.5 text-ink-primary text-sm placeholder:text-ink-muted transition-all"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted p-1"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={
                                loading
                            }
                            className="w-full bg-gold hover:bg-gold-light active:bg-gold-dark text-base font-semibold rounded-xl py-4 mt-2 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 text-sm tracking-wider uppercase"
                            style={{
                                color: "#080808",
                            }}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Signing
                                    in…
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-ink-muted text-xs mt-6">
                    ©{" "}
                    {new Date().getFullYear()}{" "}
                    Gents
                    Collection. All
                    rights reserved.
                </p>
            </div>
        </div>
    );
}