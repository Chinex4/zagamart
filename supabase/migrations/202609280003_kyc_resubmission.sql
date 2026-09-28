-- Keep profile verification state synchronized with student submissions.
-- Admin review actions will update the profile status through trusted server code.

create or replace function public.sync_kyc_submission_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles
  set verification_status = 'pending'
  where id = new.student_id;

  return new;
end;
$$;

create trigger student_verification_submitted
  after insert on public.student_verifications
  for each row execute procedure public.sync_kyc_submission_status();

-- Users may clean up only their own KYC objects before review if a submission
-- fails. Application flows otherwise keep verification documents immutable.
create policy "students delete own KYC upload objects"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'kyc-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
