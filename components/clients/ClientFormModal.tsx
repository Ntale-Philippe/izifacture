"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useAppData } from "@/lib/store";
import { countries, type Client } from "@/lib/data";

type ClientFields = Omit<Client, "id" | "createdAt">;

const empty: ClientFields = { name: "", email: "", phone: "", contactName: "", address: "", city: "", country: "Côte d'Ivoire", ninu: "" };

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Client à modifier ; absent = création. */
  client?: Client;
  /** Appelé après enregistrement avec le client créé ou modifié. */
  onSaved?: (client: Client) => void;
}

/** Création / modification d'un client. Utilisé par Clients, la fiche client et Nouvelle facture. */
export function ClientFormModal({ isOpen, onClose, client, onSaved }: ClientFormModalProps) {
  const { createClient, updateClient } = useAppData();
  const { toast } = useToast();
  const [form, setForm] = useState<ClientFields>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof ClientFields, string>>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm(client ? { ...empty, ...client } : empty);
      setErrors({});
    }
  }, [isOpen, client]);

  const set = (key: keyof ClientFields, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors(({ [key]: _, ...rest }) => rest);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!form.name.trim()) next.name = "Nom de l'entreprise requis";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Adresse e-mail invalide";
    if (!form.email.trim() && !form.phone.trim()) next.phone = "Indiquez au moins un e-mail ou un téléphone";
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }
    const data = { ...form, name: form.name.trim(), email: form.email.trim() };
    setSaving(true);
    try {
      if (client) {
        await updateClient(client.id, data);
        toast("Client mis à jour", "success");
        onSaved?.({ ...client, ...data });
      } else {
        const created = await createClient(data);
        toast(`${created.name} ajouté à vos clients`, "success");
        onSaved?.(created);
      }
      onClose();
    } catch {
      /* erreur déjà signalée par le store ; la fenêtre reste ouverte */
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={client ? "Modifier le client" : "Nouveau client"} className="max-w-2xl">
      <form onSubmit={submit} noValidate className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Input id="client-name" label="Nom de l'entreprise" placeholder="Ex. Kouadio & Frères" value={form.name} error={errors.name} onChange={(e) => set("name", e.target.value)} autoFocus />
          </div>
          <Input id="client-contact" label="Contact" placeholder="Nom de la personne à contacter" value={form.contactName} onChange={(e) => set("contactName", e.target.value)} />
          <Input id="client-ninu" label="NINU (facultatif)" placeholder="Ex. CI-1234567-A" value={form.ninu} onChange={(e) => set("ninu", e.target.value)} />
          <Input id="client-email" type="email" label="E-mail" placeholder="contact@entreprise.ci" value={form.email} error={errors.email} onChange={(e) => set("email", e.target.value)} />
          <Input id="client-phone" type="tel" label="Téléphone" placeholder="+225 07 00 00 00 00" value={form.phone} error={errors.phone} onChange={(e) => set("phone", e.target.value)} />
          <div className="md:col-span-2">
            <Input id="client-address" label="Adresse" placeholder="Rue, quartier" value={form.address} onChange={(e) => set("address", e.target.value)} />
          </div>
          <Input id="client-city" label="Ville" placeholder="Abidjan" value={form.city} onChange={(e) => set("city", e.target.value)} />
          <Select id="client-country" label="Pays" value={form.country} onChange={(e) => set("country", e.target.value)}>
            {countries.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" isLoading={saving}>
            {client ? "Enregistrer" : "Ajouter le client"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
