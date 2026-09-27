create table public.alumia_memory_suppressions (
  user_id uuid not null references auth.users(id) on delete cascade,
  memory_key text not null,
  suppressed_at timestamptz not null default now(),
  primary key (user_id, memory_key)
);
alter table public.alumia_memory_suppressions enable row level security;
create policy "Users read own memory suppressions" on public.alumia_memory_suppressions
  for select to authenticated using (user_id = auth.uid());
revoke all on public.alumia_memory_suppressions from anon;
grant select on public.alumia_memory_suppressions to authenticated;

create or replace function public.upsert_alumia_module_memory(
  p_user_id uuid,
  p_memory_key text,
  p_content text,
  p_source_module text
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not exists (
    select 1 from public.alumia_ai_preferences
    where user_id = p_user_id and memory_enabled and memory_consent_version = 2
  ) or exists (
    select 1 from public.alumia_memory_suppressions
    where user_id = p_user_id and memory_key = p_memory_key
  ) then
    return;
  end if;

  insert into public.alumia_memories (user_id, content, source, memory_key, source_module, updated_at)
  values (p_user_id, p_content, 'module_observed', p_memory_key, p_source_module, now())
  on conflict (user_id, memory_key) where memory_key is not null
  do update set content = excluded.content, source = excluded.source,
    source_module = excluded.source_module, updated_at = excluded.updated_at;
end;
$$;

create or replace function public.update_alumia_memory(p_memory_id uuid, p_content text)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_memory_key text;
begin
  if v_user_id is null then raise exception using errcode = 'P0001', message = 'UNAUTHENTICATED'; end if;
  if char_length(btrim(coalesce(p_content, ''))) not between 1 and 240 then
    raise exception using errcode = 'P0001', message = 'INVALID_MEMORY';
  end if;
  if not exists (select 1 from public.alumia_ai_preferences where user_id = v_user_id and memory_enabled and memory_consent_version = 2) then
    raise exception using errcode = 'P0001', message = 'LEARNING_DISABLED';
  end if;

  select memory_key into v_memory_key from public.alumia_memories where id = p_memory_id and user_id = v_user_id;
  if not found then raise exception using errcode = 'P0001', message = 'MEMORY_NOT_FOUND'; end if;
  if v_memory_key is not null then
    insert into public.alumia_memory_suppressions (user_id, memory_key) values (v_user_id, v_memory_key)
    on conflict (user_id, memory_key) do update set suppressed_at = now();
  end if;
  update public.alumia_memories set content = btrim(p_content), source = 'user_confirmed',
    memory_key = null, source_module = null, updated_at = now()
  where id = p_memory_id and user_id = v_user_id;
end;
$$;

create or replace function public.forget_alumia_memory(p_memory_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_memory_key text;
begin
  if v_user_id is null then raise exception using errcode = 'P0001', message = 'UNAUTHENTICATED'; end if;
  select memory_key into v_memory_key from public.alumia_memories where id = p_memory_id and user_id = v_user_id;
  if not found then return; end if;
  if v_memory_key is not null then
    insert into public.alumia_memory_suppressions (user_id, memory_key) values (v_user_id, v_memory_key)
    on conflict (user_id, memory_key) do update set suppressed_at = now();
  end if;
  delete from public.alumia_memories where id = p_memory_id and user_id = v_user_id;
end;
$$;

create or replace function public.forget_all_alumia_memories()
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_user_id uuid := auth.uid();
begin
  if v_user_id is null then raise exception using errcode = 'P0001', message = 'UNAUTHENTICATED'; end if;
  insert into public.alumia_memory_suppressions (user_id, memory_key)
  select v_user_id, memory_key from public.alumia_memories where user_id = v_user_id and memory_key is not null
  on conflict (user_id, memory_key) do update set suppressed_at = now();
  delete from public.alumia_memories where user_id = v_user_id;
end;
$$;

revoke all on function public.update_alumia_memory(uuid, text) from public, anon;
revoke all on function public.forget_alumia_memory(uuid) from public, anon;
revoke all on function public.forget_all_alumia_memories() from public, anon;
grant execute on function public.update_alumia_memory(uuid, text) to authenticated;
grant execute on function public.forget_alumia_memory(uuid) to authenticated;
grant execute on function public.forget_all_alumia_memories() to authenticated;
