-- Criação idempotente de tarefas confirmadas na Alum.IA.
alter table public.tasks
  add column if not exists alumia_action_id uuid;

alter table public.tasks
  drop constraint if exists tasks_user_alumia_action_id_key;

alter table public.tasks
  add constraint tasks_user_alumia_action_id_key unique (user_id, alumia_action_id);

create or replace function public.create_alumia_task_once(
  p_action_id uuid,
  p_title text,
  p_description text default null,
  p_date date default null,
  p_time text default null,
  p_priority text default null,
  p_reminder text default null
)
returns public.tasks
language plpgsql
security invoker
set search_path = public
as $$
declare
  created_task public.tasks%rowtype;
  normalized_title text := btrim(p_title);
  normalized_description text := nullif(btrim(coalesce(p_description, '')), '');
begin
  if auth.uid() is null then
    raise exception 'Usuário não autenticado';
  end if;

  if p_action_id is null then
    raise exception 'Identificador da ação é obrigatório';
  end if;

  if normalized_title = '' or char_length(normalized_title) > 120 then
    raise exception 'Título inválido';
  end if;

  if normalized_description is not null and char_length(normalized_description) > 500 then
    raise exception 'Descrição inválida';
  end if;

  if p_time is not null and p_time !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then
    raise exception 'Horário inválido';
  end if;

  if p_time is not null and p_date is null then
    raise exception 'Horário exige uma data';
  end if;

  if p_reminder is not null and (p_date is null or p_time is null) then
    raise exception 'Lembrete exige data e horário';
  end if;

  insert into public.tasks (
    user_id,
    title,
    description,
    date,
    time,
    priority,
    reminder,
    module_key,
    alumia_action_id,
    done
  ) values (
    auth.uid(),
    normalized_title,
    normalized_description,
    p_date,
    p_time,
    p_priority,
    p_reminder,
    'alumia_ai',
    p_action_id,
    false
  )
  on conflict (user_id, alumia_action_id)
  do update set alumia_action_id = excluded.alumia_action_id
  returning * into created_task;

  return created_task;
end;
$$;

revoke all on function public.create_alumia_task_once(uuid, text, text, date, text, text, text) from public;
grant execute on function public.create_alumia_task_once(uuid, text, text, date, text, text, text) to authenticated;
