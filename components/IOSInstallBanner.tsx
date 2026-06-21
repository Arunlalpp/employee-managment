"use client";

import { useEffect, useState } from "react";
import { X, Share, Plus } from "lucide-react";

export default function IOSInstallBanner() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const isIOS =
            /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        const isInStandalone =
            (window.navigator as any).standalone === true;
        const dismissed =
            localStorage.getItem("ios-install-dismissed") === "1";

        if (isIOS && !isInStandalone && !dismissed) {
            setVisible(true);
        }
    }, []);

    const dismiss = () => {
        localStorage.setItem("ios-install-dismissed", "1");
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div className="fixed bottom-24 left-4 right-4 z-50 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                    <p className="text-white font-semibold text-sm mb-1">
                        Install App on iPhone
                    </p>
                    <p className="text-zinc-400 text-xs leading-relaxed">
                        Tap{" "}
                        <span className="inline-flex items-center gap-0.5 text-white font-medium">
                            <Share className="w-3 h-3" />
                            Share
                        </span>
                        {" "}at the bottom of Safari, then{" "}
                        <span className="inline-flex items-center gap-0.5 text-white font-medium">
                            <Plus className="w-3 h-3" />
                            Add to Home Screen
                        </span>
                    </p>
                </div>
                <button
                    onClick={dismiss}
                    className="text-zinc-500 hover:text-white mt-0.5 shrink-0"
                    aria-label="Dismiss"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Arrow pointing down toward nav */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-zinc-900 border-r border-b border-zinc-700 rotate-45" />
        </div>
    );
}
