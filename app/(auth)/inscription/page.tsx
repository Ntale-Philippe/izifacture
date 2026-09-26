"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MailCheck, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { createClient, createEmailAuthClient } from "@/lib/supabase/client";
import { authErrorMessage, isEmail } from "@/lib/authErrors";

type Field = "firstName" | "lastName" | "company" | "email" | "password";

export default function InscriptionPage() {
  const router = useRouter();
  const [form, setForm] = useState<Record<Field, string>>({ firstName: "", lastName: "", company: "", email: "", password: "" });
  const [errors, setErrors] = useState<Partial<Record<Field | "form", string>>>({});
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const set = (key: Field, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors(({ [key]: _, ...rest }) => rest);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!form.firstName.trim()) next.firstName = "Prénom requis";
    if (!form.company.trim()) next.company = "Nom de l'entreprise requis";
    if (!isEmail(form.email)) next.email = "Adresse e-mail invalide";
    if (form.password.length < 8) next.password = "8 caractères minimum";
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    const { data, error } = await createEmailAuthClient().auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        // Repris par le trigger handle_new_user pour créer le profil.
        data: { first_name: form.firstName.trim(), last_name: form.lastName.trim(), company_name: form.company.trim() },
        emailRedirectTo: `${window.location.origin}/auth/session?next=/dashboard`,
      },
    });
    setLoading(false);
    if (error) {
      setErrors({ form: authErrorMessage(error.message) });
      return;
    }
    // E-mail déjà inscrit : Supabase répond « succès » sans identité (pour ne pas révéler les comptes).
    if (data.user && data.user.identities?.length === 0) {
      setErrors({ form: "Un compte existe déjà avec cet e-mail. Connectez-vous ou utilisez « Mot de passe oublié »." });
      return;
    }
    if (data.session) {
      // Confirmation d'e-mail désactivée : connecté immédiatement (session enregistrée dans les cookies).
      await createClient().auth.setSession(data.session);
      router.replace("/dashboard");
      router.refresh();
    } else {
      setSentTo(form.email.trim());
    }
  };

  if (sentTo) {
    return (
      <div className="animate-fade-up opacity-0 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-accent/10 text-accent flex items-center justify-center">
          <MailCheck size={28} aria-hidden="true" />
        </div>
        <h1 className="font-display font-bold text-3xl text-ink tracking-tight mt-6">Vérifiez votre boîte mail</h1>
        <p className="text-sm text-muted mt-3">
          Nous avons envoyé un lien de confirmation à <span className="font-mono text-ink">{sentTo}</span>. Ouvrez-le pour activer votre compte, depuis n&apos;importe quel appareil.
        </p>
        <p className="text-xs text-muted mt-6">Rien reçu après quelques minutes ? Regardez dans les courriers indésirables.</p>
        <Link href="/connexion" className="group inline-block text-sm font-medium text-accent mt-8">
          <span className="link-underline">Retour à la connexion</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-up opacity-0">
      <div className="lg:hidden flex items-center gap-2 mb-10">
        <div className="w-9 h-9 rounded-lg bg-accent text-white flex items-center justify-center font-display font-bold text-lg shadow-warm-md">iz</div>
        <span className="font-display font-bold text-xl tracking-tight text-ink">Izifacture</span>
      </div>

      <h1 className="font-display font-bold text-3xl md:text-4xl text-ink tracking-tight">Créer votre compte</h1>
      <p className="text-sm text-muted mt-2">Gratuit, sans carte bancaire. Votre première facture en 2 minutes.</p>

      <form onSubmit={submit} noValidate className="mt-8 space-y-4">
        {errors.form && (
          <p role="alert" className="text-sm text-danger bg-danger-soft rounded-xl px-4 py-3">
            {errors.form}
          </p>
        )}
        <div className="grid grid-cols-2 gap-4">
          <Input id="signup-firstname" label="Prénom" autoComplete="given-name" value={form.firstName} error={errors.firstName} onChange={(e) => set("firstName", e.target.value)} autoFocus />
          <Input id="signup-lastname" label="Nom" autoComplete="family-name" value={form.lastName} onChange={(e) => set("lastName", e.target.value)} />
        </div>
        <Input id="signup-company" label="Entreprise" autoComplete="organization" placeholder="Ex. Studio Diallo SARL" value={form.company} error={errors.company} onChange={(e) => set("company", e.target.value)} />
        <Input id="signup-email" type="email" label="E-mail professionnel" autoComplete="email" placeholder="vous@entreprise.ci" value={form.email} error={errors.email} onChange={(e) => set("email", e.target.value)} />
        <PasswordInput id="signup-password" label="Mot de passe" autoComplete="new-password" placeholder="8 caractères minimum" value={form.password} error={errors.password} onChange={(e) => set("password", e.target.value)} />
        <Button type="submit" size="lg" className="w-full" isLoading={loading}>
          <UserPlus size={18} aria-hidden="true" /> Créer mon compte
        </Button>
      </form>

      <p className="text-sm text-muted text-center mt-8">
        Déjà inscrit ?{" "}
        <Link href="/connexion" className="group font-medium text-accent">
          <span className="link-underline">Se connecter</span>
        </Link>
      </p>
    </div>
  );
}
