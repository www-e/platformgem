// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from 'next/font/google'; // Changed font
import { SessionProvider } from "next-auth/react";
import { Navbar } from "@/components/shared/navbar";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css"; // Ensure globals is imported

// Using Inter for a clean, modern UI
const font = Inter({
  subsets: ["latin"], // Latin subset is sufficient for Inter
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: "EduPlatform | Modern Learning", // Updated title
  description: "A modern, advanced educational platform.", // Updated description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // SessionProvider should be the outermost provider
    <SessionProvider>
      <html lang="ar" dir="rtl">
        <body className={`${font.variable} font-sans bg-background antialiased`}>
          <Navbar />
          <main>{children}</main>
          {/* Toaster for notifications, using richColors for better feedback */}
          <Toaster richColors position="bottom-right" />
        </body>
      </html>
    </SessionProvider>
  );
}