import Groq from 'groq-sdk';

export const GROQ_MODEL = 'openai/gpt-oss-120b';

/**
 * Returns an initialized Groq client if an API key is available.
 * Reads GROQ_API_KEY from environment variables or custom runtime override.
 */
export function getGroqClient(customKey?: string): Groq | null {
  const apiKey = (customKey || process.env.GROQ_API_KEY || '').trim();
  if (!apiKey || !apiKey.startsWith('gsk_')) {
    return null;
  }
  return new Groq({ apiKey });
}

/**
 * Strips markdown code blocks (```json ... ``` or ``` ... ```) and parses JSON safely.
 */
export function cleanAndParseJSON<T>(raw: string): T {
  let cleaned = raw.trim();
  // Strip backticks / markdown formatting
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
    cleaned = cleaned.replace(/\s*```$/i, '');
  }
  // Try direct parse first
  try {
    return JSON.parse(cleaned.trim());
  } catch (err) {
    // If wrapped in surrounding text, extract outermost JSON object or array
    const jsonMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw err;
  }
}

/**
 * Curated high-yield interview questions by job role when Groq API key is not configured.
 */
export function getFallbackQuestions(roleTitle: string): Array<{ id: number; question_text: string; question: string }> {
  const normalized = roleTitle.toLowerCase();

  let list: string[] = [];

  if (normalized.includes('front') || normalized.includes('react') || normalized.includes('web')) {
    list = [
      `As a ${roleTitle}, how do you diagnose and resolve client-side performance bottlenecks (e.g. excessive re-renders, layout thrashing, slow LCP)?`,
      `Can you explain the trade-offs between Server-Side Rendering (SSR), Static Site Generation (SSG), and Client-Side Rendering (CSR)?`,
      `How do you structure complex state management across a large-scale application while keeping components decoupled and maintainable?`,
      `Describe a scenario where you had to implement an accessible (WCAG compliant) custom keyboard navigation pattern for a complex UI widget.`,
      `Tell me about a time you had a technical disagreement with a team member regarding an architectural choice. How was it resolved?`
    ];
  } else if (normalized.includes('product') || normalized.includes('pm')) {
    list = [
      `As a ${roleTitle}, how do you balance user feedback, business revenue targets, and engineering technical debt when planning a quarterly roadmap?`,
      `Walk me through your methodology for defining and measuring the success metrics (North Star & guardrail metrics) of a new feature launch.`,
      `Imagine a key customer segment is demanding a feature that diverges from your long-term product vision. How do you handle it?`,
      `How do you conduct customer discovery interviews to separate genuine user pain points from superficial feature requests?`,
      `Tell me about a product or feature you launched that failed to achieve its intended goals. What did you learn and how did you pivot?`
    ];
  } else if (normalized.includes('data') || normalized.includes('ai') || normalized.includes('ml')) {
    list = [
      `For a ${roleTitle} position, how do you handle data drift, feature leakage, and model degradation in production systems?`,
      `Explain the trade-offs between precision, recall, and F1-score in an unbalanced classification dataset.`,
      `How do you design scalable ETL / ELT data pipelines that are resilient to schema changes and upstream failures?`,
      `Describe how you validate the statistical significance of results during A/B experimentation.`,
      `Tell me about an instance where you had to explain complex machine learning or quantitative findings to non-technical stakeholders.`
    ];
  } else {
    list = [
      `What core technical challenges and best practices are unique to excelling as a ${roleTitle}?`,
      `Describe your approach to designing a scalable, fault-tolerant system or workflow for a high-demand project.`,
      `How do you prioritize code quality, automated testing, and documentation against tight delivery deadlines?`,
      `Walk me through a difficult debugging or troubleshooting problem you solved recently. What was your root-cause methodology?`,
      `Tell me about a high-pressure situation where requirements shifted late in a development cycle. How did you adapt and deliver?`
    ];
  }

  return list.map((q, idx) => {
    let qType = 'Technical';
    if (/tell me about|disagreement|failed|pivot/i.test(q)) {
      qType = 'Behavioral';
    } else if (/imagine|scenario|situation|balance/i.test(q)) {
      qType = 'Situational';
    }

    return {
      id: idx + 1,
      question_text: q,
      question: q,
      question_type: qType
    };
  });
}

/**
 * Fallback scoring evaluator when Groq API key is not configured.
 */
export function getFallbackEvaluation(question: string, answer: string): {
  score: number;
  feedback: string;
  improvement_tip: string;
  strengths: string;
} {
  const trimmed = answer.trim();
  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;

  if (wordCount < 15) {
    return {
      score: 42,
      feedback: 'The answer is too brief and lacks specific details, examples, or technical depth expected for this question.',
      improvement_tip: 'Elaborate using the STAR method (Situation, Task, Action, Result). Mention real-world tools, trade-offs, and tangible outcomes.',
      strengths: 'Acknowledged the core premise of the question.'
    };
  }

  if (wordCount < 40) {
    return {
      score: 72,
      feedback: 'Good initial direction, but could be enhanced by providing a concrete example and discussing trade-offs.',
      improvement_tip: 'Incorporate quantifiable outcomes (e.g. latency improvements, revenue impact) and alternate approaches considered.',
      strengths: 'Direct, clear response that addresses the question without unnecessary fluff.'
    };
  }

  return {
    score: 88,
    feedback: 'Strong, thorough response with solid technical terminology, structured reasoning, and practical perspective.',
    improvement_tip: 'To reach a top score, briefly touch on edge cases, security considerations, or how you aligned cross-functional teams.',
    strengths: 'Demonstrated solid domain expertise, clear methodology, and thoughtful communication.'
  };
}
