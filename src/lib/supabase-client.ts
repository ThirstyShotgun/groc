import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CreateSessionRequest, SessionRecord } from '@/types/session';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  supabaseAnonKey.length > 20
);

export function getSupabaseServerClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  return createClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Saves an interview session and its associated questions atomically into Supabase.
 */
export async function saveSessionWithQuestions(
  payload: CreateSessionRequest
): Promise<{ success: boolean; sessionId?: string; error?: string }> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return { success: false, error: 'Supabase is not configured' };
  }

  // 1. Insert session record
  const { data: sessionData, error: sessionError } = await supabase
    .from('sessions')
    .insert({
      role_title: payload.role_title,
      overall_score: payload.overall_score,
      user_id: payload.user_id || null
    })
    .select('id')
    .single();

  if (sessionError || !sessionData) {
    console.error('[SupabaseClient] Error inserting session record:', sessionError);
    return { success: false, error: sessionError?.message || 'Failed to insert session' };
  }

  const sessionId = sessionData.id;

  // 2. Insert questions if present
  if (payload.questions && payload.questions.length > 0) {
    const questionRows = payload.questions.map((q, idx) => ({
      session_id: sessionId,
      question_text: q.question_text,
      answer_text: q.answer_text || '',
      score: q.score ?? 0,
      feedback: q.feedback || '',
      order_index: q.order_index ?? idx + 1
    }));

    const { error: questionsError } = await supabase
      .from('questions')
      .insert(questionRows);

    if (questionsError) {
      console.error('[SupabaseClient] Error inserting questions for session:', sessionId, questionsError);
      // Clean up orphaned session to maintain data integrity
      await supabase.from('sessions').delete().eq('id', sessionId);
      return { success: false, error: `Failed to insert questions: ${questionsError.message}` };
    }
  }

  return { success: true, sessionId };
}

/**
 * Fetches all sessions ordered by creation date descending.
 */
export async function fetchSessionsList(): Promise<{ sessions: SessionRecord[]; error?: string }> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return { sessions: [], error: 'Supabase is not configured' };
  }

  const { data, error } = await supabase
    .from('sessions')
    .select(`
      id,
      user_id,
      role_title,
      created_at,
      overall_score,
      questions (
        id,
        question_text,
        answer_text,
        score,
        feedback,
        order_index
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[SupabaseClient] Error fetching sessions:', error);
    return { sessions: [], error: error.message };
  }

  return { sessions: (data as SessionRecord[]) || [] };
}

/**
 * Fetches a single session by ID with its questions.
 */
export async function fetchSessionById(
  id: string
): Promise<{ session: SessionRecord | null; error?: string }> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return { session: null, error: 'Supabase is not configured' };
  }

  const { data, error } = await supabase
    .from('sessions')
    .select(`
      id,
      user_id,
      role_title,
      created_at,
      overall_score,
      questions (
        id,
        question_text,
        answer_text,
        score,
        feedback,
        order_index
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('[SupabaseClient] Error fetching session by id:', id, error);
    return { session: null, error: error.message };
  }

  return { session: (data as SessionRecord) || null };
}
