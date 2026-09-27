-- Tarefas vencidas ganham um novo dia sem perder a origem do reagendamento.
alter table public.tasks
  add column if not exists postponed_count integer not null default 0 check (postponed_count >= 0),
  add column if not exists last_postponed_from date,
  add column if not exists postponed_at timestamptz;

create index if not exists tasks_user_pending_date_idx
  on public.tasks (user_id, date)
  where done = false and date is not null;

create or replace function public.smallint_array_is_unique(items smallint[])
returns boolean
language sql
immutable
strict
set search_path = public
as $$
  select cardinality(items) = (select count(distinct item) from unnest(items) as item);
$$;

create table public.task_recurrence_rules (
  id uuid default gen_random_uuid() primary key,
  task_id uuid not null unique references public.tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  frequency text not null check (frequency in ('daily', 'weekly')),
  weekdays smallint[],
  starts_on date not null,
  timezone text not null,
  active boolean not null default true,
  deactivated_at timestamptz,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  constraint weekly_recurrence_has_valid_weekdays check (
    (frequency = 'daily' and weekdays is null)
    or (
      frequency = 'weekly'
      and cardinality(weekdays) between 1 and 7
      and weekdays <@ array[1, 2, 3, 4, 5, 6, 7]::smallint[]
      and public.smallint_array_is_unique(weekdays)
    )
  )
);

create index task_recurrence_rules_user_active_idx
  on public.task_recurrence_rules (user_id, active)
  where active = true;

alter table public.task_recurrence_rules enable row level security;

create policy "Users manage their own task recurrence rules"
  on public.task_recurrence_rules for all
  to authenticated
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.tasks
      where tasks.id = task_recurrence_rules.task_id
        and tasks.user_id = auth.uid()
    )
  );

-- Executada na sincronização do app. Se a pessoa ficou vários dias sem abrir,
-- a tarefa vai diretamente para o dia atual e o contador preserva esse intervalo.
create or replace function public.rollover_overdue_tasks(p_today date default current_date)
returns table(task_id uuid)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return;
  end if;

  return query
  update public.tasks
  set
    last_postponed_from = date,
    postponed_count = postponed_count + greatest(p_today - date, 1),
    date = p_today,
    postponed_at = timezone('utc'::text, now())
  where user_id = auth.uid()
    and done = false
    and date is not null
    and date < p_today
  returning id;
end;
$$;

-- Conclui a ocorrência atual e materializa apenas a próxima. Assim o histórico
-- é preservado sem criar uma série futura infinita.
create or replace function public.complete_task_and_schedule_next(p_task_id uuid)
returns setof public.tasks
language plpgsql
security definer
set search_path = public
as $$
declare
  current_task public.tasks%rowtype;
  next_task public.tasks%rowtype;
  recurrence_rule public.task_recurrence_rules%rowtype;
  base_date date;
  next_date date;
  offset_days integer;
begin
  if auth.uid() is null then
    return;
  end if;

  update public.tasks
  set done = true, completed_at = timezone('utc'::text, now())
  where id = p_task_id and user_id = auth.uid() and done = false
  returning * into current_task;

  if not found then
    return query select * from public.tasks where id = p_task_id and user_id = auth.uid();
    return;
  end if;

  select * into recurrence_rule
  from public.task_recurrence_rules
  where task_id = p_task_id and user_id = auth.uid() and active = true
  for update;

  if found then
    base_date := greatest(
      coalesce(current_task.date, recurrence_rule.starts_on),
      (now() at time zone recurrence_rule.timezone)::date
    );

    if recurrence_rule.frequency = 'daily' then
      next_date := base_date + 1;
    else
      for offset_days in 1..7 loop
        if extract(isodow from base_date + offset_days)::smallint = any(recurrence_rule.weekdays) then
          next_date := base_date + offset_days;
          exit;
        end if;
      end loop;
    end if;

    insert into public.tasks (
      user_id, title, description, date, time, priority, reminder, done, module_key
    ) values (
      current_task.user_id, current_task.title, current_task.description, next_date,
      current_task.time, current_task.priority, current_task.reminder, false, current_task.module_key
    ) returning * into next_task;

    update public.task_recurrence_rules
    set active = false, deactivated_at = timezone('utc'::text, now()), updated_at = timezone('utc'::text, now())
    where id = recurrence_rule.id;

    insert into public.task_recurrence_rules (
      task_id, user_id, frequency, weekdays, starts_on, timezone
    ) values (
      next_task.id, recurrence_rule.user_id, recurrence_rule.frequency,
      recurrence_rule.weekdays, recurrence_rule.starts_on, recurrence_rule.timezone
    );
  end if;

  return next current_task;
end;
$$;

revoke all on function public.rollover_overdue_tasks(date) from public;
revoke all on function public.complete_task_and_schedule_next(uuid) from public;
grant execute on function public.rollover_overdue_tasks(date) to authenticated;
grant execute on function public.complete_task_and_schedule_next(uuid) to authenticated;
