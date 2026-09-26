import { NextRequest, NextResponse } from 'next/server';
import { fetchSessionById } from '@/lib/supabase-client';
import { AppError, handleApiError } from '@/lib/app-error';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id || id.trim() === '') {
      throw AppError.badRequest('Session ID parameter is required');
    }

    const { session, error } = await fetchSessionById(id);

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FETCH_ERROR',
            message: error
          }
        },
        { status: 500 }
      );
    }

    if (!session) {
      throw AppError.notFound(`Session with ID "${id}" was not found`);
    }

    return NextResponse.json({
      success: true,
      data: session
    });
  } catch (err: unknown) {
    return handleApiError(err, 'GET /api/v1/sessions/[id]');
  }
}
