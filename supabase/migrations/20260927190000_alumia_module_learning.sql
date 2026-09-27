alter table public.alumia_memories
  add column memory_key text,
  add column source_module text check (source_module in ('tasks', 'student', 'hydration', 'mindfulness'));

create unique index alumia_memories_user_key_unique
  on public.alumia_memories (user_id, memory_key)
  where memory_key is not null;

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

create or replace function public.refresh_alumia_task_pattern(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_period text;
  v_label text;
begin
  select period into v_period from (
    select case
      when substring(time from 1 for 2)::integer < 12 then 'morning'
      when substring(time from 1 for 2)::integer < 18 then 'afternoon'
      else 'evening'
    end as period, count(*) as uses
    from public.tasks
    where user_id = p_user_id and module_key = 'tasks'
      and time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
    group by 1
    having count(*) >= 3
    order by uses desc, period
    limit 1
  ) patterns;

  if v_period is null then
    delete from public.alumia_memories where user_id = p_user_id and memory_key = 'module:tasks:planning_period';
    return;
  end if;
  v_label := case v_period when 'morning' then 'pela manhã' when 'afternoon' then 'à tarde' else 'à noite' end;
  perform public.upsert_alumia_module_memory(p_user_id, 'module:tasks:planning_period',
    'Costuma planejar tarefas ' || v_label || '.', 'tasks');
end;
$$;

create or replace function public.refresh_alumia_student_pattern(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_minutes integer;
begin
  select (round(avg(planned_minutes)::numeric / 5) * 5)::integer into v_minutes
  from public.student_study_sessions where user_id = p_user_id
  having count(*) >= 3;
  if v_minutes is null then
    delete from public.alumia_memories where user_id = p_user_id and memory_key = 'module:student:session_length';
    return;
  end if;
  perform public.upsert_alumia_module_memory(p_user_id, 'module:student:session_length',
    'Costuma planejar sessões de estudo de cerca de ' || v_minutes || ' minutos.', 'student');
end;
$$;

create or replace function public.refresh_alumia_hydration_pattern(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_amount integer;
begin
  select amount_ml into v_amount from public.hydration_logs
  where user_id = p_user_id
  group by amount_ml
  having count(*) >= 3
  order by count(*) desc, amount_ml
  limit 1;
  if v_amount is null then
    delete from public.alumia_memories where user_id = p_user_id and memory_key = 'module:hydration:portion';
    return;
  end if;
  perform public.upsert_alumia_module_memory(p_user_id, 'module:hydration:portion',
    'Prefere registrar hidratação em porções de ' || v_amount || ' ml.', 'hydration');
end;
$$;

create or replace function public.refresh_alumia_mindfulness_pattern(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_format text;
  v_label text;
begin
  select format into v_format from public.mindfulness_sessions
  where user_id = p_user_id and not ended_early
  group by format
  having count(*) >= 3
  order by count(*) desc, format
  limit 1;
  if v_format is null then
    delete from public.alumia_memories where user_id = p_user_id and memory_key = 'module:mindfulness:format';
    return;
  end if;
  v_label := case v_format when 'audio' then 'em áudio' else 'em texto' end;
  perform public.upsert_alumia_module_memory(p_user_id, 'module:mindfulness:format',
    'Prefere práticas de Mindfulness ' || v_label || '.', 'mindfulness');
end;
$$;

create or replace function public.capture_alumia_task_pattern()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin perform public.refresh_alumia_task_pattern(coalesce(new.user_id, old.user_id)); return null; end; $$;
create or replace function public.capture_alumia_student_pattern()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin perform public.refresh_alumia_student_pattern(coalesce(new.user_id, old.user_id)); return null; end; $$;
create or replace function public.capture_alumia_hydration_pattern()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin perform public.refresh_alumia_hydration_pattern(coalesce(new.user_id, old.user_id)); return null; end; $$;
create or replace function public.capture_alumia_mindfulness_pattern()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin perform public.refresh_alumia_mindfulness_pattern(coalesce(new.user_id, old.user_id)); return null; end; $$;

create trigger alumia_learn_from_tasks after insert or update or delete on public.tasks
  for each row execute function public.capture_alumia_task_pattern();
create trigger alumia_learn_from_student after insert or update or delete on public.student_study_sessions
  for each row execute function public.capture_alumia_student_pattern();
create trigger alumia_learn_from_hydration after insert or update or delete on public.hydration_logs
  for each row execute function public.capture_alumia_hydration_pattern();
create trigger alumia_learn_from_mindfulness after insert or update or delete on public.mindfulness_sessions
  for each row execute function public.capture_alumia_mindfulness_pattern();

revoke all on function public.upsert_alumia_module_memory(uuid, text, text, text) from public, anon, authenticated;
revoke all on function public.refresh_alumia_task_pattern(uuid) from public, anon, authenticated;
revoke all on function public.refresh_alumia_student_pattern(uuid) from public, anon, authenticated;
revoke all on function public.refresh_alumia_hydration_pattern(uuid) from public, anon, authenticated;
revoke all on function public.refresh_alumia_mindfulness_pattern(uuid) from public, anon, authenticated;
revoke all on function public.capture_alumia_task_pattern() from public, anon, authenticated;
revoke all on function public.capture_alumia_student_pattern() from public, anon, authenticated;
revoke all on function public.capture_alumia_hydration_pattern() from public, anon, authenticated;
revoke all on function public.capture_alumia_mindfulness_pattern() from public, anon, authenticated;
