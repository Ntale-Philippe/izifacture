"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Users, Settings, LogOut, X } from "lucide-react";
import clsx from "clsx";
import { useAppData } from "@/lib/store";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Factures", href: "/factures", icon: FileText },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Paramètres", href: "/parametres", icon: Settings },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { settings, signOut } = useAppData();
  const fullName = [settings.user.firstName, settings.user.lastName].filter(Boolean).join(" ") || "Mon compte";

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 kente-pattern relative h-24 shrink-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card" />
        <div className="relative z-10 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent text-white flex items-center justify-center font-display font-bold text-lg shadow-warm-md">
            iz
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-ink">Izifacture</span>
          {onClose && (
            <button
              onClick={onClose}
              aria-label="Fermer le menu"
              className="ml-auto -mr-2 p-2.5 text-muted hover:text-ink active:bg-hover rounded-xl transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              // Ferme le tiroir à chaque tap, y compris sur la page courante
              onClick={onClose}
              className={clsx(
                "group flex items-center gap-3 px-3 py-3 rounded-xl transition-colors relative font-medium",
                isActive ? "text-accent bg-accent/10" : "text-muted hover:text-ink hover:bg-hover active:bg-hover"
              )}
            >
              {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-accent rounded-r-full" />}
              <Icon size={20} className="transition-transform group-hover:scale-110" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-line pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-3 p-2 rounded-xl">
          <Link href="/parametres" onClick={onClose} className="flex flex-1 items-center gap-3 min-w-0 rounded-xl hover:bg-hover -m-1 p-1 transition-colors">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center font-display font-bold text-accent shrink-0">
              {fullName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-ink truncate">{fullName}</p>
              <p className="text-xs text-muted truncate">{settings.company.name || "Plan Premium"}</p>
            </div>
          </Link>
          <button
            onClick={signOut}
            aria-label="Se déconnecter"
            title="Se déconnecter"
            className="p-2 text-muted hover:text-danger hover:bg-danger-soft rounded-lg transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  // Échap ferme le tiroir
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      <aside className="hidden lg:block w-[264px] h-full border-r border-line bg-card fixed left-0 top-0 z-40">
        <SidebarContent />
      </aside>

      {/* Tiroir mobile toujours monté, piloté en CSS : fermé, il est invisible
          et ne capte aucun tap (pas de couche fantôme qui bloque l'écran). */}
      <div
        className={clsx("lg:hidden fixed inset-0 z-[60]", open ? "visible" : "invisible pointer-events-none")}
        aria-hidden={!open}
      >
        <div
          onClick={onClose}
          className={clsx(
            "absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity duration-300",
            open ? "opacity-100" : "opacity-0"
          )}
        />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Menu principal"
          className={clsx(
            "absolute left-0 top-0 h-full w-[264px] max-w-[85vw] bg-card shadow-warm-lg transition-transform duration-300 ease-drawer",
            open ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <SidebarContent onClose={onClose} />
        </aside>
      </div>
    </>
  );
}
