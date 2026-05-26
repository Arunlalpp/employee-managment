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
        "StoreManager — Gents Collection",

    description:
        "Staff & Payroll Management",

    manifest:
        "/manifest.json?v=10",

    appleWebApp: {

        capable: true,

        statusBarStyle:
            "black-translucent",

        title:
            "StoreManager",
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

                <meta
                    name="theme-color"
                    content="#080808"
                />

                <meta
                    name="mobile-web-app-capable"
                    content="yes"
                />

                <meta
                    name="apple-mobile-web-app-capable"
                    content="yes"
                />

                <meta
                    name="apple-mobile-web-app-status-bar-style"
                    content="black-translucent"
                />

                <link
                    rel="manifest"
                    href="/manifest.json?v=10"
                />

                <link
                    rel="icon"
                    href="/icon-192.png"
                />

                <link
                    rel="apple-touch-icon"
                    href="/icon-192.png"
                />

            </head>

            <body className="antialiased">
                <PwaInstaller></PwaInstaller>
                <Providers>
                    {children}
                </Providers>

            </body>

        </html>
    );
}