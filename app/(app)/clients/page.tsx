"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Plus, Search, Users, Wallet, AlertCircle, FilePlus2, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ClientLogo } from "@/components/ui/ClientLogo";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { StatCard } from "@/components/dashboard/StatCard";
import { ClientFormModal } from "@/components/clients/ClientFormModal";
import { useAppData } from "@/lib/store";
import { statsFor } from "@/lib/clientStats";
import { formatFCFA, formatDate } from "@/lib/format";
import type { Client } from "@/lib/data";

function ClientsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="w-40 h-10 rounded-xl" />
          <Skeleton className="w-72 h-4 rounded-full" />
        </div>
        <Skeleton className="w-40 h-11 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {[0, 1, 2].map((i) => (
          <Card key={i} className="p-6 space-y-6">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="w-24 h-4 rounded-full" />
              <Skeleton className="w-36 h-7 rounded-full" />
            </div>
          </Card>
        ))}
      </div>
      <Card>
        <div className="p-4 border-b border-line">
          <Skeleton className="max-w-md h-11 rounded-xl" />
        </div>
        <div className="divide-y divide-line">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4">
              <Skeleton className="w-10 h-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="w-44 h-4 rounded-full" />
                <Skeleton className="w-28 h-3 rounded-full" />
              </div>
              <Skeleton className="hidden md:block w-28 h-4 rounded-full" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default function ClientsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { hydrated, clients, invoices, deleteClient } = useAppData();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Client | undefined>();
  const [toDelete, setToDelete] = useState<Client | null>(null);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return clients
      .map((c) => ({ client: c, stats: statsFor(c.id, invoices) }))
      .filter(({ client: c }) => !q || [c.name, c.contactName, c.email, c.city, c.phone].some((v) => v.toLowerCase().includes(q)))
      .sort((a, b) => b.stats.billed - a.stats.billed || a.client.name.localeCompare(b.client.name));
  }, [clients, invoices, search]);

  if (!hydrated) return <ClientsSkeleton />;

  const allStats = clients.map((c) => statsFor(c.id, invoices));
  const totalBilled = allStats.reduce((s, x) => s + x.billed, 0);
  const totalOutstanding = allStats.reduce((s, x) => s + x.outstanding, 0);
  const lateClients = allStats.filter((x) => x.overdue > 0).length;

  const openCreate = () => {
    setEditing(undefined);
    setFormOpen(true);
  };
  const openEdit = (c: Client) => {
    setEditing(c);
    setFormOpen(true);
  };
  const stop = (fn: () => void) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fn();
  };
  const deleteBlocked = toDelete ? invoices.some((i) => i.clientId === toDelete.id) : false;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clients"
        description="Votre carnet de clients, leur chiffre d'affaires et ce qu'il reste à encaisser."
        actions={
          <Button onClick={openCreate}>
            <Plus size={18} aria-hidden="true" /> Nouveau client
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        <StatCard title="Clients actifs" value={clients.length} format={false} icon={Users} delay={0.1} />
        <StatCard title="Chiffre d'affaires facturé" value={totalBilled} icon={Wallet} delay={0.15} />
        <StatCard
          title="Reste à encaisser"
          value={totalOutstanding}
          icon={AlertCircle}
          delay={0.2}
          href="/factures?statut=En%20retard"
          hint={lateClients ? `${lateClients} client${lateClients > 1 ? "s" : ""} avec des retards` : "Aucun retard"}
          className="sm:col-span-2 xl:col-span-1"
        />
      </div>

      <Card className="animate-fade-up opacity-0" style={{ animationDelay: "0.25s" }}>
        <div className="p-4 border-b border-line">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" size={18} aria-hidden="true" />
            <Input aria-label="Rechercher un client" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nom, contact, ville, téléphone..." className="pl-10" />
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Users}
              title={clients.length === 0 ? "Pas encore de clients enregistrés" : "Aucun client ne correspond"}
              description={clients.length === 0 ? "Ajoutez un client pour préremplir ses coordonnées sur vos factures." : "Essayez un autre nom, une ville ou un numéro."}
              action={
                <Button onClick={openCreate}>
                  <Plus size={18} aria-hidden="true" /> Ajouter un client
                </Button>
              }
            />
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-bg text-muted font-medium text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Localisation</th>
                    <th className="px-6 py-4 text-center">Factures</th>
                    <th className="px-6 py-4 text-right">Facturé</th>
                    <th className="px-6 py-4 text-right">Reste dû</th>
                    <th className="px-6 py-4 text-right">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {rows.map(({ client: c, stats }) => (
                    <tr key={c.id} onClick={() => router.push(`/clients/${c.id}`)} className="hover:bg-hover transition-colors group cursor-pointer">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <ClientLogo name={c.name} className="w-10 h-10 shrink-0" />
                          <div className="min-w-0">
                            <Link href={`/clients/${c.id}`} onClick={(e) => e.stopPropagation()} className="font-bold text-ink hover:text-accent transition-colors truncate block">
                              {c.name}
                            </Link>
                            <div className="text-xs text-muted truncate">{c.contactName || c.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted whitespace-nowrap">
                        {c.city}
                        {c.city && c.country && ", "}
                        {c.country}
                      </td>
                      <td className="px-6 py-4 text-center font-mono text-ink">{stats.count}</td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-ink whitespace-nowrap">{formatFCFA(stats.billed)}</td>
                      <td className={clsx("px-6 py-4 text-right font-mono whitespace-nowrap", stats.overdue > 0 ? "text-danger font-bold" : stats.outstanding > 0 ? "text-ink" : "text-muted")}>
                        {stats.outstanding > 0 ? formatFCFA(stats.outstanding) : "—"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                          <Link
                            href={`/factures/nouvelle?client=${c.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 text-accent hover:bg-accent/10 rounded-lg transition-colors"
                            title="Nouvelle facture"
                            aria-label={`Nouvelle facture pour ${c.name}`}
                          >
                            <FilePlus2 size={18} aria-hidden="true" />
                          </Link>
                          <button onClick={stop(() => openEdit(c))} className="p-1.5 text-muted hover:text-ink hover:bg-line rounded-lg transition-colors" title="Modifier" aria-label={`Modifier ${c.name}`}>
                            <Pencil size={18} aria-hidden="true" />
                          </button>
                          <button onClick={stop(() => setToDelete(c))} className="p-1.5 text-danger hover:bg-danger-soft rounded-lg transition-colors" title="Supprimer" aria-label={`Supprimer ${c.name}`}>
                            <Trash2 size={18} aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden flex flex-col gap-4 p-4 bg-bg">
              {rows.map(({ client: c, stats }) => (
                <Link key={c.id} href={`/clients/${c.id}`} className="block">
                  <Card hoverable className="p-5 flex flex-col gap-5 active:scale-[0.99] transition-transform">
                    <div className="flex items-center gap-3 min-w-0">
                      <ClientLogo name={c.name} className="w-10 h-10 shrink-0" />
                      <div className="min-w-0">
                        <div className="font-bold text-ink truncate">{c.name}</div>
                        <div className="text-xs text-muted truncate">{[c.city, c.country].filter(Boolean).join(", ")}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <div className="text-xs text-muted mb-1 font-medium">Factures</div>
                        <div className="font-mono text-sm text-ink">{stats.count}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted mb-1 font-medium">Facturé</div>
                        <div className="font-mono font-bold text-sm text-ink">{formatFCFA(stats.billed)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted mb-1 font-medium">Reste dû</div>
                        <div className={clsx("font-mono text-sm", stats.overdue > 0 ? "text-danger font-bold" : "text-ink")}>{stats.outstanding ? formatFCFA(stats.outstanding) : "—"}</div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="px-4 md:px-6 py-4 border-t border-line text-sm text-muted">
              <span className="font-mono text-ink">{rows.length}</span> client{rows.length > 1 ? "s" : ""}
              {rows[0]?.stats.lastDate && (
                <>
                  {" "}· dernière facture le <span className="font-mono text-ink">{formatDate(rows.map((r) => r.stats.lastDate ?? "").sort().pop()!)}</span>
                </>
              )}
            </div>
          </>
        )}
      </Card>

      <ClientFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} client={editing} />

      <Modal isOpen={!!toDelete} onClose={() => setToDelete(null)} title={deleteBlocked ? "Suppression impossible" : "Supprimer le client"}>
        {deleteBlocked ? (
          <>
            <p className="text-sm text-muted mb-6">
              <span className="text-ink font-medium">{toDelete?.name}</span> a des factures enregistrées. Supprimez ou réattribuez d&apos;abord ses factures pour garder une comptabilité cohérente.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setToDelete(null)}>
                Fermer
              </Button>
              <Link href={`/factures?client=${toDelete?.id}`} tabIndex={-1}>
                <Button>Voir ses factures</Button>
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-muted mb-6">
              <span className="text-ink font-medium">{toDelete?.name}</span> sera retiré de votre carnet de clients. Cette action est irréversible.
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
                    if (await deleteClient(target.id)) toast(`${target.name} supprimé`, "success");
                  } catch {}
                }}
              >
                Supprimer
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
