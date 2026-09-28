begin;
create extension if not exists pgtap with schema extensions;
select plan(10);
create temporary table finance_results (result text);
grant all on finance_results to authenticated;

insert into auth.users (id) values
  ('fd9111ef-1421-4f9a-aec5-303875343101'),
  ('fd9111ef-1421-4f9a-aec5-303875343102');

set local role authenticated;
select set_config('request.jwt.claim.sub', 'fd9111ef-1421-4f9a-aec5-303875343101', true);

insert into public.finance_transactions (user_id, kind, title, category, amount)
values (auth.uid(), 'income', 'Freela', 'Entrada', 800);
insert into finance_results select is(
  (select count(*)::int from public.finance_transactions), 1,
  'user creates and reads own transaction'
);

create temporary table created_obligation (id uuid);
with created as (
  insert into public.finance_obligations (user_id, kind, title, amount, due_date)
  values (auth.uid(), 'bill', 'Energia', 184.60, current_date + 1)
  returning id
)
insert into created_obligation select id from created;

insert into finance_results select lives_ok(
  format('select public.pay_finance_obligation(%L::uuid)', (select id from created_obligation)),
  'user can pay own pending obligation atomically'
);
insert into finance_results select is(
  (select status from public.finance_obligations where id = (select id from created_obligation)),
  'paid', 'payment marks obligation as paid'
);
insert into finance_results select is(
  (select count(*)::int from public.finance_transactions where obligation_id = (select id from created_obligation)),
  1, 'payment creates one linked expense'
);

create temporary table created_goal (id uuid);
with created as (
  insert into public.finance_goals (user_id, title, target_amount)
  values (auth.uid(), 'Reserva tranquila', 5000)
  returning id
)
insert into created_goal select id from created;

insert into finance_results select lives_ok(
  format('select public.record_finance_goal_contribution(%L::uuid, 250)', (select id from created_goal)),
  'user can deposit into own active goal atomically'
);
insert into finance_results select is(
  (select current_amount from public.finance_goal_balances where id = (select id from created_goal)),
  250.00::numeric, 'goal balance includes deposit'
);
insert into finance_results select lives_ok(
  format('select public.record_finance_goal_contribution(%L::uuid, 50, %L)', (select id from created_goal), 'withdrawal'),
  'user can withdraw from own active goal atomically'
);
insert into finance_results select is(
  (select current_amount from public.finance_goal_balances where id = (select id from created_goal)),
  200.00::numeric, 'goal balance subtracts withdrawal'
);

select set_config('request.jwt.claim.sub', 'fd9111ef-1421-4f9a-aec5-303875343102', true);
insert into finance_results select is(
  (select count(*)::int from public.finance_transactions), 0,
  'RLS hides another user transactions'
);
insert into finance_results select throws_ok(
  format('select public.record_finance_goal_contribution(%L::uuid, 10)', (select id from created_goal)),
  'P0001', 'GOAL_NOT_AVAILABLE', 'user cannot contribute to another user goal'
);

insert into finance_results select * from finish();
select json_agg(result) as results from finance_results;
rollback;
