import type { Invoice } from "./data";

export interface ClientStats {
  count: number;
  billed: number; // total des factures émises (hors brouillons)
  paid: number;
  outstanding: number; // en attente + en retard
  overdue: number;
  lastDate?: string;
}

/** Chiffres d'un client à partir de ses factures. */
export function statsFor(clientId: string, invoices: Invoice[]): ClientStats {
  const mine = invoices.filter((i) => i.clientId === clientId);
  const issued = mine.filter((i) => i.status !== "Brouillon");
  const sum = (list: Invoice[]) => list.reduce((s, i) => s + i.amount, 0);
  return {
    count: mine.length,
    billed: sum(issued),
    paid: sum(issued.filter((i) => i.status === "Payée")),
    outstanding: sum(issued.filter((i) => i.status === "En attente" || i.status === "En retard")),
    overdue: sum(issued.filter((i) => i.status === "En retard")),
    lastDate: mine.map((i) => i.date).sort().pop(),
  };
}
