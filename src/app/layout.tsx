import type { Metadata } from "next";
import Link from "next/link";
import { Web3Providers } from "@/lib/wagmi";
import ToastProvider from "@/components/ToastProvider";
import { FEATURE_STATUS } from "@/lib/flags";
import dynamic from "next/dynamic";
import EnvBanner from "@/components/EnvBanner";
import ApolloProviders from "@/components/providers/ApolloProviders";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const NotificationBell = dynamic(() => import("@/components/NotificationBell"));

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PoolParty",
  description: "DeFi pool analytics and wallet tools",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased text-foreground`}>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 bg-black text-white dark:bg-white dark:text-black px-3 py-1 rounded">
          Skip to content
        </a>
        <header className="sticky top-0 z-10 border-b border-black/10 dark:border-white/10 bg-white/80 dark:bg-black/50 backdrop-blur" role="banner">
          <nav aria-label="Primary" className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="font-semibold tracking-tight" aria-label="PoolParty Home">PoolParty</Link>
              <Link href="/" className="text-sm opacity-80 hover:opacity-100">Dashboard</Link>
              <Link href="/wallet" className="text-sm opacity-80 hover:opacity-100">Wallet</Link>
              {FEATURE_STATUS && (
                <Link href="/status" className="text-sm opacity-80 hover:opacity-100">Status</Link>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="text-xs opacity-60 hidden md:block">
                {process.env.NEXT_PUBLIC_COMMIT_SHA ? `#${process.env.NEXT_PUBLIC_COMMIT_SHA.slice(0, 7)}` : 'MVP'}
              </div>
              {/* Lazy-load bell to avoid SSR use client mismatch */}
              <NotificationBell />
            </div>
          </nav>
        </header>
        <Web3Providers>
          <ApolloProviders>
            <ToastProvider>
              <EnvBanner />
              <main id="main" className="mx-auto max-w-6xl px-4 py-6" role="main">{children}</main>
            </ToastProvider>
          </ApolloProviders>
        </Web3Providers>
      </body>
    </html>
  );
}
