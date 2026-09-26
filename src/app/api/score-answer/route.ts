/**
 * @deprecated Use /api/v1/answers/evaluate instead.
 * This endpoint is maintained for backward compatibility.
 * See docs/deprecations.md for migration guidelines.
 */
import { NextRequest } from 'next/server';
import { POST as v1Post } from '@/app/api/v1/answers/evaluate/route';

export async function POST(req: NextRequest) {
  const response = await v1Post(req);
  response.headers.set(
    'X-API-Deprecated',
    'This route is deprecated. Use POST /api/v1/answers/evaluate instead.'
  );
  return response;
}
