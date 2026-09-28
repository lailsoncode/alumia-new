-- Financial context is sensitive and requires consent independent from chat history.
alter table public.alumia_ai_preferences
  add column if not exists finance_context boolean not null default false,
  add column if not exists finance_consent_version integer not null default 1
    check (finance_consent_version = 1);

comment on column public.alumia_ai_preferences.finance_context is
  'Allows an ephemeral aggregated finance snapshot to be sent to Alum.IA. Never enables financial memory.';
