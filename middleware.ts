import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Pages accessibles sans être connecté.
const PUBLIC_PATHS = ["/connexion", "/inscription", "/mot-de-passe-oublie", "/auth"];

/**
 * Rafraîchit la session Supabase à chaque requête et protège l'application :
 * non connecté → /connexion ; déjà connecté sur une page d'accès → /dashboard.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // Ne rien exécuter entre createServerClient et getUser (recommandation Supabase).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPublic = PUBLIC_PATHS.some((p) => path === p || path.startsWith(p + "/"));

  const redirect = (to: string) => {
    const url = request.nextUrl.clone();
    url.pathname = to;
    url.search = to === "/connexion" && path !== "/" ? `?suite=${encodeURIComponent(path + request.nextUrl.search)}` : "";
    const res = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => res.cookies.set(c));
    return res;
  };

  if (!user && !isPublic) return redirect("/connexion");
  if (user && isPublic && !path.startsWith("/auth")) return redirect("/dashboard");
  return response;
}

export const config = {
  // Tout sauf les fichiers statiques et les images.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
