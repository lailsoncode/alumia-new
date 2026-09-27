alter table public.alumia_ai_preferences
  drop constraint if exists alumia_ai_preferences_memory_consent_version_check;

alter table public.alumia_ai_preferences
  add constraint alumia_ai_preferences_memory_consent_version_check
    check (memory_consent_version in (1, 2)),
  add column memory_consent_at timestamptz,
  add column memory_revoked_at timestamptz,
  add column memory_onboarding_completed_at timestamptz;

-- A autorização anterior abrangia somente lembranças confirmadas uma a uma.
-- O aprendizado global possui finalidade mais ampla e exige uma nova decisão.
update public.alumia_ai_preferences
set memory_enabled = false,
    memory_consent_version = null,
    memory_revoked_at = now(),
    updated_at = now()
where memory_consent_version = 1;

alter table public.alumia_memories
  drop constraint if exists alumia_memories_source_check;

alter table public.alumia_memories
  add constraint alumia_memories_source_check
    check (source in ('user_confirmed', 'onboarding_confirmed', 'assistant_learned', 'module_observed'));

drop policy if exists "Create authorized memories" on public.alumia_memories;
create policy "Create authorized memories" on public.alumia_memories for insert to authenticated
  with check (user_id = auth.uid() and exists (
    select 1 from public.alumia_ai_preferences p where p.user_id = auth.uid()
      and p.memory_enabled and p.memory_consent_version = 2
  ));

drop policy if exists "Edit authorized memories" on public.alumia_memories;
create policy "Edit authorized memories" on public.alumia_memories for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and exists (
    select 1 from public.alumia_ai_preferences p where p.user_id = auth.uid()
      and p.memory_enabled and p.memory_consent_version = 2
  ));
