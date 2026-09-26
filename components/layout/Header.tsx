"use client";

import React, { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, Bell, Menu, ChevronRight } from "lucide-react";
import { useAppData } from "@/lib/store";

type Crumb = { label: string; href?: string };

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const params = useSearchParams();
  const { invoices, getInvoice, getClient, settings } = useAppData();
  const [query, setQuery] = useState("");

  const segments = pathname.split("/").filter(Boolean);
  let crumbs: Crumb[] = [{ label: "Dashboard" }];
  if (segments[0] === "factures") {
    crumbs = [{ label: "Factures", href: "/factures" }];
    if (segments[1] === "nouvelle") {
      const editId = params.get("edit");
      crumbs.push({ label: editId ? `Modifier ${getInvoice(editId)?.number ?? ""}`.trim() : "Nouvelle facture" });
    } else if (segments[1]) {
      crumbs.push({ label: getInvoice(segments[1])?.number ?? "Facture" });
    }
  }
  if (segments[0] === "clients") {
    crumbs = [{ label: "Clients", href: "/clients" }];
    if (segments[1]) crumbs.push({ label: getClient(segments[1])?.name ?? "Client" });
  }
  if (segments[0] === "parametres") crumbs = [{ label: "Paramètres" }];
  if (segments[0] === "design-system") crumbs = [{ label: "Design system" }];

  const overdue = invoices.filter((i) => i.status === "En retard").length;
  const initial = (settings.user.firstName || "?").charAt(0).toUpperCase();

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/factures?q=${encodeURIComponent(q)}` : "/factures");
  };

  return (
    <header className="sticky top-0 z-30 bg-bg/80 backdrop-blur-md border-b border-line px-4 md:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <button onClick={onMenuClick} aria-label="Ouvrir le menu" className="lg:hidden p-2 -ml-2 text-muted hover:text-ink transition-colors">
          <Menu size={24} aria-hidden="true" />
        </button>
        <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 min-w-0">
          {crumbs.map((c, i) => {
            const last = i === crumbs.length - 1;
            return (
              <span key={c.label + i} className={last ? "flex items-center gap-1.5 min-w-0" : "hidden sm:flex items-center gap-1.5 min-w-0"}>
                {i > 0 && <ChevronRight size={16} className="text-muted shrink-0 hidden sm:block" aria-hidden="true" />}
                {c.href && !last ? (
                  <Link href={c.href} className="text-sm font-medium text-muted hover:text-accent transition-colors whitespace-nowrap">
                    {c.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="font-display font-bold text-lg md:text-xl text-ink tracking-tight truncate">
                    {c.label}
                  </span>
                )}
              </span>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        <form role="search" onSubmit={submitSearch} className="hidden md:flex relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" size={18} aria-hidden="true" />
          <input
            type="search"
            aria-label="Rechercher une facture ou un client"
            placeholder="Rechercher une facture..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-4 py-2 bg-card border border-line rounded-xl text-sm focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all w-64 hover:border-muted/30"
          />
        </form>

        <Link
          href="/factures?statut=En%20retard"
          aria-label={overdue ? `${overdue} facture${overdue > 1 ? "s" : ""} en retard` : "Aucune facture en retard"}
          className="relative p-2 text-muted hover:text-ink hover:bg-hover rounded-xl transition-colors group"
        >
          <Bell size={20} aria-hidden="true" className="group-hover:rotate-12 transition-transform origin-top" />
          {overdue > 0 && (
            <span className="absolute top-0.5 right-0.5 min-w-4 h-4 px-1 bg-accent text-white text-xs leading-4 font-mono font-bold rounded-full ring-2 ring-bg text-center">
              {overdue}
            </span>
          )}
        </Link>

        <Link
          href="/parametres"
          aria-label="Mon profil et paramètres"
          className="w-8 h-8 rounded-full bg-accent/10 lg:hidden flex items-center justify-center font-display font-bold text-sm text-accent"
        >
          {initial}
        </Link>
      </div>
    </header>
  );
}
