alter table public.alumia_ai_preferences
  add column memory_enabled boolean not null default false,
  add column memory_consent_version integer check (memory_consent_version = 1);

create table public.alumia_memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null check (char_length(btrim(content)) between 1 and 240),
  source text not null default 'user_confirmed' check (source = 'user_confirmed'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, content)
);
alter table public.alumia_memories enable row level security;
create policy "Read own memories" on public.alumia_memories for select to authenticated
  using (user_id = auth.uid());
create policy "Forget own memories" on public.alumia_memories for delete to authenticated
  using (user_id = auth.uid());
create policy "Create authorized memories" on public.alumia_memories for insert to authenticated
  with check (user_id = auth.uid() and exists (
    select 1 from public.alumia_ai_preferences p where p.user_id = auth.uid()
      and p.memory_enabled and p.memory_consent_version = 1
  ));
create policy "Edit authorized memories" on public.alumia_memories for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and exists (
    select 1 from public.alumia_ai_preferences p where p.user_id = auth.uid()
      and p.memory_enabled and p.memory_consent_version = 1
  ));
revoke all on public.alumia_memories from anon;
grant select, insert, update, delete on public.alumia_memories to authenticated;
create index alumia_memories_recent on public.alumia_memories (user_id, updated_at desc);
