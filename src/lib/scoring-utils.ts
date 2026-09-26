import { EvaluateAnswerResponse } from '@/types/question';

/**
 * Fallback scoring evaluator when Groq API is unavailable or offline.
 */
export function getFallbackEvaluation(
  question: string,
  answer: string
): Omit<EvaluateAnswerResponse, 'model_served'> {
  const trimmed = answer.trim();
  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;

  if (wordCount === 0) {
    return {
      score: 0,
      feedback: 'No answer was provided. Leaving questions unanswered results in a score of zero.',
      improvement_tip: 'Even when uncertain, outline your methodology, explain how you would troubleshoot, or ask clarifying questions.',
      strengths: 'None recorded.',
      source: 'edge_case_handler'
    };
  }

  if (wordCount < 15) {
    return {
      score: 42,
      feedback: 'The answer is too brief and lacks specific details, examples, or technical depth expected for this question.',
      improvement_tip: 'Elaborate using the STAR method (Situation, Task, Action, Result). Mention real-world tools, trade-offs, and tangible outcomes.',
      strengths: 'Acknowledged the core premise of the question.',
      source: 'fallback'
    };
  }

  if (wordCount < 40) {
    return {
      score: 72,
      feedback: 'Good initial direction, but could be enhanced by providing a concrete example and discussing trade-offs.',
      improvement_tip: 'Incorporate quantifiable outcomes (e.g. latency improvements, revenue impact) and alternate approaches considered.',
      strengths: 'Direct, clear response that addresses the question without unnecessary fluff.',
      source: 'fallback'
    };
  }

  return {
    score: 88,
    feedback: 'Strong, thorough response with solid technical terminology, structured reasoning, and practical perspective.',
    improvement_tip: 'To reach a top score, briefly touch on edge cases, security considerations, or how you aligned cross-functional teams.',
    strengths: 'Demonstrated solid domain expertise, clear methodology, and thoughtful communication.',
    source: 'fallback'
  };
}

/**
 * STAR Framework prompt helper for candidate guidance.
 */
export const STAR_FRAMEWORK_TIPS = [
  { letter: 'S', title: 'Situation', desc: 'Set the context, scale, and background of the challenge.' },
  { letter: 'T', title: 'Task', desc: 'Explain your exact responsibility and the target goal.' },
  { letter: 'A', title: 'Action', desc: 'Describe the specific steps, technical choices, and trade-offs you made.' },
  { letter: 'R', title: 'Result', desc: 'Quantify the outcome, metrics, lessons learned, and impact.' }
];
