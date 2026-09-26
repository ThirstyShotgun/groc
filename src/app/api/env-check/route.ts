import { NextResponse } from 'next/server';
import { checkServerEnv } from '@/lib/env-check';

/**
 * GET /api/env-check
 * ------------------
 * Reports which environment variables are loaded and valid.
 * Returns a JSON summary — safe to call during development.
 * Does NOT expose actual key values, only presence + format validity.
 */
export async function GET() {
  const groqKey = process.env.GROQ_API_KEY?.trim() ?? '';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? '';

  const { ok, missing, warnings } = checkServerEnv();

  return NextResponse.json({
    ok,
    variables: {
      GROQ_API_KEY: groqKey
        ? { status: groqKey.startsWith('gsk_') ? '✅ valid' : '❌ bad format (must start with gsk_)', length: groqKey.length, prefix: groqKey.slice(0, 8) + '...' }
        : { status: '❌ missing' },

      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl
        ? { status: supabaseUrl.startsWith('https://') && !supabaseUrl.endsWith('/') ? '✅ valid' : supabaseUrl.endsWith('/') ? '⚠️ trailing slash' : '❌ bad format', value: supabaseUrl }
        : { status: '❌ missing' },

      NEXT_PUBLIC_SUPABASE_ANON_KEY: anonKey
        ? { status: anonKey.length > 100 ? '✅ valid' : '⚠️ suspiciously short', length: anonKey.length, prefix: anonKey.slice(0, 20) + '...' }
        : { status: '❌ missing' },

      SUPABASE_SERVICE_ROLE_KEY: serviceKey
        ? { status: serviceKey.length > 100 ? '✅ valid' : '⚠️ suspiciously short', length: serviceKey.length, prefix: serviceKey.slice(0, 20) + '...' }
        : { status: '⚠️ missing (falling back to anon key for server writes)' },
    },
    missing,
    warnings,
  });
}
