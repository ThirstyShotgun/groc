import { NextRequest, NextResponse } from 'next/server';
import { CreateSessionRequestSchema } from '@/types/session';
import { fetchSessionsList, saveSessionWithQuestions } from '@/lib/supabase-client';
import { AppError, handleApiError } from '@/lib/app-error';

export async function GET() {
  try {
    const { sessions, error } = await fetchSessionsList();

    if (error) {
      return NextResponse.json({
        success: false,
        sessions: [],
        source: 'local_storage_fallback',
        message: `Database notice: ${error}`
      });
    }

    return NextResponse.json({
      success: true,
      sessions,
      source: 'supabase'
    });
  } catch (err: unknown) {
    return handleApiError(err, 'GET /api/v1/sessions');
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json().catch(() => ({}));
    const parseResult = CreateSessionRequestSchema.safeParse(rawBody);

    if (!parseResult.success) {
      const issue = parseResult.error.issues[0]?.message || 'Invalid session payload';
      throw AppError.badRequest(issue, parseResult.error.format());
    }

    const { success, sessionId, error } = await saveSessionWithQuestions(parseResult.data);

    if (!success) {
      return NextResponse.json({
        success: false,
        source: 'local_storage_fallback',
        message: `Failed to save to database: ${error}`
      });
    }

    return NextResponse.json({
      success: true,
      session_id: sessionId,
      source: 'supabase',
      message: 'Session and questions saved successfully.'
    });
  } catch (err: unknown) {
    return handleApiError(err, 'POST /api/v1/sessions');
  }
}
