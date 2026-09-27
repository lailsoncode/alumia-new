create table public.alumia_ai_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  conversation_context boolean not null default false,
  consent_version integer not null default 1 check (consent_version = 1),
  updated_at timestamptz not null default now()
);
alter table public.alumia_ai_preferences enable row level security;
create policy "Own AI preferences" on public.alumia_ai_preferences
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
revoke all on public.alumia_ai_preferences from anon;
grant select, insert, update, delete on public.alumia_ai_preferences to authenticated;
