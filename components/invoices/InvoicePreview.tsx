import React from "react";
import type { Client, LineItem, Settings } from "@/lib/data";
import { computeTotals, paymentDetail } from "@/lib/invoice";
import { formatDate, formatFCFA } from "@/lib/format";

export interface InvoicePreviewData {
  number: string;
  date: string;
  dueDate: string;
  items: LineItem[];
  discount: number;
  taxRate: number;
  notes: string;
  acceptedMethods: string[];
}

interface InvoicePreviewProps {
  data: InvoicePreviewData;
  client?: Client;
  settings: Settings;
}

/**
 * Document de facture (format A4, 800px de large de référence).
 * Utilisé par l'aperçu de création, la fiche facture et le modal plein écran.
 */
export function InvoicePreview({ data, client, settings }: InvoicePreviewProps) {
  const { subtotal, discountAmount, taxAmount, total } = computeTotals(data.items, data.discount, data.taxRate);
  const c = settings.company;

  return (
    <div className="bg-card p-8 font-sans text-ink">
      <div className="flex justify-between items-start gap-8 mb-10 border-b border-line pb-8">
        <div>
          <div className="w-12 h-12 rounded-xl bg-accent text-white flex items-center justify-center font-display font-bold text-2xl mb-4">
            iz
          </div>
          <h2 className="font-bold text-lg">{c.name || "Votre entreprise"}</h2>
          <p className="text-sm text-muted">{[c.address, c.city, c.country].filter(Boolean).join(", ")}</p>
          <p className="text-sm text-muted">{[c.phone, c.email].filter(Boolean).join(" · ")}</p>
          {(c.ninu || c.rccm) && (
            <p className="text-xs text-muted mt-1 font-mono">
              {c.ninu && `NINU ${c.ninu}`}
              {c.ninu && c.rccm && " · "}
              {c.rccm && `RCCM ${c.rccm}`}
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="text-4xl font-display font-bold text-accent mb-2 tracking-tight" aria-hidden="true">FACTURE</p>
          <p className="font-mono font-bold">{data.number}</p>
          <div className="mt-4 text-sm text-muted space-y-0.5">
            <p>
              Émise le <span className="font-mono text-ink">{formatDate(data.date)}</span>
            </p>
            <p>
              Échéance <span className="font-mono text-ink">{data.dueDate ? formatDate(data.dueDate) : "—"}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Facturé à</h3>
        {client ? (
          <div className="text-sm">
            <p className="font-bold text-lg">{client.name}</p>
            {client.contactName && <p className="text-muted">À l&apos;attention de {client.contactName}</p>}
            <p className="text-muted">{[client.address, client.city, client.country].filter(Boolean).join(", ")}</p>
            <p className="text-muted">{[client.email, client.phone].filter(Boolean).join(" · ")}</p>
            {client.ninu && <p className="text-xs text-muted font-mono mt-1">NINU {client.ninu}</p>}
          </div>
        ) : (
          <p className="text-sm text-muted italic">Aucun client sélectionné</p>
        )}
      </div>

      <table className="w-full text-sm text-left mb-8">
        <thead className="bg-bg text-muted font-medium text-xs uppercase tracking-wider">
          <tr>
            <th className="py-3 px-4">Description</th>
            <th className="py-3 px-4 text-center">Qté</th>
            <th className="py-3 px-4 text-right">Prix unitaire</th>
            <th className="py-3 px-4 text-right">Total HT</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line border-b border-line">
          {data.items.map((item) => (
            <tr key={item.id}>
              <td className="py-4 px-4">{item.description || "—"}</td>
              <td className="py-4 px-4 text-center font-mono">{item.quantity}</td>
              <td className="py-4 px-4 text-right font-mono whitespace-nowrap">{formatFCFA(item.price)}</td>
              <td className="py-4 px-4 text-right font-mono font-bold whitespace-nowrap">{formatFCFA(item.quantity * item.price)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end mb-10">
        <div className="w-72 space-y-3 text-sm">
          <div className="flex justify-between text-muted">
            <span>Sous-total HT</span>
            <span className="font-mono">{formatFCFA(subtotal)}</span>
          </div>
          {data.discount > 0 && (
            <div className="flex justify-between text-danger">
              <span>Remise ({data.discount} %)</span>
              <span className="font-mono">−{formatFCFA(discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-muted">
            <span>TVA ({data.taxRate} %)</span>
            <span className="font-mono">{formatFCFA(taxAmount)}</span>
          </div>
          <div className="flex justify-between border-t border-ink pt-3 font-bold text-lg">
            <span>Total TTC</span>
            <span className="font-mono text-accent">{formatFCFA(total)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 text-sm">
        <div>
          <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Moyens de paiement</h3>
          {data.acceptedMethods.length === 0 ? (
            <p className="text-muted">—</p>
          ) : (
            <ul className="space-y-1">
              {data.acceptedMethods.map((m) => {
                const detail = paymentDetail(m, settings);
                return (
                  <li key={m}>
                    <span className="font-medium">{m}</span>
                    {detail && <span className="text-muted font-mono text-xs"> · {detail}</span>}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        {data.notes && (
          <div>
            <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Notes</h3>
            <p className="text-muted whitespace-pre-line">{data.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
