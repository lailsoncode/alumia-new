-- Dados privados do módulo Estudante. A agenda permanece centralizada em tasks.
create table public.student_subjects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 80),
  normalized_name text generated always as (lower(btrim(name))) stored,
  archived_at timestamptz,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  unique (user_id, normalized_name)
);

create table public.student_task_details (
  task_id uuid primary key references public.tasks(id) on delete cascade,
  subject_id uuid references public.student_subjects(id) on delete set null,
  academic_type text not null check (academic_type in ('exam', 'assignment', 'reading', 'review')),
  estimated_minutes integer not null check (estimated_minutes between 5 and 240),
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create table public.student_study_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete set null,
  subject_id uuid references public.student_subjects(id) on delete set null,
  planned_minutes integer not null check (planned_minutes between 5 and 240),
  elapsed_seconds integer not null check (elapsed_seconds >= 0),
  outcome text check (outcome in ('difficult', 'progress', 'continue')),
  started_at timestamptz not null,
  ended_at timestamptz not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  check (ended_at >= started_at)
);

create index student_subjects_user_idx on public.student_subjects (user_id, archived_at, name);
create index student_study_sessions_user_started_idx on public.student_study_sessions (user_id, started_at desc);

alter table public.student_subjects enable row level security;
alter table public.student_task_details enable row level security;
alter table public.student_study_sessions enable row level security;

create policy "Users manage their own student subjects"
  on public.student_subjects for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage details from their own student tasks"
  on public.student_task_details for all to authenticated
  using (exists (
    select 1 from public.tasks
    where tasks.id = student_task_details.task_id and tasks.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.tasks
    where tasks.id = student_task_details.task_id and tasks.user_id = auth.uid()
  ) and (
    student_task_details.subject_id is null or exists (
      select 1 from public.student_subjects
      where student_subjects.id = student_task_details.subject_id
        and student_subjects.user_id = auth.uid()
    )
  ));

create policy "Users manage their own study sessions"
  on public.student_study_sessions for all to authenticated
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and (task_id is null or exists (
      select 1 from public.tasks
      where tasks.id = student_study_sessions.task_id and tasks.user_id = auth.uid()
    ))
    and (subject_id is null or exists (
      select 1 from public.student_subjects
      where student_subjects.id = student_study_sessions.subject_id
        and student_subjects.user_id = auth.uid()
    ))
  );

create or replace function public.create_student_commitment(
  p_title text,
  p_description text,
  p_subject_id uuid,
  p_new_subject_name text,
  p_academic_type text,
  p_date date,
  p_time text,
  p_estimated_minutes integer,
  p_reminder text,
  p_priority text
)
returns public.tasks
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_subject_id uuid;
  v_task public.tasks%rowtype;
begin
  if v_user_id is null then
    raise exception using errcode = 'P0001', message = 'UNAUTHENTICATED';
  end if;
  if char_length(btrim(coalesce(p_title, ''))) = 0 then
    raise exception using errcode = 'P0001', message = 'TITLE_REQUIRED';
  end if;
  if p_academic_type not in ('exam', 'assignment', 'reading', 'review') then
    raise exception using errcode = 'P0001', message = 'ACADEMIC_TYPE_INVALID';
  end if;
  if p_estimated_minutes < 5 or p_estimated_minutes > 240 then
    raise exception using errcode = 'P0001', message = 'ESTIMATED_MINUTES_INVALID';
  end if;
  if p_reminder is not null and (p_date is null or p_time is null) then
    raise exception using errcode = 'P0001', message = 'REMINDER_REQUIRES_SCHEDULE';
  end if;
  if p_reminder is not null and p_reminder not in ('na_hora', '5min', '15min', '30min') then
    raise exception using errcode = 'P0001', message = 'REMINDER_INVALID';
  end if;
  if p_priority is not null and p_priority not in ('alta', 'media', 'baixa') then
    raise exception using errcode = 'P0001', message = 'PRIORITY_INVALID';
  end if;

  if p_subject_id is not null then
    select id into v_subject_id from public.student_subjects
    where id = p_subject_id and user_id = v_user_id and archived_at is null;
    if v_subject_id is null then
      raise exception using errcode = 'P0001', message = 'SUBJECT_NOT_AVAILABLE';
    end if;
  elsif char_length(btrim(coalesce(p_new_subject_name, ''))) > 0 then
    insert into public.student_subjects (user_id, name)
    values (v_user_id, btrim(p_new_subject_name))
    on conflict (user_id, normalized_name)
    do update set name = excluded.name, archived_at = null
    returning id into v_subject_id;
  else
    raise exception using errcode = 'P0001', message = 'SUBJECT_REQUIRED';
  end if;

  insert into public.tasks (
    user_id, title, description, date, time, priority, reminder, module_key, done
  ) values (
    v_user_id, btrim(p_title), nullif(btrim(coalesce(p_description, '')), ''),
    p_date, p_time, p_priority, p_reminder, 'student', false
  ) returning * into v_task;

  insert into public.student_task_details (task_id, subject_id, academic_type, estimated_minutes)
  values (v_task.id, v_subject_id, p_academic_type, p_estimated_minutes);

  return v_task;
end;
$$;

revoke all on function public.create_student_commitment(text, text, uuid, text, text, date, text, integer, text, text) from public;
revoke all on function public.create_student_commitment(text, text, uuid, text, text, date, text, integer, text, text) from anon;
grant execute on function public.create_student_commitment(text, text, uuid, text, text, date, text, integer, text, text) to authenticated;
