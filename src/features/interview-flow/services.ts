import { EvaluateAnswerRequest, EvaluateAnswerResponse } from '@/types/question';
import { CreateSessionRequest, SessionRecord } from '@/types/session';

/**
 * Evaluates candidate answer via /api/v1/answers/evaluate.
 */
export async function evaluateAnswer(
  payload: EvaluateAnswerRequest
): Promise<EvaluateAnswerResponse> {
  const res = await fetch('/api/v1/answers/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody?.error?.message || `Failed to evaluate answer (status: ${res.status})`);
  }

  return await res.json();
}

const LOCAL_STORAGE_SESSIONS_KEY = 'prepr_interview_sessions_v1';

/**
 * Persists complete session to API with transparent localStorage fallback.
 */
export async function persistInterviewSession(
  payload: CreateSessionRequest
): Promise<{ success: boolean; sessionId: string; source: 'supabase' | 'local_storage' }> {
  try {
    const res = await fetch('/api/v1/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (res.ok && data.success && data.session_id) {
      // Also cache in localStorage for fast local reads
      saveSessionToLocalStorage({
        id: data.session_id,
        role_title: payload.role_title,
        overall_score: payload.overall_score,
        difficulty: payload.difficulty,
        created_at: new Date().toISOString(),
        questions: payload.questions?.map((q, idx) => ({
          question_text: q.question_text,
          answer_text: q.answer_text,
          score: q.score,
          feedback: q.feedback,
          improvement_tip: q.improvement_tip,
          order_index: q.order_index ?? idx + 1
        })) || []
      });

      return { success: true, sessionId: data.session_id, source: 'supabase' };
    }
  } catch (apiErr) {
    console.warn('[InterviewFlow Service] API session save failed, falling back to local storage:', apiErr);
  }

  // Fallback to local storage
  const localId = `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const localRecord: SessionRecord = {
    id: localId,
    role_title: payload.role_title,
    overall_score: payload.overall_score,
    difficulty: payload.difficulty,
    created_at: new Date().toISOString(),
    questions: payload.questions?.map((q, idx) => ({
      question_text: q.question_text,
      answer_text: q.answer_text,
      score: q.score,
      feedback: q.feedback,
      improvement_tip: q.improvement_tip,
      order_index: q.order_index ?? idx + 1
    })) || []
  };

  saveSessionToLocalStorage(localRecord);
  return { success: true, sessionId: localId, source: 'local_storage' };
}

export function saveSessionToLocalStorage(session: SessionRecord): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SESSIONS_KEY);
    const existing: SessionRecord[] = raw ? JSON.parse(raw) : [];
    existing.unshift(session);
    localStorage.setItem(LOCAL_STORAGE_SESSIONS_KEY, JSON.stringify(existing.slice(0, 50)));
  } catch (err) {
    console.error('Failed to write session to localStorage:', err);
  }
}

export function getLocalSessions(): SessionRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SESSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to read sessions from localStorage:', err);
    return [];
  }
}
