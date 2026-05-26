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
    }>;
}

export default function
    PwaInstaller() {

    const [
        deferredPrompt,
        setDeferredPrompt,
    ] =
        useState<BeforeInstallPromptEvent | null>(
            null
        );

    const [
        isInstalled,
        setIsInstalled,
    ] =
        useState(false);

    useEffect(() => {

        // APP ALREADY INSTALLED
        if (

            window.matchMedia(
                "(display-mode: standalone)"
            ).matches

        ) {

            setIsInstalled(
                true
            );

            return;
        }

        const handleBeforeInstallPrompt =
            (
                event: Event
            ) => {

                event.preventDefault();

                setDeferredPrompt(
                    event as BeforeInstallPromptEvent
                );
            };

        const handleInstalled =
            () => {

                setIsInstalled(
                    true
                );

                setDeferredPrompt(
                    null
                );
            };

        window.addEventListener(
            "beforeinstallprompt",
            handleBeforeInstallPrompt
        );

        window.addEventListener(
            "appinstalled",
            handleInstalled
        );

        return () => {

            window.removeEventListener(
                "beforeinstallprompt",
                handleBeforeInstallPrompt
            );

            window.removeEventListener(
                "appinstalled",
                handleInstalled
            );
        };

    }, []);

    const handleInstall =
        async () => {

            if (
                !deferredPrompt
            ) {
                return;
            }

            await deferredPrompt.prompt();

            const choice =
                await deferredPrompt.userChoice;

            if (
                choice.outcome ===
                "accepted"
            ) {

                setDeferredPrompt(
                    null
                );
            }
        };

    // HIDE IF:
    // already installed
    // OR install unavailable

    if (
        isInstalled ||
        !deferredPrompt
    ) {

        return null;
    }

    return (

        <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-[320px] rounded-3xl border border-yellow-500/20 bg-zinc-950/95 backdrop-blur-xl p-5 shadow-2xl">

            <div className="flex items-start gap-4">

                <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-2xl">
                    📲
                </div>

                <div className="flex-1">

                    <h3 className="text-white font-semibold text-base">
                        Install StoreManager
                    </h3>

                    <p className="text-zinc-400 text-sm mt-1 leading-relaxed">
                        Add the app to your home screen for faster access.
                    </p>

                    <button
                        onClick={
                            handleInstall
                        }
                        className="mt-4 w-full bg-yellow-500 text-black font-semibold py-3 rounded-2xl"
                    >

                        Install App

                    </button>

                </div>

            </div>

        </div>
    );
}