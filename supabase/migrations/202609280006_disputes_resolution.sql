-- Trusted dispute opening, evidence, release requests, and admin resolution.

revoke insert on public.dispute_evidence from authenticated;
drop policy if exists "dispute parties add evidence" on public.dispute_evidence;

create or replace function public.open_transaction_dispute(
  p_transaction_id uuid,
  p_actor_id uuid,
  p_reason text
)
returns public.disputes
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_transaction public.transactions;
  v_dispute public.disputes;
begin
  if char_length(trim(p_reason)) < 10 or char_length(trim(p_reason)) > 2000 then
    raise exception 'Invalid dispute reason';
  end if;

  select * into v_transaction
  from public.transactions
  where id = p_transaction_id
  for update;

  if v_transaction.id is null
    or p_actor_id not in (v_transaction.buyer_id, v_transaction.seller_id)
    or v_transaction.status not in ('paid_held', 'release_pending') then
    raise exception 'Transaction cannot be disputed';
  end if;

  update public.transactions set status = 'disputed'
  where id = v_transaction.id;

  insert into public.disputes(transaction_id, opened_by, reason, status)
  values(v_transaction.id, p_actor_id, trim(p_reason), 'open')
  returning * into v_dispute;

  return v_dispute;
end;
$$;

revoke all on function public.open_transaction_dispute(uuid, uuid, text)
  from public, anon, authenticated;
grant execute on function public.open_transaction_dispute(uuid, uuid, text)
  to service_role;

create or replace function public.request_transaction_release(
  p_transaction_id uuid,
  p_buyer_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.transactions
  set status = 'release_pending', release_requested_at = now()
  where id = p_transaction_id
    and buyer_id = p_buyer_id
    and status = 'paid_held';

  return found;
end;
$$;

revoke all on function public.request_transaction_release(uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.request_transaction_release(uuid, uuid)
  to service_role;

create or replace function public.resolve_transaction_dispute(
  p_dispute_id uuid,
  p_admin_id uuid,
  p_outcome public.dispute_status,
  p_resolution_note text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_dispute public.disputes;
  v_admin public.profiles;
  v_next_status public.transaction_status;
begin
  select * into v_admin from public.profiles
  where id = p_admin_id and role = 'admin' and account_status = 'active';
  if v_admin.id is null then raise exception 'Admin authorization required'; end if;

  if p_outcome not in ('resolved_buyer', 'resolved_seller') then
    raise exception 'Invalid dispute outcome';
  end if;
  if char_length(trim(p_resolution_note)) < 5 then
    raise exception 'Resolution note required';
  end if;

  select * into v_dispute from public.disputes
  where id = p_dispute_id for update;
  if v_dispute.id is null or v_dispute.status not in ('open', 'under_review') then
    return false;
  end if;

  v_next_status := case when p_outcome = 'resolved_buyer' then 'refunded' else 'release_pending' end;

  update public.disputes
  set status = p_outcome, resolution_note = trim(p_resolution_note),
      resolved_by = p_admin_id, resolved_at = now()
  where id = v_dispute.id;

  update public.transactions
  set status = v_next_status,
      refunded_at = case when v_next_status = 'refunded' then now() else refunded_at end,
      release_requested_at = case when v_next_status = 'release_pending' then now() else release_requested_at end
  where id = v_dispute.transaction_id and status = 'disputed';

  insert into public.audit_logs(actor_id, action, subject_type, subject_id, metadata)
  values(
    p_admin_id,
    'dispute.resolved',
    'dispute',
    v_dispute.id::text,
    jsonb_build_object('outcome', p_outcome, 'transaction_id', v_dispute.transaction_id)
  );

  return true;
end;
$$;

revoke all on function public.resolve_transaction_dispute(uuid, uuid, public.dispute_status, text)
  from public, anon, authenticated;
grant execute on function public.resolve_transaction_dispute(uuid, uuid, public.dispute_status, text)
  to service_role;
