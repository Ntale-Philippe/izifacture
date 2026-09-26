// Intl rend XOF en « F CFA » ou « XOF » selon la version d'ICU :
// on formate le nombre seul pour un rendu stable « 1 250 000 FCFA ».
const numberFormat = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

export function formatNumber(amount: number): string {
  return numberFormat.format(Math.round(amount));
}

export function formatFCFA(amount: number): string {
  return `${formatNumber(amount)} FCFA`;
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString));
}
