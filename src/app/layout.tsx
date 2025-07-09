// src/app/layout.tsx

import type { Metadata } from "next";
import { Noto_Kufi } from "next/font/google"; // Switched to a font with better Arabic support
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { Navbar } from "@/components/shared/navbar";

// Using Noto_Kufi for better Arabic rendering
const font = Noto_Kufi({
  subsets: ["arabic"],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: "منصة التعلم المتقدمة",
  description: "منصة تعليمية حديثة ومتطورة",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 1. We wrap everything in the SessionProvider
    <SessionProvider>
      <html lang="ar" dir="rtl">
        {/* 2. I've updated the font for better Arabic support */}
        <body className={`${font.variable} font-sans bg-slate-900 antialiased`}>
          {/* 3. The Navbar is added here so it appears on all pages */}
          <Navbar />
          {/* 4. The rest of your app's pages will be rendered here */}
          <main>{children}</main>
        </body>
      </html>
    </SessionProvider>
  );
}