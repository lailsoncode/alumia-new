begin;
create extension if not exists pgtap with schema extensions;
select plan(5);
create temporary table learning_preference_results (result text);
grant all on learning_preference_results to authenticated;
insert into auth.users (id) values ('fd9111ef-1421-4f9a-aec5-303875344001'), ('fd9111ef-1421-4f9a-aec5-303875344002');

set local role authenticated;
select set_config('request.jwt.claim.sub', 'fd9111ef-1421-4f9a-aec5-303875344001', true);
insert into public.tasks (user_id, title, time) values
  (auth.uid(), 'Uma', '19:00'), (auth.uid(), 'Duas', '20:00'), (auth.uid(), 'Três', '21:00');
insert into learning_preference_results select is((select count(*)::int from public.alumia_memories), 0, 'activity before consent does not create memory');

select public.set_alumia_learning_enabled(true);
insert into learning_preference_results select is((select content from public.alumia_memories where memory_key = 'module:tasks:planning_period'), 'Costuma planejar tarefas à noite.', 'activation synchronizes prior activity');
insert into learning_preference_results select ok((select memory_consent_at is not null and memory_revoked_at is null from public.alumia_ai_preferences where user_id = auth.uid()), 'activation records consent timestamp');

select public.set_alumia_learning_enabled(false);
insert into learning_preference_results select ok((select not memory_enabled and memory_revoked_at is not null from public.alumia_ai_preferences where user_id = auth.uid()), 'revocation is recorded without deleting memories');
insert into learning_preference_results select is((select count(*)::int from public.alumia_memories), 1, 'revocation preserves memories for explicit deletion');

insert into learning_preference_results select * from finish();
select json_agg(result) as results from learning_preference_results;
rollback;
