-- Criar tabela de logs de hidratação
create table public.hydration_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  amount_ml integer not null check (amount_ml > 0),
  date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS
alter table public.hydration_logs enable row level security;

-- Política de RLS para gerenciamento próprio
create policy "Allow users to manage their own hydration logs"
  on public.hydration_logs for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
