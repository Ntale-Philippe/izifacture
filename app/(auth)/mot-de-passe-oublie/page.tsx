"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MailCheck, Send } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createEmailAuthClient } from "@/lib/supabase/client";
import { authErrorMessage, isEmail } from "@/lib/authErrors";

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmail(email)) {
      setError("Adresse e-mail invalide");
      return;
    }
    setLoading(true);
    const { error: err } = await createEmailAuthClient().auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/session?next=/reinitialiser`,
    });
    setLoading(false);
    if (err) {
      setFormError(authErrorMessage(err.message));
      return;
    }
    setSent(true);
  };

  return (
    <div className="animate-fade-up opacity-0">
      <Link href="/connexion" className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-ink transition-colors group mb-10">
        <ArrowLeft size={16} aria-hidden="true" className="transition-transform group-hover:-translate-x-0.5" />
        Retour à la connexion
      </Link>

      {sent ? (
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-accent/10 text-accent flex items-center justify-center">
            <MailCheck size={28} aria-hidden="true" />
          </div>
          <h1 className="font-display font-bold text-3xl text-ink tracking-tight mt-6">E-mail envoyé</h1>
          <p className="text-sm text-muted mt-3">
            Si un compte existe pour <span className="font-mono text-ink">{email.trim()}</span>, vous recevrez un lien pour choisir un nouveau mot de passe.
          </p>
        </div>
      ) : (
        <>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-ink tracking-tight">Mot de passe oublié</h1>
          <p className="text-sm text-muted mt-2">Indiquez votre e-mail : nous vous envoyons un lien de réinitialisation.</p>
          <form onSubmit={submit} noValidate className="mt-8 space-y-4">
            {formError && (
              <p role="alert" className="text-sm text-danger bg-danger-soft rounded-xl px-4 py-3">
                {formError}
              </p>
            )}
            <Input
              id="reset-email"
              type="email"
              label="E-mail"
              autoComplete="email"
              value={email}
              error={error}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(undefined);
              }}
              autoFocus
            />
            <Button type="submit" size="lg" className="w-full" isLoading={loading}>
              <Send size={18} aria-hidden="true" /> Envoyer le lien
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
