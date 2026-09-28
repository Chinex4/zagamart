-- Restrict self-service profile edits to non-privileged fields.
-- Role, account status, verification status, and moderation timestamps are
-- intentionally writable only through trusted service-role/admin code.

revoke update on public.profiles from authenticated;
grant update (full_name, programme, level, phone, avatar_path)
  on public.profiles to authenticated;

-- Financial and administrative tables are readable only through their RLS
-- policies and are not directly mutable by authenticated browser clients.
revoke insert, update, delete on public.transactions from authenticated;
revoke insert, update, delete on public.payment_events from authenticated;
revoke insert, update, delete on public.fraud_flags from authenticated;
revoke insert, update, delete on public.payout_requests from authenticated;
revoke insert, update, delete on public.system_settings from authenticated;
revoke insert, update, delete on public.audit_logs from authenticated;
