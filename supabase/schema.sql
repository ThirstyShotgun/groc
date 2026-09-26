-- ==============================================================================
-- Prepr Database Schema for Supabase (PostgreSQL)
-- AI-Powered Mock Interview Simulator
-- ==============================================================================

-- 1. Create 'sessions' table
create table if not exists public.sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid,
  role_title text not null,
  difficulty text default 'entry',
  overall_score numeric,
  created_at timestamp with time zone default now()
);

-- 2. Create 'questions' table
create table if not exists public.questions (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.sessions(id) on delete cascade,
  question_text text not null,
  answer_text text,
  score numeric,
  feedback text,
  improvement_tip text,
  question_type text default 'Technical',
  order_index int,
  created_at timestamp with time zone default now()
);

-- 3. Create indexes for high-speed queries
create index if not exists idx_sessions_created_at on public.sessions(created_at desc);
create index if not exists idx_questions_session_id on public.questions(session_id);
create index if not exists idx_questions_order on public.questions(session_id, order_index asc);

-- 4. Enable Row Level Security (RLS) on both tables
alter table public.sessions enable row level security;
alter table public.questions enable row level security;

-- 5. Drop any conflicting older policies if re-running
drop policy if exists "Public sessions select" on public.sessions;
drop policy if exists "Public sessions insert" on public.sessions;
drop policy if exists "Public sessions update" on public.sessions;
drop policy if exists "Public sessions delete" on public.sessions;

drop policy if exists "Public questions select" on public.questions;
drop policy if exists "Public questions insert" on public.questions;
drop policy if exists "Public questions update" on public.questions;
drop policy if exists "Public questions delete" on public.questions;

-- 6. Permissive RLS Policies for Anonymous/Public MVP access
create policy "Public sessions select" on public.sessions for select using (true);
create policy "Public sessions insert" on public.sessions for insert with check (true);
create policy "Public sessions update" on public.sessions for update using (true);
create policy "Public sessions delete" on public.sessions for delete using (true);

create policy "Public questions select" on public.questions for select using (true);
create policy "Public questions insert" on public.questions for insert with check (true);
create policy "Public questions update" on public.questions for update using (true);
create policy "Public questions delete" on public.questions for delete using (true);

-- 7. Enable Realtime Replication for 'sessions'
-- This allows the dashboard to receive instant live updates as interviews complete
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'sessions'
  ) then
    alter publication supabase_realtime add table public.sessions;
  end if;
end $$;

-- 8. Add question_type column if upgrading an existing database
alter table public.questions add column if not exists question_type text default 'Technical';

-- 9. Create 'arcade_scores' table for Practice Arcade micro-drills
create table if not exists public.arcade_scores (
  id uuid default gen_random_uuid() primary key,
  user_id uuid,
  game_type text not null,
  score_value numeric not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now()
);

create index if not exists idx_arcade_scores_game_created on public.arcade_scores(game_type, created_at desc);
create index if not exists idx_arcade_scores_game_score on public.arcade_scores(game_type, score_value);

alter table public.arcade_scores enable row level security;

drop policy if exists "Public arcade_scores select" on public.arcade_scores;
drop policy if exists "Public arcade_scores insert" on public.arcade_scores;
drop policy if exists "Public arcade_scores update" on public.arcade_scores;
drop policy if exists "Public arcade_scores delete" on public.arcade_scores;

create policy "Public arcade_scores select" on public.arcade_scores for select using (true);
create policy "Public arcade_scores insert" on public.arcade_scores for insert with check (true);
create policy "Public arcade_scores update" on public.arcade_scores for update using (true);
create policy "Public arcade_scores delete" on public.arcade_scores for delete using (true);
