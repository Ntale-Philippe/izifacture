# Izifacture

Facturation simple pour les entrepreneurs d'Afrique francophone : factures en **FCFA**, TVA UEMOA,
encaissement par **Orange Money, MTN MoMo, Wave** ou virement, suivi des retards et relances.

**Stack** : Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion · Supabase (Postgres, Auth, RLS)

## Démarrer

```bash
npm install
cp .env.example .env.local   # puis renseigner l'URL et la clé publique du projet Supabase
npm run dev                  # http://localhost:3000
```

## Scripts

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build:check` | Contrôle du design system + build de vérification (n'interrompt pas `dev`) |
| `npm run check:design` | Garde-fou du design system |
| `npm run db:migrate` | Applique les migrations `supabase/migrations/` au projet Supabase |
| `npm run setup:smtp` | Branche le service d'envoi d'e-mails et installe les modèles en français |

## Documentation

- [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) : règles d'interface (obligatoires pour toute nouvelle page)
- [SUPABASE.md](SUPABASE.md) : backend, schéma, sécurité, état d'avancement
- [AGENTS.md](AGENTS.md) · [CLAUDE.md](CLAUDE.md) : consignes pour les agents IA
