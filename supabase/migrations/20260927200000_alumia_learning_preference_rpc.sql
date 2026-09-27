create or replace function public.set_alumia_learning_enabled(p_enabled boolean)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_now timestamptz := now();
begin
  if v_user_id is null then
    raise exception using errcode = 'P0001', message = 'UNAUTHENTICATED';
  end if;

  insert into public.alumia_ai_preferences (
    user_id, memory_enabled, memory_consent_version,
    memory_consent_at, memory_revoked_at, updated_at
  ) values (
    v_user_id, p_enabled, 2,
    case when p_enabled then v_now else null end,
    case when p_enabled then null else v_now end,
    v_now
  )
  on conflict (user_id) do update set
    memory_enabled = excluded.memory_enabled,
    memory_consent_version = 2,
    memory_consent_at = excluded.memory_consent_at,
    memory_revoked_at = excluded.memory_revoked_at,
    updated_at = excluded.updated_at;

  if p_enabled then
    perform public.refresh_alumia_task_pattern(v_user_id);
    perform public.refresh_alumia_student_pattern(v_user_id);
    perform public.refresh_alumia_hydration_pattern(v_user_id);
    perform public.refresh_alumia_mindfulness_pattern(v_user_id);
  end if;
end;
$$;

revoke all on function public.set_alumia_learning_enabled(boolean) from public, anon;
grant execute on function public.set_alumia_learning_enabled(boolean) to authenticated;
