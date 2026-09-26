/**
 * @deprecated Use /api/v1/sessions instead.
 * This endpoint is maintained for backward compatibility.
 * See docs/deprecations.md for migration guidelines.
 */
import { NextRequest } from 'next/server';
import { GET as v1Get, POST as v1Post } from '@/app/api/v1/sessions/route';

export async function GET() {
  const response = await v1Get();
  response.headers.set(
    'X-API-Deprecated',
    'This route is deprecated. Use GET /api/v1/sessions instead.'
  );
  return response;
}

export async function POST(req: NextRequest) {
  const response = await v1Post(req);
  response.headers.set(
    'X-API-Deprecated',
    'This route is deprecated. Use POST /api/v1/sessions instead.'
  );
  return response;
}
