-- Payout and bank-account safety constraints.
alter table public.payout_requests
  drop constraint if exists payout_requests_amount_bounds,
  add constraint payout_requests_amount_bounds
    check (amount_kobo between 500000 and 20000000);

create unique index if not exists one_open_payout_per_seller
  on public.payout_requests(seller_id)
  where status in ('pending', 'processing');

create or replace function public.create_payout_request(
  p_seller_id uuid,
  p_bank_account_id uuid,
  p_amount_kobo bigint
)
returns public.payout_requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile public.profiles;
  v_account public.bank_accounts;
  v_available bigint;
  v_payout public.payout_requests;
begin
  select * into v_profile from public.profiles where id = p_seller_id;
  if v_profile.id is null
    or v_profile.role <> 'student'
    or v_profile.account_status <> 'active'
    or v_profile.verification_status <> 'verified' then
    raise exception 'Seller is not eligible for payouts';
  end if;

  if p_amount_kobo < 500000 or p_amount_kobo > 20000000 then
    raise exception 'Payout amount is outside allowed bounds';
  end if;

  select * into v_account from public.bank_accounts
  where id = p_bank_account_id and student_id = p_seller_id;
  if v_account.id is null then raise exception 'Bank account not found'; end if;

  select coalesce(sum(amount_kobo), 0) into v_available
  from public.transactions
  where seller_id = p_seller_id and status = 'released';

  select v_available - coalesce(sum(amount_kobo), 0) into v_available
  from public.payout_requests
  where seller_id = p_seller_id and status in ('pending', 'processing', 'paid');

  if v_available < p_amount_kobo then raise exception 'Insufficient available balance'; end if;

  insert into public.payout_requests(seller_id, bank_account_id, amount_kobo, status)
  values(p_seller_id, p_bank_account_id, p_amount_kobo, 'pending')
  returning * into v_payout;

  return v_payout;
end;
$$;

revoke all on function public.create_payout_request(uuid, uuid, bigint)
  from public, anon, authenticated;
grant execute on function public.create_payout_request(uuid, uuid, bigint)
  to service_role;
