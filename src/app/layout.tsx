import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NextAuthProvider from "@/components/providers/NextAuthProvider";
import MobileNavigation from "@/components/layout/MobileNavigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "AROMIX | Premium Perfume Management",
    description: "High-end multi-tenant SaaS for perfume retail management.",
    manifest: "/manifest.json",
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
                </NextAuthProvider>
            </body>
        </html>
    );
}
