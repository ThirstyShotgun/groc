import { NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// The migration SQL
const MIGRATION_SQL = `
-- Create sessions table
create table if not exists public.sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid,
  role_title text not null,
  difficulty text default 'entry',
  overall_score numeric,
  created_at timestamp with time zone default now()
);

-- Create questions table
create table if not exists public.questions (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.sessions(id) on delete cascade,
  question_text text not null,
  answer_text text,
  score numeric,
  feedback text,
  improvement_tip text,
  order_index int,
  created_at timestamp with time zone default now()
);

-- Indexes
create index if not exists idx_sessions_created_at on public.sessions(created_at desc);
create index if not exists idx_questions_session_id on public.questions(session_id);
create index if not exists idx_questions_order on public.questions(session_id, order_index asc);

-- RLS
alter table public.sessions enable row level security;
alter table public.questions enable row level security;

-- Drop old policies
drop policy if exists "Public sessions select" on public.sessions;
drop policy if exists "Public sessions insert" on public.sessions;
drop policy if exists "Public sessions update" on public.sessions;
drop policy if exists "Public sessions delete" on public.sessions;
drop policy if exists "Public questions select" on public.questions;
drop policy if exists "Public questions insert" on public.questions;
drop policy if exists "Public questions update" on public.questions;
drop policy if exists "Public questions delete" on public.questions;

-- RLS policies
create policy "Public sessions select" on public.sessions for select using (true);
create policy "Public sessions insert" on public.sessions for insert with check (true);
create policy "Public sessions update" on public.sessions for update using (true);
create policy "Public sessions delete" on public.sessions for delete using (true);
create policy "Public questions select" on public.questions for select using (true);
create policy "Public questions insert" on public.questions for insert with check (true);
create policy "Public questions update" on public.questions for update using (true);
create policy "Public questions delete" on public.questions for delete using (true);
`;

export async function POST() {
  // Execute each statement separately via PostgREST's query param
  const results: Array<{ sql: string; status: string; error?: string }> = [];
  
  // Split into individual statements and run each
  const statements = MIGRATION_SQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 10 && !s.startsWith('--'));
  
  for (const stmt of statements) {
    try {
      // Use the SQL execution via pg function
      const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`
        },
        body: JSON.stringify({ sql: stmt + ';' })
      });
      const data = await r.text();
      results.push({ sql: stmt.slice(0, 60) + '...', status: r.ok ? 'ok' : 'error', error: r.ok ? undefined : data });
    } catch (e: unknown) {
      results.push({ sql: stmt.slice(0, 60) + '...', status: 'exception', error: e instanceof Error ? e.message : String(e) });
    }
  }
  
  return NextResponse.json({ results, note: 'exec_sql rpc may not exist — see migration instructions below' });
}

export async function GET() {
  return NextResponse.json({
    instructions: 'Run this SQL in your Supabase SQL Editor at https://supabase.com/dashboard/project/bhraoafxgrrepghgvnja/sql/new',
    sql: MIGRATION_SQL,
    steps: [
      '1. Go to https://supabase.com/dashboard/project/bhraoafxgrrepghgvnja/sql/new',
      '2. Paste the SQL from the "sql" field above into the editor',
      '3. Click "Run" (or press Ctrl+Enter)',
      '4. You should see "Success. No rows returned" for each DDL statement',
      '5. Come back and call POST /api/run-migration to verify tables exist, or run the test again'
    ]
  });
}
