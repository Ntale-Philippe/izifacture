/** Messages d'erreur Supabase Auth traduits pour l'utilisateur. */
export function authErrorMessage(message: string | undefined): string {
  const m = message ?? "";
  if (/Invalid login credentials/i.test(m)) return "E-mail ou mot de passe incorrect.";
  if (/Email not confirmed/i.test(m)) return "Confirmez d'abord votre adresse : ouvrez le lien reçu par e-mail.";
  if (/User already registered|already been registered/i.test(m)) return "Un compte existe déjà avec cet e-mail. Connectez-vous.";
  if (/Password should be at least/i.test(m)) return "Le mot de passe doit contenir au moins 8 caractères.";
  // Limite du service d'e-mail gratuit de Supabase : 2 e-mails par heure pour tout le projet (sans SMTP personnalisé).
  if (/email rate limit|over_email_send_rate_limit/i.test(m)) return "Limite d'envoi d'e-mails atteinte pour le moment. Réessayez dans une heure.";
  if (/rate limit|too many|For security purposes/i.test(m)) return "Trop de tentatives. Patientez une minute puis réessayez.";
  if (/Unable to validate email|invalid format/i.test(m)) return "Adresse e-mail invalide.";
  if (/same.*password|different from the old/i.test(m)) return "Choisissez un mot de passe différent de l'ancien.";
  if (/Failed to fetch|NetworkError/i.test(m)) return "Connexion impossible. Vérifiez votre accès à internet.";
  return "Une erreur est survenue. Réessayez.";
}

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
