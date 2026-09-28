-- Automated fraud scoring, audit events, and admin risk notifications.
-- Risk scores reproduce the legacy Zagamart rules and are capped at 100.

create unique index if not exists one_open_aggregate_fraud_flag_per_user
  on public.fraud_flags(user_id, rule_code)
  where resolved_at is null and rule_code = 'aggregate_risk_score';

create or replace function public.calculate_user_fraud_score(p_user_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_score integer := 0;
  v_kyc_submissions integer;
  v_rejected_kyc integer;
  v_listings_10m integer;
  v_listings_24h integer;
  v_high_value_24h integer;
  v_seller_disputes integer;
  v_seller_sales integer;
  v_cancelled_transactions integer;
begin
  select count(*) into v_kyc_submissions
  from public.student_verifications
  where student_id = p_user_id;

  select count(*) into v_rejected_kyc
  from public.student_verifications
  where student_id = p_user_id and status = 'rejected';

  select count(*) into v_listings_10m
  from public.listings
  where seller_id = p_user_id and created_at >= now() - interval '10 minutes';

  select count(*) into v_listings_24h
  from public.listings
  where seller_id = p_user_id and created_at >= now() - interval '24 hours';

  select count(*) into v_high_value_24h
  from public.listings
  where seller_id = p_user_id
    and price_kobo >= 100000000
    and created_at >= now() - interval '24 hours';

  select count(*) into v_seller_disputes
  from public.disputes d
  join public.transactions t on t.id = d.transaction_id
  where t.seller_id = p_user_id;

  select count(*) into v_seller_sales
  from public.transactions
  where seller_id = p_user_id
    and status in ('paid_held', 'release_pending', 'released', 'disputed', 'refunded');

  select count(*) into v_cancelled_transactions
  from public.transactions
  where (buyer_id = p_user_id or seller_id = p_user_id)
    and status = 'cancelled';

  if v_kyc_submissions >= 3 then v_score := v_score + 20; end if;
  if v_rejected_kyc >= 1 then v_score := v_score + 10; end if;
  if v_listings_10m >= 5 then v_score := v_score + 25; end if;
  if v_listings_24h >= 12 then v_score := v_score + 15; end if;
  if v_seller_disputes >= 3 then v_score := v_score + 30; end if;
  if v_seller_disputes >= 1
    and v_seller_sales > 0
    and (v_seller_disputes::numeric / v_seller_sales::numeric) >= 0.5 then
    v_score := v_score + 20;
  end if;
  if v_cancelled_transactions >= 3 then v_score := v_score + 15; end if;
  if v_high_value_24h >= 3 then v_score := v_score + 10; end if;

  return least(v_score, 100);
end;
$$;

revoke all on function public.calculate_user_fraud_score(uuid)
  from public, anon, authenticated;
grant execute on function public.calculate_user_fraud_score(uuid)
  to service_role;

create or replace function public.evaluate_user_fraud_risk(p_user_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_score integer;
  v_severity public.fraud_severity;
  v_existing public.fraud_flags;
begin
  select public.calculate_user_fraud_score(p_user_id) into v_score;
  v_severity := case
    when v_score >= 60 then 'high'::public.fraud_severity
    when v_score >= 30 then 'medium'::public.fraud_severity
    else 'low'::public.fraud_severity
  end;

  select * into v_existing
  from public.fraud_flags
  where user_id = p_user_id
    and rule_code = 'aggregate_risk_score'
    and resolved_at is null
  for update;

  if v_score >= 30 then
    if v_existing.id is null then
      insert into public.fraud_flags(user_id, rule_code, score, severity, details)
      values(
        p_user_id,
        'aggregate_risk_score',
        v_score,
        v_severity,
        jsonb_build_object('threshold', 30, 'evaluated_at', now())
      );

      insert into public.audit_logs(actor_id, action, subject_type, subject_id, metadata)
      values(
        null,
        'fraud.flag_opened',
        'profile',
        p_user_id::text,
        jsonb_build_object('score', v_score, 'severity', v_severity)
      );

      insert into public.notifications(user_id, type, title, body, metadata)
      select
        p.id,
        'fraud_flag',
        'Fraud review required',
        'A student account crossed the fraud-review threshold.',
        jsonb_build_object('student_id', p_user_id, 'score', v_score)
      from public.profiles p
      where p.role = 'admin' and p.account_status = 'active';
    elsif v_existing.score <> v_score or v_existing.severity <> v_severity then
      update public.fraud_flags
      set score = v_score,
          severity = v_severity,
          details = jsonb_build_object('threshold', 30, 'evaluated_at', now())
      where id = v_existing.id;

      insert into public.audit_logs(actor_id, action, subject_type, subject_id, metadata)
      values(
        null,
        'fraud.flag_updated',
        'fraud_flag',
        v_existing.id::text,
        jsonb_build_object('previous_score', v_existing.score, 'score', v_score, 'severity', v_severity)
      );
    end if;
  elsif v_existing.id is not null then
    update public.fraud_flags
    set score = v_score,
        severity = v_severity,
        resolved_at = now(),
        details = jsonb_build_object('threshold', 30, 'evaluated_at', now(), 'auto_resolved', true)
    where id = v_existing.id;

    insert into public.audit_logs(actor_id, action, subject_type, subject_id, metadata)
    values(
      null,
      'fraud.flag_auto_resolved',
      'fraud_flag',
      v_existing.id::text,
      jsonb_build_object('score', v_score)
    );
  end if;

  return v_score;
end;
$$;

revoke all on function public.evaluate_user_fraud_risk(uuid)
  from public, anon, authenticated;
grant execute on function public.evaluate_user_fraud_risk(uuid)
  to service_role;

create or replace function public.refresh_fraud_risk_from_event()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
begin
  if tg_table_name = 'student_verifications' then
    v_user_id := coalesce(new.student_id, old.student_id);
    perform public.evaluate_user_fraud_risk(v_user_id);
  elsif tg_table_name = 'listings' then
    v_user_id := coalesce(new.seller_id, old.seller_id);
    perform public.evaluate_user_fraud_risk(v_user_id);
  elsif tg_table_name = 'disputes' then
    select seller_id into v_user_id
    from public.transactions
    where id = coalesce(new.transaction_id, old.transaction_id);
    if v_user_id is not null then
      perform public.evaluate_user_fraud_risk(v_user_id);
    end if;
  elsif tg_table_name = 'transactions' then
    perform public.evaluate_user_fraud_risk(coalesce(new.buyer_id, old.buyer_id));
    if coalesce(new.seller_id, old.seller_id) <> coalesce(new.buyer_id, old.buyer_id) then
      perform public.evaluate_user_fraud_risk(coalesce(new.seller_id, old.seller_id));
    end if;
  end if;

  return coalesce(new, old);
end;
$$;

drop trigger if exists fraud_risk_on_verification on public.student_verifications;
create trigger fraud_risk_on_verification
  after insert or update on public.student_verifications
  for each row execute procedure public.refresh_fraud_risk_from_event();

drop trigger if exists fraud_risk_on_listing on public.listings;
create trigger fraud_risk_on_listing
  after insert or update or delete on public.listings
  for each row execute procedure public.refresh_fraud_risk_from_event();

drop trigger if exists fraud_risk_on_dispute on public.disputes;
create trigger fraud_risk_on_dispute
  after insert or update on public.disputes
  for each row execute procedure public.refresh_fraud_risk_from_event();

drop trigger if exists fraud_risk_on_transaction on public.transactions;
create trigger fraud_risk_on_transaction
  after insert or update on public.transactions
  for each row execute procedure public.refresh_fraud_risk_from_event();

-- Notification content is server-authored. Users may only change read_at.
revoke insert, delete on public.notifications from authenticated;
revoke update on public.notifications from authenticated;
grant update (read_at) on public.notifications to authenticated;
