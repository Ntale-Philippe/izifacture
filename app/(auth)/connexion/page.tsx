"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn, MailCheck } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { createClient, createEmailAuthClient } from "@/lib/supabase/client";
import { authErrorMessage, isEmail } from "@/lib/authErrors";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>(
    params.get("erreur") === "lien" ? { form: "Ce lien a expiré ou a déjà été utilisé. Connectez-vous ou demandez-en un nouveau." } : {}
  );
  const [loading, setLoading] = useState(false);
  const [unconfirmed, setUnconfirmed] = useState(false);
  const [resent, setResent] = useState<"idle" | "sending" | "sent">("idle");

  const resend = async () => {
    setResent("sending");
    const { error } = await createEmailAuthClient().auth.resend({
      type: "signup",
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/session?next=/dashboard` },
    });
    if (error) {
      setErrors({ form: authErrorMessage(error.message) });
      setResent("idle");
      return;
    }
    setResent("sent");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!isEmail(email)) next.email = "Adresse e-mail invalide";
    if (!password) next.password = "Mot de passe requis";
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    setUnconfirmed(false);
    setResent("idle");
    const { error } = await createClient().auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setUnconfirmed(error.code === "email_not_confirmed" || /Email not confirmed/i.test(error.message));
      setErrors({ form: authErrorMessage(error.message) });
      setLoading(false);
      return;
    }
    // Retour à la page demandée avant la connexion (?suite=), sinon le tableau de bord.
    const suite = params.get("suite");
    router.replace(suite && suite.startsWith("/") && !suite.startsWith("//") ? suite : "/dashboard");
    router.refresh();
  };

  return (
    <div className="animate-fade-up opacity-0">
      <div className="lg:hidden flex items-center gap-2 mb-10">
        <div className="w-9 h-9 rounded-lg bg-accent text-white flex items-center justify-center font-display font-bold text-lg shadow-warm-md">iz</div>
        <span className="font-display font-bold text-xl tracking-tight text-ink">Izifacture</span>
      </div>

      <h1 className="font-display font-bold text-3xl md:text-4xl text-ink tracking-tight">Bon retour</h1>
      <p className="text-sm text-muted mt-2">Connectez-vous pour retrouver vos factures et vos clients.</p>

      <form onSubmit={submit} noValidate className="mt-8 space-y-4">
        {errors.form && (
          <div role="alert" className="text-sm text-danger bg-danger-soft rounded-xl px-4 py-3 space-y-2">
            <p>{errors.form}</p>
            {unconfirmed && (
              resent === "sent" ? (
                <p className="flex items-center gap-2 text-success font-medium">
                  <MailCheck size={16} aria-hidden="true" /> Nouvel e-mail envoyé : ouvrez le lien, depuis n&apos;importe quel appareil.
                </p>
              ) : (
                <button type="button" onClick={resend} disabled={resent === "sending"} className="group font-semibold text-accent disabled:opacity-50">
                  <span className="link-underline">{resent === "sending" ? "Envoi…" : "Renvoyer l'e-mail de confirmation"}</span>
                </button>
              )
            )}
          </div>
        )}
        <Input id="login-email" type="email" label="E-mail" autoComplete="email" placeholder="vous@entreprise.ci" value={email} error={errors.email} onChange={(e) => setEmail(e.target.value)} autoFocus />
        <div className="space-y-1.5">
          <PasswordInput id="login-password" label="Mot de passe" autoComplete="current-password" value={password} error={errors.password} onChange={(e) => setPassword(e.target.value)} />
          <div className="text-right">
            <Link href="/mot-de-passe-oublie" className="group text-sm font-medium text-accent">
              <span className="link-underline">Mot de passe oublié ?</span>
            </Link>
          </div>
        </div>
        <Button type="submit" size="lg" className="w-full" isLoading={loading}>
          <LogIn size={18} aria-hidden="true" /> Se connecter
        </Button>
      </form>

      <p className="text-sm text-muted text-center mt-8">
        Pas encore de compte ?{" "}
        <Link href="/inscription" className="group font-medium text-accent">
          <span className="link-underline">Créer un compte</span>
        </Link>
      </p>
    </div>
  );
}

export default function ConnexionPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
