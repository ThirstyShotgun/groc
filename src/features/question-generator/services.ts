import { GenerateQuestionsRequest, GenerateQuestionsResponse } from '@/types/question';

/**
 * Service to request generated interview questions from /api/v1/questions/generate.
 */
export async function generateInterviewQuestions(
  payload: GenerateQuestionsRequest
): Promise<GenerateQuestionsResponse> {
  const res = await fetch('/api/v1/questions/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody?.error?.message || `Failed to generate questions (status: ${res.status})`);
  }

  const data = await res.json();
  return data;
}
