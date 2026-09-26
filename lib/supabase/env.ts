/** Variables publiques Supabase (à définir dans .env.local en local, et dans Vercel › Settings › Environment Variables). */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
export const hasSupabaseEnv = Boolean(SUPABASE_URL && SUPABASE_KEY);
export const MISSING_ENV_MESSAGE =
  "Configuration manquante : définissez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (Vercel › Settings › Environment Variables), puis redéployez.";
