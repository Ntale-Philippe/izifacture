# Izifacture — instructions pour les agents IA

Ce fichier s'adresse à tout agent de code (Antigravity, Gemini, Codex, Cursor…). Les règles sont identiques à celles de `CLAUDE.md`.

**Avant toute création ou modification d'interface, lire et appliquer [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md).**
Il est la source de vérité validée par le propriétaire du projet et prime sur tout autre choix esthétique.

Résumé non négociable :

- Réutiliser `components/ui/*`. Ne jamais recréer un bouton, un champ, un badge, une carte ou un titre à la main.
- Utiliser uniquement les tokens de `lib/tokens.ts`. Pas de hex, pas de `bg-blue-500`, pas de `rounded-md`,
  pas de `shadow-lg`, pas de texte sous 12px.
- Montants : `formatFCFA()` / `<CountUp>` en `font-mono`. Dates : `formatDate()`. Interface en français, au vouvoiement.
- Chaque page : `space-y-6`, `PageHeader`, skeleton à la forme du contenu, état vide, animation en cascade,
  toast après action, erreurs de formulaire inline.
- Mobile d'abord (375px) : tableaux → cartes, bottom-nav, zones tactiles ≥ 44px.

**Terminé = `npm run check:design` sans violation + `npm run build:check` qui passe + checklist du §16 de DESIGN_SYSTEM.md cochée.**

**Backend Supabase :** lire [SUPABASE.md](SUPABASE.md) avant de toucher aux données. Toute modification de la base passe par
un nouveau fichier dans `supabase/migrations/` (appliqué via le MCP Supabase ou `scripts/apply-migrations.mjs`), les pages
n'appellent jamais Supabase directement (`useAppData()` uniquement), et la section « État d'avancement » de SUPABASE.md est
mise à jour à la fin de chaque session.
