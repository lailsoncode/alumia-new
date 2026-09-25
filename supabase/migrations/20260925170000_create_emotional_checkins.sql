-- Catálogos editoriais e registros privados do check-in emocional.
alter table public.tasks
  add column if not exists module_key text not null default 'tasks'
  check (module_key in ('tasks', 'hydration', 'checkin', 'mindfulness', 'student', 'alumia_ai'));

create table public.checkin_emotions (
  id uuid default gen_random_uuid() primary key,
  code text not null unique,
  label text not null,
  emoji text not null default '',
  valence text not null check (valence in ('positive', 'difficult')),
  sort_order integer not null default 0,
  published boolean not null default false,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create table public.checkin_needs (
  id uuid default gen_random_uuid() primary key,
  code text not null unique,
  label text not null,
  emoji text not null default '',
  sort_order integer not null default 0,
  published boolean not null default false,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create table public.care_suggestions (
  id uuid default gen_random_uuid() primary key,
  code text not null,
  version integer not null default 1 check (version > 0),
  title text not null,
  body text not null,
  action_text text not null,
  action_category text not null,
  published boolean not null default false,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  unique (code, version)
);

create table public.checkin_suggestion_rules (
  id uuid default gen_random_uuid() primary key,
  need_code text references public.checkin_needs(code) on update cascade on delete cascade,
  mood_category text check (mood_category in (
    'very_difficult', 'difficult', 'slightly_difficult', 'mixed',
    'slightly_positive', 'positive', 'very_positive'
  )),
  suggestion_id uuid not null references public.care_suggestions(id) on delete cascade,
  priority integer not null default 0,
  published boolean not null default false,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create table public.care_checkins (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  need_code text not null references public.checkin_needs(code) on update cascade,
  mood_category text not null check (mood_category in (
    'very_difficult', 'difficult', 'slightly_difficult', 'mixed',
    'slightly_positive', 'positive', 'very_positive'
  )),
  idempotency_key uuid not null,
  occurred_at timestamptz default timezone('utc'::text, now()) not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  unique (user_id, idempotency_key)
);

create table public.care_checkin_emotions (
  checkin_id uuid not null references public.care_checkins(id) on delete cascade,
  emotion_code text not null references public.checkin_emotions(code) on update cascade,
  primary key (checkin_id, emotion_code)
);

create table public.checkin_suggestion_snapshots (
  id uuid default gen_random_uuid() primary key,
  checkin_id uuid not null unique references public.care_checkins(id) on delete cascade,
  suggestion_code text not null,
  suggestion_version integer not null,
  title text not null,
  body text not null,
  action_text text not null,
  action_category text not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create index care_checkins_user_occurred_at_idx on public.care_checkins (user_id, occurred_at desc);
create index checkin_suggestion_rules_match_idx
  on public.checkin_suggestion_rules (need_code, mood_category, priority desc)
  where published = true;

alter table public.checkin_emotions enable row level security;
alter table public.checkin_needs enable row level security;
alter table public.care_suggestions enable row level security;
alter table public.checkin_suggestion_rules enable row level security;
alter table public.care_checkins enable row level security;
alter table public.care_checkin_emotions enable row level security;
alter table public.checkin_suggestion_snapshots enable row level security;

create policy "Authenticated users can read published checkin emotions"
  on public.checkin_emotions for select to authenticated using (published = true);
create policy "Authenticated users can read published checkin needs"
  on public.checkin_needs for select to authenticated using (published = true);
create policy "Users can read their own care checkins"
  on public.care_checkins for select to authenticated using (auth.uid() = user_id);
create policy "Users can delete their own care checkins"
  on public.care_checkins for delete to authenticated using (auth.uid() = user_id);
create policy "Users can read emotions from their own care checkins"
  on public.care_checkin_emotions for select to authenticated
  using (exists (
    select 1 from public.care_checkins
    where care_checkins.id = care_checkin_emotions.checkin_id
      and care_checkins.user_id = auth.uid()
  ));
create policy "Users can read snapshots from their own care checkins"
  on public.checkin_suggestion_snapshots for select to authenticated
  using (exists (
    select 1 from public.care_checkins
    where care_checkins.id = checkin_suggestion_snapshots.checkin_id
      and care_checkins.user_id = auth.uid()
  ));

insert into public.checkin_emotions (code, label, emoji, valence, sort_order, published) values
  ('motivated', 'Motivado(a)', '💪', 'positive', 10, true),
  ('grateful', 'Grato(a)', '🙏', 'positive', 20, true),
  ('calm', 'Calmo(a)', '😌', 'positive', 30, true),
  ('hopeful', 'Esperançoso(a)', '🤞', 'positive', 40, true),
  ('happy', 'Feliz', '😀', 'positive', 50, true),
  ('animated', 'Animado(a)', '😊', 'positive', 60, true),
  ('proud', 'Orgulhoso(a)', '😎', 'positive', 70, true),
  ('relieved', 'Aliviado(a)', '☺️', 'positive', 80, true),
  ('anxious', 'Ansioso(a)', '😰', 'difficult', 110, true),
  ('overwhelmed', 'Sobrecarregado(a)', '😵', 'difficult', 120, true),
  ('irritated', 'Irritado(a)', '😠', 'difficult', 130, true),
  ('lonely', 'Sozinho(a)', '😔', 'difficult', 140, true),
  ('stressed', 'Estressado(a)', '😤', 'difficult', 150, true),
  ('sad', 'Triste', '😢', 'difficult', 160, true),
  ('tired', 'Cansado(a)', '😴', 'difficult', 170, true),
  ('confused', 'Confuso(a)', '🙁', 'difficult', 180, true);

insert into public.checkin_needs (code, label, emoji, sort_order, published) values
  ('focus', 'Preciso de foco', '🎯', 10, true),
  ('calm', 'Preciso de calma', '🧘', 20, true),
  ('energy', 'Preciso de energia', '⚡', 30, true),
  ('support', 'Preciso de apoio', '🫂', 40, true),
  ('just_record', 'Só queria registrar', '📝', 50, true);

insert into public.care_suggestions (code, version, title, body, action_text, action_category, published) values
  ('focus_difficult', 1, 'Uma coisa de cada vez', 'Quando tudo parece urgente, escolher menos também pode ser cuidado.', 'Que tal separar uma única tarefa simples para este momento? O restante pode esperar.', 'prioritization', true),
  ('focus_mixed', 1, 'Seu tempo merece cuidado', 'Sentimentos mistos podem disputar a atenção. Você não precisa organizar tudo de uma vez.', 'Talvez um timer curto e uma tarefa pequena ajudem a encontrar o começo.', 'focus', true),
  ('focus_positive', 1, 'Direcione essa energia com leveza', 'É bom perceber disposição sem precisar transformá-la em cobrança.', 'Você pode escolher o que mais importa e também guardar espaço para uma pausa.', 'focus', true),
  ('calm_difficult', 1, 'Você pode desacelerar agora', 'O que está pesado pode ser acolhido sem precisar ser resolvido neste instante.', 'Se fizer sentido, solte os ombros e acompanhe três respirações tranquilas.', 'breathing', true),
  ('calm_mixed', 1, 'Um pouco de silêncio também cuida', 'Há dias em que muitas coisas convivem por dentro. Isso é válido.', 'Talvez fechar os olhos por um minuto e notar os pés no chão traga um pequeno respiro.', 'pause', true),
  ('calm_positive', 1, 'Cuide da calma que encontrou', 'Momentos leves também merecem presença e atenção.', 'Você pode preservar esse ritmo com alguns instantes longe da tela.', 'pause', true),
  ('energy_difficult', 1, 'Energia também volta aos poucos', 'Cansaço e sobrecarga não são falhas. Seu corpo pode estar pedindo gentileza.', 'Um pouco de água, luz natural ou um alongamento leve pode ser suficiente agora.', 'body_care', true),
  ('energy_mixed', 1, 'Escute o ritmo de hoje', 'Nem todo momento precisa ter a mesma força para continuar sendo válido.', 'Talvez uma música querida ou alguns movimentos suaves ajudem o corpo a despertar.', 'music', true),
  ('energy_positive', 1, 'Leveza também sustenta a força', 'Essa disposição pode ser aproveitada sem que você precise se esgotar.', 'Que tal direcionar a energia para algo que inspira e deixar uma pausa reservada?', 'body_care', true),
  ('support_difficult', 1, 'Você não precisa atravessar tudo sozinho(a)', 'Pedir companhia ou escuta pode ser um gesto de coragem e cuidado.', 'Considere enviar uma mensagem simples para alguém de confiança dizendo que gostaria de conversar.', 'support', true),
  ('support_mixed', 1, 'Há espaço para ser cuidado(a)', 'Mesmo quando é difícil explicar, sua experiência merece escuta.', 'Talvez ficar perto de alguém seguro, mesmo sem falar muito, já ofereça algum apoio.', 'support', true),
  ('support_positive', 1, 'Receber cuidado também é afeto', 'Estar bem não elimina a necessidade de vínculo e acolhimento.', 'Você pode compartilhar esse momento com alguém querido e também se permitir receber presença.', 'support', true),
  ('record_difficult', 1, 'Seu momento foi acolhido', 'Perceber o que está difícil já é um gesto de cuidado consigo.', 'Você pode simplesmente deixar este registro aqui. Não precisa fazer mais nada agora.', 'record', true),
  ('record_mixed', 1, 'O que você sente tem lugar aqui', 'Sentimentos diferentes podem existir ao mesmo tempo, sem precisar de explicação.', 'Este registro já basta. Volte a ele somente quando fizer sentido.', 'record', true),
  ('record_positive', 1, 'Este momento também merece memória', 'Reconhecer o que faz bem ajuda a guardar a delicadeza do dia.', 'Talvez anotar uma pequena coisa boa ajude a lembrar deste instante depois.', 'gratitude', true),
  ('gentle_fallback', 1, 'Obrigado por escutar o seu momento', 'O que você sente pode estar aqui sem julgamento.', 'Escolha o próximo gesto apenas quando fizer sentido para você.', 'care', true);

with category_map(mood_category, group_name) as (
  values ('very_difficult', 'difficult'), ('difficult', 'difficult'),
    ('slightly_difficult', 'difficult'), ('mixed', 'mixed'),
    ('slightly_positive', 'positive'), ('positive', 'positive'),
    ('very_positive', 'positive')
), need_map(need_code, suggestion_prefix) as (
  values ('focus', 'focus'), ('calm', 'calm'), ('energy', 'energy'),
    ('support', 'support'), ('just_record', 'record')
)
insert into public.checkin_suggestion_rules (need_code, mood_category, suggestion_id, priority, published)
select n.need_code, c.mood_category, s.id, 100, true
from category_map c cross join need_map n
join public.care_suggestions s on s.code = n.suggestion_prefix || '_' || c.group_name and s.version = 1;

insert into public.checkin_suggestion_rules (suggestion_id, priority, published)
select id, 0, true from public.care_suggestions where code = 'gentle_fallback' and version = 1;

create or replace function public.create_care_checkin(
  p_emotion_codes text[], p_need_code text, p_idempotency_key uuid
)
returns table (
  checkin_id uuid, occurred_at timestamptz, mood_category text,
  suggestion_code text, suggestion_version integer, suggestion_title text,
  suggestion_body text, suggestion_action_text text, suggestion_action_category text
)
language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_emotion_codes text[];
  v_positive_count integer;
  v_difficult_count integer;
  v_score integer;
  v_mood_category text;
  v_checkin_id uuid;
  v_occurred_at timestamptz;
  v_suggestion public.care_suggestions%rowtype;
begin
  if v_user_id is null then
    raise exception using errcode = 'P0001', message = 'UNAUTHENTICATED';
  end if;

  select array_agg(distinct emotion_code order by emotion_code) into v_emotion_codes
  from unnest(coalesce(p_emotion_codes, array[]::text[])) emotion_code;

  if coalesce(cardinality(v_emotion_codes), 0) = 0 then
    raise exception using errcode = 'P0001', message = 'EMOTION_REQUIRED';
  end if;
  if exists (
    select 1 from unnest(v_emotion_codes) selected(code)
    where not exists (
      select 1 from public.checkin_emotions emotion
      where emotion.code = selected.code and emotion.published = true
    )
  ) then
    raise exception using errcode = 'P0001', message = 'EMOTION_NOT_AVAILABLE';
  end if;

  select count(*) filter (where valence = 'positive'), count(*) filter (where valence = 'difficult')
    into v_positive_count, v_difficult_count
  from public.checkin_emotions where code = any(v_emotion_codes);
  if v_positive_count > 3 or v_difficult_count > 3 then
    raise exception using errcode = 'P0001', message = 'EMOTION_LIMIT_EXCEEDED';
  end if;
  if p_need_code is null or not exists (
    select 1 from public.checkin_needs where code = p_need_code and published = true
  ) then
    raise exception using errcode = 'P0001', message = 'NEED_NOT_AVAILABLE';
  end if;

  select c.id, c.occurred_at into v_checkin_id, v_occurred_at
  from public.care_checkins c
  where c.user_id = v_user_id and c.idempotency_key = p_idempotency_key;
  if v_checkin_id is not null then
    return query select v_checkin_id, v_occurred_at, c.mood_category, s.suggestion_code,
      s.suggestion_version, s.title, s.body, s.action_text, s.action_category
    from public.care_checkins c join public.checkin_suggestion_snapshots s on s.checkin_id = c.id
    where c.id = v_checkin_id;
    return;
  end if;

  v_score := greatest(-3, least(3, v_positive_count - v_difficult_count));
  v_mood_category := case v_score
    when -3 then 'very_difficult' when -2 then 'difficult'
    when -1 then 'slightly_difficult' when 0 then 'mixed'
    when 1 then 'slightly_positive' when 2 then 'positive'
    else 'very_positive' end;

  select suggestion.* into v_suggestion
  from public.checkin_suggestion_rules rule
  join public.care_suggestions suggestion on suggestion.id = rule.suggestion_id
  where rule.published and suggestion.published
    and (rule.need_code is null or rule.need_code = p_need_code)
    and (rule.mood_category is null or rule.mood_category = v_mood_category)
  order by ((rule.need_code is not null)::integer + (rule.mood_category is not null)::integer) desc,
    rule.priority desc, rule.created_at asc limit 1;
  if v_suggestion.id is null then
    raise exception using errcode = 'P0001', message = 'SUGGESTION_NOT_AVAILABLE';
  end if;

  insert into public.care_checkins (user_id, need_code, mood_category, idempotency_key)
  values (v_user_id, p_need_code, v_mood_category, p_idempotency_key)
  returning id, care_checkins.occurred_at into v_checkin_id, v_occurred_at;
  insert into public.care_checkin_emotions (checkin_id, emotion_code)
  select v_checkin_id, code from unnest(v_emotion_codes) code;
  insert into public.checkin_suggestion_snapshots
    (checkin_id, suggestion_code, suggestion_version, title, body, action_text, action_category)
  values (v_checkin_id, v_suggestion.code, v_suggestion.version, v_suggestion.title,
    v_suggestion.body, v_suggestion.action_text, v_suggestion.action_category);

  return query select v_checkin_id, v_occurred_at, v_mood_category, v_suggestion.code,
    v_suggestion.version, v_suggestion.title, v_suggestion.body,
    v_suggestion.action_text, v_suggestion.action_category;
end;
$$;

revoke all on function public.create_care_checkin(text[], text, uuid) from public;
revoke all on function public.create_care_checkin(text[], text, uuid) from anon;
grant execute on function public.create_care_checkin(text[], text, uuid) to authenticated;
