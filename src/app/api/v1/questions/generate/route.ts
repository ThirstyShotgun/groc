import { NextRequest, NextResponse } from 'next/server';
import { GenerateQuestionsRequestSchema, QuestionItem } from '@/types/question';
import {
  getGroqClient,
  cleanAndParseJSON,
  getFallbackQuestions,
  executeGroqWithFallback
} from '@/lib/groq-client';
import { AppError, handleApiError } from '@/lib/app-error';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json().catch(() => ({}));
    const parseResult = GenerateQuestionsRequestSchema.safeParse(rawBody);

    if (!parseResult.success) {
      const issue = parseResult.error.issues[0]?.message || 'Invalid request body';
      throw AppError.badRequest(issue, parseResult.error.format());
    }

    const { role_title, difficulty, groq_key } = parseResult.data;
    const clientKey = groq_key || req.headers.get('x-groq-key') || undefined;
    const groq = getGroqClient(clientKey);

    if (!groq) {
      const fallbackList = getFallbackQuestions(role_title);
      return NextResponse.json({
        success: true,
        questions: fallbackList,
        role_title,
        difficulty,
        source: 'fallback',
        message: 'Loaded curated interview questions (Set GROQ_API_KEY in .env.local for live Groq inference).'
      });
    }

    let difficultyGuidance = '';
    const diffLower = difficulty.toLowerCase();
    if (diffLower.includes('entry') || diffLower.includes('junior')) {
      difficultyGuidance = 'Target entry-level / junior candidates: core concepts, foundational mechanics, common patterns, problem decomposition, and learning mindset.';
    } else if (diffLower.includes('mid')) {
      difficultyGuidance = 'Target mid-level candidates: practical feature development, design patterns, testing, performance, error handling, and cross-functional teamwork.';
    } else {
      difficultyGuidance = 'Target senior/lead candidates: distributed system design, high-stakes trade-offs, architecture, scalability, reliability, mentorship, and technical vision.';
    }

    const systemPrompt = `You are an expert technical interviewer and hiring director.
Generate exactly 5 realistic, challenging, and insightful interview questions tailored specifically for the role of "${role_title}" at the "${difficulty}" difficulty level.
${difficultyGuidance}

Cover an essential mix:
1. Core domain fundamentals (Technical)
2. Practical problem-solving / scenario (Situational)
3. Architecture, system design, or workflow strategy (Technical)
4. Trade-offs, edge cases, and performance considerations (Technical)
5. Collaboration, communication, or leadership scenario (Behavioral)

Each question must include a "question_type" field with one of: "Technical", "Behavioral", or "Situational".

Respond ONLY with a valid JSON array containing exactly 5 objects. Do NOT wrap in markdown fences or include explanation outside the JSON:
[
  { "question_text": "First interview question here", "question_type": "Technical" },
  { "question_text": "Second interview question here", "question_type": "Situational" },
  { "question_text": "Third interview question here", "question_type": "Technical" },
  { "question_text": "Fourth interview question here", "question_type": "Technical" },
  { "question_text": "Fifth interview question here", "question_type": "Behavioral" }
]`;

    try {
      const completion = await executeGroqWithFallback(
        groq,
        [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Generate 5 interview questions for role: "${role_title}", difficulty: "${difficulty}". Output ONLY a valid JSON array.`
          }
        ],
        {
          temperature: 0.6,
          maxTokens: 1024,
          responseFormat: { type: 'json_object' }
        }
      );

      let parsed: unknown;
      try {
        parsed = cleanAndParseJSON(completion.content);
      } catch {
        const arrayMatch = completion.content.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (arrayMatch) {
          parsed = JSON.parse(arrayMatch[0]);
        } else {
          throw new Error('Failed to parse JSON response from Groq');
        }
      }

      const rawList: unknown[] = Array.isArray(parsed)
        ? parsed
        : typeof parsed === 'object' && parsed !== null && Array.isArray((parsed as Record<string, unknown>).questions)
        ? ((parsed as Record<string, unknown>).questions as unknown[])
        : [];

      if (rawList.length < 3) {
        throw new Error(`Insufficient questions returned by model (${rawList.length})`);
      }

      const questionsResult: QuestionItem[] = rawList.map((item, idx) => {
        const text = typeof item === 'string'
          ? item
          : typeof item === 'object' && item !== null
          ? String((item as Record<string, unknown>).question_text || (item as Record<string, unknown>).question || '')
          : '';

        let qType: 'Technical' | 'Behavioral' | 'Situational' = 'Technical';
        if (typeof item === 'object' && item !== null && (item as Record<string, unknown>).question_type) {
          const rawQType = String((item as Record<string, unknown>).question_type).trim();
          if (rawQType === 'Behavioral' || rawQType === 'Situational' || rawQType === 'Technical') {
            qType = rawQType;
          }
        }

        if (qType === 'Technical') {
          if (/tell me about|describe a time|give an example|conflict|team member|disagreement|mistake/i.test(text)) {
            qType = 'Behavioral';
          } else if (/how would you handle|imagine|suppose|what if|prioritize|scenario/i.test(text)) {
            qType = 'Situational';
          }
        }

        return {
          id: idx + 1,
          question_text: text,
          question: text,
          question_type: qType,
          suggested_time_seconds: 90
        };
      }).filter(q => q.question_text.trim().length > 8);

      return NextResponse.json({
        success: true,
        questions: questionsResult,
        role_title,
        difficulty,
        source: 'groq',
        model_served: completion.modelServed
      });
    } catch (llmErr) {
      console.warn('[API v1 Questions Generate] Groq inference error, falling back to curated questions:', llmErr);
      const fallbackList = getFallbackQuestions(role_title);
      return NextResponse.json({
        success: true,
        questions: fallbackList,
        role_title,
        difficulty,
        source: 'fallback',
        message: 'Loaded curated questions library due to upstream LLM timeout/error.'
      });
    }
  } catch (err: unknown) {
    return handleApiError(err, 'POST /api/v1/questions/generate');
  }
}
