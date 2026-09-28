-- Zagamart core schema and authorization foundation.
-- All monetary values are stored in Nigerian kobo as bigint integers.

create extension if not exists pgcrypto;

create type public.user_role as enum ('student', 'admin');
create type public.account_status as enum ('active', 'suspended');
create type public.verification_status as enum ('not_submitted', 'pending', 'verified', 'rejected');
create type public.listing_status as enum ('draft', 'active', 'reserved', 'sold', 'archived');
create type public.transaction_status as enum (
  'pending_payment',
  'paid_held',
  'release_pending',
  'released',
  'disputed',
  'refunded',
  'cancelled'
);
create type public.dispute_status as enum ('open', 'under_review', 'resolved_buyer', 'resolved_seller', 'closed');
create type public.payout_status as enum ('pending', 'processing', 'paid', 'failed', 'cancelled');
create type public.fraud_severity as enum ('low', 'medium', 'high', 'critical');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 120),
  matric_number text unique,
  university_email text unique,
  programme text,
  level text,
  phone text,
  avatar_path text,
  role public.user_role not null default 'student',
  account_status public.account_status not null default 'active',
  verification_status public.verification_status not null default 'not_submitted',
  verified_at timestamptz,
  suspended_at timestamptz,
  suspension_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.student_verifications (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  student_id_path text not null,
  fee_receipt_path text not null,
  status public.verification_status not null default 'pending',
  rejection_reason text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status <> 'rejected' or rejection_reason is not null)
);

create unique index one_open_verification_per_student
  on public.student_verifications(student_id)
  where status = 'pending';

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete restrict,
  title text not null check (char_length(title) between 3 and 140),
  description text not null check (char_length(description) between 10 and 5000),
  category text not null,
  condition text not null,
  price_kobo bigint not null check (price_kobo > 0),
  status public.listing_status not null default 'draft',
  location_label text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index listings_marketplace_idx on public.listings(status, created_at desc);
create index listings_seller_idx on public.listings(seller_id, created_at desc);

create table public.listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  storage_path text not null,
  position smallint not null default 0 check (position >= 0),
  created_at timestamptz not null default now(),
  unique(listing_id, storage_path)
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete restrict,
  buyer_id uuid not null references public.profiles(id) on delete restrict,
  seller_id uuid not null references public.profiles(id) on delete restrict,
  amount_kobo bigint not null check (amount_kobo > 0),
  currency text not null default 'NGN' check (currency = 'NGN'),
  status public.transaction_status not null default 'pending_payment',
  payment_reference text unique,
  paid_at timestamptz,
  release_requested_at timestamptz,
  released_at timestamptz,
  refunded_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (buyer_id <> seller_id)
);

create index transactions_buyer_idx on public.transactions(buyer_id, created_at desc);
create index transactions_seller_idx on public.transactions(seller_id, created_at desc);
create index transactions_status_idx on public.transactions(status, created_at desc);

create table public.payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'paystack' check (provider = 'paystack'),
  provider_event_id text not null unique,
  event_type text not null,
  payment_reference text,
  payload jsonb not null,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.disputes (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null unique references public.transactions(id) on delete restrict,
  opened_by uuid not null references public.profiles(id) on delete restrict,
  reason text not null check (char_length(reason) between 10 and 2000),
  status public.dispute_status not null default 'open',
  resolution_note text,
  resolved_by uuid references public.profiles(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.dispute_evidence (
  id uuid primary key default gen_random_uuid(),
  dispute_id uuid not null references public.disputes(id) on delete cascade,
  submitted_by uuid not null references public.profiles(id) on delete restrict,
  storage_path text not null,
  note text,
  created_at timestamptz not null default now()
);

create table public.fraud_flags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  transaction_id uuid references public.transactions(id) on delete set null,
  rule_code text not null,
  score integer not null check (score between 0 and 100),
  severity public.fraud_severity not null,
  details jsonb not null default '{}'::jsonb,
  resolved_at timestamptz,
  resolved_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index fraud_flags_unresolved_idx on public.fraud_flags(created_at desc)
  where resolved_at is null;

create table public.bank_accounts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  bank_code text not null,
  bank_name text not null,
  account_number_last4 text not null check (account_number_last4 ~ '^[0-9]{4}$'),
  account_name text not null,
  recipient_code text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index one_default_bank_account_per_student
  on public.bank_accounts(student_id)
  where is_default;

create table public.payout_requests (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete restrict,
  bank_account_id uuid not null references public.bank_accounts(id) on delete restrict,
  amount_kobo bigint not null check (amount_kobo > 0),
  status public.payout_status not null default 'pending',
  provider_reference text unique,
  failure_reason text,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.system_settings (
  key text primary key,
  value jsonb not null,
  description text,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  read_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index notifications_user_idx on public.notifications(user_id, created_at desc);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  subject_type text not null,
  subject_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_logs_created_idx on public.audit_logs(created_at desc);
create index audit_logs_actor_idx on public.audit_logs(actor_id, created_at desc);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and account_status = 'active'
  );
$$;

create or replace function public.is_verified_active_student()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'student'
      and account_status = 'active'
      and verification_status = 'verified'
  );
$$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    matric_number,
    university_email,
    programme,
    level
  )
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), 'Student'),
    nullif(upper(trim(new.raw_user_meta_data ->> 'matric_number')), ''),
    lower(new.email),
    nullif(trim(new.raw_user_meta_data ->> 'programme'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'level'), '')
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create trigger profiles_touch_updated_at before update on public.profiles
  for each row execute procedure public.touch_updated_at();
create trigger verifications_touch_updated_at before update on public.student_verifications
  for each row execute procedure public.touch_updated_at();
create trigger listings_touch_updated_at before update on public.listings
  for each row execute procedure public.touch_updated_at();
create trigger transactions_touch_updated_at before update on public.transactions
  for each row execute procedure public.touch_updated_at();
create trigger disputes_touch_updated_at before update on public.disputes
  for each row execute procedure public.touch_updated_at();
create trigger bank_accounts_touch_updated_at before update on public.bank_accounts
  for each row execute procedure public.touch_updated_at();
create trigger payouts_touch_updated_at before update on public.payout_requests
  for each row execute procedure public.touch_updated_at();

alter table public.profiles enable row level security;
alter table public.student_verifications enable row level security;
alter table public.listings enable row level security;
alter table public.listing_images enable row level security;
alter table public.transactions enable row level security;
alter table public.payment_events enable row level security;
alter table public.disputes enable row level security;
alter table public.dispute_evidence enable row level security;
alter table public.fraud_flags enable row level security;
alter table public.bank_accounts enable row level security;
alter table public.payout_requests enable row level security;
alter table public.system_settings enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

create policy "profiles readable by owner or admin"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

create policy "profiles self update limited by server validation"
  on public.profiles for update
  using (id = auth.uid() and account_status = 'active')
  with check (id = auth.uid());

create policy "verification readable by owner or admin"
  on public.student_verifications for select
  using (student_id = auth.uid() or public.is_admin());

create policy "students submit own verification"
  on public.student_verifications for insert
  with check (
    student_id = auth.uid()
    and status = 'pending'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and account_status = 'active'
    )
  );

create policy "admins manage verifications"
  on public.student_verifications for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "active listings are publicly readable"
  on public.listings for select
  using (status = 'active' or seller_id = auth.uid() or public.is_admin());

create policy "verified students create listings"
  on public.listings for insert
  with check (seller_id = auth.uid() and public.is_verified_active_student());

create policy "sellers update own listings"
  on public.listings for update
  using (seller_id = auth.uid() and public.is_verified_active_student())
  with check (seller_id = auth.uid() and public.is_verified_active_student());

create policy "sellers delete own non sold listings"
  on public.listings for delete
  using (seller_id = auth.uid() and status in ('draft', 'active', 'archived'));

create policy "listing images follow listing visibility"
  on public.listing_images for select
  using (
    exists (
      select 1 from public.listings
      where listings.id = listing_images.listing_id
        and (listings.status = 'active' or listings.seller_id = auth.uid() or public.is_admin())
    )
  );

create policy "seller manages listing images"
  on public.listing_images for all
  using (
    exists (
      select 1 from public.listings
      where listings.id = listing_images.listing_id
        and listings.seller_id = auth.uid()
        and public.is_verified_active_student()
    )
  )
  with check (
    exists (
      select 1 from public.listings
      where listings.id = listing_images.listing_id
        and listings.seller_id = auth.uid()
        and public.is_verified_active_student()
    )
  );

create policy "transaction parties and admins can read"
  on public.transactions for select
  using (buyer_id = auth.uid() or seller_id = auth.uid() or public.is_admin());

create policy "dispute parties and admins can read"
  on public.disputes for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.transactions
      where transactions.id = disputes.transaction_id
        and (transactions.buyer_id = auth.uid() or transactions.seller_id = auth.uid())
    )
  );

create policy "transaction parties open disputes"
  on public.disputes for insert
  with check (
    opened_by = auth.uid()
    and exists (
      select 1 from public.transactions
      where transactions.id = disputes.transaction_id
        and transactions.status in ('paid_held', 'release_pending')
        and (transactions.buyer_id = auth.uid() or transactions.seller_id = auth.uid())
    )
  );

create policy "admins manage disputes"
  on public.disputes for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "dispute parties read evidence"
  on public.dispute_evidence for select
  using (
    public.is_admin()
    or exists (
      select 1
      from public.disputes
      join public.transactions on transactions.id = disputes.transaction_id
      where disputes.id = dispute_evidence.dispute_id
        and (transactions.buyer_id = auth.uid() or transactions.seller_id = auth.uid())
    )
  );

create policy "dispute parties add evidence"
  on public.dispute_evidence for insert
  with check (
    submitted_by = auth.uid()
    and exists (
      select 1
      from public.disputes
      join public.transactions on transactions.id = disputes.transaction_id
      where disputes.id = dispute_evidence.dispute_id
        and disputes.status in ('open', 'under_review')
        and (transactions.buyer_id = auth.uid() or transactions.seller_id = auth.uid())
    )
  );

create policy "students read own bank accounts"
  on public.bank_accounts for select
  using (student_id = auth.uid() or public.is_admin());

create policy "students manage own bank accounts"
  on public.bank_accounts for all
  using (student_id = auth.uid() and public.is_verified_active_student())
  with check (student_id = auth.uid() and public.is_verified_active_student());

create policy "sellers read own payouts"
  on public.payout_requests for select
  using (seller_id = auth.uid() or public.is_admin());

create policy "users read own notifications"
  on public.notifications for select
  using (user_id = auth.uid());

create policy "users mark own notifications read"
  on public.notifications for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "admins read fraud flags"
  on public.fraud_flags for select
  using (public.is_admin());

create policy "admins read system settings"
  on public.system_settings for select
  using (public.is_admin());

create policy "admins read audit logs"
  on public.audit_logs for select
  using (public.is_admin());

-- Payment events, transaction writes, payout writes, fraud writes, audit writes,
-- and system-setting writes intentionally have no authenticated-client policies.
-- They are performed only through trusted server-side service-role operations.

insert into storage.buckets (id, name, public)
values
  ('listing-images', 'listing-images', true),
  ('kyc-documents', 'kyc-documents', false),
  ('dispute-evidence', 'dispute-evidence', false)
on conflict (id) do nothing;

create policy "public listing image reads"
  on storage.objects for select
  using (bucket_id = 'listing-images');

create policy "verified students upload listing images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'listing-images'
    and public.is_verified_active_student()
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "owners manage listing image objects"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'listing-images'
    and owner_id = auth.uid()::text
  )
  with check (
    bucket_id = 'listing-images'
    and owner_id = auth.uid()::text
  );

create policy "owners delete listing image objects"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'listing-images'
    and owner_id = auth.uid()::text
  );

create policy "students upload own KYC documents"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'kyc-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "students read own KYC documents"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'kyc-documents'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

create policy "dispute parties upload evidence"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'dispute-evidence'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users read own dispute evidence objects"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'dispute-evidence'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );
