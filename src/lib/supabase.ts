import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { InterviewSession, Question } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  supabaseAnonKey.length > 20
);

/**
 * Browser-side Supabase client initialized with anonymous public credentials.
 * Elevated operations must run server-side via `lib/supabase-server.ts`.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const LOCAL_STORAGE_KEY = 'prepr_mock_sessions_v1';

/**
 * Valid RFC4122 v4 UUID generator for client-side fallback IDs
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Local Storage service for offline/demo resilience when Supabase is not yet configured
 */
export const localStorageService = {
  getSessions: (): InterviewSession[] => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!stored) {
        const initialMock: InterviewSession[] = [
          {
            id: generateUUID(),
            role_title: 'Full Stack Engineer',
            difficulty: 'senior',
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            overall_score: 82,
            questions: [
              {
                id: generateUUID(),
                order_index: 1,
                question_text: 'Explain the difference between optimistic updates and pessimistic updates in UI state management.',
                answer_text: 'Optimistic updates reflect UI changes immediately before server confirmation, while pessimistic waits for server response.',
                score: 85,
                feedback: 'Clear, concise explanation with good distinction.',
                improvement_tip: 'Mention rollback error handling strategies when optimistic mutations fail.'
              },
              {
                id: generateUUID(),
                order_index: 2,
                question_text: 'How do you design a database schema to handle high read/write concurrency for an e-commerce order system?',
                answer_text: 'Use partitioning, indexing on frequent lookup fields, read replicas, and caching layer like Redis for inventory.',
                score: 80,
                feedback: 'Good architectural awareness of replicas and caching.',
                improvement_tip: 'Detail transactional isolation levels and distributed locks.'
              }
            ]
          },
          {
            id: generateUUID(),
            role_title: 'Product Manager',
            difficulty: 'mid',
            created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            overall_score: 91,
            questions: [
              {
                id: generateUUID(),
                order_index: 1,
                question_text: 'How do you prioritize competing feature requests from enterprise clients vs self-serve users?',
                answer_text: 'Using a value vs effort matrix (RICE framework) coupled with strategic revenue impact and core product roadmap alignment.',
                score: 94,
                feedback: 'Outstanding structured response using industry frameworks.',
                improvement_tip: 'Add a real-world example of stakeholder pushback.'
              }
            ]
          }
        ];
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialMock));
        return initialMock;
      }
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to read from localStorage:', e);
      return [];
    }
  },

  saveSession: (session: InterviewSession): boolean => {
    if (typeof window === 'undefined') return false;
    try {
      const existing = localStorageService.getSessions();
      const updated = [session, ...existing.filter(s => s.id !== session.id)];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      return true;
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
      return false;
    }
  },

  updateSession: (sessionId: string, updates: Partial<InterviewSession>): void => {
    if (typeof window === 'undefined') return;
    try {
      const existing = localStorageService.getSessions();
      const updated = existing.map(s => s.id === sessionId ? { ...s, ...updates } : s);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to update session in localStorage:', e);
    }
  },

  clearSessions: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }
};

/**
 * 1. Step 1: Create session row when interview starts
 */
export async function createSession(
  roleTitle: string,
  difficulty: string = 'entry',
  userId?: string | null
): Promise<{ sessionId: string; source: 'supabase' | 'local' }> {
  const localId = generateUUID();
  const normalizedDifficulty = difficulty.toLowerCase();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .insert({
          role_title: roleTitle.trim(),
          difficulty: normalizedDifficulty,
          user_id: userId || null,
          overall_score: null
        })
        .select('id')
        .single();

      if (!error && data?.id) {
        // Also seed into local storage for offline responsiveness
        localStorageService.saveSession({
          id: data.id,
          role_title: roleTitle.trim(),
          difficulty: normalizedDifficulty,
          user_id: userId || null,
          created_at: new Date().toISOString(),
          overall_score: null,
          questions: []
        });
        return { sessionId: data.id, source: 'supabase' };
      }
      console.warn('Supabase createSession returned error, falling back to local:', error);
    } catch (err) {
      console.warn('Supabase createSession error:', err);
    }
  }

  // Fallback to local storage
  localStorageService.saveSession({
    id: localId,
    role_title: roleTitle.trim(),
    difficulty: normalizedDifficulty,
    user_id: userId || null,
    created_at: new Date().toISOString(),
    overall_score: null,
    questions: []
  });

  return { sessionId: localId, source: 'local' };
}

/**
 * 2. Step 2: Insert generated questions linked to session_id
 */
export async function insertQuestions(
  sessionId: string,
  questions: Array<{ question_text: string; question_type?: string; order_index?: number }>
): Promise<Array<{ id: string; question_text: string; question_type?: string; order_index: number }>> {
  if (supabase) {
    try {
      const payload = questions.map((q, idx) => ({
        session_id: sessionId,
        question_text: q.question_text,
        order_index: q.order_index ?? (idx + 1),
        answer_text: null,
        score: null,
        feedback: null
      }));

      const { data, error } = await supabase
        .from('questions')
        .insert(payload)
        .select('id, question_text, order_index');

      if (!error && data && data.length > 0) {
        // Update local cache
        const sessions = localStorageService.getSessions();
        const target = sessions.find(s => s.id === sessionId);
        if (target) {
          target.questions = data.map((d, i) => ({
            id: d.id,
            question_text: d.question_text,
            question_type: questions[i]?.question_type || 'Technical',
            order_index: d.order_index
          }));
          localStorageService.saveSession(target);
        }

        return data.map((d, i) => ({
          id: d.id,
          question_text: d.question_text,
          question_type: questions[i]?.question_type || 'Technical',
          order_index: d.order_index
        }));
      }
      console.warn('Supabase insertQuestions returned error:', error);
    } catch (err) {
      console.warn('Supabase insertQuestions exception:', err);
    }
  }

  // Fallback
  const fallbackRecords = questions.map((q, idx) => ({
    id: generateUUID(),
    question_text: q.question_text,
    question_type: q.question_type || 'Technical',
    order_index: q.order_index ?? (idx + 1)
  }));

  const sessions = localStorageService.getSessions();
  const target = sessions.find(s => s.id === sessionId);
  if (target) {
    target.questions = fallbackRecords;
    localStorageService.saveSession(target);
  }

  return fallbackRecords;
}

/**
 * 3. Step 3: Update question row when an answer is scored
 */
export async function updateQuestionScore(
  questionId: string | number,
  answerText: string,
  score: number,
  feedback: string,
  improvementTip?: string
): Promise<boolean> {
  const roundedScore = Math.min(100, Math.max(0, Math.round(score)));

  if (supabase && typeof questionId === 'string' && questionId.includes('-')) {
    try {
      const { error } = await supabase
        .from('questions')
        .update({
          answer_text: answerText,
          score: roundedScore,
          feedback: feedback,
          improvement_tip: improvementTip || null
        })
        .eq('id', questionId);

      if (!error) {
        // Also update local cache
        updateLocalQuestion(questionId, answerText, roundedScore, feedback, improvementTip);
        return true;
      }
      console.warn('Supabase updateQuestionScore error:', error);
    } catch (err) {
      console.warn('Supabase updateQuestionScore exception:', err);
    }
  }

  // Fallback to local
  updateLocalQuestion(questionId, answerText, roundedScore, feedback, improvementTip);
  return true;
}

function updateLocalQuestion(
  questionId: string | number,
  answerText: string,
  score: number,
  feedback: string,
  improvementTip?: string
) {
  const sessions = localStorageService.getSessions();
  let modified = false;
  for (const s of sessions) {
    if (s.questions) {
      const q = s.questions.find(item => String(item.id) === String(questionId));
      if (q) {
        q.answer_text = answerText;
        q.score = score;
        q.feedback = feedback;
        if (improvementTip) q.improvement_tip = improvementTip;
        modified = true;
        break;
      }
    }
  }
  if (modified) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sessions));
  }
}

/**
 * 4. Step 4: Complete session and calculate/update overall_score on sessions row
 */
export async function completeSession(
  sessionId: string,
  explicitScore?: number
): Promise<{ overall_score: number; success: boolean }> {
  let finalScore = explicitScore !== undefined ? Math.round(explicitScore) : 0;

  if (supabase) {
    try {
      if (explicitScore === undefined) {
        // Query average score of questions in this session
        const { data: questions, error: qErr } = await supabase
          .from('questions')
          .select('score')
          .eq('session_id', sessionId)
          .not('score', 'is', null);

        if (!qErr && questions && questions.length > 0) {
          const total = questions.reduce((acc, q) => acc + (q.score || 0), 0);
          finalScore = Math.round(total / questions.length);
        }
      }

      const { error } = await supabase
        .from('sessions')
        .update({
          overall_score: finalScore
        })
        .eq('id', sessionId);

      if (!error) {
        localStorageService.updateSession(sessionId, { overall_score: finalScore });
        return { overall_score: finalScore, success: true };
      }
      console.warn('Supabase completeSession update error:', error);
    } catch (err) {
      console.warn('Supabase completeSession exception:', err);
    }
  }

  // Fallback
  localStorageService.updateSession(sessionId, { overall_score: finalScore });
  return { overall_score: finalScore, success: true };
}

/**
 * Unified persistence helper for full sessions (backward compatibility)
 */
export async function persistSession(
  roleTitle: string,
  overallScore: number,
  questions: Question[],
  userId?: string | null
): Promise<{ success: boolean; sessionId: string; source: 'supabase' | 'local' }> {
  const { sessionId, source } = await createSession(roleTitle, 'entry', userId);

  if (questions.length > 0) {
    const inserted = await insertQuestions(
      sessionId,
      questions.map((q, idx) => ({
        question_text: q.question_text || q.question || '',
        order_index: q.order_index ?? (idx + 1)
      }))
    );

    for (let i = 0; i < inserted.length; i++) {
      const orig = questions[i];
      if (orig && orig.score !== undefined && orig.score !== null) {
        await updateQuestionScore(
          inserted[i].id,
          orig.answer_text || '',
          orig.score,
          orig.feedback || ''
        );
      }
    }
  }

  await completeSession(sessionId, overallScore);
  return { success: true, sessionId, source };
}

/**
 * Fetch all sessions from Supabase, with questions joined and sorted descending
 */
export async function fetchAllSessions(): Promise<InterviewSession[]> {
  if (supabase) {
    try {
      const { data: sessions, error } = await supabase
        .from('sessions')
        .select(`
          id,
          user_id,
          role_title,
          difficulty,
          created_at,
          overall_score,
          questions (
            id,
            question_text,
            answer_text,
            score,
            feedback,
            order_index,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (!error && sessions) {
        const formatted = sessions.map((s: Record<string, unknown>) => ({
          ...s,
          questions: ((s.questions as Record<string, unknown>[]) || []).map((q: Record<string, unknown>) => {
            let feedback = String(q.feedback || '');
            let improvement_tip = '';
            if (feedback.includes('\n\nTip: ')) {
              const parts = feedback.split('\n\nTip: ');
              feedback = parts[0];
              improvement_tip = parts[1];
            }
            let qType = q.question_type;
            if (!qType) {
              if (/tell me about|describe a time|give an example|conflict|team member|disagreement|mistake/i.test(String(q.question_text || ''))) {
                qType = 'Behavioral';
              } else if (/how would you handle|imagine|suppose|what if|prioritize|scenario/i.test(String(q.question_text || ''))) {
                qType = 'Situational';
              } else {
                qType = 'Technical';
              }
            }
            return {
              ...q,
              question: q.question_text,
              question_type: qType,
              feedback,
              improvement_tip
            };
          }).sort((a: Record<string, unknown>, b: Record<string, unknown>) => (Number(a.order_index) || 0) - (Number(b.order_index) || 0))
        }));

        return formatted as InterviewSession[];
      } else if (error) {
        console.warn('Supabase fetchAllSessions error:', error);
      }
    } catch (e) {
      console.warn('Failed to fetch from Supabase, loading from localStorage:', e);
    }
  }

  return localStorageService.getSessions();
}

export interface StreakData {
  currentStreak: number;
  bestStreak: number;
  practicedToday: boolean;
  totalDaysPracticed: number;
}

/**
 * Calculates user's practice streak based on session timestamps.
 */
export function calculateStreak(sessions: InterviewSession[]): StreakData {
  if (!sessions || sessions.length === 0) {
    return { currentStreak: 0, bestStreak: 0, practicedToday: false, totalDaysPracticed: 0 };
  }

  const dateSet = new Set<string>();
  for (const s of sessions) {
    if (s.created_at) {
      const d = new Date(s.created_at);
      if (!isNaN(d.getTime())) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        dateSet.add(`${year}-${month}-${day}`);
      }
    }
  }

  const sortedDates = Array.from(dateSet).sort().reverse();
  if (sortedDates.length === 0) {
    return { currentStreak: 0, bestStreak: 0, practicedToday: false, totalDaysPracticed: 0 };
  }

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  const practicedToday = sortedDates.includes(todayStr);

  let currentStreak = 0;
  let checkDate: Date | null = null;
  
  if (practicedToday) {
    checkDate = now;
  } else if (sortedDates.includes(yesterdayStr)) {
    checkDate = yesterday;
  }

  if (checkDate) {
    const cursor = new Date(checkDate);
    while (true) {
      const cursorStr = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
      if (dateSet.has(cursorStr)) {
        currentStreak++;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Calculate historical best streak
  let bestStreak = currentStreak;
  let running = 0;
  const chronoDates = Array.from(dateSet).sort();
  for (let i = 0; i < chronoDates.length; i++) {
    if (i === 0) {
      running = 1;
    } else {
      const prev = new Date(chronoDates[i - 1]);
      const curr = new Date(chronoDates[i]);
      const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        running++;
      } else if (diffDays > 1) {
        running = 1;
      }
    }
    if (running > bestStreak) bestStreak = running;
  }

  return {
    currentStreak,
    bestStreak,
    practicedToday,
    totalDaysPracticed: dateSet.size
  };
}
