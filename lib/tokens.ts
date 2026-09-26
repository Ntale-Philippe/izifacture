/**
 * IZIFACTURE — DESIGN TOKENS (source unique de vérité)
 *
 * Toute valeur visuelle vient d'ici. tailwind.config.ts importe ce fichier :
 * les classes Tailwind (bg-accent, shadow-warm-md…) et les couleurs utilisées
 * dans les SVG (graphiques) restent donc toujours synchronisées.
 *
 * Règle : aucun code hexadécimal ailleurs que dans ce fichier.
 * Voir DESIGN_SYSTEM.md pour l'usage de chaque token.
 */

/* ─── Couleurs ────────────────────────────────────────────────────────── */

export const colors = {
  // Surfaces
  bg: { DEFAULT: "#FFFBF5", soft: "#FEFDFB" }, // fond de page (crème chaud)
  card: { DEFAULT: "#FFFFFF", soft: "#FFFFFF" }, // surface des cartes
  hover: { DEFAULT: "#FFF7ED", soft: "#FFFAF5" }, // survol de ligne / d'élément
  line: { DEFAULT: "#FDE8CD", soft: "#FEF4E6" }, // bordures 1px / pistes de jauge
  // Texte
  ink: { DEFAULT: "#1C1917", soft: "#292524" }, // texte principal + surface sombre (bandeau)
  muted: { DEFAULT: "#78716C", soft: "#A8A29E" }, // texte secondaire / icônes inactives
  // Marque
  accent: { DEFAULT: "#EA580C", soft: "#FFEDD5", light: "#FDBA74", warm: "#F59E0B" }, // orange terre
  // Sémantique (jamais utilisées comme accent décoratif)
  success: { DEFAULT: "#16A34A", soft: "#DCFCE7" },
  warning: { DEFAULT: "#CA8A04", soft: "#FEF3C7" },
  danger: { DEFAULT: "#DC2626", soft: "#FEE2E2" },
} as const;

/** Couleurs des canaux d'encaissement — exception assumée : ce sont les
 *  couleurs de reconnaissance des marques, réservées aux graphiques/légendes. */
export const channelColors: Record<string, string> = {
  "Wave": "#1DC3E8",
  "Orange Money": "#EA580C",
  "MTN MoMo": "#E5B800",
  "Virement Bancaire": "#57534E",
  "Espèces": "#16A34A",
};

/** Palette des monogrammes clients : teintes de textiles d'Afrique de l'Ouest
 *  (terre, ocre, indigo adire, kola, forêt). Utilisée uniquement par ClientLogo. */
export const clientPalette = ["#EA580C", "#B45309", "#15803D", "#1E3A8A", "#9F1239", "#0F766E", "#7C2D12", "#CA8A04"];

/* ─── Élévation ───────────────────────────────────────────────────────── */

export const shadows = {
  "warm-sm": "0 1px 2px 0 rgba(234, 88, 12, 0.05)", // repos : cartes, inputs
  "warm-md": "0 4px 6px -1px rgba(234, 88, 12, 0.1), 0 2px 4px -1px rgba(234, 88, 12, 0.06)", // survol, bouton primaire
  "warm-lg": "0 10px 15px -3px rgba(234, 88, 12, 0.1), 0 4px 6px -2px rgba(234, 88, 12, 0.05)", // flottant : modal, tiroir, barre d'action
} as const;

/* ─── Rayons ──────────────────────────────────────────────────────────── */

export const radius = {
  lg: "8px", // petits contrôles internes ≤ 36px (onglets, boutons-icônes de ligne)
  xl: "12px", // contrôles : bouton, input, select, textarea
  "2xl": "16px", // conteneurs : carte, modal, bandeau, barre d'action, nav
  // full : pastilles, badges, avatars, points, switches, jauges
} as const;

/* ─── Typographie ─────────────────────────────────────────────────────── */

export const fonts = {
  display: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"], // titres
  sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"], // corps
  mono: ["var(--font-space-mono)", "ui-monospace", "monospace"], // montants, n°, dates
} as const;

/* ─── Mouvement ───────────────────────────────────────────────────────── */

export const motion = {
  ease: "cubic-bezier(0.25, 0.46, 0.45, 0.94)", // easing par défaut (boutons, liens, graphiques)
  easeDrawer: "cubic-bezier(0.32, 0.72, 0, 1)", // tiroirs / panneaux qui glissent
  duration: { fast: 200, base: 300, count: 1200 }, // ms — compteurs : 1200
  stagger: { text: 0.08, block: 0.05 }, // s — décalage entre éléments révélés
} as const;
