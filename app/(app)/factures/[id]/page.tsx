"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, BellRing, CheckCircle2, Copy, Pencil, Trash2, Mail, Phone, ArrowUpRight } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { ClientLogo } from "@/components/ui/ClientLogo";
import { useToast } from "@/components/ui/Toast";
import { InvoicePreview } from "@/components/invoices/InvoicePreview";
import { useAppData } from "@/lib/store";
import { daysUntil } from "@/lib/invoice";
import { formatDate, formatFCFA } from "@/lib/format";

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="w-40 h-4 rounded-full" />
      <div className="flex justify-between gap-4">
        <Skeleton className="w-64 h-10 rounded-xl" />
        <Skeleton className="w-40 h-11 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Skeleton className="xl:col-span-2 h-[640px] rounded-2xl" />
        <div className="space-y-6">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const { hydrated, settings, getInvoice, getClient, markInvoicePaid, duplicateInvoice, deleteInvoice, sendReminder } = useAppData();
  const [payOpen, setPayOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [payMethod, setPayMethod] = useState("");

  if (!hydrated) return <DetailSkeleton />;

  const invoice = getInvoice(id);
  if (!invoice) {
    return (
      <Card className="p-6">
        <EmptyState
          title="Facture introuvable"
          description="Elle a peut-être été supprimée. Retrouvez toutes vos factures dans la liste."
          action={<Link href="/factures" tabIndex={-1}><Button>Voir les factures</Button></Link>}
        />
      </Card>
    );
  }

  const client = getClient(invoice.clientId);
  const days = daysUntil(invoice.dueDate);
  const canEdit = invoice.status !== "Payée";
  const canRemind = invoice.status === "En attente" || invoice.status === "En retard";

  const dueLabel =
    invoice.status === "Payée"
      ? `Payée le ${formatDate(invoice.paidAt ?? invoice.dueDate)}`
      : invoice.status === "Brouillon"
      ? "Pas encore envoyée"
      : days < 0
      ? `En retard de ${Math.abs(days)} jour${Math.abs(days) > 1 ? "s" : ""}`
      : days === 0
      ? "Échéance aujourd'hui"
      : `Échéance dans ${days} jour${days > 1 ? "s" : ""}`;

  const duplicate = async () => {
    try {
      const copy = await duplicateInvoice(invoice.id);
      toast(`Copie ${copy.number} créée en brouillon`, "info");
      router.push(`/factures/nouvelle?edit=${copy.id}`);
    } catch {
      /* erreur déjà signalée */
    }
  };

  return (
    <div className="space-y-6">
      <Link href="/factures" className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-ink transition-colors group">
        <ArrowLeft size={16} aria-hidden="true" className="transition-transform group-hover:-translate-x-0.5" />
        Retour aux factures
      </Link>

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 animate-fade-up opacity-0">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-mono font-bold text-3xl md:text-4xl text-ink tracking-tight">{invoice.number}</h1>
            <StatusBadge status={invoice.status} />
          </div>
          <p className="text-sm text-muted mt-1">
            {client?.name ?? "Client supprimé"} · émise le {formatDate(invoice.date)} · {dueLabel}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {canEdit && (
            <Link href={`/factures/nouvelle?edit=${invoice.id}`} tabIndex={-1}>
              <Button variant="secondary">
                <Pencil size={16} aria-hidden="true" /> Modifier
              </Button>
            </Link>
          )}
          <Button variant="secondary" onClick={duplicate}>
            <Copy size={16} aria-hidden="true" /> Dupliquer
          </Button>
          {invoice.status !== "Payée" && invoice.status !== "Brouillon" && (
            <Button
              onClick={() => {
                setPayMethod(invoice.acceptedMethods[0] ?? "Orange Money");
                setPayOpen(true);
              }}
            >
              <CheckCircle2 size={18} aria-hidden="true" /> Marquer payée
            </Button>
          )}
          {invoice.status === "Brouillon" && (
            <Link href={`/factures/nouvelle?edit=${invoice.id}`} tabIndex={-1}>
              <Button>Finaliser et envoyer</Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <Card className="xl:col-span-2 animate-fade-up opacity-0" style={{ animationDelay: "0.1s" }}>
          <div className="overflow-x-auto">
            <div className="min-w-[640px]">
              <InvoicePreview data={invoice} client={client} settings={settings} />
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6 animate-fade-up opacity-0" style={{ animationDelay: "0.15s" }}>
            <CardHeader title="Montant" />
            <p className="font-mono font-bold text-3xl text-ink tracking-tight mt-4">{formatFCFA(invoice.amount)}</p>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Échéance</dt>
                <dd className="font-mono text-ink">{formatDate(invoice.dueDate)}</dd>
              </div>
              {invoice.paymentMethod && invoice.status === "Payée" && (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Encaissé via</dt>
                  <dd className="font-medium text-ink">{invoice.paymentMethod}</dd>
                </div>
              )}
              {invoice.lastReminderAt && (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Dernière relance</dt>
                  <dd className="font-mono text-ink">{formatDate(invoice.lastReminderAt)}</dd>
                </div>
              )}
            </dl>
            {canRemind && (
              <Button
                variant="secondary"
                className="w-full mt-6"
                onClick={async () => {
                  try {
                    await sendReminder(invoice.id);
                    toast(`Relance envoyée à ${client?.name ?? "votre client"}`, "success");
                  } catch {}
                }}
              >
                <BellRing size={16} aria-hidden="true" /> Envoyer une relance
              </Button>
            )}
          </Card>

          {client && (
            <Card className="p-6 animate-fade-up opacity-0" style={{ animationDelay: "0.2s" }}>
              <CardHeader
                title="Client"
                action={
                  <Link href={`/clients/${client.id}`} className="group text-sm font-medium text-accent inline-flex items-center gap-1">
                    <span className="link-underline">Fiche</span>
                    <ArrowUpRight size={14} aria-hidden="true" />
                  </Link>
                }
              />
              <div className="flex items-center gap-3 mt-4">
                <ClientLogo name={client.name} className="w-10 h-10 shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold text-ink truncate">{client.name}</p>
                  <p className="text-xs text-muted truncate">{client.contactName || client.city}</p>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                {client.email && (
                  <p className="flex items-center gap-2 text-muted min-w-0">
                    <Mail size={16} aria-hidden="true" className="shrink-0" />
                    <span className="truncate select-all">{client.email}</span>
                  </p>
                )}
                {client.phone && (
                  <p className="flex items-center gap-2 text-muted">
                    <Phone size={16} aria-hidden="true" className="shrink-0" />
                    <span className="font-mono select-all">{client.phone}</span>
                  </p>
                )}
              </div>
            </Card>
          )}

          <Card className="p-6 animate-fade-up opacity-0" style={{ animationDelay: "0.25s" }}>
            <CardHeader title="Zone sensible" description="La suppression est définitive." />
            <Button variant="ghost" className="w-full mt-4 text-danger hover:bg-danger-soft" onClick={() => setDeleteOpen(true)}>
              <Trash2 size={16} aria-hidden="true" /> Supprimer la facture
            </Button>
          </Card>
        </div>
      </div>

      <Modal isOpen={payOpen} onClose={() => setPayOpen(false)} title="Enregistrer le paiement">
        <p className="text-sm text-muted mb-4">
          <span className="font-mono text-ink">{invoice.number}</span> · {formatFCFA(invoice.amount)}
        </p>
        <Select id="pay-method" label="Encaissé via" value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
          {(invoice.acceptedMethods.length ? invoice.acceptedMethods : ["Espèces"]).map((m) => (
            <option key={m}>{m}</option>
          ))}
        </Select>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="ghost" onClick={() => setPayOpen(false)}>
            Annuler
          </Button>
          <Button
            onClick={async () => {
              try {
                await markInvoicePaid(invoice.id, payMethod);
                setPayOpen(false);
                toast(`${invoice.number} marquée comme payée`, "success");
              } catch {}
            }}
          >
            <CheckCircle2 size={18} aria-hidden="true" /> Confirmer le paiement
          </Button>
        </div>
      </Modal>

      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Supprimer la facture">
        <p className="text-sm text-muted mb-6">
          La facture <span className="font-mono text-ink">{invoice.number}</span> sera définitivement supprimée. Cette action est irréversible.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
            Annuler
          </Button>
          <Button
            variant="danger"
            onClick={async () => {
              try {
                await deleteInvoice(invoice.id);
                toast(`Facture ${invoice.number} supprimée`, "success");
                router.push("/factures");
              } catch {
                setDeleteOpen(false);
              }
            }}
          >
            Supprimer
          </Button>
        </div>
      </Modal>
    </div>
  );
}
