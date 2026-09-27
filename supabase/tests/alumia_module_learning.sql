begin;
create extension if not exists pgtap with schema extensions;
select plan(12);
create temporary table module_learning_results (result text);
grant all on module_learning_results to authenticated;
insert into auth.users (id) values ('fd9111ef-1421-4f9a-aec5-303875343001'), ('fd9111ef-1421-4f9a-aec5-303875343002');
insert into public.alumia_ai_preferences (user_id, memory_enabled, memory_consent_version)
values ('fd9111ef-1421-4f9a-aec5-303875343001', true, 2), ('fd9111ef-1421-4f9a-aec5-303875343002', false, 2);

set local role authenticated;
select set_config('request.jwt.claim.sub', 'fd9111ef-1421-4f9a-aec5-303875343001', true);
insert into public.tasks (user_id, title, time) values
  (auth.uid(), 'Conteúdo privado um', '09:00'), (auth.uid(), 'Conteúdo privado dois', '10:00'), (auth.uid(), 'Conteúdo privado três', '11:00');
insert into module_learning_results select is((select content from public.alumia_memories where memory_key = 'module:tasks:planning_period'), 'Costuma planejar tarefas pela manhã.', 'learns task planning period after three observations');
insert into module_learning_results select is((select source_module from public.alumia_memories where memory_key = 'module:tasks:planning_period'), 'tasks', 'records task origin');
insert into module_learning_results select is((select count(*)::int from public.alumia_memories where content like '%Conteúdo privado%'), 0, 'never copies task titles');

insert into public.student_study_sessions (user_id, planned_minutes, elapsed_seconds, started_at, ended_at)
select auth.uid(), minutes, minutes * 60, now() - interval '1 hour', now() from unnest(array[20,25,30]) minutes;
insert into module_learning_results select is((select content from public.alumia_memories where memory_key = 'module:student:session_length'), 'Costuma planejar sessões de estudo de cerca de 25 minutos.', 'learns rounded study duration');

insert into public.hydration_logs (user_id, amount_ml, date) values
  (auth.uid(), 500, current_date), (auth.uid(), 500, current_date), (auth.uid(), 500, current_date);
insert into module_learning_results select is((select content from public.alumia_memories where memory_key = 'module:hydration:portion'), 'Prefere registrar hidratação em porções de 500 ml.', 'learns only hydration interaction preference');

insert into module_learning_results select is((select count(*)::int from public.alumia_memories where source = 'module_observed'), 3, 'stores one stable memory per available module pattern');
insert into module_learning_results select is((select count(*)::int from public.alumia_memories where memory_key is not null and source_module is null), 0, 'module memories always expose their origin');

select public.create_mindfulness_session((select id from public.mindfulness_practices where published order by sort_order limit 1), now() - interval '4 minutes', 180, 'text', 'present', false);
select public.create_mindfulness_session((select id from public.mindfulness_practices where published order by sort_order limit 1), now() - interval '4 minutes', 180, 'text', 'same', false);
select public.create_mindfulness_session((select id from public.mindfulness_practices where published order by sort_order limit 1), now() - interval '4 minutes', 180, 'text', 'another', false);
insert into module_learning_results select is((select content from public.alumia_memories where memory_key = 'module:mindfulness:format'), 'Prefere práticas de Mindfulness em texto.', 'learns only mindfulness format preference');
insert into module_learning_results select is((select count(*)::int from public.alumia_memories where content ~* 'present|same|another'), 0, 'never copies mindfulness reflections');

select set_config('request.jwt.claim.sub', 'fd9111ef-1421-4f9a-aec5-303875343002', true);
insert into public.tasks (user_id, title, time) values
  (auth.uid(), 'Uma', '09:00'), (auth.uid(), 'Duas', '09:30'), (auth.uid(), 'Três', '10:00');
insert into module_learning_results select is((select count(*)::int from public.alumia_memories), 0, 'disabled account never receives observed memories');

select set_config('request.jwt.claim.sub', 'fd9111ef-1421-4f9a-aec5-303875343001', true);
delete from public.tasks where user_id = auth.uid() and module_key = 'tasks';
insert into module_learning_results select is((select count(*)::int from public.alumia_memories where memory_key = 'module:tasks:planning_period'), 0, 'removes pattern when supporting observations are deleted');
insert into module_learning_results select is((select count(*)::int from public.alumia_memories where source_module in ('finance', 'checkin')), 0, 'does not learn from sensitive modules');

insert into module_learning_results select * from finish();
select json_agg(result) as results from module_learning_results;
rollback;
