"use client";

import React, { useState } from "react";
import { colors, shadows, radius, channelColors, clientPalette } from "@/lib/tokens";
import { statusOrder } from "@/lib/status";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TrendBadge } from "@/components/ui/TrendBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ClientLogo } from "@/components/ui/ClientLogo";
import { CountUp } from "@/components/ui/CountUp";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { StatCard } from "@/components/dashboard/StatCard";
import { Switch } from "@/components/ui/Switch";
import { Plus, Send, Trash2, Wallet, FileText, Copy } from "lucide-react";

/** Catalogue vivant du design system. Toute nouveauté de components/ui doit apparaître ici. */

function Section({ id, title, rule, children, delay }: { id: string; title: string; rule: string; children: React.ReactNode; delay: number }) {
  return (
    <section id={id} className="space-y-4 animate-fade-up opacity-0 scroll-mt-24" style={{ animationDelay: `${delay}s` }}>
      <div className="flex items-baseline justify-between gap-4 border-b border-line pb-2">
        <h2 className="font-display font-bold text-xl text-ink">{title}</h2>
        <span className="text-xs font-mono text-muted shrink-0">DESIGN_SYSTEM.md {rule}</span>
      </div>
      {children}
    </section>
  );
}

function Swatch({ name, hex, cls }: { name: string; hex: string; cls: string }) {
  return (
    <div className="flex items-center gap-3 min-w-0">
      <span className="w-10 h-10 rounded-xl border border-line shrink-0" style={{ backgroundColor: hex }} />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-ink truncate">{cls}</p>
        <p className="text-xs font-mono text-muted">{hex}</p>
      </div>
      <span className="sr-only">{name}</span>
    </div>
  );
}

const typeScale = [
  { label: "Titre de page (H1)", cls: "font-display font-bold text-3xl md:text-4xl tracking-tight", sample: "Nouvelle facture" },
  { label: "Titre de carte (H3)", cls: "font-display font-bold text-base", sample: "Répartition par statut" },
  { label: "Chiffre héros", cls: "font-mono font-bold text-5xl tracking-tight", sample: "55%" },
  { label: "Valeur de stat", cls: "font-mono font-bold text-2xl tracking-tight", sample: "11 400 000" },
  { label: "Corps", cls: "text-sm text-ink", sample: "Créez et envoyez vos factures en quelques secondes." },
  { label: "Description", cls: "text-sm text-muted", sample: "Part du montant émis déjà encaissée." },
  { label: "En-tête de colonne", cls: "text-xs font-medium uppercase tracking-wider text-muted", sample: "Montant" },
  { label: "Méta (minimum 12px)", cls: "text-xs text-muted", sample: "contact@kouadio.ci" },
];

export default function DesignSystemPage() {
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoValue, setDemoValue] = useState(1_250_000);
  const [switchOn, setSwitchOn] = useState(true);

  const surfaceTokens = ["bg", "card", "hover", "line", "ink", "muted"] as const;
  const semanticTokens = ["accent", "success", "warning", "danger"] as const;

  return (
    <div className="space-y-12">
      <PageHeader
        title="Design system"
        description={
          <>
            Afrique Premium : la référence vivante des tokens et composants d&apos;Izifacture. Les règles complètes sont dans{" "}
            <span className="font-mono text-ink">DESIGN_SYSTEM.md</span>, les valeurs dans <span className="font-mono text-ink">lib/tokens.ts</span>.
          </>
        }
      />

      <Section id="couleurs" title="Couleurs" rule="§2" delay={0.1}>
        <Card className="p-6 space-y-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted mb-3">Surfaces et texte</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {surfaceTokens.flatMap((t) => [
                <Swatch key={t} name={t} hex={colors[t].DEFAULT} cls={t} />,
                <Swatch key={t + "-soft"} name={t + " soft"} hex={colors[t].soft} cls={`${t}-soft`} />,
              ])}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted mb-3">Accent et sémantique</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {semanticTokens.flatMap((t) => [
                <Swatch key={t} name={t} hex={colors[t].DEFAULT} cls={t} />,
                <Swatch key={t + "-soft"} name={t + " soft"} hex={colors[t].soft} cls={`${t}-soft`} />,
              ])}
              <Swatch name="accent light" hex={colors.accent.light} cls="accent-light (texte sur ink)" />
              <Swatch name="accent warm" hex={colors.accent.warm} cls="accent-warm (fin de jauge)" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted mb-3">Canaux (graphiques uniquement)</p>
              <div className="flex flex-wrap gap-3">
                {Object.entries(channelColors).map(([name, hex]) => (
                  <span key={name} className="inline-flex items-center gap-2 text-sm text-ink">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: hex }} />
                    {name}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted mb-3">Palette client (ClientLogo uniquement)</p>
              <div className="flex flex-wrap gap-2">
                {clientPalette.map((hex) => (
                  <span key={hex} className="w-8 h-8 rounded-lg" style={{ backgroundColor: hex }} title={hex} />
                ))}
              </div>
            </div>
          </div>
        </Card>
      </Section>

      <Section id="typographie" title="Typographie" rule="§3" delay={0.15}>
        <Card className="divide-y divide-line">
          {typeScale.map((t) => (
            <div key={t.label} className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-6 px-6 py-4 items-baseline">
              <div>
                <p className="text-sm font-medium text-ink">{t.label}</p>
                <p className="text-xs font-mono text-muted break-words">{t.cls}</p>
              </div>
              <p className={`${t.cls} md:col-span-2 min-w-0 break-words`}>{t.sample}</p>
            </div>
          ))}
        </Card>
      </Section>

      <Section id="forme" title="Rayons et élévation" rule="§5 · §6" delay={0.2}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <CardHeader title="Rayons" description="Conteneur 16 · contrôle 12 · petit élément 8 · pastille ∞" />
            <div className="flex flex-wrap items-end gap-4 mt-6">
              {[
                ["rounded-lg", radius.lg, "rounded-lg"],
                ["rounded-xl", radius.xl, "rounded-xl"],
                ["rounded-2xl", radius["2xl"], "rounded-2xl"],
                ["rounded-full", "∞", "rounded-full"],
              ].map(([label, value, cls]) => (
                <div key={label} className="flex flex-col items-center gap-2">
                  <span className={`w-16 h-16 bg-accent/10 border border-accent/30 ${cls}`} />
                  <span className="text-xs font-mono text-muted">{label}</span>
                  <span className="text-xs font-mono text-ink">{value}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-6">
            <CardHeader title="Élévation" description="Ombres teintées orange, 3 niveaux uniquement." />
            <div className="grid grid-cols-3 gap-4 mt-6">
              {(Object.keys(shadows) as (keyof typeof shadows)[]).map((s) => (
                <div key={s} className={`h-20 rounded-2xl bg-card border border-line flex items-center justify-center shadow-${s}`}>
                  <span className="text-xs font-mono text-muted">{s}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </Section>

      <Section id="boutons" title="Boutons" rule="§11" delay={0.25}>
        <Card className="p-6 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <Button><Plus size={18} aria-hidden="true" /> Primaire</Button>
            <Button variant="secondary">Secondaire</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger"><Trash2 size={18} aria-hidden="true" /> Supprimer</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Petit</Button>
            <Button size="md">Moyen</Button>
            <Button size="lg">Grand</Button>
            <Button disabled>Désactivé</Button>
            <Button
              isLoading={loading}
              onClick={() => {
                setLoading(true);
                setTimeout(() => setLoading(false), 1500);
              }}
            >
              <Send size={16} aria-hidden="true" /> Chargement
            </Button>
          </div>
          <p className="text-xs text-muted">Un seul bouton primaire par zone visible. Survol : scale 1.02 ; pression : 0.98.</p>
        </Card>
      </Section>

      <Section id="champs" title="Champs de formulaire" rule="§9.4" delay={0.3}>
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input id="ds-input" label="Raison sociale" placeholder="Ex. Studio Diallo SARL" />
            <Input id="ds-input-error" label="Échéance" type="date" error="Date d'échéance requise" />
            <Select id="ds-select" label="Client" defaultValue="">
              <option value="">Sélectionner un client...</option>
              <option>Kouadio & Frères</option>
            </Select>
            <Input id="ds-input-disabled" label="NINU" value="1234567890" disabled readOnly />
            <div className="md:col-span-2">
              <Textarea id="ds-textarea" label="Notes client" placeholder="Merci pour votre confiance..." />
            </div>
            <Switch label="Orange Money" description="+225 07 00 11 22 33" checked={switchOn} onChange={setSwitchOn} />
            <Switch label="Espèces" description="Switch désactivé" checked={false} onChange={() => undefined} disabled />
          </div>
        </Card>
      </Section>

      <Section id="donnees" title="Statuts, tendances et données" rule="§2.3 · §10" delay={0.35}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <Card className="p-6">
            <CardHeader title="StatusBadge" description="La seule façon d'afficher un statut de facture." />
            <div className="flex flex-wrap gap-2 mt-6">
              {statusOrder.map((s) => <StatusBadge key={s} status={s} />)}
            </div>
          </Card>
          <Card className="p-6">
            <CardHeader title="TrendBadge" description="Flèche = sens · couleur = bon ou mauvais." />
            <div className="flex flex-wrap gap-2 mt-6">
              <TrendBadge value={12} />
              <TrendBadge value={-5} />
              <TrendBadge value={-5} goodWhenDown />
              <TrendBadge value={2} goodWhenDown />
              <TrendBadge value={6} unit=" pts" />
            </div>
          </Card>
          <Card className="p-6 md:col-span-2 xl:col-span-1">
            <CardHeader
              title="CountUp et formatFCFA"
              description="Tout montant, animé depuis sa valeur précédente."
              action={
                <Button size="sm" variant="secondary" onClick={() => setDemoValue(Math.round(Math.random() * 9_000_000))}>
                  Changer
                </Button>
              }
            />
            <p className="font-mono font-bold text-2xl text-ink tracking-tight mt-6">
              <CountUp value={demoValue} />
            </p>
            <div className="flex items-center gap-3 mt-4">
              {["Kouadio & Frères", "Ndiaye Tech", "Douala Logistics", "Sow E-commerce"].map((n) => (
                <ClientLogo key={n} name={n} className="w-8 h-8" />
              ))}
              <span className="text-xs text-muted">ClientLogo</span>
            </div>
          </Card>
        </div>
      </Section>

      <Section id="cartes" title="Cartes" rule="§11" delay={0.4}>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard title="Encaissé" value={11_400_000} trend={12} icon={Wallet} />
          <StatCard title="Factures émises" value={24} format={false} trend={8} icon={FileText} />
          <Card className="p-6">
            <CardHeader title="Card" description="Repos : shadow-warm-sm, rounded-2xl, p-6." />
          </Card>
          <Card hoverable className="p-6 cursor-pointer">
            <CardHeader title="Card hoverable" description="Survolez : lévitation + ombre." action={<Copy size={16} className="text-muted" aria-hidden="true" />} />
          </Card>
        </div>
      </Section>

      <Section id="etats" title="États et feedback" rule="§9" delay={0.45}>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card className="p-6 space-y-4">
            <CardHeader title="Skeleton" description="La forme exacte du contenu à venir." />
            <div className="flex items-center gap-4">
              <Skeleton className="w-10 h-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="w-3/4 h-4 rounded-full" />
                <Skeleton className="w-1/2 h-3 rounded-full" />
              </div>
              <Skeleton className="w-20 h-6 rounded-full" />
            </div>
          </Card>
          <Card className="p-6 space-y-4">
            <CardHeader title="Toast et Modal" description="Feedback après action · confirmation avant destruction." />
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={() => toast("Facture envoyée avec succès", "success")}>Toast succès</Button>
              <Button size="sm" variant="secondary" onClick={() => toast("Veuillez corriger les erreurs", "error")}>Toast erreur</Button>
              <Button size="sm" variant="secondary" onClick={() => toast("Facture dupliquée (Brouillon)", "info")}>Toast info</Button>
              <Button size="sm" variant="danger" onClick={() => setModalOpen(true)}>Ouvrir le modal</Button>
            </div>
          </Card>
          <Card className="p-6">
            <EmptyState
              title="Pas encore de factures"
              description="Créez votre première facture en quelques clics."
              action={<Button size="sm"><Plus size={16} aria-hidden="true" /> Nouvelle facture</Button>}
            />
          </Card>
        </div>
      </Section>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Supprimer la facture">
        <p className="text-sm text-muted mb-6">Êtes-vous sûr de vouloir supprimer cette facture ? Cette action est irréversible.</p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setModalOpen(false)}>Annuler</Button>
          <Button variant="danger" onClick={() => { setModalOpen(false); toast("Facture supprimée", "success"); }}>Supprimer</Button>
        </div>
      </Modal>
    </div>
  );
}
