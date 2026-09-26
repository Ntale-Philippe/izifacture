"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Building2, UserPlus, FilePlus2, Sparkles, Check } from "lucide-react";
import clsx from "clsx";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useAppData } from "@/lib/store";

/** Premiers pas d'un compte vide : 3 étapes réelles + chargement de la démonstration. */
export function Onboarding() {
  const { settings, clients, loadDemo } = useAppData();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const steps = [
    { done: !!settings.company.name, icon: Building2, title: "Renseignez votre entreprise", text: "Raison sociale, NINU, RCCM et numéros Mobile Money apparaîtront sur vos factures.", href: "/parametres", cta: "Ouvrir les paramètres" },
    { done: clients.length > 0, icon: UserPlus, title: "Ajoutez un client", text: "Ses coordonnées seront préremplies sur chaque facture.", href: "/clients", cta: "Ajouter un client" },
    { done: false, icon: FilePlus2, title: "Envoyez votre première facture", text: "Totaux, TVA et aperçu se calculent pendant que vous tapez.", href: "/factures/nouvelle", cta: "Créer une facture" },
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <Card className="xl:col-span-2 p-6 animate-fade-up opacity-0" style={{ animationDelay: "0.1s" }}>
        <CardHeader title="Bien démarrer" description="Trois étapes pour envoyer votre première facture." />
        <ol className="mt-6 space-y-4">
          {steps.map(({ done, icon: Icon, title, text, href, cta }, i) => (
            <li key={title} className={clsx("flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border", done ? "border-success/30 bg-success-soft/40" : "border-line")}>
              <div className={clsx("w-11 h-11 rounded-full flex items-center justify-center shrink-0", done ? "bg-success text-white" : "bg-accent/10 text-accent")}>
                {done ? <Check size={20} aria-hidden="true" /> : <Icon size={20} aria-hidden="true" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-ink">
                  <span className="font-mono text-muted mr-2">{i + 1}.</span>
                  {title}
                </p>
                <p className="text-sm text-muted">{text}</p>
              </div>
              {!done && (
                <Link href={href} tabIndex={-1} className="shrink-0">
                  <Button size="sm" variant={i === steps.findIndex((s) => !s.done) ? "primary" : "secondary"}>
                    {cta}
                  </Button>
                </Link>
              )}
            </li>
          ))}
        </ol>
      </Card>

      <Card className="p-6 flex flex-col animate-fade-up opacity-0" style={{ animationDelay: "0.15s" }}>
        <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center">
          <Sparkles size={24} aria-hidden="true" />
        </div>
        <h3 className="font-display font-bold text-ink mt-4">Explorer avec des exemples</h3>
        <p className="text-sm text-muted mt-1">
          Chargez 8 clients et 28 factures fictives pour voir le tableau de bord en action. Vous pourrez tout effacer depuis les Paramètres.
        </p>
        <Button
          variant="secondary"
          className="mt-6 w-full"
          isLoading={loading}
          onClick={async () => {
            setLoading(true);
            try {
              await loadDemo();
              toast("Données de démonstration chargées", "success");
            } catch {
              /* erreur déjà signalée */
            } finally {
              setLoading(false);
            }
          }}
        >
          <Sparkles size={16} aria-hidden="true" /> Charger la démonstration
        </Button>
      </Card>
    </div>
  );
}
