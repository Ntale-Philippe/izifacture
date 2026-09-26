import type { InvoiceStatus } from "./data";
import { colors } from "./tokens";

// Source unique des couleurs de statut (preset Afrique Premium).
// Badges : fond pastel + texte coloré + point. Graphiques : couleur pleine.
export const statusMeta: Record<InvoiceStatus, { hex: string; badge: string; dot: string }> = {
  "Payée": { hex: colors.success.DEFAULT, badge: "bg-success-soft text-success", dot: "bg-success" },
  "En attente": { hex: colors.warning.DEFAULT, badge: "bg-warning-soft text-warning", dot: "bg-warning" },
  "En retard": { hex: colors.danger.DEFAULT, badge: "bg-danger-soft text-danger", dot: "bg-danger" },
  "Brouillon": { hex: colors.muted.soft, badge: "bg-line-soft text-muted", dot: "bg-muted-soft" },
};

export const statusOrder: InvoiceStatus[] = ["Payée", "En attente", "En retard", "Brouillon"];
