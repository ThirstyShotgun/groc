import { NextRequest, NextResponse } from 'next/server';
import { getGroqClient, executeGroqWithFallback, cleanAndParseJSON } from '@/lib/groq-client';
import { FillerStats } from '@/types/arcade';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { text = '', fillerStats, clientKey } = body as {
      text?: string;
      fillerStats?: FillerStats;
      clientKey?: string;
    };

    const groqKey = clientKey || req.headers.get('x-groq-key') || undefined;
    const groq = getGroqClient(groqKey);

    const stats: FillerStats = fillerStats || {
      totalWords: text.trim().split(/\s+/).filter(Boolean).length,
      fillerCount: 0,
      fillerPercentage: 0,
      breakdown: {},
      detectedList: [],
    };

    // If no words typed
    if (stats.totalWords === 0) {
      return NextResponse.json({
        success: true,
        tip: 'Type or speak freely next round — even imperfect speech is valuable data for refining your verbal rhythm.',
        source: 'fallback',
      });
    }

    // If zero fillers detected
    if (stats.fillerCount === 0) {
      return NextResponse.json({
        success: true,
        tip: 'Impeccable verbal clarity! Maintain this deliberate cadence and comfort with natural silent pauses.',
        source: 'fallback',
      });
    }

    const topFillers = stats.detectedList.slice(0, 3).map((item) => `"${item.word}" (${item.count}x)`).join(', ');

    // Rule-based fallback generator
    const getSmartFallbackTip = () => {
      const topWord = stats.detectedList[0]?.word?.toLowerCase();
      if (topWord === 'like') {
        return "Replace 'like' with an intentional half-second breath; silence projects far more executive presence than verbal bridges.";
      }
      if (topWord === 'um' || topWord === 'uh') {
        return 'When retrieving your next point, keep your lips gently closed — quiet pauses signal composure and deliberate mastery.';
      }
      if (topWord === 'basically' || topWord === 'actually') {
        return "Drop qualifiers like 'basically' and 'actually'; state your technical decisions with direct, declarative ownership.";
      }
      if (topWord === 'you know' || topWord === 'right') {
        return "Avoid seeking conversational validation with 'you know' or 'right'; deliver each assertion as a finished thought.";
      }
      if (topWord === 'kind of' || topWord === 'sort of') {
        return "Eliminate minimizing phrases like 'kind of'; own your architecture and engineering results with conviction.";
      }
      return 'Practice embracing a full second of silence between clauses instead of bridging transitions with unconscious vocal fillers.';
    };

    if (!groq) {
      return NextResponse.json({
        success: true,
        tip: getSmartFallbackTip(),
        source: 'smart_fallback',
      });
    }

    try {
      const systemPrompt = `You are a world-class speech and interview coach specializing in verbal precision, confidence, and executive presence.
The candidate just completed a 60-second freeform drill.
Summary of their speech:
- Total words: ${stats.totalWords}
- Filler words caught: ${stats.fillerCount} (${stats.fillerPercentage}% filler density)
- Top filler words used: ${topFillers}

Task:
Produce exactly ONE punchy, memorable, highly actionable coaching sentence (maximum 22 words) specifically addressing their dominant filler word patterns and giving them a concrete verbal/psychological tactic to replace it. Do not use quotes or preamble.

Output strictly valid JSON with this exact key:
{
  "tip": "Single coaching sentence here."
}`;

      const userPrompt = `Speech excerpt: "${text.slice(0, 400)}"`;

      const result = await executeGroqWithFallback(
        groq,
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        {
          temperature: 0.5,
          maxTokens: 512,
        }
      );

      const parsed = cleanAndParseJSON<{ tip: string }>(result.content);
      if (parsed?.tip) {
        return NextResponse.json({
          success: true,
          tip: parsed.tip.trim(),
          source: 'groq',
        });
      }

      return NextResponse.json({
        success: true,
        tip: getSmartFallbackTip(),
        source: 'smart_fallback',
      });
    } catch (groqErr) {
      console.warn('[FillerTipAPI] Groq inference error, using smart fallback:', groqErr);
      return NextResponse.json({
        success: true,
        tip: getSmartFallbackTip(),
        source: 'smart_fallback',
      });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json(
      { success: false, error: message, tip: 'Practice deliberate pauses to anchor your verbal clarity.' },
      { status: 500 }
    );
  }
}
