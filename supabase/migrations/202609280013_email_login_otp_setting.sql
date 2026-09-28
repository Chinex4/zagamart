insert into public.system_settings (key, value, description, updated_at)
values (
  'email_login_otp_enabled',
  'true'::jsonb,
  'Require an email one-time code after password authentication.',
  now()
)
on conflict (key) do nothing;
