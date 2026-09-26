# Izifacture — Backend Supabase

> **Document de relais.** Claude Code et Antigravity travaillent à tour de rôle sur ce projet.
> Avant toute modification du backend, lire ce fichier en entier ; après, mettre à jour la section
> « État d'avancement ». Les règles d'interface restent celles de [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md).

- **Projet** : `Izifacture` · ref `nuhsjznwbaiibnqfwuvv` · région `eu-west-1`
- **Tableau de bord** : https://supabase.com/dashboard/project/nuhsjznwbaiibnqfwuvv
- **URL API** : `https://nuhsjznwbaiibnqfwuvv.supabase.co`

---

## 1. Architecture

```
Navigateur (Next.js 14, composants client)
  └─ useAppData()  ← lib/store.tsx : SEUL point d'accès aux données pour les pages
       └─ @supabase/ssr (lib/supabase/client.ts, clé publique)
            └─ PostgREST + RPC ─→ Postgres (RLS : chaque ligne appartient à auth.uid())
middleware.ts   → rafraîchit la session, protège toutes les pages sauf l'accès
app/auth/callback/route.ts → retour des liens e-mail (confirmation, mot de passe oublié)
```

| Fichier | Rôle |
|---|---|
| `lib/store.tsx` | Charge profil + clients + factures, expose les actions **asynchrones** |
| `lib/supabase/mappers.ts` | **Seul** fichier qui connaît les noms de colonnes (snake_case ⇄ camelCase) + messages d'erreur |
| `lib/supabase/client.ts` · `server.ts` | Clients navigateur / serveur |
| `middleware.ts` | Redirige vers `/connexion` si non connecté, vers `/dashboard` si déjà connecté |
| `app/(auth)/*` | Connexion, inscription, mot de passe oublié, nouveau mot de passe |
| `app/auth/session/page.tsx` | Arrivée des liens e-mail : reprend la session du fragment `#access_token` puis redirige |
| `supabase/migrations/*.sql` | Schéma versionné (source de vérité de la base) |
| `scripts/apply-migrations.mjs` | Applique les migrations en attente au projet distant |
| `lib/data.ts` | Types + jeu de démonstration (utilisé uniquement par `loadDemo()`) |

## 2. Schéma

| Table | Contenu | Remarques |
|---|---|---|
| `profiles` | 1 ligne par utilisateur : identité, entreprise, facturation, moyens de paiement | Créée par le trigger `on_auth_user_created` à partir des métadonnées de `signUp` |
| `clients` | Carnet de clients | `owner_id` = `auth.uid()` par défaut |
| `invoices` | Factures | `unique(owner_id, number)` ; `client_id … on delete restrict` ; `amount` = TTC recalculé par le serveur |
| `invoice_items` | Lignes (`position`, `description`, `quantity`, `price` HT) | Supprimées en cascade avec la facture |

**Fonctions RPC** (security invoker : la RLS s'applique à l'intérieur) :

| Fonction | Usage |
|---|---|
| `save_invoice(p_id, p_client_id, p_date, p_due_date, p_status, p_discount, p_tax_rate, p_notes, p_accepted_methods, p_items)` | Crée (`p_id` null) ou met à jour une facture + remplace ses lignes, en une transaction ; attribue le numéro ; recalcule le montant |
| `duplicate_invoice(p_id)` | Copie en brouillon daté du jour, nouveau numéro |
| `allocate_invoice_number()` | Numéro suivant avec verrou de ligne (pas de doublon, même avec 2 onglets) |
| `compute_invoice_amount(items, discount, tax)` | Total TTC ; **doit rester identique** à `computeTotals()` de `lib/invoice.ts` |
| `reset_my_data()` | Efface factures + clients de l'utilisateur, remet le compteur à 1 |

**Statut « En retard »** : jamais stocké automatiquement. Une facture `En attente` dont l'échéance est passée
s'affiche « En retard » (calcul client : `effectiveStatus()`).

## 3. Sécurité

- RLS activée sur les 4 tables ; règle unique « propriétaire » (`owner_id = auth.uid()`), plus une
  vérification que le client / la facture parente appartient aussi à l'utilisateur.
- Le navigateur n'utilise que la **clé publique** (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` dans `.env.local`).
- ❌ Ne **jamais** mettre la clé secrète (`service_role` / `sb_secret_…`) ni le jeton personnel (`sbp_…`)
  dans le code, dans `.env.local` ou dans un fichier versionné.
- Testé (23 vérifications de bout en bout, le 26/09/2026) : un compte ne peut ni lire, ni créer, ni modifier
  les données d'un autre ; un visiteur anonyme ne lit rien.
- Avertissement connu du conseiller de sécurité : `public.rls_auto_enable()` (fonction créée par Supabase avant
  ce projet, pas par nos migrations) est exécutable par `anon`/`authenticated`. À examiner avant la production.

## 4. Règles de travail (Claude Code **et** Antigravity)

1. **Toute** modification de la base = un **nouveau** fichier `supabase/migrations/AAAAMMJJHHMMSS_nom.sql`.
   Ne jamais modifier une migration déjà appliquée ; ne jamais changer le schéma à la main dans le tableau de bord.
2. Appliquer :
   - Claude Code / terminal : `npm run db:migrate` (`-- --status` pour lister ; jeton lu dans `SUPABASE_ACCESS_TOKEN` ou dans la config MCP d'Antigravity) ;
   - Antigravity : outil MCP `apply_migration` avec le contenu du fichier, **puis** vérifier avec `--status`
     (ou `list_migrations`) que la version est enregistrée ;
   - à défaut : coller le fichier dans Supabase › SQL Editor.
3. Nouvelle colonne ⇒ mettre à jour `lib/supabase/mappers.ts` (types + conversions) et `lib/data.ts` (types).
4. Nouvelle table ⇒ RLS activée **dans la même migration**, avec une règle propriétaire.
5. Les pages n'appellent **jamais** Supabase directement : ajouter une action dans `lib/store.tsx`.
   Les actions affichent elles-mêmes le toast d'erreur puis lèvent l'exception ; côté page :
   `try { await action(); toast("…", "success"); } catch {}`.
6. Après une modification : `npm run check:design`, `npx tsc --noEmit`, `npm run build:check`, puis tester en vrai.

## 5. Configuration du projet Supabase

- **Production** : https://izifacture-one.vercel.app (Vercel, déploiement automatique à chaque push sur `main`).
  Variables Vercel : `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (Production + Preview).
- Auth › URL Configuration : Site URL `https://izifacture-one.vercel.app` ; Redirect URLs `http://localhost:3000/**`,
  `https://izifacture-one.vercel.app/**`, `https://izifacture-git-main-nt13.vercel.app/**`, `https://izifacture-*-nt13.vercel.app/**`.
  Nouveau domaine (ex. nom de domaine personnalisé) ⇒ l'ajouter ici ET dans Supabase.
- **Liens e-mail** : inscription, renvoi et mot de passe oublié utilisent `createEmailAuthClient()` (flux *implicit*) avec
  `redirectTo = /auth/session?next=…`. Le lien marche donc depuis n'importe quel appareil (app Gmail, téléphone).
  Ne pas repasser ces appels sur le client PKCE par défaut : le lien ne fonctionnerait plus que dans le navigateur d'origine.
- **E-mails (SMTP)** : fournisseur prévu Brevo (300 e-mails/jour gratuits, pas de domaine requis). Identifiants dans
  `%USERPROFILE%\.izifacture\smtp.json` (hors du projet, jamais versionné). Configuration en une commande :
  `npm run setup:smtp -- --test vous@exemple.com` → SMTP, expéditeur, limite (60/h) et modèles français
  (`supabase/templates/*.html`, liens `{{ .ConfirmationURL }}`). Sans SMTP : 2 e-mails/heure pour tout le projet et
  modèles non modifiables (erreur 400 de l'API).
- Auth › E-mail : confirmation obligatoire à l'inscription (réglage par défaut). Le service d'e-mail intégré de
  Supabase est limité à quelques envois par heure : configurer un SMTP (Resend, Brevo…) avant la mise en ligne.

## 6. État d'avancement

- [x] Schéma, RLS et fonctions (migrations `20260926120000` → `20260926120200`, appliquées)
- [x] Authentification e-mail + mot de passe, mot de passe oublié, protection des pages
- [x] Store branché sur Supabase (factures, clients, paramètres, démo, remise à zéro)
- [x] Compte vide : parcours « Bien démarrer » + chargement de la démonstration
- [x] Tests de bout en bout (parcours complet + isolation RLS) : 23/23
- [x] Liens e-mail valables sur tout appareil, bouton « Afficher le mot de passe », renvoi de confirmation : 8/8
- [ ] SMTP : script et modèles prêts (`npm run setup:smtp`) — en attente des identifiants Brevo de l'utilisateur
- [ ] Envoi réel des factures et relances par e-mail (Edge Function + Resend), avec PDF
- [ ] Logo de l'entreprise (Supabase Storage) affiché sur les factures
- [x] Déploiement Vercel : https://izifacture-one.vercel.app (variables + Redirect URLs configurées)
- [ ] Examiner l'avertissement `rls_auto_enable` du conseiller de sécurité
