"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Plus, Users, Settings } from "lucide-react";
import clsx from "clsx";

const navItems = [
  { name: "Accueil", href: "/dashboard", icon: LayoutDashboard },
  { name: "Factures", href: "/factures", icon: FileText },
  { name: "Nouvelle facture", href: "/factures/nouvelle", icon: Plus, isFab: true },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Paramètres", href: "/parametres", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigation principale"
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-card/95 backdrop-blur-md border-t border-line rounded-t-2xl shadow-warm-lg px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      {/* Grille à 5 colonnes égales : chaque zone de tap fait toute la largeur de sa colonne */}
      <div className="grid grid-cols-5 items-center">
        {navItems.map((item) => {
          const Icon = item.icon;

          if (item.isFab) {
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.name}
                className="justify-self-center w-14 h-14 -mt-7 bg-accent text-white rounded-full flex items-center justify-center shadow-warm-lg ring-4 ring-bg active:scale-95 transition-transform"
              >
                <Plus size={26} />
              </Link>
            );
          }

          // /factures ne doit pas s'allumer sur /factures/nouvelle (c'est le FAB)
          const isActive =
            item.href === "/factures"
              ? pathname === "/factures"
              : pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.name}
              aria-current={isActive ? "page" : undefined}
              className="flex flex-col items-center justify-center gap-1 h-14 rounded-2xl active:bg-hover transition-colors"
            >
              <span
                className={clsx(
                  "flex items-center justify-center w-12 h-8 rounded-full transition-colors duration-200",
                  isActive ? "bg-accent/15 text-accent" : "text-muted"
                )}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </span>
              <span className={clsx("text-xs leading-none font-semibold", isActive ? "text-accent" : "text-muted")}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
