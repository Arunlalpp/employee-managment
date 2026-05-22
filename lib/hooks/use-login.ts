"use client";

import {
    useMutation,
    useQueryClient,
}
    from "@tanstack/react-query";
import { createClient }
    from "@/lib/supabase";

export function useLogin() {
    const queryClient =
        useQueryClient();
    const supabase =
        createClient();

    return useMutation({
        mutationFn: async ({
            email,
            password,
        }: {
            email: string;
            password: string;
        }) => {
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

            if (authError) {
                throw authError;
            }

            const user =
                data.user;

            if (!user) {
                throw new Error(
                    "User not found"
                );
            }

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

            if (
                profileError ||
                !profile
            ) {
                throw new Error(
                    "Profile not found"
                );
            }

            return {
                user,
                profile,
            };
        },
        onSuccess: ({
            user,
            profile,
        }) => {
            queryClient.removeQueries();
            queryClient.setQueryData(
                [
                    "auth",
                    "user",
                ],
                user
            );
            queryClient.setQueryData(
                [
                    "profile",
                    user.id,
                ],
                profile
            );
        },
    });
}
