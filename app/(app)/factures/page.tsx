"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { Search, Plus, Filter, Copy, Trash2, CheckCircle2, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ClientLogo } from "@/components/ui/ClientLogo";
import { Skeleton } from "@/components/ui/Skeleton";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useAppData } from "@/lib/store";
import { formatFCFA, formatDate } from "@/lib/format";
import type { Invoice } from "@/lib/data";

const tabs = ["Toutes", "Payée", "En attente", "En retard", "Brouillon"] as const;
const PAGE_SIZE = 8;

function ListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="w-48 h-10 rounded-xl" />
          <Skeleton className="w-72 h-4 rounded-full" />
        </div>
        <Skeleton className="w-44 h-11 rounded-xl" />
      </div>
      <Skeleton className="w-full sm:w-[560px] h-12 rounded-xl" />
      <Card>
        <div className="p-4 border-b border-line">
          <Skeleton className="max-w-md h-11 rounded-xl" />
        </div>
        <div className="divide-y divide-line">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4">
              <Skeleton className="w-8 h-8 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="w-40 h-4 rounded-full" />
                <Skeleton className="w-28 h-3 rounded-full" />
              </div>
              <Skeleton className="hidden md:block w-28 h-4 rounded-full" />
              <Skeleton className="w-20 h-6 rounded-full" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function InvoiceList() {
  const router = useRouter();
  const params = useSearchParams();
  const { toast } = useToast();
  const { hydrated, invoices, clients, getClient, markInvoicePaid, duplicateInvoice, deleteInvoice } = useAppData();

  const [activeTab, setActiveTab] = useState<string>("Toutes");
  const [search, setSearch] = useState("");
  const [clientFilter, setClientFilter] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState<Invoice | null>(null);

  // Filtres reçus par l'URL : ?statut= (dashboard, cloche), ?q= (recherche de l'en-tête), ?client=
  useEffect(() => {
    const statut = params.get("statut");
    if (statut && (tabs as readonly string[]).includes(statut)) setActiveTab(statut);
    const q = params.get("q");
    if (q !== null) setSearch(q);
    const c = params.get("client");
    if (c) {
      setClientFilter(c);
      setFiltersOpen(true);
    }
  }, [params]);

  useEffect(() => setPage(1), [activeTab, search, clientFilter]);

  const matching = useMemo(() => {
    const q = search.trim().toLowerCase();
    return invoices
      .filter((inv) => {
        if (activeTab !== "Toutes" && inv.status !== activeTab) return false;
        if (clientFilter && inv.clientId !== clientFilter) return false;
        if (!q) return true;
        const name = getClient(inv.clientId)?.name.toLowerCase() ?? "";
        return name.includes(q) || inv.number.toLowerCase().includes(q) || inv.items.some((i) => i.description.toLowerCase().includes(q));
      })
      .sort((a, b) => b.date.localeCompare(a.date) || b.number.localeCompare(a.number));
  }, [invoices, activeTab, clientFilter, search, getClient]);

  if (!hydrated) return <ListSkeleton />;

  const pageCount = Math.max(1, Math.ceil(matching.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = matching.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const countFor = (tab: string) => (tab === "Toutes" ? invoices.length : invoices.filter((i) => i.status === tab).length);
  const hasFilters = !!(search || clientFilter || activeTab !== "Toutes");

  const markPaid = async (inv: Invoice) => {
    try {
      await markInvoicePaid(inv.id);
      toast(`${inv.number} marquée comme payée`, "success");
    } catch {}
  };
  const duplicate = async (inv: Invoice) => {
    try {
      const copy = await duplicateInvoice(inv.id);
      toast(`Copie ${copy.number} créée en brouillon`, "info");
      router.push(`/factures/nouvelle?edit=${copy.id}`);
    } catch {}
  };
  const resetFilters = () => {
    setSearch("");
    setClientFilter("");
    setActiveTab("Toutes");
    router.replace("/factures");
  };

  // Empêche le clic d'une action de ligne d'ouvrir aussi la fiche.
  const stop = (fn: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    fn();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Factures"
        description="Suivez, relancez et encaissez toutes vos factures."
        actions={
          <Link href="/factures/nouvelle" tabIndex={-1}>
            <Button>
              <Plus size={18} aria-hidden="true" />
              Nouvelle facture
            </Button>
          </Link>
        }
      />

      <div className="animate-fade-up opacity-0" style={{ animationDelay: "0.1s" }}>
        <div role="tablist" aria-label="Filtrer par statut" className="flex bg-card p-1 rounded-xl border border-line w-full sm:w-fit overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className={clsx("relative px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors", activeTab === tab ? "text-ink" : "text-muted hover:text-ink")}
            >
              {activeTab === tab && (
                <motion.div layoutId="activeTab" className="absolute inset-0 bg-bg border border-line rounded-lg shadow-warm-sm" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {tab}
                <span className="bg-line-soft px-1.5 py-0.5 rounded-full text-xs font-mono">{countFor(tab)}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <Card className="animate-fade-up opacity-0" style={{ animationDelay: "0.15s" }}>
        <div className="p-4 border-b border-line space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" size={18} aria-hidden="true" />
              <Input aria-label="Rechercher une facture" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="N°, client ou prestation..." className="pl-10" />
            </div>
            <div className="flex gap-3">
              {hasFilters && (
                <Button variant="ghost" onClick={resetFilters}>
                  <X size={16} aria-hidden="true" /> Réinitialiser
                </Button>
              )}
              <Button variant="secondary" className="sm:w-auto w-full" aria-expanded={filtersOpen} onClick={() => setFiltersOpen((o) => !o)}>
                <Filter size={18} aria-hidden="true" />
                Filtres
                {clientFilter && <span className="w-2 h-2 rounded-full bg-accent" aria-label="Filtre actif" />}
              </Button>
            </div>
          </div>
          <AnimatePresence initial={false}>
            {filtersOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                  <Select id="filter-client" label="Client" value={clientFilter} onChange={(e) => setClientFilter(e.target.value)}>
                    <option value="">Tous les clients</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {visible.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title={invoices.length === 0 ? "Pas encore de factures" : "Aucune facture ne correspond"}
              description={invoices.length === 0 ? "Créez votre première facture en quelques clics." : "Modifiez vos critères de recherche ou créez une nouvelle facture."}
              action={
                <Link href="/factures/nouvelle" tabIndex={-1}>
                  <Button>
                    <Plus size={18} aria-hidden="true" /> Nouvelle facture
                  </Button>
                </Link>
              }
            />
          </div>
        ) : (
          <div>
            {/* Tableau (≥ md) : chaque ligne ouvre la fiche facture */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-bg text-muted font-medium text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">N° facture</th>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Émise · échéance</th>
                    <th className="px-6 py-4 text-right">Montant</th>
                    <th className="px-6 py-4 text-center">Statut</th>
                    <th className="px-6 py-4 text-right">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {visible.map((inv) => {
                    const client = getClient(inv.clientId);
                    return (
                      <tr key={inv.id} onClick={() => router.push(`/factures/${inv.id}`)} className="hover:bg-hover transition-colors group cursor-pointer">
                        <td className="px-6 py-4">
                          <Link href={`/factures/${inv.id}`} onClick={(e) => e.stopPropagation()} className="font-mono font-medium text-ink hover:text-accent transition-colors">
                            {inv.number}
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <ClientLogo name={client?.name ?? "?"} className="w-8 h-8 shrink-0" />
                            <div className="min-w-0">
                              <div className="font-bold text-ink truncate">{client?.name ?? "Client supprimé"}</div>
                              <div className="text-xs text-muted truncate">{inv.items[0]?.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono whitespace-nowrap">
                          <div className="text-ink">{formatDate(inv.date)}</div>
                          <div className={clsx("text-xs", inv.status === "En retard" ? "text-danger" : "text-muted")}>Éch. {formatDate(inv.dueDate)}</div>
                        </td>
                        <td className="px-6 py-4 text-right font-mono font-bold text-ink whitespace-nowrap">{formatFCFA(inv.amount)}</td>
                        <td className="px-6 py-4 text-center">
                          <StatusBadge status={inv.status} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                            {(inv.status === "En attente" || inv.status === "En retard") && (
                              <button onClick={stop(() => markPaid(inv))} className="p-1.5 text-success hover:bg-success-soft rounded-lg transition-colors" title="Marquer payée" aria-label={`Marquer ${inv.number} payée`}>
                                <CheckCircle2 size={18} aria-hidden="true" />
                              </button>
                            )}
                            <button onClick={stop(() => duplicate(inv))} className="p-1.5 text-muted hover:text-ink hover:bg-line rounded-lg transition-colors" title="Dupliquer" aria-label={`Dupliquer ${inv.number}`}>
                              <Copy size={18} aria-hidden="true" />
                            </button>
                            <button onClick={stop(() => setToDelete(inv))} className="p-1.5 text-danger hover:bg-danger-soft rounded-lg transition-colors" title="Supprimer" aria-label={`Supprimer ${inv.number}`}>
                              <Trash2 size={18} aria-hidden="true" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Cartes (< md) */}
            <div className="md:hidden flex flex-col gap-4 p-4 bg-bg">
              {visible.map((inv) => {
                const client = getClient(inv.clientId);
                return (
                  <Link key={inv.id} href={`/factures/${inv.id}`} className="block">
                    <Card hoverable className="p-5 flex flex-col gap-5 active:scale-[0.99] transition-transform">
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <ClientLogo name={client?.name ?? "?"} className="w-10 h-10 shrink-0" />
                          <div className="min-w-0">
                            <div className="font-bold text-ink truncate">{client?.name ?? "Client supprimé"}</div>
                            <div className="text-xs text-muted mt-0.5 truncate">{client?.email}</div>
                          </div>
                        </div>
                        <StatusBadge status={inv.status} />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <div className="text-xs text-muted mb-1 font-medium">Montant</div>
                          <div className="font-mono font-bold text-sm text-ink">{formatFCFA(inv.amount)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted mb-1 font-medium">N°</div>
                          <div className="font-mono text-sm text-ink">{inv.number.split("-").pop()}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted mb-1 font-medium">Échéance</div>
                          <div className={clsx("font-mono text-sm", inv.status === "En retard" ? "text-danger" : "text-ink")}>{formatDate(inv.dueDate)}</div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-4 px-4 md:px-6 py-4 border-t border-line text-sm">
              <span className="text-muted">
                <span className="font-mono text-ink">
                  {(currentPage - 1) * PAGE_SIZE + 1}–{(currentPage - 1) * PAGE_SIZE + visible.length}
                </span>{" "}
                sur <span className="font-mono text-ink">{matching.length}</span> factures
              </span>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" aria-label="Page précédente" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} className="px-3">
                  <ChevronLeft size={16} aria-hidden="true" />
                </Button>
                <span className="font-mono text-ink px-2">
                  {currentPage} / {pageCount}
                </span>
                <Button variant="secondary" size="sm" aria-label="Page suivante" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)} className="px-3">
                  <ChevronRight size={16} aria-hidden="true" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      <Modal isOpen={!!toDelete} onClose={() => setToDelete(null)} title="Supprimer la facture">
        <p className="text-sm text-muted mb-6">
          La facture <span className="font-mono text-ink">{toDelete?.number}</span> sera définitivement supprimée. Cette action est irréversible.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setToDelete(null)}>
            Annuler
          </Button>
          <Button
            variant="danger"
            onClick={async () => {
              const target = toDelete;
              setToDelete(null);
              if (!target) return;
              try {
                await deleteInvoice(target.id);
                toast(`Facture ${target.number} supprimée`, "success");
              } catch {}
            }}
          >
            Supprimer
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default function FacturesPage() {
  return (
    <Suspense fallback={<ListSkeleton />}>
      <InvoiceList />
    </Suspense>
  );
}
