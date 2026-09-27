begin;
create extension if not exists pgtap with schema extensions;
select plan(5);
create temporary table suppression_results (result text);
grant all on suppression_results to authenticated;
insert into auth.users (id) values ('fd9111ef-1421-4f9a-aec5-303875345001');
insert into public.alumia_ai_preferences (user_id, memory_enabled, memory_consent_version)
values ('fd9111ef-1421-4f9a-aec5-303875345001', true, 2);
set local role authenticated;
select set_config('request.jwt.claim.sub', 'fd9111ef-1421-4f9a-aec5-303875345001', true);

insert into public.tasks (user_id, title, time) values
  (auth.uid(), 'Uma', '08:00'), (auth.uid(), 'Duas', '09:00'), (auth.uid(), 'Três', '10:00');
insert into suppression_results select is((select count(*)::int from public.alumia_memories where memory_key = 'module:tasks:planning_period'), 1, 'pattern is learned');
select public.forget_alumia_memory((select id from public.alumia_memories where memory_key = 'module:tasks:planning_period'));
insert into suppression_results select is((select count(*)::int from public.alumia_memories where memory_key = 'module:tasks:planning_period'), 0, 'forget removes observed memory');
insert into public.tasks (user_id, title, time) values (auth.uid(), 'Quatro', '11:00');
insert into suppression_results select is((select count(*)::int from public.alumia_memories where memory_key = 'module:tasks:planning_period'), 0, 'forgotten pattern is not relearned');

delete from public.alumia_memory_suppressions where false;
insert into public.alumia_memories (user_id, content, source, memory_key, source_module)
values (auth.uid(), 'Costuma estudar por 25 minutos.', 'module_observed', 'module:student:session_length', 'student');
select public.update_alumia_memory((select id from public.alumia_memories where memory_key = 'module:student:session_length'), 'Prefere estudar em blocos curtos.');
insert into suppression_results select ok((select source = 'user_confirmed' and memory_key is null and source_module is null from public.alumia_memories where content = 'Prefere estudar em blocos curtos.'), 'manual correction becomes authoritative');
insert into suppression_results select ok((select count(*) = 2 from public.alumia_memory_suppressions), 'forget and correction suppress their automatic patterns');

insert into suppression_results select * from finish();
select json_agg(result) as results from suppression_results;
rollback;
