import Groq from 'groq-sdk';
import { QuestionItem } from '@/types/question';

export const GROQ_PRIMARY_MODEL =
  process.env.GROQ_PRIMARY_MODEL || 'openai/gpt-oss-120b';

export const GROQ_FALLBACK_MODEL =
  process.env.GROQ_FALLBACK_MODEL || 'openai/gpt-oss-20b';

/**
 * Returns an initialized Groq client if an API key is available.
 */
export function getGroqClient(customKey?: string): Groq | null {
  const apiKey = (customKey || process.env.GROQ_API_KEY || '').trim();
  if (!apiKey || !apiKey.startsWith('gsk_')) {
    return null;
  }
  return new Groq({ apiKey });
}

/**
 * Strips markdown code blocks and parses JSON safely.
 */
export function cleanAndParseJSON<T>(raw: string): T {
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

export interface GroqCompletionResult {
  content: string;
  modelServed: string;
  durationMs: number;
}

/**
 * Executes a Groq completion with automated primary -> fallback model retry.
 * Logs which model served the request.
 */
export async function executeGroqWithFallback(
  groq: Groq,
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  options: {
    temperature?: number;
    maxTokens?: number;
    responseFormat?: { type: 'json_object' };
  } = {}
): Promise<GroqCompletionResult> {
  const models = [GROQ_PRIMARY_MODEL, GROQ_FALLBACK_MODEL];
  let lastError: unknown = null;

  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    const startTime = Date.now();
    try {
      console.log(`[GroqClient] Attempting inference with model: ${model} (attempt ${i + 1}/${models.length})`);
      const response = await groq.chat.completions.create({
        model,
        messages,
        temperature: options.temperature ?? 0.6,
        max_tokens: options.maxTokens ?? 1024,
        ...(options.responseFormat ? { response_format: options.responseFormat } : {})
      });

      const content = response.choices[0]?.message?.content || '';
      if (!content.trim()) {
        throw new Error(`Empty response content returned by model ${model}`);
      }

      const durationMs = Date.now() - startTime;
      console.log(`[GroqClient] ✅ Successfully served request via "${model}" in ${durationMs}ms`);

      return {
        content,
        modelServed: model,
        durationMs
      };
    } catch (err: unknown) {
      const durationMs = Date.now() - startTime;
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn(`[GroqClient] ⚠️ Model "${model}" failed after ${durationMs}ms: ${errMsg}`);
      lastError = err;
    }
  }

  throw lastError || new Error('All configured Groq models failed to return a response.');
}

/**
 * Curated high-yield fallback interview questions when Groq is not configured or offline.
 */
export function getFallbackQuestions(roleTitle: string): QuestionItem[] {
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
    let qType: 'Technical' | 'Behavioral' | 'Situational' = 'Technical';
    if (/tell me about|disagreement|failed|pivot/i.test(q)) {
      qType = 'Behavioral';
    } else if (/imagine|scenario|situation|balance/i.test(q)) {
      qType = 'Situational';
    }

    return {
      id: idx + 1,
      question_text: q,
      question: q,
      question_type: qType,
      suggested_time_seconds: 90
    };
  });
}
