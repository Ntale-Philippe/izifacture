-- ════════════════════════════════════════════════════════════════════
-- Izifacture · 003 · Fonctions métier (appelées via supabase.rpc)
-- security invoker : elles s'exécutent avec les droits de l'utilisateur,
-- donc les règles RLS s'appliquent aussi à l'intérieur.
-- ════════════════════════════════════════════════════════════════════

-- Total TTC d'une liste de lignes [{quantity, price}] : remise sur le HT, puis TVA.
-- Doit rester identique à computeTotals() dans lib/invoice.ts.
create or replace function public.compute_invoice_amount(p_items jsonb, p_discount numeric, p_tax_rate numeric)
returns bigint language sql immutable set search_path = '' as $$
  with t as (
    select coalesce(sum((i ->> 'quantity')::bigint * (i ->> 'price')::bigint), 0)::numeric as subtotal
    from jsonb_array_elements(coalesce(p_items, '[]'::jsonb)) as i
  ), d as (
    select subtotal, round(subtotal * p_discount / 100) as discount_amount from t
  )
  select ((subtotal - discount_amount) + round((subtotal - discount_amount) * p_tax_rate / 100))::bigint from d;
$$;

-- Réserve le prochain numéro de facture de l'utilisateur (verrou de ligne : pas de doublon).
create or replace function public.allocate_invoice_number()
returns text language plpgsql security invoker set search_path = '' as $$
declare
  v_prefix text;
  v_n integer;
begin
  update public.profiles
     set next_invoice_number = next_invoice_number + 1
   where id = auth.uid()
  returning invoice_prefix, next_invoice_number - 1 into v_prefix, v_n;
  if v_n is null then
    raise exception 'Profil introuvable pour cet utilisateur';
  end if;
  return v_prefix || '-' || extract(year from current_date)::int || '-' || lpad(v_n::text, 3, '0');
end $$;

-- Crée (p_id null) ou met à jour une facture et remplace ses lignes, en une transaction.
-- Le montant est toujours recalculé côté serveur.
create or replace function public.save_invoice(
  p_id               uuid,
  p_client_id        uuid,
  p_date             date,
  p_due_date         date,
  p_status           text,
  p_discount         numeric,
  p_tax_rate         numeric,
  p_notes            text,
  p_accepted_methods text[],
  p_items            jsonb
)
returns public.invoices language plpgsql security invoker set search_path = '' as $$
declare
  v_invoice public.invoices;
  v_amount bigint := public.compute_invoice_amount(p_items, p_discount, p_tax_rate);
begin
  if p_id is null then
    insert into public.invoices (client_id, number, date, due_date, status, discount, tax_rate, notes, accepted_methods, amount)
    values (p_client_id, public.allocate_invoice_number(), p_date, p_due_date, p_status, p_discount, p_tax_rate, p_notes, p_accepted_methods, v_amount)
    returning * into v_invoice;
  else
    update public.invoices
       set client_id = p_client_id, date = p_date, due_date = p_due_date, status = p_status,
           discount = p_discount, tax_rate = p_tax_rate, notes = p_notes,
           accepted_methods = p_accepted_methods, amount = v_amount
     where id = p_id
    returning * into v_invoice;
    if v_invoice.id is null then
      raise exception 'Facture introuvable';
    end if;
    delete from public.invoice_items where invoice_id = p_id;
  end if;

  insert into public.invoice_items (invoice_id, position, description, quantity, price)
  select v_invoice.id, (ord - 1)::int, coalesce(i ->> 'description', ''), coalesce((i ->> 'quantity')::int, 1), coalesce((i ->> 'price')::bigint, 0)
  from jsonb_array_elements(coalesce(p_items, '[]'::jsonb)) with ordinality as x(i, ord);

  return v_invoice;
end $$;

-- Copie une facture en brouillon daté d'aujourd'hui, avec un nouveau numéro.
create or replace function public.duplicate_invoice(p_id uuid)
returns public.invoices language plpgsql security invoker set search_path = '' as $$
declare
  v_src public.invoices;
  v_new public.invoices;
begin
  select * into v_src from public.invoices where id = p_id;
  if v_src.id is null then
    raise exception 'Facture introuvable';
  end if;

  insert into public.invoices (client_id, number, date, due_date, status, discount, tax_rate, notes, accepted_methods, amount)
  values (v_src.client_id, public.allocate_invoice_number(), current_date, current_date, 'Brouillon',
          v_src.discount, v_src.tax_rate, v_src.notes, v_src.accepted_methods, v_src.amount)
  returning * into v_new;

  insert into public.invoice_items (invoice_id, position, description, quantity, price)
  select v_new.id, position, description, quantity, price from public.invoice_items where invoice_id = p_id;

  return v_new;
end $$;

-- Efface toutes les factures et tous les clients de l'utilisateur (le profil est conservé).
create or replace function public.reset_my_data()
returns void language plpgsql security invoker set search_path = '' as $$
begin
  delete from public.invoices where owner_id = auth.uid();
  delete from public.clients where owner_id = auth.uid();
  update public.profiles set next_invoice_number = 1 where id = auth.uid();
end $$;

-- Seuls les utilisateurs connectés peuvent appeler ces fonctions.
revoke execute on function public.allocate_invoice_number() from public, anon;
revoke execute on function public.save_invoice(uuid, uuid, date, date, text, numeric, numeric, text, text[], jsonb) from public, anon;
revoke execute on function public.duplicate_invoice(uuid) from public, anon;
revoke execute on function public.reset_my_data() from public, anon;
grant execute on function public.allocate_invoice_number() to authenticated;
grant execute on function public.save_invoice(uuid, uuid, date, date, text, numeric, numeric, text, text[], jsonb) to authenticated;
grant execute on function public.duplicate_invoice(uuid) to authenticated;
grant execute on function public.reset_my_data() to authenticated;
grant execute on function public.compute_invoice_amount(jsonb, numeric, numeric) to authenticated;
