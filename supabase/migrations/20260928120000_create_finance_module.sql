-- Dados financeiros privados. Este módulo não alimenta a memória da Alum.IA.
create table public.finance_obligations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('bill', 'debt')),
  title text not null check (char_length(btrim(title)) between 1 and 120),
  issuer text check (issuer is null or char_length(btrim(issuer)) between 1 and 120),
  amount numeric(14, 2) not null check (amount > 0),
  currency text not null default 'BRL' check (currency ~ '^[A-Z]{3}$'),
  due_date date not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'cancelled')),
  installment_number integer check (installment_number is null or installment_number > 0),
  installment_total integer check (installment_total is null or installment_total > 0),
  payment_code text check (payment_code is null or char_length(btrim(payment_code)) between 1 and 200),
  notes text check (notes is null or char_length(notes) <= 1000),
  paid_at timestamptz,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  unique (id, user_id),
  check (
    (installment_number is null and installment_total is null)
    or (
      installment_number is not null
      and installment_total is not null
      and installment_number <= installment_total
    )
  ),
  check (
    (status = 'paid' and paid_at is not null)
    or (status <> 'paid' and paid_at is null)
  )
);

create table public.finance_transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  obligation_id uuid,
  kind text not null check (kind in ('income', 'expense')),
  title text not null check (char_length(btrim(title)) between 1 and 120),
  category text check (category is null or char_length(btrim(category)) between 1 and 60),
  amount numeric(14, 2) not null check (amount > 0),
  currency text not null default 'BRL' check (currency ~ '^[A-Z]{3}$'),
  occurred_at timestamptz not null default timezone('utc'::text, now()),
  notes text check (notes is null or char_length(notes) <= 1000),
  source text not null default 'manual' check (source in ('manual', 'obligation', 'goal')),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  unique (id, user_id),
  foreign key (obligation_id, user_id)
    references public.finance_obligations(id, user_id) on delete restrict
);

create table public.finance_goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 120),
  note text check (note is null or char_length(note) <= 500),
  target_amount numeric(14, 2) not null check (target_amount > 0),
  currency text not null default 'BRL' check (currency ~ '^[A-Z]{3}$'),
  target_date date,
  status text not null default 'active' check (status in ('active', 'completed', 'archived')),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  unique (id, user_id)
);

create table public.finance_goal_contributions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_id uuid not null,
  transaction_id uuid not null,
  kind text not null check (kind in ('deposit', 'withdrawal')),
  amount numeric(14, 2) not null check (amount > 0),
  occurred_at timestamptz not null default timezone('utc'::text, now()),
  created_at timestamptz not null default timezone('utc'::text, now()),
  unique (transaction_id),
  foreign key (goal_id, user_id)
    references public.finance_goals(id, user_id) on delete cascade,
  foreign key (transaction_id, user_id)
    references public.finance_transactions(id, user_id) on delete cascade
);

create index finance_obligations_user_due_idx
  on public.finance_obligations (user_id, status, due_date);
create index finance_transactions_user_occurred_idx
  on public.finance_transactions (user_id, occurred_at desc);
create index finance_transactions_user_kind_idx
  on public.finance_transactions (user_id, kind, occurred_at desc);
create index finance_goals_user_status_idx
  on public.finance_goals (user_id, status, created_at desc);
create index finance_goal_contributions_goal_idx
  on public.finance_goal_contributions (goal_id, occurred_at desc);

alter table public.finance_obligations enable row level security;
alter table public.finance_transactions enable row level security;
alter table public.finance_goals enable row level security;
alter table public.finance_goal_contributions enable row level security;

create policy "Users manage their own finance obligations"
  on public.finance_obligations for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage their own finance transactions"
  on public.finance_transactions for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage their own finance goals"
  on public.finance_goals for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users read their own finance goal contributions"
  on public.finance_goal_contributions for select to authenticated
  using (auth.uid() = user_id);

create or replace function public.set_finance_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at := timezone('utc'::text, now());
  return new;
end;
$$;

create trigger set_finance_obligations_updated_at
before update on public.finance_obligations
for each row execute function public.set_finance_updated_at();

create trigger set_finance_transactions_updated_at
before update on public.finance_transactions
for each row execute function public.set_finance_updated_at();

create trigger set_finance_goals_updated_at
before update on public.finance_goals
for each row execute function public.set_finance_updated_at();

create or replace function public.record_finance_goal_contribution(
  p_goal_id uuid,
  p_amount numeric,
  p_kind text default 'deposit',
  p_occurred_at timestamptz default timezone('utc'::text, now())
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_goal public.finance_goals%rowtype;
  v_transaction_id uuid;
  v_contribution_id uuid;
begin
  if v_user_id is null then
    raise exception using errcode = 'P0001', message = 'UNAUTHENTICATED';
  end if;
  if p_amount is null or p_amount <= 0 then
    raise exception using errcode = 'P0001', message = 'AMOUNT_INVALID';
  end if;
  if p_kind not in ('deposit', 'withdrawal') then
    raise exception using errcode = 'P0001', message = 'CONTRIBUTION_KIND_INVALID';
  end if;
  if p_occurred_at is null then
    raise exception using errcode = 'P0001', message = 'OCCURRED_AT_REQUIRED';
  end if;

  select * into v_goal
  from public.finance_goals
  where id = p_goal_id and user_id = v_user_id
  for update;

  if v_goal.id is null or v_goal.status <> 'active' then
    raise exception using errcode = 'P0001', message = 'GOAL_NOT_AVAILABLE';
  end if;

  insert into public.finance_transactions (
    user_id, kind, title, category, amount, currency, occurred_at, source
  ) values (
    v_user_id,
    case when p_kind = 'deposit' then 'expense' else 'income' end,
    case when p_kind = 'deposit' then 'Valor guardado em ' else 'Valor retirado de ' end || v_goal.title,
    'Cofrinho', p_amount, v_goal.currency, p_occurred_at, 'goal'
  ) returning id into v_transaction_id;

  insert into public.finance_goal_contributions (
    user_id, goal_id, transaction_id, kind, amount, occurred_at
  ) values (
    v_user_id, v_goal.id, v_transaction_id, p_kind, p_amount, p_occurred_at
  ) returning id into v_contribution_id;

  return v_contribution_id;
end;
$$;

create or replace function public.pay_finance_obligation(
  p_obligation_id uuid,
  p_paid_at timestamptz default timezone('utc'::text, now())
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_obligation public.finance_obligations%rowtype;
  v_transaction_id uuid;
begin
  if v_user_id is null then
    raise exception using errcode = 'P0001', message = 'UNAUTHENTICATED';
  end if;
  if p_paid_at is null then
    raise exception using errcode = 'P0001', message = 'PAID_AT_REQUIRED';
  end if;

  select * into v_obligation
  from public.finance_obligations
  where id = p_obligation_id and user_id = v_user_id
  for update;

  if v_obligation.id is null or v_obligation.status <> 'pending' then
    raise exception using errcode = 'P0001', message = 'OBLIGATION_NOT_AVAILABLE';
  end if;

  insert into public.finance_transactions (
    user_id, obligation_id, kind, title, category, amount, currency, occurred_at, source
  ) values (
    v_user_id, v_obligation.id, 'expense', v_obligation.title,
    case when v_obligation.kind = 'debt' then 'Dívidas' else 'Contas' end,
    v_obligation.amount, v_obligation.currency, p_paid_at, 'obligation'
  ) returning id into v_transaction_id;

  update public.finance_obligations
  set status = 'paid', paid_at = p_paid_at
  where id = v_obligation.id;

  return v_transaction_id;
end;
$$;

revoke all on function public.set_finance_updated_at() from public, anon, authenticated;
revoke all on function public.record_finance_goal_contribution(uuid, numeric, text, timestamptz) from public, anon;
revoke all on function public.pay_finance_obligation(uuid, timestamptz) from public, anon;
grant execute on function public.record_finance_goal_contribution(uuid, numeric, text, timestamptz) to authenticated;
grant execute on function public.pay_finance_obligation(uuid, timestamptz) to authenticated;

create view public.finance_goal_balances
with (security_invoker = true)
as
select
  goal.id,
  goal.user_id,
  goal.title,
  goal.note,
  goal.target_amount,
  goal.currency,
  goal.target_date,
  goal.status,
  goal.created_at,
  goal.updated_at,
  coalesce(sum(
    case contribution.kind
      when 'deposit' then contribution.amount
      else -contribution.amount
    end
  ), 0)::numeric(14, 2) as current_amount
from public.finance_goals goal
left join public.finance_goal_contributions contribution on contribution.goal_id = goal.id
group by goal.id;

revoke all on public.finance_goal_balances from public, anon;
grant select on public.finance_goal_balances to authenticated;
