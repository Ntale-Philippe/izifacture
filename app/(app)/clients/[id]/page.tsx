"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import clsx from "clsx";
import { ArrowLeft, FilePlus2, Pencil, Wallet, CheckCircle2, AlertCircle, Mail, Phone, MapPin, User, Hash } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ClientLogo } from "@/components/ui/ClientLogo";
import { StatCard } from "@/components/dashboard/StatCard";
import { ClientFormModal } from "@/components/clients/ClientFormModal";
import { useAppData } from "@/lib/store";
import { statsFor } from "@/lib/clientStats";
import { formatDate, formatFCFA } from "@/lib/format";

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { hydrated, getClient, invoices } = useAppData();
  const [editOpen, setEditOpen] = useState(false);

  if (!hydrated) {
    return (
      <div className="space-y-6">
        <Skeleton className="w-40 h-4 rounded-full" />
        <div className="flex items-center gap-4">
          <Skeleton className="w-16 h-16 rounded-full" />
          <Skeleton className="w-64 h-10 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
        </div>
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    );
  }

  const client = getClient(id);
  if (!client) {
    return (
      <Card className="p-6">
        <EmptyState
          title="Client introuvable"
          description="Il a peut-être été supprimé. Retrouvez vos clients dans le carnet."
          action={<Link href="/clients" tabIndex={-1}><Button>Voir les clients</Button></Link>}
        />
      </Card>
    );
  }

  const stats = statsFor(client.id, invoices);
  const list = invoices.filter((i) => i.clientId === client.id).sort((a, b) => b.date.localeCompare(a.date));
  const contact = [
    { icon: User, label: "Contact", value: client.contactName },
    { icon: Mail, label: "E-mail", value: client.email },
    { icon: Phone, label: "Téléphone", value: client.phone, mono: true },
    { icon: MapPin, label: "Adresse", value: [client.address, client.city, client.country].filter(Boolean).join(", ") },
    { icon: Hash, label: "NINU", value: client.ninu, mono: true },
  ].filter((c) => c.value);

  return (
    <div className="space-y-6">
      <Link href="/clients" className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-ink transition-colors group">
        <ArrowLeft size={16} aria-hidden="true" className="transition-transform group-hover:-translate-x-0.5" />
        Retour aux clients
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-fade-up opacity-0">
        <div className="flex items-center gap-4 min-w-0">
          <ClientLogo name={client.name} className="w-16 h-16 shrink-0" />
          <div className="min-w-0">
            <h1 className="font-display font-bold text-3xl md:text-4xl text-ink tracking-tight text-balance">{client.name}</h1>
            <p className="text-sm text-muted mt-1">
              Client depuis le {formatDate(client.createdAt)}
              {stats.lastDate && <> · dernière facture le {formatDate(stats.lastDate)}</>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button variant="secondary" onClick={() => setEditOpen(true)}>
            <Pencil size={16} aria-hidden="true" /> Modifier
          </Button>
          <Link href={`/factures/nouvelle?client=${client.id}`} tabIndex={-1}>
            <Button>
              <FilePlus2 size={18} aria-hidden="true" /> Nouvelle facture
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        <StatCard title="Total facturé" value={stats.billed} icon={Wallet} delay={0.1} hint={`${stats.count} facture${stats.count > 1 ? "s" : ""}`} />
        <StatCard title="Encaissé" value={stats.paid} icon={CheckCircle2} delay={0.15} />
        <StatCard
          title="Reste à encaisser"
          value={stats.outstanding}
          icon={AlertCircle}
          delay={0.2}
          hint={stats.overdue ? `dont ${formatFCFA(stats.overdue)} en retard` : "Aucun retard"}
          className="sm:col-span-2 xl:col-span-1"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <Card className="p-6 animate-fade-up opacity-0" style={{ animationDelay: "0.25s" }}>
          <CardHeader title="Coordonnées" />
          <dl className="mt-4 space-y-4">
            {contact.map(({ icon: Icon, label, value, mono }) => (
              <div key={label} className="flex gap-3">
                <Icon size={18} className="text-muted shrink-0 mt-0.5" aria-hidden="true" />
                <div className="min-w-0">
                  <dt className="text-xs text-muted">{label}</dt>
                  <dd className={clsx("text-sm text-ink break-words select-all", mono && "font-mono")}>{value}</dd>
                </div>
              </div>
            ))}
          </dl>
        </Card>

        <Card className="xl:col-span-2 animate-fade-up opacity-0" style={{ animationDelay: "0.3s" }}>
          <CardHeader
            className="p-6 border-b border-line"
            title="Factures"
            action={
              list.length > 0 && (
                <Link href={`/factures?client=${client.id}`} className="group text-sm font-medium text-accent">
                  <span className="link-underline">Ouvrir dans la liste</span>
                </Link>
              )
            }
          />
          {list.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="Pas encore de factures"
                description={`Créez la première facture pour ${client.name}.`}
                action={
                  <Link href={`/factures/nouvelle?client=${client.id}`} tabIndex={-1}>
                    <Button>
                      <FilePlus2 size={18} aria-hidden="true" /> Nouvelle facture
                    </Button>
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-bg text-muted font-medium text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3">N° facture</th>
                    <th className="px-6 py-3 hidden sm:table-cell">Échéance</th>
                    <th className="px-6 py-3 text-right">Montant</th>
                    <th className="px-6 py-3 text-center">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {list.map((inv) => (
                    <tr key={inv.id} onClick={() => router.push(`/factures/${inv.id}`)} className="hover:bg-hover transition-colors cursor-pointer">
                      <td className="px-6 py-4">
                        <Link href={`/factures/${inv.id}`} onClick={(e) => e.stopPropagation()} className="font-mono font-medium text-ink hover:text-accent transition-colors">
                          {inv.number}
                        </Link>
                        <div className="text-xs text-muted truncate max-w-[220px]">{inv.items[0]?.description}</div>
                      </td>
                      <td className={clsx("px-6 py-4 font-mono whitespace-nowrap hidden sm:table-cell", inv.status === "En retard" ? "text-danger" : "text-muted")}>{formatDate(inv.dueDate)}</td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-ink whitespace-nowrap">{formatFCFA(inv.amount)}</td>
                      <td className="px-6 py-4 text-center">
                        <StatusBadge status={inv.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <ClientFormModal isOpen={editOpen} onClose={() => setEditOpen(false)} client={client} />
    </div>
  );
}
