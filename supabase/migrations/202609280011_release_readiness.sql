-- Release-readiness payment recovery helpers.

create index if not exists pending_payment_initialized_at_idx
  on public.transactions(payment_initialized_at)
  where status = 'pending_payment';

create or replace function public.expire_pending_transactions(
  p_before timestamptz
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  with expired as (
    update public.transactions
    set status = 'cancelled',
        cancelled_at = now()
    where status = 'pending_payment'
      and payment_initialized_at is not null
      and payment_initialized_at < p_before
    returning listing_id
  ),
  released as (
    update public.listings l
    set status = 'active'
    from expired e
    where l.id = e.listing_id and l.status = 'reserved'
    returning l.id
  )
  select count(*) into v_count from expired;

  return v_count;
end;
$$;

revoke all on function public.expire_pending_transactions(timestamptz)
  from public, anon, authenticated;
grant execute on function public.expire_pending_transactions(timestamptz)
  to service_role;
