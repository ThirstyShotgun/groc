import { NextRequest, NextResponse } from 'next/server';
import { EvaluateAnswerRequestSchema } from '@/types/question';
import {
  getGroqClient,
  cleanAndParseJSON,
  executeGroqWithFallback
} from '@/lib/groq-client';
import { getFallbackEvaluation } from '@/lib/scoring-utils';
import { AppError, handleApiError } from '@/lib/app-error';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json().catch(() => ({}));
    const parseResult = EvaluateAnswerRequestSchema.safeParse(rawBody);

    if (!parseResult.success) {
      const issue = parseResult.error.issues[0]?.message || 'Invalid request body';
      throw AppError.badRequest(issue, parseResult.error.format());
    }

    const { question_text, answer_text, role_title, groq_key } = parseResult.data;
    const clientKey = groq_key || req.headers.get('x-groq-key') || undefined;

    // Edge case: Empty answer provided
    if (!answer_text || !answer_text.trim()) {
      return NextResponse.json({
        success: true,
        score: 0,
        feedback: 'No answer was provided. Leaving questions unanswered results in a score of zero.',
        improvement_tip: 'Even when uncertain, outline your methodology, explain how you would troubleshoot, or ask clarifying questions.',
        strengths: 'None recorded.',
        source: 'edge_case_handler'
      });
    }

    const groq = getGroqClient(clientKey);

    if (!groq) {
      const evaluation = getFallbackEvaluation(question_text, answer_text);
      return NextResponse.json({
        success: true,
        ...evaluation,
        message: 'Scored using built-in evaluation heuristic (Set GROQ_API_KEY in .env.local for live Groq scoring).'
      });
    }

    const systemPrompt = `You are a fair, discerning, and constructive technical interviewer.
Evaluate the candidate's answer for the role "${role_title}".

Requirements:
1. "score": An integer from 0 to 100 based on technical depth, correctness, practical trade-offs, and communication clarity:
   - 90-100: Exceptional, senior-level response with real-world nuance, metrics, and trade-offs.
   - 75-89: Solid, competent response that addresses the core requirements well.
   - 50-74: Surface-level or incomplete; missed key nuances, trade-offs, or best practices.
   - 15-49: Deficient, extremely brief, or partially relevant.
   - 0-14: Gibberish, placeholder text (e.g. "aaw", "asdf"), or completely off-topic.
2. "feedback": Exactly 1-2 sentences of specific, actionable critique explaining what was good and what was missing or why the answer was inadequate for this specific question.
3. "improvement_tip": Exactly 1 sentence with a concrete, question-specific recommendation explaining the ideal technical answer or approach.
4. "strengths": Exactly 1 concise phrase highlighting what the candidate did well, or "No relevant technical content provided" if the response is gibberish or off-topic.

Return ONLY valid JSON in this exact structure with no markdown formatting:
{
  "score": 85,
  "feedback": "...",
  "improvement_tip": "...",
  "strengths": "..."
}`;

    try {
      const completion = await executeGroqWithFallback(
        groq,
        [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Question: "${question_text}"\n\nCandidate Answer: "${answer_text}"`
          }
        ],
        {
          temperature: 0.3,
          maxTokens: 512,
          responseFormat: { type: 'json_object' }
        }
      );

      const parsed = cleanAndParseJSON<{
        score: number;
        feedback: string;
        improvement_tip: string;
        strengths: string;
      }>(completion.content);

      const normalizedScore = Math.max(0, Math.min(100, Math.round(Number(parsed.score) || 0)));

      return NextResponse.json({
        success: true,
        score: normalizedScore,
        feedback: parsed.feedback || 'Answer evaluated.',
        improvement_tip: parsed.improvement_tip || 'Keep practicing structured answers.',
        strengths: parsed.strengths || 'Communicated ideas clearly.',
        source: 'groq',
        model_served: completion.modelServed
      });
    } catch (llmErr) {
      console.warn('[API v1 Answers Evaluate] Groq evaluation error, falling back to heuristic scoring:', llmErr);
      const evaluation = getFallbackEvaluation(question_text, answer_text);
      return NextResponse.json({
        success: true,
        ...evaluation,
        message: 'Scored using built-in evaluation heuristic due to upstream LLM timeout/error.'
      });
    }
  } catch (err: unknown) {
    return handleApiError(err, 'POST /api/v1/answers/evaluate');
  }
}
