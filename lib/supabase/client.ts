import { createBrowserClient } from "@supabase/ssr";
import { createClient as createBaseClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

/** Client Supabase côté navigateur (clé publique : l'accès est limité par les règles RLS). */
export function createClient() {
  return createBrowserClient(URL, KEY);
}

/**
 * Client réservé aux e-mails d'authentification (inscription, renvoi, mot de passe oublié).
 * Flux « implicit » : le lien reçu par e-mail transporte la session dans l'URL et fonctionne
 * donc depuis n'importe quel navigateur ou appareil (le flux PKCE par défaut exige d'ouvrir
 * le lien dans le navigateur qui a fait la demande). La session est ensuite reprise par
 * app/auth/session/page.tsx.
 */
export function createEmailAuthClient() {
  return createBaseClient(URL, KEY, { auth: { flowType: "implicit", persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
}
