-- ════════════════════════════════════════════════════════════════════
-- Izifacture · 002 · Sécurité (Row Level Security)
-- Chaque utilisateur ne voit et ne modifie que ses propres lignes.
-- La clé publique du navigateur ne donne accès à rien d'autre.
-- ════════════════════════════════════════════════════════════════════

alter table public.profiles      enable row level security;
alter table public.clients       enable row level security;
alter table public.invoices      enable row level security;
alter table public.invoice_items enable row level security;

-- Profil : lecture et mise à jour de sa propre ligne (création par le trigger d'inscription)
create policy "profil : lecture" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy "profil : mise à jour" on public.profiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- Clients
create policy "clients : propriétaire" on public.clients
  for all to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

-- Factures : le client référencé doit aussi appartenir à l'utilisateur
create policy "factures : propriétaire" on public.invoices
  for all to authenticated
  using ((select auth.uid()) = owner_id)
  with check (
    (select auth.uid()) = owner_id
    and exists (select 1 from public.clients c where c.id = client_id and c.owner_id = (select auth.uid()))
  );

-- Lignes : la facture parente doit appartenir à l'utilisateur
create policy "lignes : propriétaire" on public.invoice_items
  for all to authenticated
  using ((select auth.uid()) = owner_id)
  with check (
    (select auth.uid()) = owner_id
    and exists (select 1 from public.invoices i where i.id = invoice_id and i.owner_id = (select auth.uid()))
  );
