// src/app/layout.tsx
import type { Metadata } from "next";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { Navbar } from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

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
        <body className="font-primary bg-background antialiased flex flex-col h-full pt-20">
          <Navbar />
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
