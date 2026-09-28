-- Trusted admin operations for verification, account moderation, and payouts.

create or replace function public.review_student_verification(
  p_verification_id uuid,
  p_admin_id uuid,
  p_status public.verification_status,
  p_rejection_reason text default null
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin public.profiles;
  v_verification public.student_verifications;
begin
  select * into v_admin from public.profiles
  where id = p_admin_id and role = 'admin' and account_status = 'active';
  if v_admin.id is null then raise exception 'Admin authorization required'; end if;

  if p_status not in ('verified', 'rejected') then
    raise exception 'Invalid review status';
  end if;
  if p_status = 'rejected' and char_length(trim(coalesce(p_rejection_reason, ''))) < 5 then
    raise exception 'Rejection reason required';
  end if;

  select * into v_verification
  from public.student_verifications
  where id = p_verification_id and status = 'pending'
  for update;
  if v_verification.id is null then return false; end if;

  update public.student_verifications
  set status = p_status,
      rejection_reason = case when p_status = 'rejected' then trim(p_rejection_reason) else null end,
      reviewed_by = p_admin_id,
      reviewed_at = now()
  where id = v_verification.id;

  update public.profiles
  set verification_status = p_status,
      verified_at = case when p_status = 'verified' then now() else null end
  where id = v_verification.student_id;

  insert into public.audit_logs(actor_id, action, subject_type, subject_id, metadata)
  values(
    p_admin_id,
    'verification.reviewed',
    'student_verification',
    v_verification.id::text,
    jsonb_build_object('status', p_status, 'student_id', v_verification.student_id)
  );

  insert into public.notifications(user_id, type, title, body, metadata)
  values(
    v_verification.student_id,
    'verification_review',
    case when p_status = 'verified' then 'Verification approved' else 'Verification needs attention' end,
    case when p_status = 'verified'
      then 'Your student verification has been approved.'
      else 'Your student verification was rejected. Review the reason and submit again.'
    end,
    jsonb_build_object('status', p_status)
  );

  return true;
end;
$$;

revoke all on function public.review_student_verification(uuid, uuid, public.verification_status, text)
  from public, anon, authenticated;
grant execute on function public.review_student_verification(uuid, uuid, public.verification_status, text)
  to service_role;

create or replace function public.set_account_suspension(
  p_user_id uuid,
  p_admin_id uuid,
  p_suspended boolean,
  p_reason text default null
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin public.profiles;
begin
  select * into v_admin from public.profiles
  where id = p_admin_id and role = 'admin' and account_status = 'active';
  if v_admin.id is null then raise exception 'Admin authorization required'; end if;
  if p_user_id = p_admin_id then raise exception 'Admins cannot suspend themselves'; end if;
  if p_suspended and char_length(trim(coalesce(p_reason, ''))) < 5 then
    raise exception 'Suspension reason required';
  end if;

  update public.profiles
  set account_status = case when p_suspended then 'suspended' else 'active' end,
      suspended_at = case when p_suspended then now() else null end,
      suspension_reason = case when p_suspended then trim(p_reason) else null end
  where id = p_user_id;

  if not found then return false; end if;

  insert into public.audit_logs(actor_id, action, subject_type, subject_id, metadata)
  values(
    p_admin_id,
    case when p_suspended then 'account.suspended' else 'account.reactivated' end,
    'profile',
    p_user_id::text,
    jsonb_build_object('reason', case when p_suspended then trim(p_reason) else null end)
  );

  return true;
end;
$$;

revoke all on function public.set_account_suspension(uuid, uuid, boolean, text)
  from public, anon, authenticated;
grant execute on function public.set_account_suspension(uuid, uuid, boolean, text)
  to service_role;

create or replace function public.update_payout_status(
  p_payout_id uuid,
  p_admin_id uuid,
  p_status public.payout_status,
  p_provider_reference text default null,
  p_failure_reason text default null
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin public.profiles;
  v_payout public.payout_requests;
begin
  select * into v_admin from public.profiles
  where id = p_admin_id and role = 'admin' and account_status = 'active';
  if v_admin.id is null then raise exception 'Admin authorization required'; end if;

  if p_status not in ('processing', 'paid', 'failed', 'cancelled') then
    raise exception 'Invalid payout status';
  end if;
  if p_status = 'paid' and nullif(trim(coalesce(p_provider_reference, '')), '') is null then
    raise exception 'Provider reference required before marking paid';
  end if;
  if p_status = 'failed' and char_length(trim(coalesce(p_failure_reason, ''))) < 3 then
    raise exception 'Failure reason required';
  end if;

  select * into v_payout from public.payout_requests
  where id = p_payout_id for update;
  if v_payout.id is null or v_payout.status not in ('pending', 'processing') then
    return false;
  end if;

  update public.payout_requests
  set status = p_status,
      provider_reference = coalesce(nullif(trim(p_provider_reference), ''), provider_reference),
      failure_reason = case when p_status = 'failed' then trim(p_failure_reason) else null end,
      processed_at = case when p_status in ('paid', 'failed', 'cancelled') then now() else processed_at end
  where id = v_payout.id;

  insert into public.audit_logs(actor_id, action, subject_type, subject_id, metadata)
  values(
    p_admin_id,
    'payout.status_changed',
    'payout_request',
    v_payout.id::text,
    jsonb_build_object('from', v_payout.status, 'to', p_status)
  );

  insert into public.notifications(user_id, type, title, body, metadata)
  values(
    v_payout.seller_id,
    'payout_status',
    'Payout status updated',
    'Your payout request status changed to ' || p_status::text || '.',
    jsonb_build_object('payout_id', v_payout.id, 'status', p_status)
  );

  return true;
end;
$$;

revoke all on function public.update_payout_status(uuid, uuid, public.payout_status, text, text)
  from public, anon, authenticated;
grant execute on function public.update_payout_status(uuid, uuid, public.payout_status, text, text)
  to service_role;
