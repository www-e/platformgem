// src/app/layout.tsx
import type { Metadata } from "next";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { Navbar } from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sport School | Modern Learning",
  description: "A modern, advanced educational platform.",
  other: {
    "google": "notranslate",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <html lang="en" dir="ltr" className="h-full">
        <head>
          <meta name="google" content="notranslate" />
          <meta httpEquiv="Content-Language" content="en" />
        </head>
        <body className="font-primary bg-background antialiased flex flex-col h-full">
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
