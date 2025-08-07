// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import { SessionProvider } from "@/components/providers/SessionProvider";
import { Navbar } from "@/components/shared/navbar";
import Footer from "@/components/shared/footer"; // Import the new Footer
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const font = Inter({
  subsets: ["latin"],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: "EduPlatform | Modern Learning",
  description: "A modern, advanced educational platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <html lang="ar" dir="rtl" className="h-full">
        <body className={`${font.variable} font-sans bg-background antialiased flex flex-col h-full pt-20`}>
          <Navbar />
          {/* The main content area will grow to fill available space, pushing the footer down */}
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <Toaster richColors position="bottom-right" />
        </body>
      </html>
    </SessionProvider>
  );
}