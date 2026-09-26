# Izifacture — Design System « Afrique Premium »

> **Ce document est la loi.** Toute page, tout composant, toute modification d'UI dans ce projet
> suit ces règles, sans exception non justifiée. Il a été extrait du Dashboard, de la liste des
> Factures et de l'écran « Nouvelle facture » : ce sont les références vivantes.
>
> - **Tokens (valeurs)** : [`lib/tokens.ts`](lib/tokens.ts), la source unique, importée par Tailwind.
> - **Catalogue vivant** : page `/design-system` de l'application.
> - **Garde-fou automatique** : `npm run check:design` (exécuté avant chaque `npm run build`).
>
> Ordre de priorité en cas de doute : **1. ce document → 2. un composant existant → 3. les écrans de référence.**
> Si rien ne répond, prendre la décision la plus sobre, l'ajouter ici, puis coder.

---

## Sommaire

1. [Identité](#1-identité)
2. [Couleurs](#2-couleurs)
3. [Typographie](#3-typographie)
4. [Espacement et layout](#4-espacement-et-layout)
5. [Rayons](#5-rayons)
6. [Élévation et texture](#6-élévation-et-texture)
7. [Mouvement](#7-mouvement)
8. [Iconographie](#8-iconographie)
9. [États et feedback](#9-états-et-feedback)
10. [Contenu et formats](#10-contenu-et-formats)
11. [Composants](#11-composants)
12. [Patterns de page](#12-patterns-de-page)
13. [Responsive](#13-responsive)
14. [Accessibilité](#14-accessibilité)
15. [Ajouter quelque chose de nouveau](#15-ajouter-quelque-chose-de-nouveau)
16. [Checklist « Definition of Done »](#16-checklist--definition-of-done)

---

## 1. Identité

**Izifacture** est un outil de facturation pour les entrepreneurs d'Afrique francophone
(zone UEMOA/CEMAC). L'interface doit donner l'impression d'un **bureau chaleureux et bien tenu** :
professionnel sans être froid, local sans être folklorique.

| Principe | Concrètement |
|---|---|
| **Chaleur maîtrisée** | Fond crème, un seul accent orange terre, ombres teintées d'orange. Jamais de gris froid. |
| **Le chiffre d'abord** | Montants en police mono, alignés à droite, toujours en FCFA. L'utilisateur scanne des sommes. |
| **L'état se lit d'un coup d'œil** | Un statut = une pastille colorée avec un point. La couleur porte le sens, le texte le confirme. |
| **Local par le contenu, pas par l'ornement** | Mobile Money, NINU/RCCM, TVA 18 % UEMOA, noms de clients réalistes. Le motif kente reste discret (3 à 5 % d'opacité). |
| **Chaque interaction répond** | Survol, pression, chargement, succès : toujours un retour visuel, jamais un écran figé. |

---

## 2. Couleurs

Toutes les couleurs viennent de `lib/tokens.ts` → classes Tailwind. **Aucun hexadécimal en dur** dans
`app/` ou `components/`. Dans un SVG, importer `colors` depuis `@/lib/tokens`.

### 2.1 Surfaces et texte

| Token | Hex | Classe | Usage **exclusif** |
|---|---|---|---|
| `bg` | `#FFFBF5` | `bg-bg` | Fond de page, fond des inputs, en-tête de tableau |
| `card` | `#FFFFFF` | `bg-card` | Cartes, modals, sidebar, barre de nav |
| `hover` | `#FFF7ED` | `bg-hover` | Survol de ligne, d'item de menu, de bouton ghost |
| `line` | `#FDE8CD` | `border-line` | Toutes les bordures 1px et séparateurs (`divide-line`) |
| `line-soft` | `#FEF4E6` | `bg-line-soft` | Pistes de jauge, compteurs d'onglets, badge Brouillon |
| `ink` | `#1C1917` | `text-ink` / `bg-ink` | Texte principal ; **seule** surface sombre autorisée (bandeau d'accueil) |
| `muted` | `#78716C` | `text-muted` | Texte secondaire, labels de colonnes, icônes inactives |
| `muted-soft` | `#A8A29E` | `bg-muted-soft` | Point du statut Brouillon, segment de graphique neutre |

### 2.2 Accent (orange terre)

| Token | Hex | Usage |
|---|---|---|
| `accent` | `#EA580C` | Bouton primaire, lien, élément actif, focus, courbe de graphique |
| `accent/10` · `accent/15` | — | Fond d'item actif (sidebar, bottom-nav), fond d'icône de StatCard |
| `accent/20` | — | Anneau de focus (`ring-accent/20`), halo du point de graphique |
| `accent-soft` | `#FFEDD5` | Réservé aux fonds d'accent pleins très clairs |
| `accent-light` | `#FDBA74` | **Uniquement** du texte d'emphase sur la surface sombre `bg-ink` |
| `accent-warm` | `#F59E0B` | **Uniquement** l'extrémité d'un dégradé de jauge `from-accent to-accent-warm` |

**Règle des 10 % :** l'accent occupe au plus environ 10 % d'un écran. Un seul bouton `primary` par zone visible.

### 2.3 Sémantique (état), jamais décorative

| Sens | Plein | Pastel | Utilisé pour |
|---|---|---|---|
| Succès / Payée | `success` `#16A34A` | `success-soft` | Payée, tendance favorable, toast de succès |
| Attention / En attente | `warning` `#CA8A04` | `warning-soft` | En attente, échéance proche |
| Erreur / En retard | `danger` `#DC2626` | `danger-soft` | En retard, erreurs de formulaire, suppression |
| Neutre / Brouillon | `muted-soft` | `line-soft` | Brouillon |

- Le mapping statut → couleur vit dans `lib/status.ts` (`statusMeta`). **Ne jamais le redéfinir.**
- Une tendance a deux axes indépendants : la flèche dit hausse/baisse, la couleur dit bon/mauvais
  (`<TrendBadge goodWhenDown>` pour les retards et les impayés).

### 2.4 Palettes spécialisées (exceptions encadrées)

- `channelColors` : couleurs de reconnaissance de Wave, Orange Money, MTN MoMo, Virement et Espèces.
  **Uniquement** dans les graphiques et légendes de canaux de paiement.
- `clientPalette` : teintes textiles (terre, ocre, indigo adire, kola, forêt). **Uniquement** dans `<ClientLogo>`.

### 2.5 Interdits

- ❌ Palette Tailwind par défaut (`bg-blue-500`, `text-gray-600`…).
- ❌ Hex arbitraire (`text-[#…]`, `style={{ color: "#…" }}`).
- ❌ Noir pur `#000` ou blanc pur comme fond de page.
- ❌ Dégradés décoratifs (violet-bleu, arc-en-ciel). Seul dégradé autorisé : jauge `accent → accent-warm`,
  voile de graphique `accent → transparent`, et fondus de bord `from-card to-transparent`.
- ❌ Mode sombre : **non supporté pour l'instant**. Ne pas ajouter de variantes `dark:`.

---

## 3. Typographie

| Rôle | Police | Classe | Réglages |
|---|---|---|---|
| Titres | Plus Jakarta Sans | `font-display` | `font-bold`, tracking serré (-0.02em H1/H2, -0.01em H3, appliqué en global) |
| Corps / UI | DM Sans | `font-sans` (défaut) | line-height 1.65 (global) |
| Données | Space Mono | `font-mono` | Montants, n° de facture, dates, pourcentages, compteurs, quantités |

### 3.1 Échelle, la seule autorisée

| Niveau | Classes | Où |
|---|---|---|
| Titre de page (H1) | `font-display font-bold text-3xl md:text-4xl tracking-tight` | `<PageHeader>` |
| Titre de bandeau | `font-display font-bold text-2xl md:text-4xl tracking-tight` | Bandeau du Dashboard |
| Fil d'Ariane (page courante) | `font-display font-bold text-lg md:text-xl` | `<Header>` |
| Titre de carte (H3) | `font-display font-bold text-ink` (16px) | `<CardHeader>` |
| Titre d'état vide | `font-display font-bold text-lg` | `<EmptyState>` |
| Chiffre héros | `font-mono font-bold text-5xl tracking-tight` | Un seul par carte (ex. taux de paiement) |
| Valeur de stat | `font-mono font-bold text-2xl tracking-tight` + suffixe `text-sm text-muted` « FCFA » | `<StatCard>`, graphique |
| Corps | `text-sm` (14px) ou `text-base` | Paragraphes, cellules, inputs |
| Description | `text-sm text-muted` | Sous un titre |
| Label de champ | `text-sm font-medium text-ink` | Au-dessus de chaque input |
| En-tête de colonne | `text-xs font-medium uppercase tracking-wider text-muted` | `<thead>` |
| Méta / légende | `text-xs text-muted` | Dates secondaires, e-mails, labels de mini-stats |

**Règles :**
- **Minimum absolu : `text-xs` (12px).** Jamais de `text-[11px]` ni de `text-[10px]`.
- Pas de taille arbitraire (`text-[15px]`) : choisir le niveau le plus proche de l'échelle.
- Tout nombre que l'on compare ou additionne passe en `font-mono`.
- `font-semibold` : pastilles, noms de clients, items actifs. `font-bold` : titres et montants.
  `font-medium` : labels, liens, boutons.
- Titres de plus d'une ligne : ajouter `text-balance`.

---

## 4. Espacement et layout

### 4.1 Grille de 8px

- **Entre blocs (cartes, sections)** : `gap-6` / `space-y-6` (24px). **Toujours.** Jamais `gap-8` ni `gap-4` entre cartes.
- **Padding de carte** : `p-6` (24px). Sous-zones internes (barre de recherche, pied de tableau) : `p-4` et `px-6 py-4`.
- **Cellules de tableau** : `px-6 py-4` (corps), `px-6 py-3` ou `py-4` (en-tête).
- **À l'intérieur d'un composant** (icône ↔ texte, pastille) : micro-espacements `gap-1` à `gap-3`, `px-2 py-1`… autorisés.
- **Titre → description** : `mt-1`. **Header de carte → contenu** : `mt-4` à `mt-6`.

### 4.2 Structure de l'application (`<AppShell>`, ne pas recréer)

```
┌──────────┬─────────────────────────────────────────┐
│ Sidebar  │ Header sticky h-16 (fil d'Ariane, actions)│
│ 264px    ├─────────────────────────────────────────┤
│ (≥ lg)   │ <main> p-4 md:p-6 lg:p-8                 │
│          │   conteneur max-w-[1320px] mx-auto       │
│          │     page = <div className="space-y-6">   │
└──────────┴─────────────────────────────────────────┘
 Mobile (< md) : bottom-nav fixe + tiroir via le hamburger
```

- Une nouvelle page = un dossier dans `app/(app)/`. Elle hérite automatiquement du shell.
- La racine d'une page est **toujours** `<div className="space-y-6">`.
- Ajouter la route au fil d'Ariane (`components/layout/Header.tsx`) et, si c'est une section principale,
  à la sidebar **et** à la bottom-nav (5 entrées maximum sur mobile).

### 4.3 Grilles standard

| Contenu | Classes |
|---|---|
| 4 cartes de stats | `grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6` |
| 3 cartes d'analyse | `grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6` (la 3ᵉ : `md:col-span-2 xl:col-span-1`) |
| Tableau + panneau | `grid grid-cols-1 xl:grid-cols-3 gap-6` (tableau `xl:col-span-2`) |
| Formulaire + résumé | `grid grid-cols-1 lg:grid-cols-12 gap-6 items-start` (8 / 4, résumé `lg:sticky lg:top-6`) |
| Champs dans une carte | `grid grid-cols-1 md:grid-cols-2 gap-4` |

On passe à 4 colonnes seulement à partir de `xl` : Space Mono est large, un montant à 8 chiffres doit tenir sans déborder.

---

## 5. Rayons

| Classe | Valeur | Réservé à |
|---|---|---|
| `rounded-2xl` | 16px | **Conteneurs** : carte, modal, bandeau, barre d'action, état vide, bottom-nav (`rounded-t-2xl`) |
| `rounded-xl` | 12px | **Contrôles** : bouton, input, select, textarea, groupe d'onglets, switch de paiement |
| `rounded-lg` | 8px | **Petits éléments internes ≤ 36px** : onglet actif, bouton-icône de ligne, `<kbd>`, logo de sidebar |
| `rounded-full` | ∞ | Pastilles de statut/tendance, avatars, points, switches, jauges, lignes de skeleton, FAB |

- ❌ `rounded`, `rounded-sm`, `rounded-md`, `rounded-3xl`.
- Règle de l'imbrication : un élément dans un conteneur a un rayon **inférieur ou égal** à celui du conteneur.

---

## 6. Élévation et texture

| Niveau | Classe | Usage |
|---|---|---|
| 0, à plat | bordure `border-line` seule | Zones internes, lignes de tableau |
| 1, repos | `shadow-warm-sm` | **Toute** carte (déjà dans `<Card>`), input, bouton secondaire |
| 2, survol | `shadow-warm-md` | Carte `hoverable` survolée, bouton primaire |
| 3, flottant | `shadow-warm-lg` | Modal, tiroir, barre d'action collante, bottom-nav, FAB, toast |

- Les ombres sont **teintées orange** (rgba(234,88,12,…)). ❌ `shadow-sm/md/lg/xl`, ❌ `shadow-[…]`.
- **Texture** : `.noise-overlay` global à 4 % (déjà dans `app/layout.tsx`, ne pas dupliquer).
- **Motif kente** : `.kente-pattern` sur fond clair (logo de la sidebar), `.kente-pattern-light` sur `bg-ink`.
  Toujours derrière un voile ou à ≤ 5 % d'opacité. Un seul motif par écran visible.
- **Verre** (`backdrop-blur`) : uniquement les éléments collants ou flottants au-dessus du contenu
  (header `bg-bg/80`, barre d'action `bg-card/85`, bottom-nav `bg-card/95`, fond de modal ou de tiroir).

---

## 7. Mouvement

Easing de marque : `cubic-bezier(0.25, 0.46, 0.45, 0.94)` → classe `ease-brand`.
Tiroirs et panneaux : `cubic-bezier(0.32, 0.72, 0, 1)` → `ease-drawer`.

| Élément | Comportement exact |
|---|---|
| **Apparition de page** | Chaque bloc : `animate-fade-up opacity-0` + `style={{ animationDelay: "Xs" }}`. X = 0 pour l'en-tête, puis **0.1 + 0.05 × index**, plafonné à 0.6s. |
| **Compteurs** | Toute valeur clé (stat, total) passe par `<CountUp>` (1.2s, easeOutExpo, depuis la valeur précédente). |
| **Bouton** | `hover:scale-[1.02]`, `active:scale-[0.98]`, 200ms `ease-brand` ; primaire : reflet `<span>` qui glisse (intégré à `<Button>`). |
| **Carte cliquable** | `<Card hoverable>` : `-translate-y-0.5` + `shadow-warm-md`, 200ms ease-out. |
| **Lien** | Soulignement animé : envelopper le texte dans `<span className="link-underline">`. |
| **Ligne de tableau** | `hover:bg-hover transition-colors`. |
| **Icône interactive** | Petite rotation ou scale au survol (cloche `rotate-12`, icône de StatCard `scale-110 -rotate-6`, flèche `translate-x-0.5`). |
| **Switch** | Pastille en `motion.span layout` avec ressort (stiffness 600, damping 30). |
| **Onglets** | Indicateur actif partagé `motion.div layoutId`, ressort (bounce 0.2). |
| **Modal** | Fond qui s'éclaircit en fondu, boîte `scale 0.95 → 1` + `y 10 → 0` (intégré à `<Modal>`). |
| **Tiroir mobile** | `translate-x` en CSS, 300ms `ease-drawer`, **toujours monté** (fermé = `invisible pointer-events-none`). |
| **Graphiques** | Courbes : `.chart-reveal` (révélation gauche → droite). Jauges et barres : transition de `width` 1000ms depuis 0. Donut : `dasharray` animé. |
| **Toast** | Glisse depuis la droite, en haut à droite, disparaît après 4s (intégré à `useToast`). |

- `prefers-reduced-motion` est géré globalement : ne pas le contourner.
- ❌ Animation en boucle décorative (sauf le shimmer des skeletons). ❌ Durées de plus de 1.4s.
- ❌ `AnimatePresence` pour une couche plein écran qui capte les clics (risque de couche fantôme) :
  préférer une transition CSS sur un élément toujours monté.

---

## 8. Iconographie

- **Seule bibliothèque : `lucide-react`.**
- Tailles : **16** (dans un lien ou une pastille), **18** (dans un bouton), **20** (navigation, en-tête, actions de ligne), **22–24** (bottom-nav, StatCard), **26–28** (FAB, état vide).
- Couleur : hérite du texte (`currentColor`). Inactif `text-muted`, actif `text-accent`.
- Icône dans un cercle (StatCard) : `w-12 h-12 rounded-full bg-accent/10 text-accent`.
- Icône décorative : `aria-hidden="true"`. **Bouton icône seul : `aria-label` obligatoire** (en français).
- ❌ Emoji dans l'interface.

---

## 9. États et feedback

### 9.1 Quatre états pour tout élément interactif

| État | Traitement |
|---|---|
| Défaut | Style de base |
| Survol | Changement de fond ou de bordure, ou lévitation (§7) |
| Pressé | `active:scale-[0.98]` (boutons) ou `active:bg-hover` (items tactiles) |
| Désactivé | `opacity-50 cursor-not-allowed`, aucun effet de survol (déjà dans `<Button>`) |
| Focus clavier | Contour global `outline accent` ; inputs : `focus:ring-2 focus:ring-accent/20 focus:border-accent/50` |

### 9.2 Chargement

- **Toujours un `<Skeleton>` à la forme exacte du contenu** : mêmes cartes, mêmes lignes, mêmes cercles.
  Lignes de texte : `h-3`/`h-4 rounded-full`. Avatars : `rounded-full`. Blocs : rayon du conteneur.
- Le skeleton s'affiche tant que `hydrated` (store) est faux ; pendant une action, le bouton passe en `isLoading`.
- ❌ Spinner pour du contenu. Seule exception : `<Button isLoading>` pendant une action.

### 9.3 Retour d'action

- Succès ou erreur d'une action → `toast("Facture envoyée avec succès", "success")`.
  Types : `success`, `error`, `info`. Message = ce qui s'est passé, au participe passé.
- Action destructrice → `<Modal>` de confirmation (Annuler en `ghost` + action en `danger`).
- ❌ `alert()`, `confirm()`, `prompt()`.

### 9.4 Formulaires

- Label **au-dessus** de chaque champ (prop `label`), jamais un placeholder seul.
  Exception : colonnes répétées (lignes d'articles), avec des en-têtes de colonnes visibles + `aria-label`.
- Erreurs **inline, sous le champ** (prop `error`), en rouge, message court et actionnable :
  « Sélectionnez un client », « Prix requis ». L'erreur disparaît dès que l'utilisateur corrige.
- Validation à la soumission, puis effacement au fil de la frappe. Un toast `error` résume.
- Un brouillon peut être incomplet ; un envoi exige tous les champs.

### 9.5 États vides

`<EmptyState icon title description action>` : titre encourageant (« Pas encore de clients enregistrés »),
une phrase qui dit quoi faire, un CTA primaire. Jamais une zone blanche ni un simple « Aucune donnée ».

---

## 10. Contenu et formats

| Donnée | Règle | Outil |
|---|---|---|
| Montant | `1 250 000 FCFA`, espace fine, pas de décimales | `formatFCFA()` ; animé : `<CountUp>` |
| Nombre | `1 250 000` | `formatNumber()` |
| Date | `26 sept. 2026` | `formatDate()` |
| Date longue (bandeau) | `Samedi 26 septembre 2026` | `Intl.DateTimeFormat("fr-FR", { weekday: "long", … })` |
| N° de facture | `INV-2026-025` en `font-mono` | — |
| Pourcentage | `43%` en `font-mono` ; variation `+12%` / `−5%` ; points `+6 pts` | `<TrendBadge>` |
| TVA | 18 % (standard UEMOA), 9 %, 0 % | — |
| Identifiants | NINU, RCCM | — |

- ❌ `toLocaleString()` ou `Intl.NumberFormat` ad hoc dans les composants.
- **Langue** : français, vouvoiement. Majuscule seulement au premier mot (« Nouvelle facture », pas « Nouvelle Facture »).
- **Ton** : direct et actif. Un bouton dit ce qu'il fait (« Envoyer la facture », « Marquer payée »).
  Une erreur dit quoi corriger, sans s'excuser.
- **Données de démonstration** : noms, villes et montants réalistes d'Afrique francophone. ❌ Lorem ipsum, ❌ « John Doe ».

---

## 11. Composants

**Règle d'or : si un composant existe, on l'utilise. On ne recrée jamais un bouton, un badge ou un input à la main.**

| Besoin | Composant | API | Ne jamais |
|---|---|---|---|
| Action | `Button` (`components/ui/Button.tsx`) | `variant`: `primary` (1 par zone) · `secondary` · `ghost` · `danger` ; `size`: `sm` · `md` · `lg` ; `isLoading` | Styler un `<button>` d'action à la main |
| Saisie | `Input`, `Select`, `Textarea` | `label`, `error` + props natives | Input sans label, erreur dans une alerte globale |
| Conteneur | `Card` | `hoverable` si cliquable ; padding par `className` (`p-6`) | Ajouter une autre ombre ou un autre rayon |
| Titre de carte | `CardHeader` | `title`, `description?`, `action?` | Écrire un `<h3>` de carte à la main |
| Titre de page | `PageHeader` | `title`, `description?`, `actions?` | Composer un H1 à la main |
| Statut de facture | `StatusBadge` | `status` | Recolorer un statut localement |
| Variation | `TrendBadge` | `value`, `unit?` (`"%"`, `" pts"`), `goodWhenDown?` | Pastille verte ou rouge faite main |
| Indicateur clé | `StatCard` (`components/dashboard`) | `title`, `value`, `format?`, `trend`, `icon`, `delay`, `goodWhenDown?` | — |
| Chiffre animé | `CountUp` | `value`, `format?` (FCFA par défaut) | — |
| Logo client | `ClientLogo` | `name` | Image ou avatar générique |
| Chargement | `Skeleton` | `className` (taille + rayon) | Spinner |
| Vide | `EmptyState` | `title`, `description`, `icon?`, `action?` | — |
| Confirmation / aperçu | `Modal` | `isOpen`, `onClose`, `title?`, `className?` | `confirm()` |
| Feedback | `useToast()` | `toast(message, "success" \| "error" \| "info")` | `alert()` |
| Interrupteur | `Switch` | `checked`, `onChange`, `label`, `description?` | Case à cocher ou switch fait main |

**Composants métier** (réutiliser, ne pas dupliquer) :

| Besoin | Composant | Utilisé par |
|---|---|---|
| Document de facture A4 | `components/invoices/InvoicePreview` | Création (miniature + modal), fiche facture |
| Créer / modifier un client | `components/clients/ClientFormModal` | Clients, fiche client, Nouvelle facture |
| Chiffres d'un client | `statsFor()` dans `lib/clientStats.ts` | Clients, fiche client |

**Données : une seule source.** Les pages lisent et écrivent **uniquement** via `useAppData()` (`lib/store.tsx`,
branché sur Supabase — voir [SUPABASE.md](SUPABASE.md)) : factures, clients, paramètres et leurs actions
(`createInvoice`, `markInvoicePaid`, `createClient`, `updateSettings`…). Les actions sont **asynchrones** :
`try { await action(); toast("…", "success"); } catch {}` (le store affiche lui-même le toast d'erreur).
❌ Ne jamais appeler Supabase depuis une page. ❌ Ne jamais importer `seedInvoices` / `seedClients` dans une page.
Tant que `hydrated` est faux, afficher le skeleton.
Totaux : `computeTotals()` · numéro : `nextInvoiceNumber` · statut en retard : automatique (`effectiveStatus`).

**Liens logiques (à conserver) :** une facture (ligne, carte, dashboard) → `/factures/[id]` ; un client → `/clients/[id]` ;
« Nouvelle facture » depuis un client → `/factures/nouvelle?client=ID` ; modifier / dupliquer → `/factures/nouvelle?edit=ID` ;
filtres par URL : `/factures?statut=…`, `?q=…`, `?client=…` ; l'émetteur et les valeurs par défaut viennent de `/parametres`.

**Patterns récurrents (à copier depuis les écrans de référence) :**

- **Tableau** : `thead` en `bg-bg` + en-têtes de colonnes (§3) ; `tbody divide-y divide-line` ; lignes `hover:bg-hover` ;
  texte à gauche, **montants à droite**, **statuts au centre**. Actions de ligne : boutons-icônes `p-1.5 rounded-lg`,
  visibles au survol **et** au focus (`group-hover:opacity-100 group-focus-within:opacity-100`).
  Pagination en pied de tableau. → `app/(app)/factures/page.tsx`
- **Tableau sur mobile** : sous `md`, remplacé par des cartes : logo + nom + badge en haut, puis 3 mini-stats
  (label `text-xs text-muted`, valeur `font-mono`). → même fichier
- **Onglets filtres** : groupe `bg-card p-1 rounded-xl border`, compteur par onglet en pastille `font-mono`.
- **Barre d'action collante** (formulaires) : `sticky bottom-24 md:bottom-6 z-20 bg-card/85 backdrop-blur-xl rounded-2xl shadow-warm-lg`,
  identifiant à gauche, `secondary` + `primary` à droite, total visible sur mobile. → `factures/nouvelle`
- **Switch** : `role="switch"` + `aria-checked`, piste `w-9 h-5 rounded-full`, pastille à ressort. → `factures/nouvelle`
- **Graphique** : couleurs via `colors` de `lib/tokens`, grille pointillée `line`, point final mis en avant,
  valeur survolée affichée au-dessus en `font-mono`. → `components/dashboard/RevenueChart.tsx`

### Échelle de z-index

`z-20` barre d'action · `z-30` header · `z-40` sidebar desktop · `z-50` bottom-nav · `z-[60]` tiroir mobile ·
`z-[100]`/`z-[110]` modal · `z-[120]` toasts. Ne pas inventer d'autres valeurs.

---

## 12. Patterns de page

### 12.1 Page de liste (modèle : Factures)

```tsx
"use client";
export default function XPage() {
  const isLoading = useFakeLoad(700);
  if (isLoading) return <XSkeleton />;              // même structure que la page chargée
  return (
    <div className="space-y-6">
      <PageHeader title="…" description="…" actions={<Button>…</Button>} />
      {/* onglets de statut + recherche */}
      <Card className="animate-fade-up opacity-0" style={{ animationDelay: "0.1s" }}>
        {/* tableau ≥ md · cartes < md · pagination · EmptyState si 0 résultat */}
      </Card>
    </div>
  );
}
```

### 12.2 Page de formulaire (modèle : Nouvelle facture)

- `PageHeader` + lien retour (`ArrowLeft`, `text-sm text-muted hover:text-ink`).
- Grille 12 colonnes : cartes de sections à gauche (8), résumé sticky + aperçu à droite (4).
- Chaque section = une `Card p-6` avec `CardHeader`.
- Barre d'action collante en bas. Validation inline. Toast puis redirection après succès.

### 12.3 Tableau de bord (modèle : Dashboard)

Bandeau `bg-ink` avec kente et halo d'accent (résumé en une phrase + 2 actions max) → 4 `StatCard` →
grille d'analyse (3 cartes) → tableau récent + graphique. Le résumé passe avant le détail.

---

## 13. Responsive

| Point de rupture | Changement |
|---|---|
| < `md` (768px) | Bottom-nav visible ; tableaux → cartes ; `main` en `pb-32` ; barre d'action à `bottom-24` |
| `md` → `lg` | Bottom-nav masquée ; sidebar encore en tiroir (hamburger) |
| ≥ `lg` (1024px) | Sidebar fixe de 264px ; résumé de formulaire collant |
| ≥ `xl` (1280px) | Stats sur 4 colonnes ; analyses sur 3 colonnes |

- Conception **mobile d'abord** ; tester à 375px, 768px, 1024px et 1440px.
- Zones tactiles d'au moins **44 × 44px** sur mobile.
- Hauteur de l'app en `h-dvh` ; barres fixes en bas avec `pb-[max(…,env(safe-area-inset-bottom))]`.
- ❌ Défilement horizontal de la page. Seuls les tableaux défilent dans leur propre `overflow-x-auto`.

---

## 14. Accessibilité

- `lang="fr"` ; hiérarchie de titres respectée (un seul H1 par page, celui de `PageHeader` ou du header).
- Tout bouton sans texte a un `aria-label` en français ; les icônes décoratives ont `aria-hidden="true"`.
- Navigation : `aria-current="page"` sur l'item actif ; tiroir : `role="dialog" aria-modal`, fermeture avec Échap.
- Contraste : texte courant en `ink` ou `muted` sur `bg`/`card`. Ne jamais mettre `muted-soft` sur du texte courant.
- La couleur n'est jamais le seul signal : un statut a toujours son texte, une tendance sa flèche et son signe.

---

## 15. Ajouter quelque chose de nouveau

1. **Chercher d'abord** dans `components/ui` et sur la page `/design-system`. Réutiliser ou étendre par une prop.
2. Nouveau composant réutilisable → `components/ui/`, construit **uniquement** avec les tokens.
   L'ajouter au tableau du §11 **et** à la page `/design-system`.
3. Nouvelle valeur (couleur, ombre…) → justifier, l'ajouter dans `lib/tokens.ts` puis documenter ici.
   Jamais de valeur locale « juste pour cet écran ».
4. Exception inévitable (ex. contrainte d'une librairie) → commentaire `// design-ok: <raison>` sur la ligne ou
   la ligne du dessus. Le garde-fou l'accepte ; la raison doit être défendable.

---

## 16. Checklist « Definition of Done »

Une UI n'est terminée que si **toutes** les cases sont cochées :

- [ ] `npm run build:check` passe, ce qui inclut `check:design` : 0 violation.
- [ ] Seuls les composants du §11 sont utilisés pour les boutons, champs, badges, titres, cartes et états vides.
- [ ] Couleurs, rayons et ombres respectent les §2, §5 et §6 (aucune valeur arbitraire).
- [ ] Montants en `formatFCFA`/`CountUp` et en `font-mono`, alignés à droite dans les tableaux.
- [ ] Skeleton à la forme du contenu pendant le chargement ; état vide soigné ; toast après chaque action.
- [ ] Erreurs de formulaire inline sous chaque champ.
- [ ] Apparition en cascade (`animate-fade-up` + délais §7) ; survol et pression sur tout élément interactif.
- [ ] Vérifié à 375px (bottom-nav, cartes, aucun débordement) et à 1440px.
- [ ] `aria-label` sur les boutons-icônes, focus visible, textes en français au vouvoiement.
- [ ] Si un nouveau composant ou token a été créé : ajouté au §11 ou au §2 **et** à `/design-system`.
