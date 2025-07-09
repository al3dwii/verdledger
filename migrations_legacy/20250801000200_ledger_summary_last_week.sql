create or replace function public.ledger_summary_last_week()
returns table(email text, org_id bigint, org_name text, kg numeric, prs int)
language sql stable as $$
select  a.email,
        o.id        as org_id,
        o.name      as org_name,
        sum(e.kg)   as kg,
        count(distinct e.pr_url) as prs
from    public.savings_event  e
join    public.org            o on o.id = e.org_id
join    public.user_account   a on a.org_id = o.id
where   e.ts >= current_date - interval '7 days'
group by 1,2,3;
$$;
