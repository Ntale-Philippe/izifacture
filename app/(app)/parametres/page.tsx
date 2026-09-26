"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Building2, FileText, Wallet, UserRound, Database, Sparkles, Trash2, Save, ArrowUpRight, LogOut } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { Skeleton } from "@/components/ui/Skeleton";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useAppData } from "@/lib/store";
import { countries, paymentMethods, taxRates, type Settings } from "@/lib/data";
import { formatInvoiceNumber } from "@/lib/invoice";

const sections = [
  { id: "profil", label: "Profil", icon: UserRound },
  { id: "entreprise", label: "Entreprise", icon: Building2 },
  { id: "facturation", label: "Facturation", icon: FileText },
  { id: "paiement", label: "Moyens de paiement", icon: Wallet },
  { id: "donnees", label: "Données", icon: Database },
];

// Champ de coordonnées associé à chaque moyen de paiement (Espèces n'en a pas).
const methodField: Record<string, { key: keyof Settings["payments"]; label: string; placeholder: string } | undefined> = {
  "Orange Money": { key: "orangeMoney", label: "Numéro Orange Money", placeholder: "+225 07 00 00 00 00" },
  "MTN MoMo": { key: "mtnMomo", label: "Numéro MTN MoMo", placeholder: "+225 05 00 00 00 00" },
  Wave: { key: "wave", label: "Numéro Wave", placeholder: "+225 07 00 00 00 00" },
  "Virement Bancaire": { key: "iban", label: "IBAN", placeholder: "CI93 CI00 0101 0000 1234 5678 901" },
};

export default function ParametresPage() {
  const { toast } = useToast();
  const { hydrated, email, settings, updateSettings, loadDemo, resetData, signOut } = useAppData();
  const [form, setForm] = useState<Settings>(settings);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dataAction, setDataAction] = useState<"demo" | "reset" | null>(null);
  const [dataBusy, setDataBusy] = useState(false);
  const [saving, setSaving] = useState(false);

  // Resynchronise le formulaire quand les données du navigateur arrivent ou après réinitialisation.
  useEffect(() => setForm(settings), [settings]);

  if (!hydrated) {
    return (
      <div className="space-y-6">
        <Skeleton className="w-56 h-10 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Skeleton className="hidden lg:block lg:col-span-3 h-64 rounded-2xl" />
          <div className="lg:col-span-9 space-y-6">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}
          </div>
        </div>
      </div>
    );
  }

  const dirty = JSON.stringify(form) !== JSON.stringify(settings);

  function set<S extends keyof Settings>(section: S, key: keyof Settings[S], value: Settings[S][keyof Settings[S]]) {
    setForm((f) => ({ ...f, [section]: { ...f[section], [key]: value } }));
    const errKey = `${String(section)}.${String(key)}`;
    if (errors[errKey]) setErrors(({ [errKey]: _, ...rest }) => rest);
  }

  const toggleMethod = (m: string, on: boolean) => {
    const list = on ? [...form.payments.enabledMethods, m] : form.payments.enabledMethods.filter((x) => x !== m);
    set("payments", "enabledMethods", paymentMethods.filter((x) => list.includes(x)));
    if (errors["payments.enabledMethods"]) setErrors(({ ["payments.enabledMethods"]: _, ...rest }) => rest);
  };

  const save = () => {
    const next: Record<string, string> = {};
    if (!form.user.firstName.trim()) next["user.firstName"] = "Prénom requis";
    if (!form.company.name.trim()) next["company.name"] = "Raison sociale requise";
    if (form.company.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.company.email)) next["company.email"] = "Adresse e-mail invalide";
    if (!/^[A-Za-z0-9]{1,6}$/.test(form.invoicing.prefix)) next["invoicing.prefix"] = "1 à 6 lettres ou chiffres";
    if (!Number.isInteger(form.invoicing.nextNumber) || form.invoicing.nextNumber < 1) next["invoicing.nextNumber"] = "Nombre entier supérieur à 0";
    if (form.payments.enabledMethods.length === 0) next["payments.enabledMethods"] = "Activez au moins un moyen de paiement";
    form.payments.enabledMethods.forEach((m) => {
      const f = methodField[m];
      if (f && !String(form.payments[f.key]).trim()) next[`payments.${f.key}`] = `${f.label} requis pour proposer ${m}`;
    });
    if (Object.keys(next).length) {
      setErrors(next);
      toast("Veuillez corriger les champs signalés", "error");
      return;
    }
    setSaving(true);
    updateSettings({ ...form, invoicing: { ...form.invoicing, prefix: form.invoicing.prefix.toUpperCase() } })
      .then(() => toast("Paramètres enregistrés", "success"))
      .catch(() => undefined) // erreur déjà signalée par le store
      .finally(() => setSaving(false));
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Paramètres" description="Ces informations apparaissent sur vos factures et servent de valeurs par défaut." />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Navigation de sections (≥ lg) */}
        <nav aria-label="Sections des paramètres" className="hidden lg:block lg:col-span-3 lg:sticky lg:top-6 animate-fade-up opacity-0" style={{ animationDelay: "0.1s" }}>
          <Card className="p-2">
            {sections.map(({ id, label, icon: Icon }) => (
              <a key={id} href={`#${id}`} className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted hover:text-ink hover:bg-hover transition-colors">
                <Icon size={18} aria-hidden="true" className="transition-transform group-hover:scale-110" />
                {label}
              </a>
            ))}
          </Card>
        </nav>

        <div className="lg:col-span-9 space-y-6">
          <Card id="profil" className="p-6 scroll-mt-6 animate-fade-up opacity-0" style={{ animationDelay: "0.1s" }}>
            <CardHeader
              title="Profil"
              description={<>Connecté avec <span className="font-mono text-ink">{email}</span></>}
              action={
                <Button variant="ghost" size="sm" onClick={signOut}>
                  <LogOut size={16} aria-hidden="true" /> Se déconnecter
                </Button>
              }
            />
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input id="set-firstname" label="Prénom" value={form.user.firstName} error={errors["user.firstName"]} onChange={(e) => set("user", "firstName", e.target.value)} />
              <Input id="set-lastname" label="Nom" value={form.user.lastName} onChange={(e) => set("user", "lastName", e.target.value)} />
            </div>
          </Card>

          <Card id="entreprise" className="p-6 scroll-mt-6 animate-fade-up opacity-0" style={{ animationDelay: "0.15s" }}>
            <CardHeader title="Entreprise" description="L'émetteur de vos factures." />
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input id="set-company" label="Raison sociale" value={form.company.name} error={errors["company.name"]} onChange={(e) => set("company", "name", e.target.value)} />
              </div>
              <Input id="set-ninu" label="NINU" className="font-mono" value={form.company.ninu} onChange={(e) => set("company", "ninu", e.target.value)} />
              <Input id="set-rccm" label="RCCM" className="font-mono" value={form.company.rccm} onChange={(e) => set("company", "rccm", e.target.value)} />
              <div className="md:col-span-2">
                <Input id="set-address" label="Adresse" value={form.company.address} onChange={(e) => set("company", "address", e.target.value)} />
              </div>
              <Input id="set-city" label="Ville" value={form.company.city} onChange={(e) => set("company", "city", e.target.value)} />
              <Select id="set-country" label="Pays" value={form.company.country} onChange={(e) => set("company", "country", e.target.value)}>
                {countries.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
              <Input id="set-phone" type="tel" label="Téléphone" value={form.company.phone} onChange={(e) => set("company", "phone", e.target.value)} />
              <Input id="set-email" type="email" label="E-mail de facturation" value={form.company.email} error={errors["company.email"]} onChange={(e) => set("company", "email", e.target.value)} />
            </div>
          </Card>

          <Card id="facturation" className="p-6 scroll-mt-6 animate-fade-up opacity-0" style={{ animationDelay: "0.2s" }}>
            <CardHeader
              title="Facturation"
              description="Numérotation et valeurs proposées à chaque nouvelle facture."
              action={
                <span className="text-xs text-muted">
                  Prochaine : <span className="font-mono font-bold text-ink">{formatInvoiceNumber((form.invoicing.prefix || "INV").toUpperCase(), form.invoicing.nextNumber || 1)}</span>
                </span>
              }
            />
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input id="set-prefix" label="Préfixe" className="font-mono uppercase" maxLength={6} value={form.invoicing.prefix} error={errors["invoicing.prefix"]} onChange={(e) => set("invoicing", "prefix", e.target.value)} />
              <Input
                id="set-next"
                label="Prochain numéro"
                type="number"
                min="1"
                className="font-mono"
                value={form.invoicing.nextNumber}
                error={errors["invoicing.nextNumber"]}
                onChange={(e) => set("invoicing", "nextNumber", parseInt(e.target.value) || 0)}
              />
              <Select id="set-due" label="Délai de paiement par défaut" value={form.invoicing.defaultDueDays} onChange={(e) => set("invoicing", "defaultDueDays", parseInt(e.target.value))}>
                {[0, 7, 15, 30, 45, 60].map((d) => (
                  <option key={d} value={d}>
                    {d === 0 ? "À réception" : `${d} jours`}
                  </option>
                ))}
              </Select>
              <Select id="set-tax" label="TVA par défaut" value={form.invoicing.defaultTaxRate} onChange={(e) => set("invoicing", "defaultTaxRate", parseFloat(e.target.value))}>
                {taxRates.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
              <div className="md:col-span-2">
                <Textarea id="set-notes" label="Notes par défaut" value={form.invoicing.defaultNotes} onChange={(e) => set("invoicing", "defaultNotes", e.target.value)} />
              </div>
            </div>
          </Card>

          <Card id="paiement" className="p-6 scroll-mt-6 animate-fade-up opacity-0" style={{ animationDelay: "0.25s" }}>
            <CardHeader title="Moyens de paiement" description="Activés par défaut sur les nouvelles factures, avec les coordonnées affichées au client." />
            <div className="mt-4 space-y-3">
              {paymentMethods.map((m) => {
                const on = form.payments.enabledMethods.includes(m);
                const field = methodField[m];
                return (
                  <div key={m} className="space-y-2">
                    <Switch label={m} description={on ? "Proposé par défaut" : "Non proposé"} checked={on} onChange={(v) => toggleMethod(m, v)} />
                    {on && field && (
                      <div className="pl-3 md:pl-4 border-l-2 border-accent/20 ml-3">
                        <Input
                          id={`set-${field.key}`}
                          label={field.label}
                          className="font-mono"
                          placeholder={field.placeholder}
                          value={String(form.payments[field.key])}
                          error={errors[`payments.${field.key}`]}
                          onChange={(e) => set("payments", field.key, e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
              {errors["payments.enabledMethods"] && <p className="text-xs text-danger font-medium">{errors["payments.enabledMethods"]}</p>}
            </div>
          </Card>

          <Card id="donnees" className="p-6 scroll-mt-6 animate-fade-up opacity-0" style={{ animationDelay: "0.3s" }}>
            <CardHeader title="Données" description="Vos factures, clients et paramètres sont enregistrés dans votre compte, en ligne." />
            <div className="mt-4 flex flex-col sm:flex-row flex-wrap gap-3">
              <Link href="/design-system" className="group inline-flex items-center gap-1 text-sm font-medium text-accent sm:mr-auto self-center">
                <span className="link-underline">Voir le design system</span>
                <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
              <Button variant="secondary" onClick={() => setDataAction("demo")}>
                <Sparkles size={16} aria-hidden="true" /> Charger la démonstration
              </Button>
              <Button variant="ghost" className="text-danger hover:bg-danger-soft" onClick={() => setDataAction("reset")}>
                <Trash2 size={16} aria-hidden="true" /> Tout effacer
              </Button>
            </div>
          </Card>

          {/* Barre d'enregistrement : visible dès qu'une modification est en attente */}
          <div
            className={clsx(
              "sticky bottom-24 md:bottom-6 z-20 bg-card/85 backdrop-blur-xl border border-line p-4 rounded-2xl shadow-warm-lg flex items-center justify-between gap-4 transition-all duration-300",
              dirty ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
            )}
            aria-hidden={!dirty}
          >
            <span className="text-sm text-muted">Modifications non enregistrées</span>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => { setForm(settings); setErrors({}); }} tabIndex={dirty ? 0 : -1}>
                Annuler
              </Button>
              <Button onClick={save} isLoading={saving} tabIndex={dirty ? 0 : -1}>
                <Save size={16} aria-hidden="true" /> Enregistrer
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={!!dataAction}
        onClose={() => !dataBusy && setDataAction(null)}
        title={dataAction === "demo" ? "Charger la démonstration" : "Tout effacer"}
      >
        <p className="text-sm text-muted mb-6">
          {dataAction === "demo"
            ? "Vos factures et clients actuels seront remplacés par 8 clients et 28 factures d'exemple. Vos paramètres d'entreprise sont conservés."
            : "Toutes vos factures et tous vos clients seront définitivement supprimés. Vos paramètres d'entreprise sont conservés."}{" "}
          Cette action est irréversible.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" disabled={dataBusy} onClick={() => setDataAction(null)}>
            Annuler
          </Button>
          <Button
            variant={dataAction === "demo" ? "primary" : "danger"}
            isLoading={dataBusy}
            onClick={async () => {
              setDataBusy(true);
              try {
                if (dataAction === "demo") {
                  await loadDemo();
                  toast("Données de démonstration chargées", "success");
                } else {
                  await resetData();
                  toast("Factures et clients effacés", "success");
                }
                setDataAction(null);
                setErrors({});
              } catch {
                /* erreur déjà signalée */
              } finally {
                setDataBusy(false);
              }
            }}
          >
            {dataAction === "demo" ? "Charger" : "Tout effacer"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
