/**
 * Conversion lignes Supabase (snake_case) ⇄ modèle de l'application (camelCase, lib/data.ts).
 * Seul fichier qui connaît les noms des colonnes : si le schéma change, on ne modifie qu'ici.
 */
import type { Client, Invoice, InvoiceStatus, LineItem, Settings } from "../data";

export interface ProfileRow {
  id: string;
  first_name: string;
  last_name: string;
  company_name: string;
  company_ninu: string;
  company_rccm: string;
  company_address: string;
  company_city: string;
  company_country: string;
  company_phone: string;
  company_email: string;
  invoice_prefix: string;
  next_invoice_number: number;
  default_due_days: number;
  default_tax_rate: number;
  default_notes: string;
  enabled_methods: string[];
  orange_money: string;
  mtn_momo: string;
  wave: string;
  iban: string;
}

export interface ClientRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  contact_name: string;
  address: string;
  city: string;
  country: string;
  ninu: string;
  created_at: string;
}

export interface ItemRow {
  id: string;
  invoice_id: string;
  position: number;
  description: string;
  quantity: number;
  price: number;
}

export interface InvoiceRow {
  id: string;
  client_id: string;
  number: string;
  date: string;
  due_date: string;
  status: InvoiceStatus;
  discount: number;
  tax_rate: number;
  notes: string;
  accepted_methods: string[];
  amount: number;
  payment_method: string | null;
  paid_at: string | null;
  last_reminder_at: string | null;
  invoice_items?: ItemRow[];
}

export const profileToSettings = (p: ProfileRow): Settings => ({
  company: {
    name: p.company_name,
    ninu: p.company_ninu,
    rccm: p.company_rccm,
    address: p.company_address,
    city: p.company_city,
    country: p.company_country,
    phone: p.company_phone,
    email: p.company_email,
  },
  invoicing: {
    prefix: p.invoice_prefix,
    nextNumber: p.next_invoice_number,
    defaultDueDays: p.default_due_days,
    defaultTaxRate: Number(p.default_tax_rate),
    defaultNotes: p.default_notes,
  },
  payments: {
    enabledMethods: p.enabled_methods ?? [],
    orangeMoney: p.orange_money,
    mtnMomo: p.mtn_momo,
    wave: p.wave,
    iban: p.iban,
  },
  user: { firstName: p.first_name, lastName: p.last_name },
});

export const settingsToProfile = (s: Settings): Omit<ProfileRow, "id"> => ({
  first_name: s.user.firstName,
  last_name: s.user.lastName,
  company_name: s.company.name,
  company_ninu: s.company.ninu,
  company_rccm: s.company.rccm,
  company_address: s.company.address,
  company_city: s.company.city,
  company_country: s.company.country,
  company_phone: s.company.phone,
  company_email: s.company.email,
  invoice_prefix: s.invoicing.prefix.toUpperCase(),
  next_invoice_number: s.invoicing.nextNumber,
  default_due_days: s.invoicing.defaultDueDays,
  default_tax_rate: s.invoicing.defaultTaxRate,
  default_notes: s.invoicing.defaultNotes,
  enabled_methods: s.payments.enabledMethods,
  orange_money: s.payments.orangeMoney,
  mtn_momo: s.payments.mtnMomo,
  wave: s.payments.wave,
  iban: s.payments.iban,
});

export const rowToClient = (r: ClientRow): Client => ({
  id: r.id,
  name: r.name,
  email: r.email,
  phone: r.phone,
  contactName: r.contact_name,
  address: r.address,
  city: r.city,
  country: r.country,
  ninu: r.ninu,
  createdAt: r.created_at.slice(0, 10),
});

export const clientToRow = (c: Omit<Client, "id" | "createdAt">) => ({
  name: c.name,
  email: c.email,
  phone: c.phone,
  contact_name: c.contactName,
  address: c.address,
  city: c.city,
  country: c.country,
  ninu: c.ninu,
});

const rowToItem = (r: ItemRow): LineItem => ({ id: r.id, description: r.description, quantity: r.quantity, price: Number(r.price) });

export const rowToInvoice = (r: InvoiceRow): Invoice => ({
  id: r.id,
  number: r.number,
  clientId: r.client_id,
  date: r.date,
  dueDate: r.due_date,
  status: r.status,
  items: [...(r.invoice_items ?? [])].sort((a, b) => a.position - b.position).map(rowToItem),
  discount: Number(r.discount),
  taxRate: Number(r.tax_rate),
  notes: r.notes,
  acceptedMethods: r.accepted_methods ?? [],
  amount: Number(r.amount),
  paymentMethod: r.payment_method ?? undefined,
  paidAt: r.paid_at ?? undefined,
  lastReminderAt: r.last_reminder_at ?? undefined,
});

/** Lignes envoyées à la fonction save_invoice (sans identifiant : elles sont recréées). */
export const itemsPayload = (items: LineItem[]) => items.map(({ description, quantity, price }) => ({ description, quantity, price }));

/** Traduit les erreurs Supabase les plus courantes en messages clairs. */
export function friendlyError(err: unknown, fallback = "Une erreur est survenue. Réessayez."): string {
  const msg = typeof err === "object" && err && "message" in err ? String((err as { message: string }).message) : "";
  if (/Failed to fetch|NetworkError|fetch failed/i.test(msg)) return "Connexion impossible. Vérifiez votre accès à internet.";
  if (/violates foreign key constraint.*invoices_client_id_fkey/i.test(msg)) return "Ce client a des factures : supprimez-les d'abord.";
  if (/duplicate key.*invoices_owner_id_number_key/i.test(msg)) return "Ce numéro de facture existe déjà. Ajustez le prochain numéro dans les Paramètres.";
  if (/JWT|not authenticated|permission denied/i.test(msg)) return "Votre session a expiré. Reconnectez-vous.";
  return fallback;
}
