create schema if not exists billing;

create table billing.org_subscription (
  org_id bigint primary key references public.org(id),
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  status text
);

create table public.feature_flag (
  name text primary key,
  enabled boolean default false
);

insert into public.feature_flag values ('realtime_grid_optimizer', false),
                                       ('audit_pdf_exporter',      false);
