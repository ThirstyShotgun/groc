import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { InterviewSession, Question } from './types';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  SUPABASE_URL.startsWith('https://') &&
  !SUPABASE_URL.includes('your-project-ref')
);

const LOCAL_SESSIONS_KEY = 'prepr_mobile_sessions';
const inMemoryCache = new Map<string, string>();

// Resilient storage that gracefully degrades if native storage module is null
export const safeStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (AsyncStorage && typeof AsyncStorage.getItem === 'function') {
        const value = await AsyncStorage.getItem(key);
        if (value !== null && value !== undefined) {
          inMemoryCache.set(key, value);
          return value;
        }
      }
    } catch (e) {
      // Fall through to in-memory cache
    }
    return inMemoryCache.get(key) || null;
  },
  setItem: async (key: string, value: string): Promise<void> => {
    inMemoryCache.set(key, value);
    try {
      if (AsyncStorage && typeof AsyncStorage.setItem === 'function') {
        await AsyncStorage.setItem(key, value);
      }
    } catch (e) {
      // Non-fatal, memory cache holds value
    }
  },
  removeItem: async (key: string): Promise<void> => {
    inMemoryCache.delete(key);
    try {
      if (AsyncStorage && typeof AsyncStorage.removeItem === 'function') {
        await AsyncStorage.removeItem(key);
      }
    } catch (e) {
      // Non-fatal
    }
  },
};

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: safeStorage,
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    })
  : null;

// Offline cache helpers
export const localSessionStorage = {
  getSessions: async (): Promise<InterviewSession[]> => {
    try {
      const raw = await safeStorage.getItem(LOCAL_SESSIONS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },
  saveSession: async (session: InterviewSession): Promise<void> => {
    try {
      const existing = await localSessionStorage.getSessions();
      const updated = [session, ...existing.filter((s) => s.id !== session.id)];
      await safeStorage.setItem(LOCAL_SESSIONS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save session locally', e);
    }
  },
};

/**
 * Creates a new session record in Supabase
 */
export async function createSession(
  roleTitle: string,
  difficulty: string = 'entry'
): Promise<{ sessionId: string }> {
  const fallbackId = 'session-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .insert({
          role_title: roleTitle.trim(),
          difficulty: difficulty.toLowerCase(),
          overall_score: null
        })
        .select('id')
        .single();

      if (!error && data?.id) {
        return { sessionId: data.id };
      }
      console.warn('Supabase createSession error:', error?.message);
    } catch (err) {
      console.warn('Supabase createSession exception:', err);
    }
  }

  return { sessionId: fallbackId };
}

/**
 * Inserts question records into Supabase linked to session_id
 */
export async function insertQuestions(
  sessionId: string,
  questions: Array<{ question_text: string; question_type?: string; order_index?: number }>
): Promise<Array<{ id: string | number; question_text: string; question_type?: string; order_index: number }>> {
  if (supabase && sessionId.includes('-')) {
    try {
      const payload = questions.map((q, idx) => ({
        session_id: sessionId,
        question_text: q.question_text,
        question_type: q.question_type || 'Technical',
        order_index: q.order_index ?? (idx + 1),
        answer_text: null,
        score: null,
        feedback: null
      }));

      const { data, error } = await supabase
        .from('questions')
        .insert(payload)
        .select('id, question_text, question_type, order_index');

      if (!error && data && data.length > 0) {
        return data;
      }
      console.warn('Supabase insertQuestions error:', error?.message);
    } catch (err) {
      console.warn('Supabase insertQuestions exception:', err);
    }
  }

  return questions.map((q, idx) => ({
    id: 'q-' + Date.now() + '-' + (idx + 1),
    question_text: q.question_text,
    question_type: q.question_type || 'Technical',
    order_index: q.order_index ?? (idx + 1)
  }));
}

/**
 * Updates a question row when scored
 */
export async function updateQuestionScore(
  questionId: string | number,
  answerText: string,
  score: number,
  feedback: string,
  improvementTip?: string
): Promise<boolean> {
  const rounded = Math.min(100, Math.max(0, Math.round(score)));

  if (supabase && typeof questionId === 'string' && questionId.includes('-')) {
    try {
      const { error } = await supabase
        .from('questions')
        .update({
          answer_text: answerText,
          score: rounded,
          feedback: feedback,
          improvement_tip: improvementTip || null
        })
        .eq('id', questionId);

      if (!error) return true;
      console.warn('Supabase updateQuestionScore error:', error?.message);
    } catch (err) {
      console.warn('Supabase updateQuestionScore exception:', err);
    }
  }

  return true;
}

/**
 * Marks session complete and saves overall score
 */
export async function completeSession(
  sessionId: string,
  overallScore: number
): Promise<boolean> {
  const rounded = Math.round(overallScore);

  if (supabase && sessionId.includes('-')) {
    try {
      const { error } = await supabase
        .from('sessions')
        .update({ overall_score: rounded })
        .eq('id', sessionId);

      if (!error) return true;
      console.warn('Supabase completeSession error:', error?.message);
    } catch (err) {
      console.warn('Supabase completeSession exception:', err);
    }
  }

  return true;
}

/**
 * Fetches all past sessions with their questions
 */
export async function fetchAllSessions(): Promise<InterviewSession[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          id,
          role_title,
          difficulty,
          created_at,
          overall_score,
          questions (
            id,
            question_text,
            question_type,
            answer_text,
            score,
            feedback,
            improvement_tip,
            order_index
          )
        `)
        .order('created_at', { ascending: false });

      if (!error && data) {
        const formatted: InterviewSession[] = data.map((s: any) => ({
          ...s,
          questions: (s.questions || []).sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
        }));

        // Cache locally for offline access
        safeStorage.setItem(LOCAL_SESSIONS_KEY, JSON.stringify(formatted)).catch(() => {});
        return formatted;
      }
      console.warn('Supabase fetchAllSessions error:', error?.message);
    } catch (err) {
      console.warn('Supabase fetchAllSessions exception:', err);
    }
  }

  return localSessionStorage.getSessions();
}

export interface StreakData {
  currentStreak: number;
  bestStreak: number;
  practicedToday: boolean;
  totalDaysPracticed: number;
}

/**
 * Calculates practice streak based on session dates
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
