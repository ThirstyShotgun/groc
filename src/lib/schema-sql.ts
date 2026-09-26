export const PREPR_SQL_SCHEMA = `-- Supabase Schema for Prepr
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID DEFAULT NULL,
    role_title TEXT NOT NULL,
    difficulty TEXT DEFAULT 'entry',
    overall_score NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    answer_text TEXT,
    score INTEGER CHECK (score >= 0 AND score <= 100),
    feedback TEXT,
    improvement_tip TEXT,
    order_index INTEGER NOT NULL
);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon insert sessions"  ON public.sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon select sessions"  ON public.sessions FOR SELECT USING (true);
CREATE POLICY "Allow anon update sessions"  ON public.sessions FOR UPDATE USING (true);
CREATE POLICY "Allow anon insert questions" ON public.questions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon select questions" ON public.questions FOR SELECT USING (true);
CREATE POLICY "Allow anon update questions" ON public.questions FOR UPDATE USING (true);

CREATE TABLE IF NOT EXISTS public.arcade_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID DEFAULT NULL,
    game_type TEXT NOT NULL,
    score_value NUMERIC NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.arcade_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon insert arcade_scores" ON public.arcade_scores FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon select arcade_scores" ON public.arcade_scores FOR SELECT USING (true);
CREATE POLICY "Allow anon update arcade_scores" ON public.arcade_scores FOR UPDATE USING (true);`;
