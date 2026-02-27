import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NextAuthProvider from "@/components/providers/NextAuthProvider";
import MobileNavigation from "@/components/layout/MobileNavigation";
import PWAHandler from "@/components/pwa/PWAHandler";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "AROMIX | Premium Perfume Management",
    description: "High-end multi-tenant SaaS for perfume retail management.",
    manifest: "/manifest.json",
    themeColor: "#C5A059",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "AROMIX",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="id" className="dark">
            <body className={`${inter.className} bg-background text-foreground antialiased`}>
                <NextAuthProvider>
                    {children}
                    <MobileNavigation />
                    <PWAHandler />
                </NextAuthProvider>
            </body>
        </html>
    );
}
