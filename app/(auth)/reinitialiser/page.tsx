"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import { authErrorMessage } from "@/lib/authErrors";

/** Choix d'un nouveau mot de passe (on arrive ici connecté, via le lien reçu par e-mail). */
export default function ReinitialiserPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirm?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (password.length < 8) next.password = "8 caractères minimum";
    if (confirm !== password) next.confirm = "Les deux mots de passe ne correspondent pas";
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    const { error } = await createClient().auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setErrors({ form: authErrorMessage(error.message) });
      return;
    }
    toast("Mot de passe mis à jour", "success");
    router.replace("/dashboard");
  };

  return (
    <div className="animate-fade-up opacity-0">
      <h1 className="font-display font-bold text-3xl md:text-4xl text-ink tracking-tight">Nouveau mot de passe</h1>
      <p className="text-sm text-muted mt-2">Choisissez un mot de passe d&apos;au moins 8 caractères.</p>
      <form onSubmit={submit} noValidate className="mt-8 space-y-4">
        {errors.form && (
          <p role="alert" className="text-sm text-danger bg-danger-soft rounded-xl px-4 py-3">
            {errors.form}
          </p>
        )}
        <PasswordInput id="new-password" label="Nouveau mot de passe" autoComplete="new-password" value={password} error={errors.password} onChange={(e) => setPassword(e.target.value)} autoFocus />
        <PasswordInput id="confirm-password" label="Confirmation" autoComplete="new-password" value={confirm} error={errors.confirm} onChange={(e) => setConfirm(e.target.value)} />
        <Button type="submit" size="lg" className="w-full" isLoading={loading}>
          <KeyRound size={18} aria-hidden="true" /> Enregistrer
        </Button>
      </form>
    </div>
  );
}
