-- Trusted checkout and payment settlement primitives.
alter table public.transactions
  add column if not exists provider text not null default 'paystack' check (provider = 'paystack'),
  add column if not exists provider_transaction_id bigint,
  add column if not exists authorization_url text,
  add column if not exists payment_initialized_at timestamptz;

create unique index if not exists transactions_provider_transaction_id_idx
  on public.transactions(provider_transaction_id) where provider_transaction_id is not null;
create unique index if not exists one_open_transaction_per_listing
  on public.transactions(listing_id)
  where status in ('pending_payment', 'paid_held', 'release_pending', 'disputed');

drop policy if exists "verified students create listings" on public.listings;
create policy "verified students create safe listings" on public.listings for insert
  with check (seller_id = auth.uid() and status in ('draft', 'active') and public.is_verified_active_student());

create or replace function public.create_checkout_transaction(p_listing_id uuid, p_buyer_id uuid, p_payment_reference text)
returns public.transactions language plpgsql security definer set search_path = '' as $$
declare v_listing public.listings; v_buyer public.profiles; v_transaction public.transactions;
begin
  select * into v_buyer from public.profiles where id = p_buyer_id;
  if v_buyer.id is null or v_buyer.role <> 'student' or v_buyer.account_status <> 'active'
    or v_buyer.verification_status <> 'verified' then raise exception 'Buyer is not eligible to checkout'; end if;
  select * into v_listing from public.listings where id = p_listing_id for update;
  if v_listing.id is null or v_listing.status <> 'active' then raise exception 'Listing is not available'; end if;
  if v_listing.seller_id = p_buyer_id then raise exception 'Seller cannot buy own listing'; end if;
  update public.listings set status = 'reserved' where id = v_listing.id;
  insert into public.transactions(listing_id,buyer_id,seller_id,amount_kobo,currency,status,payment_reference)
  values(v_listing.id,p_buyer_id,v_listing.seller_id,v_listing.price_kobo,'NGN','pending_payment',p_payment_reference)
  returning * into v_transaction;
  return v_transaction;
end; $$;
revoke all on function public.create_checkout_transaction(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.create_checkout_transaction(uuid, uuid, text) to service_role;

create or replace function public.mark_transaction_paid(p_transaction_id uuid,p_payment_reference text,p_provider_transaction_id bigint)
returns boolean language plpgsql security definer set search_path = '' as $$
declare v_transaction public.transactions;
begin
  select * into v_transaction from public.transactions where id=p_transaction_id for update;
  if v_transaction.id is null or v_transaction.payment_reference<>p_payment_reference then return false; end if;
  if v_transaction.status='paid_held' then return true; end if;
  if v_transaction.status<>'pending_payment' then return false; end if;
  update public.transactions set status='paid_held',provider_transaction_id=p_provider_transaction_id,paid_at=now() where id=v_transaction.id;
  return true;
end; $$;
revoke all on function public.mark_transaction_paid(uuid, text, bigint) from public, anon, authenticated;
grant execute on function public.mark_transaction_paid(uuid, text, bigint) to service_role;

create or replace function public.cancel_pending_transaction(p_transaction_id uuid,p_buyer_id uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
declare v_transaction public.transactions;
begin
  select * into v_transaction from public.transactions where id=p_transaction_id for update;
  if v_transaction.id is null or v_transaction.buyer_id<>p_buyer_id or v_transaction.status<>'pending_payment' then return false; end if;
  update public.transactions set status='cancelled',cancelled_at=now() where id=v_transaction.id;
  update public.listings set status='active' where id=v_transaction.listing_id and status='reserved';
  return true;
end; $$;
revoke all on function public.cancel_pending_transaction(uuid, uuid) from public, anon, authenticated;
grant execute on function public.cancel_pending_transaction(uuid, uuid) to service_role;
