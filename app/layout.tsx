import { Plus_Jakarta_Sans, DM_Sans, Space_Mono } from "next/font/google";
import type { Viewport } from "next";
import { colors } from "@/lib/tokens";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: colors.bg.DEFAULT,
};

export const metadata = {
  title: "Izifacture - Premium SaaS",
  description: "Facturation simplifiée pour l'Afrique Francophone",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${jakarta.variable} ${dmSans.variable} ${spaceMono.variable}`}>
      <body className="min-h-screen relative flex flex-col">
        <div className="noise-overlay" />
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
