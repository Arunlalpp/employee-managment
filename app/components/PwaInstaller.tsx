"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}

export default function PwaInstaller() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [shouldShowInstall, setShouldShowInstall] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
      setShouldShowInstall(true);
    };

    const handleAppInstalled = () => {
      setInstalled(true);
      setShouldShowInstall(false);
      setPromptEvent(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt as EventListener);
    window.addEventListener("appinstalled", handleAppInstalled);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((error) => console.error("Service worker registration failed:", error));
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt as EventListener);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!promptEvent) {
      return;
    }

    promptEvent.prompt();
    const choiceResult = await promptEvent.userChoice;

    setShouldShowInstall(false);
    setPromptEvent(null);

    if (choiceResult.outcome === "accepted") {
      setInstalled(true);
    }
  };

  if (!shouldShowInstall || installed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-xs rounded-2xl border border-white/10 bg-black/95 p-4 text-sm text-white shadow-xl backdrop-blur-md">
      <div className="mb-3 font-semibold">Install StoreManager</div>
      <div className="mb-4 text-xs text-slate-300">
        Add this app to your device home screen for faster access and offline support.
      </div>
      <button
        type="button"
        onClick={handleInstall}
        className="w-full rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-slate-100"
      >
        Install App
      </button>
    </div>
  );
}
