# Prepr — AI-Powered Mock Interview Simulator

Prepr is a full-stack AI interview preparation platform designed to help software engineers, product managers, and leaders master technical and behavioral interviews.

---

## 🍂 Design Theme: "Dusky Blueberry Autumn"
A moody, warm autumn-evening palette featuring deep blueberry card surfaces, warm cream typography, and burnt rust/amber accents:

- **Primary Background**: `#2E2A47` (deep dusky blueberry)
- **Secondary / Card Surfaces**: `#3B3560` (lighter dusky blueberry)
- **Primary Accent**: `#C1652F` (burnt rust orange)
- **Secondary Accent**: `#E0A458` (warm amber gold)
- **Tertiary Accent**: `#7A5C7E` (dusty plum)
- **Text (Primary)**: `#F5EDE1` (warm cream)
- **Text (Muted)**: `#B8AFC9` (dusty lavender-grey)
- **Positive / High Score**: `#8FA37E` (muted autumn sage)
- **Needs Improvement**: `#B5533C` (deep terracotta red)
- **Typography**: Poppins for headings & Inter for body.

---

## 🚀 Key Features

1. **Role-Tailored AI Question Generation**:
   - Enter any job role (e.g. *Senior Frontend Engineer*, *Product Manager*, *Staff DevOps Architect*).
   - Generates 5 realistic, multifaceted interview questions covering fundamentals, system design, trade-offs, and behavioral execution.
   - Structured JSON output powered by **Groq LLaMA 3.3 70B** (`llama-3.3-70b-versatile`).

2. **One-At-A-Time Interview Flow (`/interview`)**:
   - Sequential question delivery with progress tracker (`Q2 of 5`).
   - Clean text response interface with word count and STAR framework advice.
   - Instant AI scoring (`0-100`), key strengths breakdown, and concrete improvement tips.
   - Confetti celebration upon session completion with a full expandable question-by-question review.

3. **Performance Dashboard (`/dashboard`)**:
   - Score trajectory chart rendered via **Recharts**, styled with amber `#E0A458` line curves on dusky blueberry `#3B3560` cards.
   - Top metrics: Total Sessions, Average Score, Highest Score, and Most Practiced Role.
   - Session history list with deep-dive modal breakdown.

4. **Dual Persistence (Supabase + Offline Fallback)**:
   - Persists all interview sessions and individual question records to **Supabase (PostgreSQL)** with RLS enabled.
   - Automatic fallback to browser `localStorage` when credentials are not yet configured, ensuring zero downtime.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS v4 with custom Dusky Blueberry Autumn `@theme` tokens
- **LLM Engine**: Groq API (`groq-sdk`, model `llama-3.3-70b-versatile`)
- **Database**: Supabase (Postgres + Row Level Security)
- **Charts**: Recharts
- **Icons & Effects**: Lucide React + Canvas Confetti
- **Target Deployment**: Vercel

---

## 📦 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create `.env.local` based on `.env.example`:
```env
# Groq API Key (from https://console.groq.com/keys)
GROQ_API_KEY=gsk_your_groq_api_key_here

# Supabase Credentials (from Supabase Project Settings -> API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

*(Note: Even without API keys set, Prepr includes high-quality fallback questions and heuristic scoring with local storage persistence so you can evaluate the complete user experience immediately.)*

### 3. Setup Supabase Database
In your [Supabase Dashboard](https://supabase.com/dashboard) SQL Editor, execute the SQL script in [supabase/schema.sql](supabase/schema.sql):

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID DEFAULT NULL,
    role_title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100)
);

CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    answer_text TEXT,
    score INTEGER CHECK (score >= 0 AND score <= 100),
    feedback TEXT,
    order_index INTEGER NOT NULL
);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon insert sessions" ON public.sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon select sessions" ON public.sessions FOR SELECT USING (true);
CREATE POLICY "Allow anon insert questions" ON public.questions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon select questions" ON public.questions FOR SELECT USING (true);
```

### 4. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚢 Deploy to Vercel

1. Push your repository to GitHub / GitLab.
2. Import the project into [Vercel](https://vercel.com/new).
3. Set the environment variables in your Vercel Project Settings:
   - `GROQ_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!
