import { ScoreResult, SessionSummaryResult } from './types';

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY || '';
const GROQ_MODEL = 'openai/gpt-oss-120b';

function cleanAndParseJSON<T>(raw: string): T {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
    cleaned = cleaned.replace(/\s*```$/i, '');
  }
  try {
    return JSON.parse(cleaned.trim());
  } catch (err) {
    const jsonMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw err;
  }
}

/**
 * 1. Generate 5 interview questions via Groq with classification
 */
export async function generateQuestions(
  roleTitle: string,
  difficulty: string = 'mid'
): Promise<Array<{ id: number; question_text: string; question_type: string }>> {
  if (!GROQ_API_KEY) {
    return getFallbackQuestions(roleTitle);
  }

  const systemPrompt = `You are an expert technical interviewer and hiring director.
Generate exactly 5 realistic, challenging, and insightful interview questions tailored specifically for the role of "${roleTitle}" at the "${difficulty}" difficulty level.

Cover an essential mix:
1. Core domain fundamentals (Technical)
2. Practical problem-solving / scenario (Situational)
3. Architecture, system design, or workflow strategy (Technical)
4. Trade-offs, edge cases, and performance considerations (Technical)
5. Collaboration, communication, or leadership scenario (Behavioral)

Each question MUST include a "question_type" field with one of: "Technical", "Behavioral", or "Situational".

Respond ONLY with a valid JSON array containing exactly 5 objects. Do NOT wrap in markdown fences:
[
  { "question_text": "First interview question here", "question_type": "Technical" },
  { "question_text": "Second interview question here", "question_type": "Situational" },
  { "question_text": "Third interview question here", "question_type": "Technical" },
  { "question_text": "Fourth interview question here", "question_type": "Technical" },
  { "question_text": "Fifth interview question here", "question_type": "Behavioral" }
]`;

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Generate 5 interview questions for role: "${roleTitle}", difficulty: "${difficulty}". Output ONLY a valid JSON array.`,
          },
        ],
        temperature: 0.6,
        max_tokens: 1024,
        response_format: { type: 'json_object' },
      }),
    });

    if (!res.ok) {
      throw new Error(`Groq API returned HTTP ${res.status}`);
    }

    const data = await res.json();
    const rawContent = data.choices?.[0]?.message?.content || '';
    const parsed = cleanAndParseJSON<any>(rawContent);
    const rawList: any[] = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed?.questions)
      ? parsed.questions
      : [];

    if (rawList.length >= 3) {
      return rawList.map((item: any, idx: number) => {
        const text = typeof item === 'string' ? item : item.question_text || item.question || '';
        let qType = typeof item === 'object' && item.question_type ? String(item.question_type).trim() : '';
        if (!['Technical', 'Behavioral', 'Situational'].includes(qType)) {
          if (/tell me about|describe a time|give an example|conflict|team member/i.test(text)) {
            qType = 'Behavioral';
          } else if (/how would you handle|imagine|suppose|what if|scenario/i.test(text)) {
            qType = 'Situational';
          } else {
            qType = 'Technical';
          }
        }
        return {
          id: idx + 1,
          question_text: text,
          question_type: qType,
        };
      });
    }
  } catch (err) {
    console.warn('Groq generation error, using curated fallback:', err);
  }

  return getFallbackQuestions(roleTitle);
}

/**
 * 2. Score candidate's answer via Groq
 */
export async function scoreAnswer(
  questionText: string,
  answerText: string,
  roleTitle: string = 'General'
): Promise<ScoreResult> {
  const trimmed = answerText.trim();

  // Edge case: Empty answer
  if (!trimmed) {
    return {
      score: 0,
      feedback: 'No answer was provided. Leaving questions unanswered results in a score of zero.',
      improvement_tip: 'Even when uncertain, outline your methodology, explain how you would troubleshoot, or ask clarifying questions.',
      strengths: 'None recorded.',
      source: 'edge_case_handler',
    };
  }

  if (!GROQ_API_KEY) {
    return getFallbackEvaluation(questionText, trimmed);
  }

  const systemPrompt = `You are a fair, discerning, and constructive technical interviewer.
Evaluate the candidate's answer for the role "${roleTitle}".

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
  "feedback": "Your explanation of state management was clear and accurately identified reconciliation bottlenecks, though it lacked a concrete example of state synchronization under high concurrency.",
  "improvement_tip": "Incorporate a real-world scenario detailing how you handled cache invalidation and rollback on network failure.",
  "strengths": "Clear identification of reconciliation bottlenecks."
}`;

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Question: "${questionText}"\nCandidate Answer: "${trimmed}"\n\nEvaluate and return ONLY valid JSON.`,
          },
        ],
        temperature: 0.3,
        max_tokens: 512,
        response_format: { type: 'json_object' },
      }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const rawContent = data.choices?.[0]?.message?.content || '';
    const parsed = cleanAndParseJSON<any>(rawContent);

    return {
      score: typeof parsed.score === 'number' ? Math.min(100, Math.max(0, Math.round(parsed.score))) : 75,
      feedback: parsed.feedback || parsed.critique || 'Constructive feedback recorded.',
      improvement_tip: parsed.improvement_tip || parsed.tip || 'Provide more concrete real-world metrics and trade-offs.',
      strengths: parsed.strengths || 'Clear communication of key principles.',
      source: 'groq',
    };
  } catch (err) {
    console.warn('Groq scoring error, using fallback:', err);
    return getFallbackEvaluation(questionText, trimmed);
  }
}

/**
 * 3. Generate holistic session summary
 */
export async function generateSessionSummary(
  roleTitle: string,
  answers: Array<{ question_text: string; answer_text?: string; score?: number }>
): Promise<SessionSummaryResult> {
  const averageScore = Math.round(
    answers.reduce((acc, a) => acc + (a.score || 0), 0) / Math.max(1, answers.length)
  );

  if (!GROQ_API_KEY) {
    return {
      overall_feedback: `Consistent interview performance across ${answers.length} questions for the ${roleTitle} role. Solid technical foundation shown throughout.`,
      improvement_tip: 'Focus on quantifying real-world system impact and detailing trade-offs of rejected design alternatives.',
      hiring_verdict: averageScore >= 80 ? 'Strong Candidate' : averageScore >= 65 ? 'Promising Candidate' : 'Needs Practice',
    };
  }

  const prompt = `Synthesize an executive interview performance summary for a candidate applying for "${roleTitle}".
Average Score: ${averageScore}/100 across ${answers.length} questions.

Questions & Scores:
${answers.map((a, i) => `Q${i + 1} (${a.score}/100): "${a.question_text}"`).join('\n')}

Respond ONLY with valid JSON:
{
  "overall_feedback": "2 sentences summarizing candidate strengths and overarching patterns across the interview.",
  "improvement_tip": "1 actionable sentence on what the candidate must do to reach top 5% hiring caliber.",
  "hiring_verdict": "${averageScore >= 80 ? 'Strong Candidate' : averageScore >= 65 ? 'Promising Candidate' : 'Needs Practice'}"
}`;

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        max_tokens: 384,
        response_format: { type: 'json_object' },
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const raw = data.choices?.[0]?.message?.content || '';
      const parsed = cleanAndParseJSON<any>(raw);
      return {
        overall_feedback: parsed.overall_feedback || 'Completed full interview round with comprehensive evaluation.',
        improvement_tip: parsed.improvement_tip || 'Focus on quantified business outcomes and edge-case handling.',
        hiring_verdict: parsed.hiring_verdict || (averageScore >= 80 ? 'Strong Candidate' : 'Promising Candidate'),
      };
    }
  } catch (err) {
    console.warn('Session summary error:', err);
  }

  return {
    overall_feedback: `Demonstrated solid foundational readiness for ${roleTitle}. Key concepts were articulated clearly.`,
    improvement_tip: 'Incorporate concrete real-world metrics, trade-offs, and failure recovery scenarios into your answers.',
    hiring_verdict: averageScore >= 80 ? 'Strong Candidate' : 'Promising Candidate',
  };
}

function getFallbackQuestions(roleTitle: string) {
  const norm = roleTitle.toLowerCase();
  let list = [
    { text: `As a ${roleTitle}, how do you diagnose and resolve complex system bottlenecks?`, type: 'Technical' },
    { text: `Explain the key architectural trade-offs you evaluate when choosing between competing technology stacks.`, type: 'Technical' },
    { text: `Imagine a critical production incident occurs during peak traffic hours. Walk through your incident response workflow.`, type: 'Situational' },
    { text: `How do you structure automated testing and code quality standards to balance delivery speed and reliability?`, type: 'Technical' },
    { text: `Tell me about a high-stakes disagreement with a stakeholder or teammate. How did you build consensus?`, type: 'Behavioral' },
  ];

  if (norm.includes('front') || norm.includes('react')) {
    list = [
      { text: `How do you diagnose and resolve client-side performance bottlenecks (layout thrashing, heavy re-renders, slow LCP)?`, type: 'Technical' },
      { text: `Explain the architectural trade-offs between Server Components (SSR) and Client-Side Rendering (CSR).`, type: 'Technical' },
      { text: `How do you organize state management across large-scale applications to keep components decoupled?`, type: 'Technical' },
      { text: `Imagine a requirement arrives for an accessible keyboard-navigable UI widget with strict deadlines. How do you approach it?`, type: 'Situational' },
      { text: `Tell me about a time you advocated for refactoring technical debt against product feature pressure.`, type: 'Behavioral' },
    ];
  }

  return list.map((q, idx) => ({
    id: idx + 1,
    question_text: q.text,
    question_type: q.type,
  }));
}

function getFallbackEvaluation(question: string, answer: string): ScoreResult {
  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount < 10) {
    return {
      score: 35,
      feedback: 'The answer is too brief to demonstrate technical competence and reasoning depth expected for this role.',
      improvement_tip: 'Apply the STAR method (Situation, Task, Action, Result) and mention concrete technical trade-offs.',
      strengths: 'Acknowledged the prompt.',
      source: 'fallback',
    };
  }
  if (wordCount < 30) {
    return {
      score: 72,
      feedback: 'Good fundamental understanding. Adding specific implementation examples would elevate this response.',
      improvement_tip: 'Incorporate quantifiable outcomes and alternate approaches you considered.',
      strengths: 'Clear, direct communication.',
      source: 'fallback',
    };
  }
  return {
    score: 86,
    feedback: 'Strong response with solid technical terminology, structured reasoning, and practical perspective.',
    improvement_tip: 'To reach a top score, briefly touch on edge cases, security considerations, or performance scaling.',
    strengths: 'Demonstrated solid domain expertise and clear methodology.',
    source: 'fallback',
  };
}
