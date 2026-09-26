"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

/**
 * Arrivée depuis un lien e-mail (confirmation d'inscription ou mot de passe oublié).
 * Supabase place la session dans le fragment de l'URL (#access_token=…) : on l'enregistre
 * dans les cookies puis on redirige vers ?next= (tableau de bord ou nouveau mot de passe).
 */
export default function AuthSessionPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const query = new URLSearchParams(window.location.search);
    const next = query.get("next") ?? "/dashboard";
    const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

    const errCode = hash.get("error_code") ?? query.get("error_code");
    if (errCode) {
      setError(
        errCode === "otp_expired"
          ? "Ce lien a expiré ou a déjà été utilisé."
          : "Ce lien n'est pas valide."
      );
      return;
    }
    const access_token = hash.get("access_token");
    const refresh_token = hash.get("refresh_token");
    if (!access_token || !refresh_token) {
      setError("Ce lien n'est pas valide.");
      return;
    }
    createClient()
      .auth.setSession({ access_token, refresh_token })
      .then(({ error: e }) => {
        if (e) {
          setError("Ce lien a expiré ou a déjà été utilisé.");
          return;
        }
        // Efface le jeton de la barre d'adresse avant de quitter la page.
        window.history.replaceState(null, "", window.location.pathname);
        router.replace(safeNext);
        router.refresh();
      });
  }, [router]);

  return (
    <div className="min-h-dvh flex items-center justify-center bg-bg px-4">
      {error ? (
        <div className="w-full max-w-md text-center animate-fade-up opacity-0">
          <div className="w-16 h-16 mx-auto rounded-full bg-danger-soft text-danger flex items-center justify-center">
            <AlertCircle size={28} aria-hidden="true" />
          </div>
          <h1 className="font-display font-bold text-3xl text-ink tracking-tight mt-6">{error}</h1>
          <p className="text-sm text-muted mt-3">
            Si vous venez de confirmer votre adresse, vous pouvez simplement vous connecter. Sinon, demandez un nouveau lien.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 mt-8">
            <Link href="/connexion" tabIndex={-1}>
              <Button className="w-full">Se connecter</Button>
            </Link>
            <Link href="/mot-de-passe-oublie" tabIndex={-1}>
              <Button variant="secondary" className="w-full">Nouveau lien</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md space-y-4" aria-busy="true" aria-label="Connexion en cours">
          <Skeleton className="w-48 h-9 rounded-xl mx-auto" />
          <Skeleton className="w-full h-4 rounded-full" />
          <Skeleton className="w-2/3 h-4 rounded-full mx-auto" />
        </div>
      )}
    </div>
  );
}
