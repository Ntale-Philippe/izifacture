"use client";

import React, { Suspense, useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";
import { AppDataProvider } from "@/lib/store";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const pathname = usePathname();

  // Filet de sécurité : referme aussi le tiroir à chaque changement de route.
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  return (
    <AppDataProvider>
      {/* h-dvh : suit la hauteur réellement visible sur mobile (barre d'URL comprise) */}
      <div className="flex h-screen h-dvh overflow-hidden bg-bg">
        <Sidebar open={drawerOpen} onClose={closeDrawer} />
        <div className="flex-1 flex flex-col relative w-full min-w-0 lg:ml-[264px]">
          {/* Header lit les paramètres d'URL : Suspense requis pour le rendu statique */}
          <Suspense fallback={<div className="h-16 border-b border-line shrink-0" />}>
            <Header onMenuClick={() => setDrawerOpen(true)} />
          </Suspense>
          <main className="flex-1 overflow-y-auto overscroll-contain p-4 md:p-6 lg:p-8 pb-32 md:pb-8">
            <div className="max-w-[1320px] mx-auto w-full">{children}</div>
          </main>
          <MobileNav />
        </div>
      </div>
    </AppDataProvider>
  );
}
