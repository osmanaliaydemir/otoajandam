import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import AuthInitializer from "@/components/composite/AuthInitializer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OtoAjandam | Servis Yönetim Sistemi",
  description: "Küçük ve orta ölçekli oto servisleri için dijital kayıt, iş ve müşteri yönetim platformu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={inter.className}>
        {/* Token kontrolü yapacak olan istemci (client) bileşeni */}
        <AuthInitializer />
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
