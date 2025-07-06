-- ---- 1. demo organisation & key ----------------------------
insert into public.org (id, name)
values (1, 'Demo Org')
on conflict do nothing;

insert into public.api_key (org_id, secret, label)
values (1, 'demo-secret', 'seed key')
on conflict (secret) do nothing;

-- ---- 2. minimal SKU catalogue ------------------------------
insert into public.sku_catalogue (cloud, region, sku, watts, usd_hour)
values
  ('aws','eu-central-1','t3.micro',17,0.0104),
  ('aws','us-east-1',   't3.micro',17,0.0095)
on conflict do nothing;
