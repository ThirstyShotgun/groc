import { NextRequest, NextResponse } from 'next/server';
import { getGroqClient, executeGroqWithFallback } from '@/lib/groq-client';
import { fetchUserInventory, buildSystemPrompt, AssistantSessionData } from '@/lib/assistant-context';

export const runtime = 'nodejs';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

function generateOfflineReply(query: string, inventoryStr: string): string {
  const q = query.toLowerCase();
  if (q.includes('star') || q.includes('behavioral')) {
    return `**The STAR Method** is essential for behavioral answers:\n\n` +
      `• **Situation:** Set the scene (context, company, timeline) in 1-2 sentences.\n` +
      `• **Task:** Clarify your exact responsibility or the challenge faced.\n` +
      `• **Action:** The core (60% of your time). What specific decisions and engineering actions did *you* take?\n` +
      `• **Result:** Quantifiable impact (e.g., "reduced latency by 35%", "shipped 2 weeks early").\n\n` +
      `Keep responses between 90 and 120 seconds. Would you like to practice a behavioral scenario?`;
  }
  if (q.includes('last session') || q.includes('weak') || q.includes('how did i do') || q.includes('score')) {
    if (inventoryStr.includes('No interview sessions recorded yet')) {
      return `You haven't completed any interview sessions yet! Head over to the **Simulator** tab to take your first 5-question technical drill, and I'll analyze your answers in real time.`;
    }
    return `Based on your recent session data:\n\n${inventoryStr.slice(0, 450)}...\n\nKeep focusing on addressing diagnostic steps and tradeoffs cleanly!`;
  }
  return `I'm your Prepr interview coach! I can walk you through interview strategies (like the STAR method or system design frameworks) or analyze your recent practice performance. What would you like to focus on?`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawMessages: ChatMessage[] = Array.isArray(body.messages) ? body.messages : [];
    const currentPage: string = body.current_page || '/';
    const clientSessions: AssistantSessionData[] | undefined = body.client_sessions;
    const customGroqKey: string | undefined = body.groq_key || req.headers.get('x-groq-key') || undefined;

    if (rawMessages.length === 0) {
      return NextResponse.json({ error: 'At least one message is required' }, { status: 400 });
    }

    const inventoryContext = await fetchUserInventory(clientSessions);
    const systemPrompt = buildSystemPrompt(inventoryContext, currentPage);

    // Prepare conversation messages for Groq
    const conversation = [
      { role: 'system' as const, content: systemPrompt },
      ...rawMessages.slice(-8).map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ];

    const groq = getGroqClient(customGroqKey);
    if (!groq) {
      const lastUserMsg = rawMessages[rawMessages.length - 1]?.content || '';
      const fallbackReply = generateOfflineReply(lastUserMsg, inventoryContext);
      return NextResponse.json({ message: fallbackReply, source: 'fallback' });
    }

    try {
      const result = await executeGroqWithFallback(groq, conversation, {
        temperature: 0.5,
        maxTokens: 750,
      });

      return NextResponse.json({
        message: result.content,
        source: 'groq',
        model: result.modelServed,
      });
    } catch (llmErr) {
      console.warn('[AssistantChat] Groq completion error, using intelligent fallback:', llmErr);
      const lastUserMsg = rawMessages[rawMessages.length - 1]?.content || '';
      const fallbackReply = generateOfflineReply(lastUserMsg, inventoryContext);
      return NextResponse.json({ message: fallbackReply, source: 'fallback' });
    }
  } catch (err: unknown) {
    console.error('[AssistantChat] Request handling error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
