"use client";

import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import {
    clearNotifications,
    getNotifications,
} from "./services/notifications.service";

export function useNotifications() {
    return useQuery({
        queryKey: [
            "notifications",
        ],
        queryFn:
            getNotifications,
        staleTime:
            1000 * 60 * 2,
        refetchOnWindowFocus:
            false,
    });
}

export function useClearNotifications() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn:
            clearNotifications,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [
                    "notifications",
                ],
            });
        },
    });
}
