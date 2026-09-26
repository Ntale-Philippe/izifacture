"use client";

/**
 * Store de l'application, branché sur Supabase.
 * Charge le profil (paramètres), les clients et les factures de l'utilisateur connecté,
 * puis expose des actions asynchrones. Chaque action met à jour l'écran avec la réponse
 * du serveur ; en cas d'échec, un toast explique le problème et l'action lève une erreur
 * (les pages l'attrapent pour arrêter leur traitement).
 *
 * Les pages n'utilisent QUE ce hook (useAppData) : elles ignorent tout de Supabase.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient as createSupabase } from "./supabase/client";
import {
  clientToRow,
  friendlyError,
  itemsPayload,
  profileToSettings,
  rowToClient,
  rowToInvoice,
  settingsToProfile,
  type ClientRow,
  type InvoiceRow,
  type ProfileRow,
} from "./supabase/mappers";
import { seedClients, seedInvoices, seedSettings, type Client, type Invoice, type Settings } from "./data";
import { computeTotals, effectiveStatus, formatInvoiceNumber, newId, todayISO } from "./invoice";
import { useToast } from "@/components/ui/Toast";

export type InvoiceDraft = Omit<Invoice, "id" | "number" | "amount">;
type ClientFields = Omit<Client, "id" | "createdAt">;

const INVOICE_SELECT = "*, invoice_items(*)";

interface AppData {
  /** true une fois les données chargées depuis Supabase (afficher un skeleton avant). */
  hydrated: boolean;
  /** E-mail du compte connecté. */
  email: string;
  invoices: Invoice[];
  clients: Client[];
  settings: Settings;
  getClient: (id: string) => Client | undefined;
  getInvoice: (id: string) => Invoice | undefined;
  /** Prochain numéro de facture (indicatif : le numéro définitif est attribué par la base). */
  nextInvoiceNumber: string;
  createInvoice: (draft: InvoiceDraft) => Promise<Invoice>;
  updateInvoice: (id: string, draft: InvoiceDraft) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  markInvoicePaid: (id: string, method?: string) => Promise<void>;
  duplicateInvoice: (id: string) => Promise<Invoice>;
  sendReminder: (id: string) => Promise<void>;
  createClient: (client: ClientFields) => Promise<Client>;
  updateClient: (id: string, client: ClientFields) => Promise<void>;
  /** false si le client a des factures (suppression refusée). */
  deleteClient: (id: string) => Promise<boolean>;
  updateSettings: (settings: Settings) => Promise<void>;
  /** Remplace toutes les données par le jeu de démonstration. */
  loadDemo: () => Promise<void>;
  /** Efface factures et clients (le profil est conservé). */
  resetData: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AppDataContext = createContext<AppData | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createSupabase(), []);
  const router = useRouter();
  const { toast } = useToast();

  const [hydrated, setHydrated] = useState(false);
  const [email, setEmail] = useState("");
  const [rawInvoices, setRawInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [settings, setSettings] = useState<Settings>(seedSettings);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  /** Exécute une requête ; en cas d'erreur, affiche un toast clair puis relance l'erreur. */
  const run = useCallback(
    async <T,>(op: PromiseLike<{ data: T; error: unknown }>, fallback?: string): Promise<T> => {
      const { data, error } = await op;
      if (error) {
        toast(friendlyError(error, fallback), "error");
        throw error;
      }
      return data;
    },
    [toast]
  );

  const load = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.replace("/connexion");
      return;
    }
    setEmail(user.email ?? "");
    try {
      const [profile, clientRows, invoiceRows] = await Promise.all([
        run(supabase.from("profiles").select("*").eq("id", user.id).single()),
        run(supabase.from("clients").select("*").order("created_at", { ascending: false })),
        run(supabase.from("invoices").select(INVOICE_SELECT).order("date", { ascending: false })),
      ]);
      setSettings(profileToSettings(profile as ProfileRow));
      setClients((clientRows as ClientRow[]).map(rowToClient));
      setRawInvoices((invoiceRows as InvoiceRow[]).map(rowToInvoice));
    } catch {
      /* toast déjà affiché ; l'application reste sur ses valeurs par défaut */
    }
    setHydrated(true);
  }, [supabase, router, run]);

  useEffect(() => {
    load();
    // Déconnexion depuis un autre onglet : retour à la page de connexion.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") router.replace("/connexion");
    });
    return () => sub.subscription.unsubscribe();
  }, [load, supabase, router]);

  // Statut effectif : une facture en attente dont l'échéance est passée devient « En retard ».
  const invoices = useMemo(() => {
    const today = todayISO();
    return rawInvoices.map((inv) => ({ ...inv, status: effectiveStatus(inv, today) }));
  }, [rawInvoices]);

  const fetchInvoice = useCallback(
    async (id: string) => rowToInvoice((await run(supabase.from("invoices").select(INVOICE_SELECT).eq("id", id).single())) as InvoiceRow),
    [supabase, run]
  );
  const upsertLocal = (inv: Invoice) => setRawInvoices((list) => [inv, ...list.filter((i) => i.id !== inv.id)]);
  const patchLocal = (id: string, patch: Partial<Invoice>) => setRawInvoices((list) => list.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  const bumpNumber = () =>
    setSettings((s) => ({ ...s, invoicing: { ...s.invoicing, nextNumber: s.invoicing.nextNumber + 1 } }));

  const saveInvoice = useCallback(
    async (id: string | null, draft: InvoiceDraft) => {
      const row = (await run(
        supabase.rpc("save_invoice", {
          p_id: id,
          p_client_id: draft.clientId,
          p_date: draft.date,
          p_due_date: draft.dueDate,
          p_status: draft.status,
          p_discount: draft.discount,
          p_tax_rate: draft.taxRate,
          p_notes: draft.notes,
          p_accepted_methods: draft.acceptedMethods,
          p_items: itemsPayload(draft.items),
        }),
        "La facture n'a pas pu être enregistrée."
      )) as InvoiceRow;
      const saved = await fetchInvoice(row.id);
      upsertLocal(saved);
      return saved;
    },
    [supabase, run, fetchInvoice]
  );

  const createInvoice = useCallback(async (draft: InvoiceDraft) => {
    const inv = await saveInvoice(null, draft);
    bumpNumber();
    return inv;
  }, [saveInvoice]);

  const updateInvoice = useCallback(async (id: string, draft: InvoiceDraft) => {
    await saveInvoice(id, draft);
  }, [saveInvoice]);

  const deleteInvoice = useCallback(
    async (id: string) => {
      await run(supabase.from("invoices").delete().eq("id", id), "La facture n'a pas pu être supprimée.");
      setRawInvoices((list) => list.filter((i) => i.id !== id));
    },
    [supabase, run]
  );

  const markInvoicePaid = useCallback(
    async (id: string, method?: string) => {
      const current = rawInvoices.find((i) => i.id === id);
      const patch = { status: "Payée" as const, paidAt: todayISO(), paymentMethod: method ?? current?.paymentMethod ?? current?.acceptedMethods[0] };
      await run(
        supabase.from("invoices").update({ status: patch.status, paid_at: patch.paidAt, payment_method: patch.paymentMethod ?? null }).eq("id", id),
        "Le paiement n'a pas pu être enregistré."
      );
      patchLocal(id, patch);
    },
    [supabase, run, rawInvoices]
  );

  const duplicateInvoice = useCallback(
    async (id: string) => {
      const row = (await run(supabase.rpc("duplicate_invoice", { p_id: id }), "La facture n'a pas pu être dupliquée.")) as InvoiceRow;
      const copy = await fetchInvoice(row.id);
      upsertLocal(copy);
      bumpNumber();
      return copy;
    },
    [supabase, run, fetchInvoice]
  );

  const sendReminder = useCallback(
    async (id: string) => {
      const today = todayISO();
      await run(supabase.from("invoices").update({ last_reminder_at: today }).eq("id", id), "La relance n'a pas pu être enregistrée.");
      patchLocal(id, { lastReminderAt: today });
    },
    [supabase, run]
  );

  const createClient = useCallback(
    async (client: ClientFields) => {
      const row = (await run(supabase.from("clients").insert(clientToRow(client)).select().single(), "Le client n'a pas pu être ajouté.")) as ClientRow;
      const created = rowToClient(row);
      setClients((list) => [created, ...list]);
      return created;
    },
    [supabase, run]
  );

  const updateClient = useCallback(
    async (id: string, client: ClientFields) => {
      const row = (await run(supabase.from("clients").update(clientToRow(client)).eq("id", id).select().single(), "Le client n'a pas pu être modifié.")) as ClientRow;
      const updated = rowToClient(row);
      setClients((list) => list.map((c) => (c.id === id ? updated : c)));
    },
    [supabase, run]
  );

  const deleteClient = useCallback(
    async (id: string) => {
      if (rawInvoices.some((i) => i.clientId === id)) return false;
      await run(supabase.from("clients").delete().eq("id", id), "Le client n'a pas pu être supprimé.");
      setClients((list) => list.filter((c) => c.id !== id));
      return true;
    },
    [supabase, run, rawInvoices]
  );

  const updateSettings = useCallback(
    async (next: Settings) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Session expirée");
      const row = (await run(supabase.from("profiles").update(settingsToProfile(next)).eq("id", user.id).select().single(), "Les paramètres n'ont pas pu être enregistrés.")) as ProfileRow;
      setSettings(profileToSettings(row));
    },
    [supabase, run]
  );

  const resetData = useCallback(async () => {
    await run(supabase.rpc("reset_my_data"), "Les données n'ont pas pu être effacées.");
    setRawInvoices([]);
    setClients([]);
    setSettings((s) => ({ ...s, invoicing: { ...s.invoicing, nextNumber: 1 } }));
  }, [supabase, run]);

  const loadDemo = useCallback(async () => {
    await run(supabase.rpc("reset_my_data"), "Les données de démonstration n'ont pas pu être chargées.");
    // Identifiants générés ici pour relier factures et clients sans aller-retour.
    const idMap = new Map(seedClients.map((c) => [c.id, newId()]));
    const invMap = new Map(seedInvoices.map((i) => [i.id, newId()]));
    await run(
      supabase.from("clients").insert(seedClients.map((c) => ({ ...clientToRow(c), id: idMap.get(c.id), created_at: c.createdAt }))),
      "Les clients de démonstration n'ont pas pu être créés."
    );
    await run(
      supabase.from("invoices").insert(
        seedInvoices.map((i) => ({
          id: invMap.get(i.id),
          client_id: idMap.get(i.clientId),
          number: i.number,
          date: i.date,
          due_date: i.dueDate,
          status: i.status,
          discount: i.discount,
          tax_rate: i.taxRate,
          notes: i.notes,
          accepted_methods: i.acceptedMethods,
          amount: computeTotals(i.items, i.discount, i.taxRate).total,
          payment_method: i.paymentMethod ?? null,
          paid_at: i.paidAt ?? null,
        }))
      ),
      "Les factures de démonstration n'ont pas pu être créées."
    );
    await run(
      supabase.from("invoice_items").insert(
        seedInvoices.flatMap((i) => i.items.map((it, position) => ({ invoice_id: invMap.get(i.id), position, description: it.description, quantity: it.quantity, price: it.price })))
      ),
      "Les lignes de démonstration n'ont pas pu être créées."
    );
    const s = settingsRef.current;
    await updateSettings({ ...s, invoicing: { ...s.invoicing, nextNumber: seedSettings.invoicing.nextNumber } });
    await load();
  }, [supabase, run, updateSettings, load]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    router.replace("/connexion");
    router.refresh();
  }, [supabase, router]);

  const value = useMemo<AppData>(
    () => ({
      hydrated,
      email,
      invoices,
      clients,
      settings,
      getClient: (id) => clients.find((c) => c.id === id),
      getInvoice: (id) => invoices.find((i) => i.id === id),
      nextInvoiceNumber: formatInvoiceNumber(settings.invoicing.prefix, settings.invoicing.nextNumber),
      createInvoice,
      updateInvoice,
      deleteInvoice,
      markInvoicePaid,
      duplicateInvoice,
      sendReminder,
      createClient,
      updateClient,
      deleteClient,
      updateSettings,
      loadDemo,
      resetData,
      signOut,
    }),
    [hydrated, email, invoices, clients, settings, createInvoice, updateInvoice, deleteInvoice, markInvoicePaid, duplicateInvoice, sendReminder, createClient, updateClient, deleteClient, updateSettings, loadDemo, resetData, signOut]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppData {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData doit être utilisé dans <AppDataProvider>");
  return ctx;
}
