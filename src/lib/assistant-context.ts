import { supabaseServer } from '@/lib/supabase-server';

export interface AssistantSessionData {
  id?: string;
  role_title?: string;
  difficulty?: string;
  overall_score?: number | null;
  created_at?: string;
  questions?: Array<{
    question_text?: string;
    score?: number | null;
    feedback?: string | null;
    improvement_tip?: string | null;
  }>;
}

export async function fetchUserInventory(clientSessions?: AssistantSessionData[]): Promise<string> {
  let sessions: AssistantSessionData[] = [];

  if (supabaseServer) {
    try {
      const { data, error } = await supabaseServer
        .from('sessions')
        .select(`
          id, role_title, difficulty, overall_score, created_at,
          questions ( question_text, score, feedback )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && data && data.length > 0) {
        sessions = data as AssistantSessionData[];
      }
    } catch (err) {
      console.warn('[AssistantContext] Supabase query failed:', err);
    }
  }

  // Fallback to client sessions from localStorage if Supabase has no data
  if (sessions.length === 0 && clientSessions && clientSessions.length > 0) {
    sessions = clientSessions;
  }

  if (sessions.length === 0) {
    return 'USER INVENTORY: No interview sessions recorded yet. The user has not started any practice sessions.';
  }

  const totalSessions = sessions.length;
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const sessionsThisWeek = sessions.filter(s => s.created_at && new Date(s.created_at).getTime() >= oneWeekAgo).length;

  const roleCounts: Record<string, number> = {};
  sessions.forEach(s => {
    const role = s.role_title || 'General';
    roleCounts[role] = (roleCounts[role] || 0) + 1;
  });

  const latest = sessions[0];
  const questionsWithScores = sessions
    .flatMap(s => (s.questions || []).map(q => ({ ...q, role: s.role_title })))
    .filter(q => typeof q.score === 'number' && q.score !== null) as Array<{
      question_text?: string;
      score: number;
      feedback?: string | null;
      role?: string;
    }>;

  questionsWithScores.sort((a, b) => a.score - b.score);
  const weakest = questionsWithScores.slice(0, 2);
  const strongest = [...questionsWithScores].reverse().slice(0, 2);

  const scoresList = sessions.map(s => s.overall_score).filter((sc): sc is number => typeof sc === 'number' && sc !== null);
  const avgScore = scoresList.length > 0 ? Math.round(scoresList.reduce((a, b) => a + b, 0) / scoresList.length) : null;

  return `USER INVENTORY (Real practice data from Supabase/database):
- Total Sessions Recorded: ${totalSessions}
- Sessions Completed This Week: ${sessionsThisWeek}
- Role Frequency: ${Object.entries(roleCounts).map(([r, c]) => `${r} (${c}x)`).join(', ')}
- Average Overall Score: ${avgScore !== null ? `${avgScore}/100` : 'In progress / partial'}
- Latest Session:
  * Role: ${latest.role_title || 'N/A'} (${latest.difficulty || 'mid'})
  * Date: ${latest.created_at ? new Date(latest.created_at).toLocaleDateString() : 'Recent'}
  * Score: ${latest.overall_score !== null && latest.overall_score !== undefined ? `${latest.overall_score}/100` : 'Partial/In-progress'}
  * Questions Scored: ${(latest.questions || []).filter(q => q.score !== null && q.score !== undefined).map(q => `"${q.question_text?.slice(0, 60)}..." (Score: ${q.score}/100)`).join('; ') || 'None'}
- Top Weak Areas (Lowest Scores):
${weakest.map(w => `  * [${w.score}/100] "${w.question_text?.slice(0, 75)}..." Tip/Feedback: ${w.feedback?.slice(0, 100) || 'None'}`).join('\n') || '  * None recorded yet'}
- Top Strong Areas (Highest Scores):
${strongest.map(s => `  * [${s.score}/100] "${s.question_text?.slice(0, 75)}..."`).join('\n') || '  * None recorded yet'}`;
}

export function buildSystemPrompt(inventoryContext: string, currentPage: string): string {
  return `You are Prepr's embedded AI Interview Assistant and performance coach.
Your job is to assist users with technical and behavioral interview preparation and help them understand their personal performance.

VOICE & TONE:
- Direct, encouraging, concise, and tactical (like an experienced engineering hiring manager / tech lead).
- Avoid fluff, excessive disclaimers, or generic AI chatter.
- Format responses cleanly using short paragraphs or bullet points.

CAPABILITIES:
1. General Interview Guidance: STAR method, answer structure, trade-off communication, behavioral strategies, technical depth tips.
2. Personal Inventory Lookup: Answer questions like "How did my last session go?", "What am I weakest at?", "How many sessions have I done?", "What should I practice next?". When asked, cite their ACTUAL data from the USER INVENTORY below.
3. Page Awareness: The user is currently browsing "${currentPage}".
   - On "/" (landing): guide them toward starting their first practice session or exploring features.
   - On "/interview" (simulator): offer concise answering tips, time management, or frameworks without giving away the exact answer.
   - On "/dashboard" (history): offer analytical insights into score trends and target areas for improvement.

GUARDRAILS:
- Always use the real USER INVENTORY below when discussing user progress. If no sessions exist, state so politely and encourage them to complete their first 5-question simulator.
- If asked about non-interview topics (e.g. recipes, general trivia, politics), politely redirect: "I specialize in interview prep and tracking your performance on Prepr. How can I help with your practice?"

${inventoryContext}`;
}
