-- Enable RLS
alter table savings_event enable row level security;
alter table api_key       enable row level security;

-- Simple policy: JWT must carry org_id claim
create policy "Org can read its events"
on savings_event
for select using ( org_id = cast(auth.jwt()->>'org_id' as bigint) );

create policy "Insert with right org"
on savings_event
for insert with check ( org_id = cast(auth.jwt()->>'org_id' as bigint) );
