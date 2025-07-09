create or replace view public.v_active_repo_week as
select count(distinct repo) as active_repos
from activity_log where ts >= date_trunc('week', now()) - interval '7 days';
