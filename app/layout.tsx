import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Multi-Agent Financial Analyst",
  description: "AI-powered financial analysis with specialized agents",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <nav className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-xl font-bold text-gray-900">
                FinAnalyst AI
              </Link>
              <div className="hidden md:flex space-x-6">
                <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Home
                </Link>
                <Link href="/financial" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Financial Analyst
                </Link>
                <Link href="/vectorize" className="text-gray-600 hover:text-gray-900 transition-colors">
                  RAG Chat
                </Link>
                <Link href="/agent" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Basic Agent
                </Link>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Multi-Agent Financial Analysis
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
