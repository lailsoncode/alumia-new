-- Create tasks table
create table public.tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  description text,
  date date,
  time text,
  priority text check (priority in ('alta', 'media', 'baixa')),
  reminder text check (reminder in ('na_hora', '5min', '15min', '30min')),
  done boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.tasks enable row level security;

-- Policies for RLS
create policy "Allow users to manage their own tasks"
  on public.tasks for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
