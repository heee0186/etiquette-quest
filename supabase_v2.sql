-- 예절 실천 퀘스트 2.0 클라우드 저장용 표
-- Supabase 대시보드 > SQL Editor 에 이 내용을 통째로 붙여 넣고 Run 을 한 번 누르면 돼요.
-- 7월 버전(v1)이 쓰는 etiquette_app_state 표는 건드리지 않아요.
-- 여러 번 실행해도 괜찮아요.

create table if not exists public.etiquette_quest_v2_state (
  owner_id   uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  state      jsonb       not null,
  revision   integer     not null default 1,
  updated_at timestamptz not null default now()
);

-- 저장할 때마다 updated_at 을 지금 시각으로 바꿔요
create or replace function public.etiquette_quest_v2_touch()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists etiquette_quest_v2_touch on public.etiquette_quest_v2_state;
create trigger etiquette_quest_v2_touch
  before update on public.etiquette_quest_v2_state
  for each row execute function public.etiquette_quest_v2_touch();

-- 로그인한 교사 계정은 자기 줄만 읽고 쓸 수 있어요
alter table public.etiquette_quest_v2_state enable row level security;

drop policy if exists "v2 own row select" on public.etiquette_quest_v2_state;
drop policy if exists "v2 own row insert" on public.etiquette_quest_v2_state;
drop policy if exists "v2 own row update" on public.etiquette_quest_v2_state;

create policy "v2 own row select" on public.etiquette_quest_v2_state
  for select to authenticated using (owner_id = auth.uid());
create policy "v2 own row insert" on public.etiquette_quest_v2_state
  for insert to authenticated with check (owner_id = auth.uid());
create policy "v2 own row update" on public.etiquette_quest_v2_state
  for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

grant select, insert, update on public.etiquette_quest_v2_state to authenticated;
