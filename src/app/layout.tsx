import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mini Projects Hub",
  description: "A collection of interactive web projects built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-full flex flex-col`}
      >
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center">
            <Navigation />
          </div>
        </header>
        <main className="flex-1 container py-6">
          {children}
        </main>
        <footer className="border-t py-6 md:py-0">
          <div className="container flex h-14 items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Built with Next.js, React, and Tailwind
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
