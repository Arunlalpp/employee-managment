"use client";

import {
    useEffect,
    useState,
} from "react";

interface BeforeInstallPromptEvent
    extends Event {

    prompt:
    () => Promise<void>;

    userChoice:
    Promise<{
        outcome:
        "accepted" |
        "dismissed";

        platform:
        string;
    }>;
}

export default function
    PwaInstaller() {

    const [
        promptEvent,
        setPromptEvent,
    ] =
        useState<BeforeInstallPromptEvent | null>(
            null
        );

    const [
        shouldShowInstall,
        setShouldShowInstall,
    ] =
        useState(false);

    useEffect(() => {

        const handleBeforeInstallPrompt =
            (
                event: Event
            ) => {

                event.preventDefault();

                setPromptEvent(
                    event as BeforeInstallPromptEvent
                );

                setShouldShowInstall(
                    true
                );
            };

        window.addEventListener(
            "beforeinstallprompt",
            handleBeforeInstallPrompt as EventListener
        );

        return () => {

            window.removeEventListener(
                "beforeinstallprompt",
                handleBeforeInstallPrompt as EventListener
            );
        };

    }, []);

    const handleInstall =
        async () => {

            if (
                !promptEvent
            ) {
                return;
            }

            await promptEvent.prompt();

            const result =
                await promptEvent.userChoice;

            if (
                result.outcome ===
                "accepted"
            ) {

                setShouldShowInstall(
                    false
                );
            }
        };

    if (
        !shouldShowInstall
    ) {
        return null;
    }

    return (

        <div className="fixed bottom-4 right-4 z-50 max-w-xs rounded-2xl border border-white/10 bg-black/95 p-4 text-sm text-white shadow-xl backdrop-blur-md">

            <div className="mb-3 font-semibold">
                Install StoreManager
            </div>

            <div className="mb-4 text-xs text-slate-300">
                Add this app to your device home screen.
            </div>

            <button
                type="button"
                onClick={
                    handleInstall
                }
                className="w-full rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black"
            >

                Install App

            </button>

        </div>
    );
}