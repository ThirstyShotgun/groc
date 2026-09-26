import { NextRequest } from 'next/server';
import { POST as sessionSummaryHandler } from '../session-summary/route';

/**
 * Backward-compatible endpoint that delegates to /api/session-summary
 */
export async function POST(req: NextRequest) {
  return sessionSummaryHandler(req);
}
