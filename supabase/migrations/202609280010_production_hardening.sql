-- Production safety corrections for dispute and payout workflows.

-- A buyer-favoring dispute decision is an authorization to refund, not proof that
-- Paystack has completed a refund. Keep funds protected until provider confirmation.
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

  update public.disputes
  set status = p_outcome,
      resolution_note = trim(p_resolution_note),
      resolved_by = p_admin_id,
      resolved_at = now()
  where id = v_dispute.id;

  update public.transactions
  set status = case
        when p_outcome = 'resolved_seller' then 'release_pending'
        else status
      end,
      release_requested_at = case
        when p_outcome = 'resolved_seller' then now()
        else release_requested_at
      end
  where id = v_dispute.transaction_id and status = 'disputed';

  insert into public.audit_logs(actor_id, action, subject_type, subject_id, metadata)
  values(
    p_admin_id,
    'dispute.resolved',
    'dispute',
    v_dispute.id::text,
    jsonb_build_object(
      'outcome', p_outcome,
      'transaction_id', v_dispute.transaction_id,
      'refund_required', p_outcome = 'resolved_buyer'
    )
  );

  return true;
end;
$$;

revoke all on function public.resolve_transaction_dispute(uuid, uuid, public.dispute_status, text)
  from public, anon, authenticated;
grant execute on function public.resolve_transaction_dispute(uuid, uuid, public.dispute_status, text)
  to service_role;

-- Prevent duplicate payout accounts for the same student/bank/last-four tuple.
create unique index if not exists unique_student_bank_account
  on public.bank_accounts(student_id, bank_code, account_number_last4);
