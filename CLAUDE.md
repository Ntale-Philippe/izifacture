# Izifacture — instructions projet

SaaS de facturation pour l'Afrique francophone (FCFA, Mobile Money, TVA UEMOA).
Stack : Next.js 14 (App Router) · TypeScript · Tailwind 3 · Framer Motion · lucide-react. Données fictives dans `lib/data.ts`.

## Règle n°1 : le design system est obligatoire

Avant de créer ou de modifier **la moindre UI**, lire [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) et s'y conformer.
Il prime sur toute préférence esthétique, tout preset et toute habitude. Il a été validé par le propriétaire du projet.

Non négociable :

1. **Réutiliser** les composants de `components/ui/` (Button, Input, Select, Textarea, Card, CardHeader, PageHeader,
   StatusBadge, TrendBadge, Skeleton, EmptyState, Modal, useToast, CountUp, ClientLogo). Ne jamais les recréer à la main.
2. **Tokens uniquement** (`lib/tokens.ts` → classes Tailwind) : pas de hex, pas de palette Tailwind par défaut,
   rayons `lg`/`xl`/`2xl`/`full`, ombres `shadow-warm-sm|md|lg`, texte de 12px minimum.
3. **Montants** : `formatFCFA()` / `<CountUp>`, en `font-mono`, alignés à droite. Dates : `formatDate()`.
4. **Chaque page** : racine `<div className="space-y-6">`, `PageHeader`, skeleton à la forme du contenu,
   état vide, apparition en cascade (`animate-fade-up opacity-0` + délai 0.1 + 0.05 × index), toast après action.
5. **Mobile d'abord** : tableaux → cartes sous `md`, zones tactiles ≥ 44px, vérifier à 375px.
6. **Tout en français**, vouvoiement, majuscule au premier mot seulement.

## Vérification obligatoire avant de dire « terminé »

```bash
npm run check:design   # 0 violation exigée (aussi lancé par npm run build)
npm run build:check   # build de vérification (dossier .next-check, n'interrompt pas npm run dev)
```

Puis parcourir la checklist du §16 de DESIGN_SYSTEM.md. Un nouveau composant ou token doit être
ajouté à DESIGN_SYSTEM.md **et** à la page `/design-system`.

## Backend Supabase

Données, authentification et sécurité : lire [SUPABASE.md](SUPABASE.md) avant toute modification du backend.
Schéma = migrations dans `supabase/migrations/` (jamais de modification à la main) ; les pages passent uniquement
par `useAppData()`. Antigravity peut prendre le relais : tenir à jour la section « État d'avancement » de SUPABASE.md.

## Garde-fou automatique (Claude Code)

Un hook `PostToolUse` (`.claude/settings.json`) exécute `check-design.mjs --hook` après chaque Edit/Write
sur `app/`, `components/` ou `lib/`. Si des violations remontent, les corriger immédiatement avant toute autre action.

## Commandes

- `npm run dev` : serveur local (http://localhost:3000 ; sur téléphone : `npx next dev -H 0.0.0.0`).
- `npm run check:design` : garde-fou du design system.
- `npm run build:check` : garde-fou + build de vérification dans `.next-check`. **À utiliser pour vérifier** : ne casse jamais un `npm run dev` en cours.
- `npm run build` : build de production (écrit dans `.next`). Ne jamais le lancer pendant qu'un `npm run dev` tourne.

## Règlement complet (chargé automatiquement à chaque session)

@DESIGN_SYSTEM.md
