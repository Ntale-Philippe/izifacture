-- ════════════════════════════════════════════════════════════════════
-- Izifacture · 001 · Schéma
-- Un compte = un utilisateur Supabase Auth. Toutes les lignes portent owner_id.
-- ════════════════════════════════════════════════════════════════════

-- ─── Profil : identité + paramètres de l'entreprise (1 ligne par utilisateur)
create table public.profiles (
  id                  uuid primary key references auth.users (id) on delete cascade,
  first_name          text not null default '',
  last_name           text not null default '',
  company_name        text not null default '',
  company_ninu        text not null default '',
  company_rccm        text not null default '',
  company_address     text not null default '',
  company_city        text not null default '',
  company_country     text not null default 'Côte d''Ivoire',
  company_phone       text not null default '',
  company_email       text not null default '',
  invoice_prefix      text not null default 'INV' check (invoice_prefix ~ '^[A-Z0-9]{1,6}$'),
  next_invoice_number integer not null default 1 check (next_invoice_number > 0),
  default_due_days    integer not null default 15 check (default_due_days between 0 and 365),
  default_tax_rate    numeric(5,2) not null default 18 check (default_tax_rate between 0 and 100),
  default_notes       text not null default 'Merci pour votre confiance.',
  enabled_methods     text[] not null default array['Orange Money', 'Wave', 'Virement Bancaire'],
  orange_money        text not null default '',
  mtn_momo            text not null default '',
  wave                text not null default '',
  iban                text not null default '',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ─── Clients
create table public.clients (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name         text not null check (length(trim(name)) > 0),
  email        text not null default '',
  phone        text not null default '',
  contact_name text not null default '',
  address      text not null default '',
  city         text not null default '',
  country      text not null default '',
  ninu         text not null default '',
  created_at   timestamptz not null default now()
);
create index clients_owner_idx on public.clients (owner_id);

-- ─── Factures
create table public.invoices (
  id               uuid primary key default gen_random_uuid(),
  owner_id         uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- restrict : on ne supprime pas un client qui a des factures (cohérence comptable)
  client_id        uuid not null references public.clients (id) on delete restrict,
  number           text not null,
  date             date not null default current_date,
  due_date         date not null default current_date,
  status           text not null default 'Brouillon' check (status in ('Payée', 'En attente', 'En retard', 'Brouillon')),
  discount         numeric(5,2) not null default 0 check (discount between 0 and 100),
  tax_rate         numeric(5,2) not null default 18 check (tax_rate between 0 and 100),
  notes            text not null default '',
  accepted_methods text[] not null default '{}',
  amount           bigint not null default 0, -- total TTC en FCFA, calculé par save_invoice()
  payment_method   text,
  paid_at          date,
  last_reminder_at date,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (owner_id, number)
);
create index invoices_owner_idx on public.invoices (owner_id);
create index invoices_client_idx on public.invoices (client_id);

-- ─── Lignes de facture
create table public.invoice_items (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  invoice_id  uuid not null references public.invoices (id) on delete cascade,
  position    integer not null default 0,
  description text not null default '',
  quantity    integer not null default 1 check (quantity >= 0),
  price       bigint not null default 0 check (price >= 0), -- prix unitaire HT en FCFA
  created_at  timestamptz not null default now()
);
create index invoice_items_invoice_idx on public.invoice_items (invoice_id);
create index invoice_items_owner_idx on public.invoice_items (owner_id);

-- ─── updated_at automatique
create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();
create trigger invoices_touch before update on public.invoices
  for each row execute function public.touch_updated_at();

-- ─── Profil créé automatiquement à l'inscription
-- (le prénom et le nom viennent des métadonnées passées par signUp)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, first_name, last_name, company_name, company_email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    coalesce(new.raw_user_meta_data ->> 'company_name', ''),
    coalesce(new.email, '')
  );
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Fonctions internes : non appelables directement depuis l'API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.touch_updated_at() from public, anon, authenticated;
