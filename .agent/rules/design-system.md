---
trigger: always_on
description: Design system Izifacture obligatoire pour toute UI
---

# Design system Izifacture (toujours actif)

Avant de créer ou de modifier une interface dans ce projet, lire et appliquer `DESIGN_SYSTEM.md` à la racine.
C'est la source de vérité validée par le propriétaire du projet.

- Réutiliser les composants de `components/ui/`. Ne jamais en recréer l'équivalent.
- Tokens de `lib/tokens.ts` uniquement : aucun hex, aucune palette Tailwind par défaut ;
  rayons `rounded-lg|xl|2xl|full` ; ombres `shadow-warm-sm|md|lg` ; texte ≥ 12px.
- Montants via `formatFCFA()` / `<CountUp>` en `font-mono` ; interface en français, au vouvoiement.
- Chaque page : `space-y-6`, `PageHeader`, skeleton, état vide, cascade `animate-fade-up`, toasts, erreurs inline, mobile d'abord.
- Avant de conclure : `npm run check:design` (0 violation) puis `npm run build:check`, et la checklist du §16 de DESIGN_SYSTEM.md.
