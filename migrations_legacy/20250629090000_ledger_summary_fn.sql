create or replace function public.ledger_summary(p_org bigint)
returns table(total_usd numeric, total_kg numeric) as $$
begin
  return query
  select  coalesce(sum(usd),0), coalesce(sum(kg),0)
  from    public.savings_event
  where   org_id = p_org;
end;
$$ language plpgsql stable security definer;
