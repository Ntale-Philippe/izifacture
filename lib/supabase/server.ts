import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Client Supabase côté serveur (route handlers, composants serveur), session lue dans les cookies. */
export function createClient() {
  const cookieStore = cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          /* appelé depuis un composant serveur : le middleware rafraîchit la session */
        }
      },
    },
  });
}
