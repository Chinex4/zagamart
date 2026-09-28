-- Restrict internal SECURITY DEFINER helpers and trigger functions from direct API execution.
-- is_admin() and is_verified_active_student() remain executable by authenticated
-- because RLS policies invoke them for signed-in requests.

revoke execute on function public.handle_new_user()
  from public, anon, authenticated;

revoke execute on function public.is_admin()
  from public, anon, authenticated;
grant execute on function public.is_admin()
  to authenticated, service_role;

revoke execute on function public.is_verified_active_student()
  from public, anon, authenticated;
grant execute on function public.is_verified_active_student()
  to authenticated, service_role;

revoke execute on function public.refresh_fraud_risk_from_event()
  from public, anon, authenticated;

revoke execute on function public.rls_auto_enable()
  from public, anon, authenticated;

revoke execute on function public.sync_kyc_submission_status()
  from public, anon, authenticated;
