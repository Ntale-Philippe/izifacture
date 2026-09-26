/**
 * Modèle de données + jeu de démonstration.
 * Les pages ne lisent jamais ce fichier directement : elles passent par le store (lib/store.tsx),
 * qui part de ces données puis persiste les modifications dans le navigateur.
 */

export type InvoiceStatus = "Payée" | "En attente" | "En retard" | "Brouillon";

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  price: number; // prix unitaire HT en FCFA
}

export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  date: string; // AAAA-MM-JJ
  dueDate: string;
  status: InvoiceStatus;
  items: LineItem[];
  discount: number; // %
  taxRate: number; // %
  notes: string;
  acceptedMethods: string[];
  amount: number; // total TTC, recalculé à chaque enregistrement
  paymentMethod?: string; // canal d'encaissement quand Payée
  paidAt?: string;
  lastReminderAt?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  contactName: string;
  address: string;
  city: string;
  country: string;
  ninu: string;
  createdAt: string;
}

export interface Settings {
  company: {
    name: string;
    ninu: string;
    rccm: string;
    address: string;
    city: string;
    country: string;
    phone: string;
    email: string;
  };
  invoicing: {
    prefix: string;
    nextNumber: number;
    defaultDueDays: number;
    defaultTaxRate: number;
    defaultNotes: string;
  };
  payments: {
    enabledMethods: string[];
    orangeMoney: string;
    mtnMomo: string;
    wave: string;
    iban: string;
  };
  user: {
    firstName: string;
    lastName: string;
  };
}

export const paymentMethods = ["Orange Money", "MTN MoMo", "Wave", "Virement Bancaire", "Espèces"];
export const countries = ["Côte d'Ivoire", "Sénégal", "Cameroun", "Mali", "Burkina Faso", "Bénin", "Togo", "Niger", "Guinée", "Gabon"];
export const taxRates = [
  { value: 18, label: "18 % (standard UEMOA)" },
  { value: 9, label: "9 % (taux réduit)" },
  { value: 0, label: "0 % (exonéré)" },
];

/* ─── Jeu de démonstration ─────────────────────────────────────────────── */

export const seedClients: Client[] = [
  { id: "C001", name: "Kouadio & Frères", email: "contact@kouadio.ci", phone: "+225 07 08 12 34 56", contactName: "Yao Kouadio", address: "Rue des Jardins, Cocody", city: "Abidjan", country: "Côte d'Ivoire", ninu: "CI-1234567-A", createdAt: "2026-01-12" },
  { id: "C002", name: "Ndiaye Tech", email: "hello@ndiaye.sn", phone: "+221 77 123 45 67", contactName: "Fatou Ndiaye", address: "Sacré-Cœur 3", city: "Dakar", country: "Sénégal", ninu: "SN-0045678-B", createdAt: "2026-02-03" },
  { id: "C003", name: "Douala Logistics", email: "logistics@douala.cm", phone: "+237 6 99 88 77 66", contactName: "Paul Mbarga", address: "Zone portuaire, Bonabéri", city: "Douala", country: "Cameroun", ninu: "CM-M051200-C", createdAt: "2026-02-18" },
  { id: "C004", name: "Bamba Immo", email: "info@bamba.ci", phone: "+225 05 44 33 22 11", contactName: "Aïcha Bamba", address: "Boulevard Latrille", city: "Abidjan", country: "Côte d'Ivoire", ninu: "CI-7654321-D", createdAt: "2026-03-01" },
  { id: "C005", name: "Diop Consulting", email: "consulting@diop.sn", phone: "+221 78 987 65 43", contactName: "Moussa Diop", address: "Almadies", city: "Dakar", country: "Sénégal", ninu: "SN-0098765-E", createdAt: "2026-03-22" },
  { id: "C006", name: "Yaoundé Design", email: "contact@y-design.cm", phone: "+237 6 77 55 44 33", contactName: "Carine Ngo", address: "Bastos", city: "Yaoundé", country: "Cameroun", ninu: "CM-P087650-F", createdAt: "2026-04-10" },
  { id: "C007", name: "Touré Agric", email: "toure@agric.ci", phone: "+225 01 23 45 67 89", contactName: "Ibrahim Touré", address: "Route de Bingerville", city: "Bouaké", country: "Côte d'Ivoire", ninu: "CI-1122334-G", createdAt: "2026-04-28" },
  { id: "C008", name: "Sow E-commerce", email: "contact@sow.sn", phone: "+221 76 222 33 44", contactName: "Awa Sow", address: "Plateau", city: "Dakar", country: "Sénégal", ninu: "SN-0033221-H", createdAt: "2026-05-15" },
];

export const seedSettings: Settings = {
  company: {
    name: "Studio Diallo SARL",
    ninu: "CI-2023-0456789",
    rccm: "CI-ABJ-2023-B-1234",
    address: "Immeuble Alpha, Plateau",
    city: "Abidjan",
    country: "Côte d'Ivoire",
    phone: "+225 07 00 11 22 33",
    email: "facturation@studiodiallo.ci",
  },
  invoicing: {
    prefix: "INV",
    nextNumber: 29,
    defaultDueDays: 15,
    defaultTaxRate: 18,
    defaultNotes: "Merci pour votre confiance. Paiement à réception par Mobile Money ou virement.",
  },
  payments: {
    enabledMethods: ["Orange Money", "Wave", "Virement Bancaire"],
    orangeMoney: "+225 07 00 11 22 33",
    mtnMomo: "",
    wave: "+225 07 00 11 22 33",
    iban: "CI93 CI00 0101 0000 1234 5678 901",
  },
  user: { firstName: "Aminata", lastName: "Diallo" },
};

type Row = [id: string, clientId: string, items: [string, number, number][], date: string, dueDate: string, status: InvoiceStatus, method?: string];

// Montants HT ; la TVA à 18 % est ajoutée par computeTotals().
const rows: Row[] = [
  ["1", "C001", [["Refonte du site vitrine", 1, 850000], ["Hébergement annuel", 1, 120000]], "2026-09-01", "2026-09-15", "Payée", "Wave"],
  ["2", "C002", [["Maquettes application mobile", 1, 650000]], "2026-09-05", "2026-09-20", "Payée", "Orange Money"],
  ["3", "C003", [["Audit des flux logistiques", 4, 450000], ["Rapport et recommandations", 1, 900000]], "2026-09-10", "2026-09-25", "En attente"],
  ["4", "C004", [["Photographies des biens", 12, 30000]], "2026-08-15", "2026-08-30", "En retard"],
  ["5", "C005", [["Accompagnement stratégique", 3, 300000]], "2026-09-12", "2026-09-27", "En attente"],
  ["6", "C006", [["Identité visuelle (proposition)", 1, 210000]], "2026-09-20", "2026-10-05", "Brouillon"],
  ["7", "C007", [["Formation Excel avancé", 2, 300000]], "2026-08-01", "2026-08-15", "Payée", "MTN MoMo"],
  ["8", "C008", [["Intégration boutique en ligne", 1, 1150000], ["Formation back-office", 1, 120000]], "2026-08-10", "2026-08-25", "Payée", "Virement Bancaire"],
  ["9", "C001", [["Maintenance mensuelle", 3, 250000]], "2026-09-18", "2026-10-02", "En attente"],
  ["10", "C002", [["Campagne réseaux sociaux", 1, 250000]], "2026-07-15", "2026-07-30", "Payée", "Wave"],
  ["11", "C003", [["Paramétrage ERP", 1, 1500000], ["Support 3 mois", 1, 280000]], "2026-07-20", "2026-08-05", "Payée", "Virement Bancaire"],
  ["12", "C004", [["Visite virtuelle 360°", 2, 210000]], "2026-08-25", "2026-09-10", "En retard"],
  ["13", "C005", [["Atelier gouvernance", 1, 680000]], "2026-09-22", "2026-10-07", "Brouillon"],
  ["14", "C006", [["Charte graphique", 1, 380000]], "2026-09-25", "2026-10-10", "En attente"],
  ["15", "C007", [["Étude de marché", 1, 1000000]], "2026-08-12", "2026-08-27", "Payée", "Wave"],
  ["16", "C008", [["Shooting produits", 1, 550000]], "2026-09-02", "2026-09-17", "Payée", "Orange Money"],
  ["17", "C001", [["Nom de domaine et e-mails", 1, 300000]], "2026-06-10", "2026-06-25", "Payée", "MTN MoMo"],
  ["18", "C002", [["Tests utilisateurs", 5, 125000]], "2026-07-05", "2026-07-20", "Payée", "Wave"],
  ["19", "C003", [["Tableau de bord logistique", 1, 1180000]], "2026-08-18", "2026-09-02", "En retard"],
  ["20", "C004", [["Rédaction annonces", 15, 50000]], "2026-09-24", "2026-10-09", "En attente"],
  ["21", "C005", [["Note de cadrage", 1, 210000]], "2026-09-26", "2026-10-11", "Brouillon"],
  ["22", "C006", [["Affiches événement", 10, 46000]], "2026-06-22", "2026-07-07", "Payée", "Virement Bancaire"],
  ["23", "C007", [["Formation équipe commerciale", 2, 480000]], "2026-07-12", "2026-07-27", "Payée", "MTN MoMo"],
  ["24", "C008", [["Optimisation SEO", 1, 400000]], "2026-09-08", "2026-09-23", "En attente"],
  ["25", "C002", [["Site institutionnel", 1, 1400000]], "2026-04-06", "2026-04-21", "Payée", "Wave"],
  ["26", "C007", [["Formation gestion de stock", 3, 390000]], "2026-04-18", "2026-05-03", "Payée", "Orange Money"],
  ["27", "C003", [["Cartographie des entrepôts", 1, 1650000]], "2026-05-09", "2026-05-24", "Payée", "Virement Bancaire"],
  ["28", "C001", [["Application de caisse", 1, 1520000]], "2026-05-20", "2026-06-04", "Payée", "MTN MoMo"],
];

function totalOf(items: [string, number, number][], taxRate = 18): number {
  const subtotal = items.reduce((s, [, q, p]) => s + q * p, 0);
  return Math.round(subtotal * (1 + taxRate / 100));
}

export const seedInvoices: Invoice[] = rows.map(([id, clientId, items, date, dueDate, status, method]) => ({
  id,
  number: `INV-2026-${id.padStart(3, "0")}`,
  clientId,
  date,
  dueDate,
  status,
  items: items.map(([description, quantity, price], i) => ({ id: `${id}-${i}`, description, quantity, price })),
  discount: 0,
  taxRate: 18,
  notes: seedSettings.invoicing.defaultNotes,
  acceptedMethods: seedSettings.payments.enabledMethods,
  amount: totalOf(items),
  paymentMethod: method,
  paidAt: status === "Payée" ? dueDate : undefined,
}));
