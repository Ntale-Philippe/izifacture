import React from "react";
import { Check } from "lucide-react";

/**
 * Mise en page des pages d'accès (connexion, inscription…) :
 * marque à gauche (60 %, masquée sur mobile), formulaire à droite (40 %).
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh grid lg:grid-cols-5 bg-bg">
      <aside className="hidden lg:flex lg:col-span-3 relative overflow-hidden bg-ink text-white p-12 flex-col justify-between">
        <div className="absolute inset-0 kente-pattern-light" aria-hidden="true" />
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-accent/30 blur-3xl" aria-hidden="true" />
        <div className="absolute -left-24 bottom-0 w-80 h-80 rounded-full bg-accent/10 blur-3xl" aria-hidden="true" />

        <div className="relative flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-accent text-white flex items-center justify-center font-display font-bold text-lg shadow-warm-md">iz</div>
          <span className="font-display font-bold text-xl tracking-tight">Izifacture</span>
        </div>

        <div className="relative max-w-xl">
          <p className="font-display font-bold text-4xl xl:text-5xl tracking-tight leading-tight text-balance">
            Facturez en FCFA, <span className="text-accent-light">encaissez par Mobile Money.</span>
          </p>
          <ul className="mt-8 space-y-3 text-white/80">
            {[
              "Factures conformes : NINU, RCCM, TVA UEMOA",
              "Orange Money, MTN MoMo, Wave et virement sur chaque facture",
              "Relances et suivi des retards en un coup d'œil",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3">
                <span className="mt-0.5 w-5 h-5 rounded-full bg-accent/20 text-accent-light flex items-center justify-center shrink-0">
                  <Check size={14} aria-hidden="true" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <figure className="relative max-w-md rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur-sm">
          <blockquote className="text-white/90">
            « Mes clients paient deux fois plus vite depuis que mes factures affichent directement mon numéro Wave. »
          </blockquote>
          <figcaption className="mt-4 text-sm text-white/60">Awa S., e-commerce à Dakar</figcaption>
        </figure>
      </aside>

      <main className="lg:col-span-2 flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
