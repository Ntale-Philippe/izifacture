import type { Invoice, InvoiceStatus, LineItem, Settings } from "./data";

/** Totaux d'une facture : remise sur le HT, puis TVA sur le HT remisé. */
export function computeTotals(items: Pick<LineItem, "quantity" | "price">[], discount: number, taxRate: number) {
  const subtotal = items.reduce((s, i) => s + i.quantity * i.price, 0);
  const discountAmount = Math.round(subtotal * (discount / 100));
  const taxable = subtotal - discountAmount;
  const taxAmount = Math.round(taxable * (taxRate / 100));
  return { subtotal, discountAmount, taxable, taxAmount, total: taxable + taxAmount };
}

export function formatInvoiceNumber(prefix: string, n: number, year = new Date().getFullYear()): string {
  return `${prefix}-${year}-${String(n).padStart(3, "0")}`;
}

export function todayISO(): string {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

/** Une facture en attente dont l'échéance est dépassée passe automatiquement « En retard ». */
export function effectiveStatus(inv: Pick<Invoice, "status" | "dueDate">, today = todayISO()): InvoiceStatus {
  return inv.status === "En attente" && inv.dueDate < today ? "En retard" : inv.status;
}

/** Nombre de jours avant (positif) ou après (négatif) l'échéance. */
export function daysUntil(iso: string, today = todayISO()): number {
  return Math.round((new Date(iso).getTime() - new Date(today).getTime()) / 86400000);
}

export function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);
}

/** Coordonnées de paiement à afficher sur la facture pour un moyen accepté. */
export function paymentDetail(method: string, settings: Settings): string | null {
  const p = settings.payments;
  if (method === "Orange Money") return p.orangeMoney || null;
  if (method === "MTN MoMo") return p.mtnMomo || null;
  if (method === "Wave") return p.wave || null;
  if (method === "Virement Bancaire") return p.iban || null;
  return null;
}
