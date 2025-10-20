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
        <Web3Providers>
          <ApolloProviders>
            <ToastProvider>
              <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 bg-black text-white dark:bg-white dark:text-black px-3 py-1 rounded">
                Skip to content
              </a>
              <header className="sticky top-0 z-10 border-b border-black/10 dark:border-white/10 bg-white/90 dark:bg-black/70 backdrop-blur-md shadow-sm" role="banner">
                <nav aria-label="Primary" className="container mx-auto max-w-[1280px] px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-8">
                    <Link href="/" className="font-bold text-lg tracking-tight text-neutral-900 dark:text-white" aria-label="PoolParty Home">
                      PoolParty
                    </Link>
                    <div className="flex items-center gap-6">
                      <Link
                        href="/"
                        className="nav-link text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-primary-blue dark:hover:text-pool-blue transition-colors px-2 py-1 relative"
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/wallet"
                        className="nav-link text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-primary-blue dark:hover:text-pool-blue transition-colors px-2 py-1 relative"
                      >
                        Wallet
                      </Link>
                      {FEATURE_STATUS && (
                        <Link
                          href="/status"
                          className="nav-link text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-primary-blue dark:hover:text-pool-blue transition-colors px-2 py-1 relative"
                        >
                          Status
                        </Link>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-xs opacity-60 hidden md:block font-mono">
                      {process.env.NEXT_PUBLIC_COMMIT_SHA ? `#${process.env.NEXT_PUBLIC_COMMIT_SHA.slice(0, 7)}` : 'MVP'}
                    </div>
                    {/* Lazy-load bell to avoid SSR use client mismatch */}
                    <NotificationBell />
                  </div>
                </nav>
              </header>
              <EnvBanner />
              <main id="main" className="container mx-auto max-w-[1280px] px-4 py-8" role="main">{children}</main>
            </ToastProvider>
          </ApolloProviders>
        </Web3Providers>
      </body>
    </html>
  );
}
