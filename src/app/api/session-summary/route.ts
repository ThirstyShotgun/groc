import { NextRequest, NextResponse } from 'next/server';
import { getGroqClient, cleanAndParseJSON, GROQ_MODEL } from '@/lib/groq';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Accept either array directly or object with questions property
    const rawQuestions: Record<string, unknown>[] = Array.isArray(body)
      ? (body as Record<string, unknown>[])
      : Array.isArray(body.questions)
      ? (body.questions as Record<string, unknown>[])
      : Array.isArray(body.answers)
      ? (body.answers as Record<string, unknown>[])
      : [];

    const role_title = String(body.role_title || 'Software Professional').trim();
    const groqKey = body.groq_key || req.headers.get('x-groq-key') || undefined;

    if (rawQuestions.length === 0) {
      return NextResponse.json(
        { error: 'Questions array is required.' },
        { status: 400 }
      );
    }

    // Normalize question items
    const normalizedQuestions = rawQuestions.map((q, idx) => ({
      index: idx,
      question_text: String(q.question_text || q.question || `Question ${idx + 1}`),
      answer_text: String(q.answer_text || q.answer || 'No answer provided.'),
      score: typeof q.score === 'number' ? q.score : 70
    }));

    // Identify candidate strongest/weakest indexes numerically
    let strongestIdx = 0;
    let weakestIdx = 0;
    let maxScore = -1;
    let minScore = 101;

    normalizedQuestions.forEach((q, i) => {
      if (q.score > maxScore) {
        maxScore = q.score;
        strongestIdx = i;
      }
      if (q.score < minScore) {
        minScore = q.score;
        weakestIdx = i;
      }
    });

    const averageScore = Math.round(
      normalizedQuestions.reduce((sum, q) => sum + q.score, 0) / normalizedQuestions.length
    );

    const groq = getGroqClient(groqKey);

    if (!groq) {
      return NextResponse.json({
        overall_feedback: `Consistent interview performance across ${normalizedQuestions.length} questions for the ${role_title} role. Your answers showed solid foundational understanding, particularly in your response to Question ${strongestIdx + 1}.`,
        strongest_answer_index: strongestIdx,
        weakest_answer_index: weakestIdx,
        improvement_tip: `To elevate your answers from good to exceptional, focus on quantifying your impact (e.g. latency reduced by 40%, team velocity increased) and articulating the trade-offs of rejected alternatives.`,
        overall_tip: `Focus on quantifying business/system impact and detailing trade-offs of alternatives considered.`,
        hiring_verdict: averageScore >= 80 ? 'Strong Candidate' : 'Promising Candidate',
        source: 'fallback'
      });
    }

    const answersBlock = normalizedQuestions.map((q) => `
[Answer Index ${q.index}]
Question: ${q.question_text}
Candidate Answer: ${q.answer_text}
Individual Score: ${q.score}/100
`).join('\n---\n');

    const systemPrompt = `You are an executive hiring committee chairperson evaluating a complete 5-question interview for a candidate applying for "${role_title}".

Analyze all 5 answers together to synthesize their overall performance.
You must return ONLY a valid JSON object with these exact keys:
{
  "overall_feedback": "A concise 2-3 sentence executive evaluation summarizing their core strengths, technical depth, and communication style across all answers.",
  "strongest_answer_index": 0,
  "weakest_answer_index": 2,
  "improvement_tip": "One high-impact, actionable 1-2 sentence recommendation for what the candidate must do to reach top 5% hiring caliber."
}

Do NOT output markdown fences, code blocks, or any text outside the JSON.`;

    let summaryResult: {
      overall_feedback: string;
      strongest_answer_index: number;
      weakest_answer_index: number;
      improvement_tip: string;
    } | null = null;

    let attempts = 0;
    let lastError: unknown = null;

    // Retry once if JSON parsing fails
    while (attempts < 2 && !summaryResult) {
      attempts++;
      try {
        const strictPrompt = attempts > 1
          ? ' CRITICAL: Return ONLY valid JSON with keys: overall_feedback, strongest_answer_index, weakest_answer_index, improvement_tip. No markdown fences.'
          : '';

        const completion = await groq.chat.completions.create({
          model: GROQ_MODEL,
          messages: [
            { role: 'system', content: systemPrompt + strictPrompt },
            {
              role: 'user',
              content: `Here are the 5 interview answers:\n${answersBlock}\n\nProvide the session summary in JSON.`
            }
          ],
          temperature: attempts === 1 ? 0.3 : 0.1,
          max_tokens: 512,
          response_format: { type: 'json_object' }
        });

        const rawContent = completion.choices[0]?.message?.content || '';
        if (!rawContent) throw new Error('Empty response from Groq');

        const parsed = cleanAndParseJSON<Record<string, unknown>>(rawContent);

        const strongest_answer_index = typeof parsed.strongest_answer_index === 'number'
          ? Math.min(normalizedQuestions.length - 1, Math.max(0, parsed.strongest_answer_index))
          : strongestIdx;

        const weakest_answer_index = typeof parsed.weakest_answer_index === 'number'
          ? Math.min(normalizedQuestions.length - 1, Math.max(0, parsed.weakest_answer_index))
          : weakestIdx;

        summaryResult = {
          overall_feedback: String(parsed.overall_feedback || parsed.overall_tip || 'Comprehensive performance summary recorded.'),
          strongest_answer_index,
          weakest_answer_index,
          improvement_tip: String(parsed.improvement_tip || parsed.overall_tip || 'Focus on quantified trade-offs and real-world system resilience.')
        };
      } catch (err) {
        lastError = err;
        console.warn(`Groq session-summary attempt ${attempts} failed:`, err);
      }
    }

    if (summaryResult) {
      return NextResponse.json({
        ...summaryResult,
        overall_tip: summaryResult.improvement_tip, // alias for UI compatibility
        hiring_verdict: averageScore >= 80 ? 'Strong Candidate' : 'Promising Candidate',
        source: 'groq'
      });
    }

    throw lastError || new Error('Failed to parse session summary from Groq after retry.');
  } catch (error: unknown) {
    console.error('Error in /api/session-summary (using fallback):', error);
    return NextResponse.json({
      overall_feedback: 'Solid overall interview demonstration. Answers demonstrated clear domain fundamentals with opportunities for deeper metric articulation.',
      strongest_answer_index: 0,
      weakest_answer_index: 1,
      improvement_tip: 'Detail real-world system constraints, architectural alternatives, and quantifiable business outcomes in each answer.',
      overall_tip: 'Detail real-world constraints, architectural alternatives, and quantifiable outcomes.',
      hiring_verdict: 'Promising Candidate',
      source: 'fallback'
    });
  }
}
