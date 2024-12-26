import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/nav";
import { Github } from "lucide-react";

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
          <div className="container flex h-16 items-center justify-between">
            <Navigation />
            <a
              href="https://github.com/yourusername/mini-projects-hub"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="h-5 w-5" />
              <span className="hidden sm:inline">View on GitHub</span>
            </a>
          </div>
        </header>
        
        <main className="flex-1">
          {children}
        </main>

        <footer className="border-t mt-16">
          <div className="container flex flex-col sm:flex-row gap-4 h-24 items-center justify-between text-center sm:text-left">
            <p className="text-sm text-muted-foreground">
              Built with Next.js, React, and Tailwind
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="/about" className="hover:text-foreground transition-colors">About</a>
              <a href="/privacy" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="/terms" className="hover:text-foreground transition-colors">Terms</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
