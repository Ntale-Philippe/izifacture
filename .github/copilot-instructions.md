# Izifacture — instructions pour GitHub Copilot

Avant de générer ou de modifier une interface, appliquer [DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md), la règle validée du projet.

- Réutiliser `components/ui/*` (Button, Input, Select, Textarea, Card, CardHeader, PageHeader, StatusBadge, TrendBadge,
  Skeleton, EmptyState, Modal, useToast, CountUp, ClientLogo). Ne jamais les recréer à la main.
- Tokens de `lib/tokens.ts` uniquement : aucun hex, aucune palette Tailwind par défaut (`bg-blue-500`…),
  rayons `rounded-lg|xl|2xl|full`, ombres `shadow-warm-sm|md|lg`, texte ≥ 12px (`text-xs`).
- Montants : `formatFCFA()` / `<CountUp>` en `font-mono`. Dates : `formatDate()`. Interface en français, au vouvoiement.
- Chaque page : `<div className="space-y-6">`, `PageHeader`, skeleton, état vide, `animate-fade-up`, toast après action.
- Vérifier avec `npm run check:design` (0 violation) puis `npm run build:check`.
