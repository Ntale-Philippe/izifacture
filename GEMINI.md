# Izifacture — instructions pour Gemini / Antigravity

Mêmes règles que [AGENTS.md](AGENTS.md). **Avant toute création ou modification d'interface, lire et appliquer
[DESIGN_SYSTEM.md](DESIGN_SYSTEM.md).** C'est la source de vérité validée par le propriétaire du projet.

Terminé = `npm run check:design` sans violation + `npm run build:check` qui passe + checklist du §16 de DESIGN_SYSTEM.md cochée.

**Backend Supabase :** lire [SUPABASE.md](SUPABASE.md) avant de toucher aux données. Toute modification de la base passe par
un nouveau fichier dans `supabase/migrations/` (appliqué via le MCP Supabase ou `scripts/apply-migrations.mjs`), les pages
n'appellent jamais Supabase directement (`useAppData()` uniquement), et la section « État d'avancement » de SUPABASE.md est
mise à jour à la fin de chaque session.
