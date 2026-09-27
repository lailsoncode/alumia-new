-- Catálogo editorial e sessões privadas do módulo Mindfulness.
create table public.mindfulness_practices (
  id uuid default gen_random_uuid() primary key,
  code text not null,
  version integer not null default 1 check (version > 0),
  title text not null check (char_length(btrim(title)) between 1 and 100),
  description text not null,
  duration_minutes integer not null check (duration_minutes between 1 and 60),
  category text not null check (category in ('breathing', 'grounding', 'focus', 'calm', 'sleep')),
  formats text[] not null check (
    cardinality(formats) > 0
    and formats <@ array['audio', 'text']::text[]
  ),
  instructions text[] not null check (cardinality(instructions) > 0),
  reviewed_by text not null,
  sort_order integer not null default 0,
  published boolean not null default false,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  unique (code, version)
);

create table public.mindfulness_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  practice_id uuid not null references public.mindfulness_practices(id) on delete restrict,
  practice_code text not null,
  practice_version integer not null,
  practice_title text not null,
  format text not null check (format in ('audio', 'text')),
  elapsed_seconds integer not null check (elapsed_seconds between 0 and 14400),
  reflection text check (reflection in ('same', 'present', 'another')),
  ended_early boolean not null default false,
  started_at timestamptz not null,
  ended_at timestamptz not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  check (ended_at >= started_at)
);

create index mindfulness_practices_published_idx
  on public.mindfulness_practices (published, sort_order)
  where published = true;
create index mindfulness_sessions_user_started_idx
  on public.mindfulness_sessions (user_id, started_at desc);

alter table public.mindfulness_practices enable row level security;
alter table public.mindfulness_sessions enable row level security;

create policy "Authenticated users read published mindfulness practices"
  on public.mindfulness_practices for select to authenticated
  using (published = true);

create policy "Users read their own mindfulness sessions"
  on public.mindfulness_sessions for select to authenticated
  using (auth.uid() = user_id);
create policy "Users delete their own mindfulness sessions"
  on public.mindfulness_sessions for delete to authenticated
  using (auth.uid() = user_id);

insert into public.mindfulness_practices
  (code, version, title, description, duration_minutes, category, formats, instructions, reviewed_by, sort_order, published)
values
  ('ground_present', 1, 'Aterrissar no presente', 'Uma pausa breve para notar o que já está ao seu redor.', 3, 'grounding', array['audio', 'text'], array[
    'Encontre uma posição que pareça possível agora. Você não precisa fechar os olhos.',
    'Perceba os pontos do corpo apoiados pela cadeira, cama ou chão.',
    'Observe uma cor, uma forma e um som presentes ao seu redor.',
    'Fique aqui por mais um instante, sem precisar mudar nada.',
    'Quando fizer sentido, retome o seu dia no seu ritmo.'
  ], 'curadoria_alumia', 10, true),
  ('notice_body', 1, 'Notar o corpo', 'Um convite para perceber apoio, temperatura e contato.', 4, 'grounding', array['audio', 'text'], array[
    'Acomode-se sem buscar uma postura perfeita.',
    'Perceba onde seu corpo encontra apoio.',
    'Note a temperatura do ar e o contato da roupa com a pele.',
    'Se alguma sensação incomodar, leve a atenção para um ponto neutro ao redor.',
    'Termine quando quiser; perceber um pouco já é suficiente.'
  ], 'curadoria_alumia', 20, true),
  ('five_senses', 1, 'Pausa dos cinco sentidos', 'Use o ambiente como ponto de apoio para este momento.', 5, 'grounding', array['text'], array[
    'Olhe ao redor e escolha três coisas que você consegue ver.',
    'Perceba dois sons próximos ou distantes.',
    'Note um ponto de contato do corpo com alguma superfície.',
    'Se quiser, perceba um cheiro ou sabor presente.',
    'Volte ao ambiente completo quando estiver pronto.'
  ], 'curadoria_alumia', 30, true),
  ('breathe_without_counting', 1, 'Respirar sem contar', 'Observe a respiração sem controlar o ritmo.', 3, 'breathing', array['audio', 'text'], array[
    'Mantenha os olhos abertos ou fechados, como for mais confortável.',
    'Perceba o ar entrando e saindo, sem precisar aprofundar.',
    'Deixe cada respiração seguir o próprio ritmo.',
    'Se respirar não estiver confortável, perceba os sons ao redor.',
    'Encerre quando quiser e retome o ambiente aos poucos.'
  ], 'curadoria_alumia', 40, true),
  ('morning_presence', 1, 'Começar o dia com presença', 'Observe o começo do dia antes de escolher o próximo gesto.', 3, 'focus', array['audio', 'text'], array[
    'Perceba como você chegou a este momento.',
    'Observe uma coisa que pede atenção hoje, sem resolvê-la agora.',
    'Escolha um gesto pequeno e possível para começar.',
    'Guarde espaço para mudar de ideia se o dia pedir outro ritmo.'
  ], 'curadoria_alumia', 50, true),
  ('welcome_thoughts', 1, 'Acolher pensamentos', 'Note pensamentos sem precisar discutir com eles.', 6, 'calm', array['text'], array[
    'Perceba que pensamentos estão passando agora.',
    'Você pode nomeá-los apenas como pensamento, lembrança ou preocupação.',
    'Não é necessário afastar nem resolver nenhum deles.',
    'Leve a atenção para um objeto ou som do ambiente por alguns instantes.',
    'Volte ao que estava fazendo quando parecer possível.'
  ], 'curadoria_alumia', 60, true),
  ('gentle_kindness', 1, 'Cultivar gentileza', 'Uma prática curta de linguagem cuidadosa consigo.', 7, 'calm', array['audio', 'text'], array[
    'Lembre de algo que tem exigido energia de você.',
    'Note como você falaria com alguém querido nessa mesma situação.',
    'Experimente oferecer a si uma frase simples e realista de cuidado.',
    'Você não precisa acreditar totalmente nela agora.',
    'Permaneça apenas pelo tempo que fizer sentido.'
  ], 'curadoria_alumia', 70, true),
  ('slow_evening', 1, 'Desacelerar à noite', 'Uma transição suave para diminuir estímulos.', 5, 'sleep', array['audio', 'text'], array[
    'Se puder, reduza um pouco a luz ou o brilho da tela.',
    'Perceba três pontos de apoio do seu corpo.',
    'Solte apenas a tensão que for confortável soltar.',
    'Deixe as tarefas de amanhã para o momento de amanhã.',
    'Encerre a prática sem obrigação de dormir ou relaxar.'
  ], 'curadoria_alumia', 80, true);

create or replace function public.create_mindfulness_session(
  p_practice_id uuid,
  p_started_at timestamptz,
  p_elapsed_seconds integer,
  p_format text,
  p_reflection text,
  p_ended_early boolean
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_practice public.mindfulness_practices%rowtype;
  v_session_id uuid;
  v_ended_at timestamptz := timezone('utc'::text, now());
begin
  if v_user_id is null then
    raise exception using errcode = 'P0001', message = 'UNAUTHENTICATED';
  end if;
  select * into v_practice from public.mindfulness_practices
  where id = p_practice_id and published = true;
  if v_practice.id is null then
    raise exception using errcode = 'P0001', message = 'PRACTICE_NOT_AVAILABLE';
  end if;
  if p_format is null or not (p_format = any(v_practice.formats)) then
    raise exception using errcode = 'P0001', message = 'FORMAT_NOT_AVAILABLE';
  end if;
  if p_elapsed_seconds is null or p_elapsed_seconds < 0 or p_elapsed_seconds > 14400 then
    raise exception using errcode = 'P0001', message = 'ELAPSED_SECONDS_INVALID';
  end if;
  if p_started_at is null or p_started_at > v_ended_at then
    raise exception using errcode = 'P0001', message = 'STARTED_AT_INVALID';
  end if;
  if p_reflection is not null and p_reflection not in ('same', 'present', 'another') then
    raise exception using errcode = 'P0001', message = 'REFLECTION_INVALID';
  end if;

  insert into public.mindfulness_sessions (
    user_id, practice_id, practice_code, practice_version, practice_title,
    format, elapsed_seconds, reflection, ended_early, started_at, ended_at
  ) values (
    v_user_id, v_practice.id, v_practice.code, v_practice.version, v_practice.title,
    p_format, p_elapsed_seconds, p_reflection, coalesce(p_ended_early, false), p_started_at, v_ended_at
  ) returning id into v_session_id;
  return v_session_id;
end;
$$;

revoke all on function public.create_mindfulness_session(uuid, timestamptz, integer, text, text, boolean) from public;
revoke all on function public.create_mindfulness_session(uuid, timestamptz, integer, text, text, boolean) from anon;
grant execute on function public.create_mindfulness_session(uuid, timestamptz, integer, text, text, boolean) to authenticated;
