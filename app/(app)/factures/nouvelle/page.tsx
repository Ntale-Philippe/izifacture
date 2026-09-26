"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Eye, Plus, Send, Trash2, UserPlus, Pencil } from "lucide-react";
import clsx from "clsx";
import { Card, CardHeader } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { CountUp } from "@/components/ui/CountUp";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { InvoicePreview } from "@/components/invoices/InvoicePreview";
import { ClientFormModal } from "@/components/clients/ClientFormModal";
import { useAppData } from "@/lib/store";
import { paymentMethods, taxRates, type InvoiceStatus, type LineItem } from "@/lib/data";
import { addDays, computeTotals, newId, paymentDetail, todayISO } from "@/lib/invoice";
import { formatDate, formatFCFA } from "@/lib/format";

const emptyItem = (): LineItem => ({ id: newId(), description: "", quantity: 1, price: 0 });

function FormSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="w-40 h-4 rounded-full" />
      <Skeleton className="w-72 h-10 rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          {[0, 1, 2].map((i) => (
            <Card key={i} className="p-6 space-y-4">
              <Skeleton className="w-32 h-5 rounded-full" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-11 rounded-xl" />
                <Skeleton className="h-11 rounded-xl" />
              </div>
            </Card>
          ))}
        </div>
        <Card className="lg:col-span-4 p-6 space-y-4 h-fit">
          <Skeleton className="w-24 h-5 rounded-full" />
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-4 rounded-full" />)}
          <Skeleton className="h-8 rounded-full" />
        </Card>
      </div>
    </div>
  );
}

function InvoiceForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { toast } = useToast();
  const { hydrated, settings, clients, getClient, getInvoice, nextInvoiceNumber, createInvoice, updateInvoice } = useAppData();

  const editId = params.get("edit");
  const editing = editId ? getInvoice(editId) : undefined;

  const [ready, setReady] = useState(false);
  const [clientId, setClientId] = useState("");
  const [date, setDate] = useState(todayISO());
  const [dueDate, setDueDate] = useState("");
  const [items, setItems] = useState<LineItem[]>([emptyItem()]);
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(18);
  const [acceptedMethods, setAcceptedMethods] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewOpen, setPreviewOpen] = useState(false);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState<InvoiceStatus | null>(null);

  // Initialisation une fois les données chargées : édition, client pré-choisi ou valeurs par défaut.
  useEffect(() => {
    if (!hydrated || ready) return;
    if (editing) {
      setClientId(editing.clientId);
      setDate(editing.date);
      setDueDate(editing.dueDate);
      setItems(editing.items.length ? editing.items : [emptyItem()]);
      setDiscount(editing.discount);
      setTaxRate(editing.taxRate);
      setAcceptedMethods(editing.acceptedMethods);
      setNotes(editing.notes);
    } else {
      const preset = params.get("client");
      if (preset && getClient(preset)) setClientId(preset);
      const today = todayISO();
      setDate(today);
      setDueDate(addDays(today, settings.invoicing.defaultDueDays));
      setTaxRate(settings.invoicing.defaultTaxRate);
      setAcceptedMethods(settings.payments.enabledMethods);
      setNotes(settings.invoicing.defaultNotes);
    }
    setReady(true);
  }, [hydrated, ready, editing, params, getClient, settings]);

  const client = getClient(clientId);
  const totals = computeTotals(items, discount, taxRate);
  const number = editing?.number ?? nextInvoiceNumber;
  const previewData = useMemo(
    () => ({ number, date, dueDate, items, discount, taxRate, notes, acceptedMethods }),
    [number, date, dueDate, items, discount, taxRate, notes, acceptedMethods]
  );

  if (!hydrated || !ready) return <FormSkeleton />;

  if (editId && !editing) {
    return (
      <Card className="p-6">
        <EmptyState
          title="Facture introuvable"
          description="Elle a peut-être été supprimée. Retrouvez vos factures dans la liste."
          action={<Link href="/factures" tabIndex={-1}><Button>Voir les factures</Button></Link>}
        />
      </Card>
    );
  }

  const clearError = (key: string) => {
    if (errors[key]) setErrors(({ [key]: _, ...rest }) => rest);
  };
  const updateItem = (id: string, patch: Partial<LineItem>) => setItems((list) => list.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  const removeItem = (id: string) => setItems((list) => (list.length > 1 ? list.filter((i) => i.id !== id) : list));
  const toggleMethod = (m: string, on: boolean) => setAcceptedMethods((list) => (on ? [...list, m] : list.filter((x) => x !== m)));

  const save = async (status: InvoiceStatus) => {
    const next: Record<string, string> = {};
    if (!clientId) next.client = "Sélectionnez un client";
    if (status !== "Brouillon") {
      if (!dueDate) next.dueDate = "Date d'échéance requise";
      else if (dueDate < date) next.dueDate = "L'échéance précède la date d'émission";
      items.forEach((i) => {
        if (!i.description.trim()) next[`desc-${i.id}`] = "Description requise";
        if (i.quantity < 1) next[`qty-${i.id}`] = "Min. 1";
        if (i.price <= 0) next[`price-${i.id}`] = "Prix requis";
      });
      if (acceptedMethods.length === 0) next.methods = "Activez au moins un moyen de paiement";
    }
    if (Object.keys(next).length) {
      setErrors(next);
      toast("Veuillez corriger les champs signalés", "error");
      return;
    }

    setSubmitting(status);
    const draft = {
      clientId,
      date,
      dueDate: dueDate || date,
      status,
      items: items.map((i) => ({ ...i, description: i.description.trim() })),
      discount,
      taxRate,
      notes: notes.trim(),
      acceptedMethods,
    };
    try {
      let id: string;
      let savedNumber = number;
      if (editing) {
        await updateInvoice(editing.id, { ...draft, paymentMethod: editing.paymentMethod, paidAt: editing.paidAt, lastReminderAt: editing.lastReminderAt });
        id = editing.id;
      } else {
        const created = await createInvoice(draft);
        id = created.id;
        savedNumber = created.number; // numéro définitif attribué par la base
      }
      toast(
        status === "Brouillon" ? `Brouillon ${savedNumber} enregistré` : `Facture ${savedNumber} envoyée à ${client?.name ?? "votre client"}`,
        "success"
      );
      router.push(`/factures/${id}`);
    } catch {
      setSubmitting(null); // le store a déjà affiché l'erreur
    }
  };

  return (
    <div className="space-y-6">
      <Link
        href={editing ? `/factures/${editing.id}` : "/factures"}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-ink transition-colors group"
      >
        <ArrowLeft size={16} aria-hidden="true" className="transition-transform group-hover:-translate-x-0.5" />
        {editing ? "Retour à la facture" : "Retour aux factures"}
      </Link>

      <PageHeader
        title={editing ? "Modifier la facture" : "Nouvelle facture"}
        description={
          <>
            <span className="font-mono text-ink">{number}</span> · les totaux et l&apos;aperçu se mettent à jour en direct.
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
          {/* Émetteur : lu depuis les Paramètres */}
          <Card className="p-6 animate-fade-up opacity-0" style={{ animationDelay: "0.1s" }}>
            <CardHeader
              title="Émetteur"
              description="Vos informations, reprises sur chaque facture."
              action={
                <Link href="/parametres" className="group text-sm font-medium text-accent inline-flex items-center gap-1">
                  <Pencil size={14} aria-hidden="true" />
                  <span className="link-underline">Modifier</span>
                </Link>
              }
            />
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted">Raison sociale</p>
                <p className="font-semibold text-ink">{settings.company.name || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted">NINU</p>
                <p className="font-mono text-ink">{settings.company.ninu || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted">RCCM</p>
                <p className="font-mono text-ink">{settings.company.rccm || "—"}</p>
              </div>
            </div>
          </Card>

          {/* Client et dates */}
          <Card className="p-6 animate-fade-up opacity-0" style={{ animationDelay: "0.15s" }}>
            <CardHeader title="Client et échéance" />
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Select
                  id="invoice-client"
                  label="Client"
                  value={clientId}
                  error={errors.client}
                  onChange={(e) => {
                    setClientId(e.target.value);
                    clearError("client");
                  }}
                >
                  <option value="">Sélectionner un client...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
                <button
                  type="button"
                  onClick={() => setClientModalOpen(true)}
                  className="group inline-flex items-center gap-1.5 text-sm font-medium text-accent"
                >
                  <UserPlus size={16} aria-hidden="true" />
                  <span className="link-underline">Nouveau client</span>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input id="invoice-date" label="Date d'émission" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                <Input
                  id="invoice-due"
                  label="Échéance"
                  type="date"
                  value={dueDate}
                  error={errors.dueDate}
                  onChange={(e) => {
                    setDueDate(e.target.value);
                    clearError("dueDate");
                  }}
                />
                <div className="col-span-2 flex flex-wrap items-center gap-2" role="group" aria-label="Échéance rapide">
                  <span className="text-xs text-muted">Échéance à</span>
                  {[0, 7, 15, 30].map((d) => {
                    const value = addDays(date, d);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => {
                          setDueDate(value);
                          clearError("dueDate");
                        }}
                        className={clsx(
                          "px-2.5 py-1 rounded-full text-xs font-mono font-medium border transition-colors",
                          dueDate === value ? "bg-accent/10 border-accent/40 text-accent" : "border-line text-muted hover:text-ink hover:bg-hover"
                        )}
                      >
                        {d === 0 ? "réception" : `${d} j`}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            {client && (
              <p className="mt-4 text-sm text-muted">
                {[client.contactName, client.email, client.phone].filter(Boolean).join(" · ")} ·{" "}
                <Link href={`/clients/${client.id}`} className="group text-accent font-medium">
                  <span className="link-underline">Voir la fiche</span>
                </Link>
              </p>
            )}
          </Card>

          {/* Articles */}
          <Card className="p-6 animate-fade-up opacity-0" style={{ animationDelay: "0.2s" }}>
            <CardHeader title="Articles" action={<span className="text-xs text-muted font-mono">{items.length} ligne{items.length > 1 ? "s" : ""}</span>} />
            <div className="hidden md:grid grid-cols-12 gap-4 pl-8 pr-14 pt-4 pb-2 text-xs font-medium text-muted">
              <span className="col-span-5">Description</span>
              <span className="col-span-2">Qté</span>
              <span className="col-span-3">Prix unitaire (FCFA)</span>
              <span className="col-span-2 text-right">Total HT</span>
            </div>
            <div className="mt-4 md:mt-0">
              <AnimatePresence initial={false}>
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div className="flex gap-3 md:gap-4 items-start pb-4">
                      <span className="hidden md:flex w-4 h-11 items-center font-mono text-xs text-muted shrink-0">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="flex-1 grid grid-cols-12 gap-3 md:gap-4">
                        <div className="col-span-12 md:col-span-5">
                          <Input
                            aria-label="Description"
                            placeholder="Ex. Conception du site vitrine"
                            value={item.description}
                            error={errors[`desc-${item.id}`]}
                            onChange={(e) => {
                              updateItem(item.id, { description: e.target.value });
                              clearError(`desc-${item.id}`);
                            }}
                          />
                        </div>
                        <div className="col-span-4 md:col-span-2">
                          <Input
                            aria-label="Quantité"
                            type="number"
                            min="1"
                            inputMode="numeric"
                            className="font-mono"
                            value={item.quantity}
                            error={errors[`qty-${item.id}`]}
                            onChange={(e) => {
                              updateItem(item.id, { quantity: parseInt(e.target.value) || 0 });
                              clearError(`qty-${item.id}`);
                            }}
                          />
                        </div>
                        <div className="col-span-8 md:col-span-3">
                          <Input
                            aria-label="Prix unitaire"
                            type="number"
                            min="0"
                            step="500"
                            inputMode="numeric"
                            className="font-mono"
                            placeholder="0"
                            value={item.price || ""}
                            error={errors[`price-${item.id}`]}
                            onChange={(e) => {
                              updateItem(item.id, { price: parseInt(e.target.value) || 0 });
                              clearError(`price-${item.id}`);
                            }}
                          />
                        </div>
                        <div className="col-span-12 md:col-span-2 flex md:h-11 items-center justify-end text-sm">
                          <span className="md:hidden text-xs text-muted mr-2">Total ligne :</span>
                          <span className="font-mono font-bold text-ink whitespace-nowrap">{formatFCFA(item.quantity * item.price)}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        disabled={items.length === 1}
                        aria-label="Supprimer la ligne"
                        className="p-2.5 text-muted hover:text-danger hover:bg-danger-soft rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 size={20} aria-hidden="true" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={() => setItems((l) => [...l, emptyItem()])}>
              <Plus size={16} aria-hidden="true" /> Ajouter une ligne
            </Button>
          </Card>

          {/* Conditions et paiement */}
          <Card className="p-6 animate-fade-up opacity-0" style={{ animationDelay: "0.25s" }}>
            <CardHeader title="Conditions et paiement" description="Valeurs par défaut réglables dans les Paramètres." />
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    id="invoice-discount"
                    label="Remise (%)"
                    type="number"
                    min="0"
                    max="100"
                    className="font-mono"
                    value={discount}
                    onChange={(e) => setDiscount(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                  />
                  <Select id="invoice-tax" label="TVA" value={taxRate} onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}>
                    {taxRates.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </Select>
                </div>
                <Textarea id="invoice-notes" label="Notes pour le client" placeholder="Merci pour votre confiance..." value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
              <div>
                <p className="text-sm font-medium text-ink mb-1.5">Moyens de paiement acceptés</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-2">
                  {paymentMethods.map((m) => (
                    <Switch
                      key={m}
                      label={m}
                      description={paymentDetail(m, settings) ?? (m === "Espèces" ? "Paiement en main propre" : "Coordonnées à renseigner dans Paramètres")}
                      checked={acceptedMethods.includes(m)}
                      onChange={(on) => {
                        toggleMethod(m, on);
                        clearError("methods");
                      }}
                    />
                  ))}
                </div>
                {errors.methods && <p className="text-xs text-danger font-medium mt-1.5">{errors.methods}</p>}
              </div>
            </div>
          </Card>
        </div>

        {/* Résumé + aperçu */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
          <Card className="p-6 animate-fade-up opacity-0" style={{ animationDelay: "0.2s" }}>
            <CardHeader title="Résumé" />
            <div className="mt-6 space-y-4 text-sm">
              <div className="flex justify-between text-muted">
                <span>Sous-total HT</span>
                <span className="font-mono">
                  <CountUp value={totals.subtotal} />
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-danger">
                  <span>Remise ({discount} %)</span>
                  <span className="font-mono">
                    −<CountUp value={totals.discountAmount} />
                  </span>
                </div>
              )}
              <div className="flex justify-between text-muted">
                <span>TVA ({taxRate} %)</span>
                <span className="font-mono">
                  <CountUp value={totals.taxAmount} />
                </span>
              </div>
              <div className="pt-4 border-t border-line flex justify-between items-center gap-4">
                <span className="font-bold text-lg">Total TTC</span>
                <span className="font-mono text-2xl font-bold text-accent tracking-tight text-right">
                  <CountUp value={totals.total} />
                </span>
              </div>
            </div>
          </Card>

          <Button variant="secondary" className="w-full lg:hidden" onClick={() => setPreviewOpen(true)}>
            <Eye size={18} aria-hidden="true" /> Aperçu de la facture
          </Button>

          {/* Miniature A4 : 800px réduits à 40 % (hauteur fixée car transform ne change pas la boîte). */}
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="hidden lg:block w-full text-left border border-line rounded-2xl overflow-hidden bg-card shadow-warm-sm hover:shadow-warm-md hover:-translate-y-0.5 transition-all duration-200 group"
          >
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-line text-xs font-medium text-muted">
              Aperçu en direct
              <span className="flex items-center gap-1 text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                <Eye size={14} aria-hidden="true" /> Agrandir
              </span>
            </div>
            <div className="relative h-[340px] overflow-hidden">
              <div className="absolute top-0 left-0 w-[800px] origin-top-left scale-[0.4] pointer-events-none">
                <InvoicePreview data={previewData} client={client} settings={settings} />
              </div>
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card to-transparent" />
            </div>
          </button>
        </div>
      </div>

      {/* Barre d'action collante */}
      <div className="sticky bottom-24 md:bottom-6 z-20 bg-card/85 backdrop-blur-xl border border-line p-4 rounded-2xl shadow-warm-lg flex items-center justify-between gap-4">
        <div className="hidden sm:flex flex-col min-w-0">
          <span className="font-mono font-bold text-ink">{number}</span>
          <span className="text-xs text-muted truncate">
            {client ? client.name : "Aucun client"} · échéance {dueDate ? formatDate(dueDate) : "non définie"}
          </span>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="sm:hidden font-mono font-bold text-accent mr-auto">{formatFCFA(totals.total)}</span>
          <Button variant="secondary" onClick={() => save("Brouillon")} disabled={!!submitting} isLoading={submitting === "Brouillon"}>
            {editing && editing.status !== "Brouillon" ? "Enregistrer" : "Brouillon"}
          </Button>
          <Button onClick={() => save("En attente")} disabled={!!submitting} isLoading={submitting === "En attente"}>
            <Send size={16} aria-hidden="true" /> Envoyer
          </Button>
        </div>
      </div>

      <Modal isOpen={previewOpen} onClose={() => setPreviewOpen(false)} title="Aperçu de la facture" className="max-w-3xl">
        <div className="overflow-x-auto">
          <div className="min-w-[640px]">
            <InvoicePreview data={previewData} client={client} settings={settings} />
          </div>
        </div>
      </Modal>

      <ClientFormModal
        isOpen={clientModalOpen}
        onClose={() => setClientModalOpen(false)}
        onSaved={(c) => {
          setClientId(c.id);
          clearError("client");
        }}
      />
    </div>
  );
}

export default function NouvelleFacturePage() {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <InvoiceForm />
    </Suspense>
  );
}
