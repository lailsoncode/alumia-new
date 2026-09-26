-- Registra quando a tarefa foi concluída para alimentar resumos diários sem
-- confundir a data agendada com o momento real da conclusão.
alter table public.tasks
  add column if not exists completed_at timestamptz;

create index if not exists tasks_user_completed_at_idx
  on public.tasks (user_id, completed_at desc)
  where completed_at is not null;
