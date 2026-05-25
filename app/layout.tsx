import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import PwaInstaller from "./components/PwaInstaller";

export const metadata: Metadata = {
    title: "StoreManager — Gents Collection",
    description: "Staff & Payroll Management",
    appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: "StoreManager",
    },
    manifest: "/manifest.json",
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: "#080808",
    viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className="dark">
            <head>
                <meta name="theme-color" content="#080808" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <link rel="manifest" href="/manifest.json" />
                <link rel="icon" href="/icon-192.png" sizes="192x192" />
                <link rel="apple-touch-icon" href="/icon-192.png" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body className="antialiased">
                <Providers>{children}</Providers>
                <PwaInstaller />
            </body>
        </html>
    );
}
