-- Harden browser privileges around stateful marketplace and financial records.

drop policy if exists "students manage own bank accounts" on public.bank_accounts;
revoke insert, update, delete on public.bank_accounts from authenticated;

drop policy if exists "transaction parties open disputes" on public.disputes;
revoke insert on public.disputes from authenticated;

revoke update on public.notifications from authenticated;
grant update (read_at) on public.notifications to authenticated;

revoke update on public.listings from authenticated;
grant update (title, description, category, condition, price_kobo, location_label)
  on public.listings to authenticated;

drop policy if exists "sellers update own listings" on public.listings;
create policy "sellers edit own listings"
  on public.listings for update
  using (
    seller_id = auth.uid()
    and status in ('draft', 'active')
    and public.is_verified_active_student()
  )
  with check (
    seller_id = auth.uid()
    and status in ('draft', 'active')
    and public.is_verified_active_student()
  );
