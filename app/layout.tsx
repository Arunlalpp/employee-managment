import type {
    Metadata,
    Viewport,
} from "next";

import "./globals.css";

import {
    Providers,
} from "./providers";
import PwaInstaller from "@/components/PwaInstaller";

export const metadata:
    Metadata = {

    title:
        "StoreManager",

    description:
        "Staff & Payroll Management",

    manifest:
        "/manifest.json?v=20",

    appleWebApp: {

        capable: true,

        statusBarStyle:
            "black-translucent",

        title:
            "StoreManager",
    },

    formatDetection: {

        telephone: false,
    },

    icons: {

        icon:
            "/icon-192.png",

        apple:
            "/icon-192.png",
    },
};

export const viewport:
    Viewport = {

    width:
        "device-width",

    initialScale: 1,

    maximumScale: 1,

    userScalable: false,

    viewportFit:
        "cover",

    themeColor:
        "#080808",
};

export default function
    RootLayout({
        children,
    }: {
        children:
        React.ReactNode;
    }) {

    return (

        <html
            lang="en"
            className="dark"
        >

            <head>

                {/* IOS PWA */}
                <meta
                    name="apple-mobile-web-app-capable"
                    content="yes"
                />

                <meta
                    name="apple-mobile-web-app-status-bar-style"
                    content="black-translucent"
                />

                <meta
                    name="apple-mobile-web-app-title"
                    content="StoreManager"
                />

                {/* ANDROID */}
                <meta
                    name="mobile-web-app-capable"
                    content="yes"
                />

                {/* THEME */}
                <meta
                    name="theme-color"
                    content="#080808"
                />

                {/* MANIFEST */}
                <link
                    rel="manifest"
                    href="/manifest.json?v=20"
                />

                {/* IOS ICON */}
                <link
                    rel="apple-touch-icon"
                    href="/icon-192.png"
                />

                {/* ICON */}
                <link
                    rel="icon"
                    href="/icon-192.png"
                />

            </head>

            <body className="bg-black text-white antialiased">

                <Providers>
                    {children}
                </Providers>

                <PwaInstaller />

            </body>

        </html>
    );
}