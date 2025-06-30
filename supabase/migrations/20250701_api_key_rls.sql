-- supabase/migrations/20250701_api_key_rls.sql
alter table api_key enable row level security;

create policy "insert own key"
on api_key
for insert
with check ( org_id = cast(auth.jwt()->>'org_id' as bigint) );
