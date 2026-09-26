/**
 * env-check.ts
 * ============
 * Call `assertEnv()` at the top of any server-side module (API routes,
 * server components) to get an immediate, explicit error naming exactly
 * which env var is missing — instead of a silent fallback or a cryptic
 * downstream failure.
 *
 * Only validates server-side secrets; NEXT_PUBLIC_* vars are checked
 * separately in the browser via `checkPublicEnv()`.
 */

interface EnvCheckResult {
  ok: boolean;
  missing: string[];
  warnings: string[];
}

/**
 * Validate that all required server-side environment variables are present.
 * Returns a result object — does NOT throw so callers can decide how to handle.
 */
export function checkServerEnv(): EnvCheckResult {
  const required: Array<{ key: string; hint: string }> = [
    {
      key: 'GROQ_API_KEY',
      hint: 'Get it at https://console.groq.com/keys — starts with gsk_'
    },
    {
      key: 'NEXT_PUBLIC_SUPABASE_URL',
      hint: 'Supabase Dashboard → Project Settings → API → Project URL'
    },
    {
      key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      hint: 'Supabase Dashboard → Project Settings → API → anon / public key'
    }
  ];

  const warnings: Array<{ key: string; hint: string }> = [
    {
      key: 'SUPABASE_SERVICE_ROLE_KEY',
      hint: 'Supabase Dashboard → Project Settings → API → service_role key (needed for server-side writes that bypass RLS)'
    }
  ];

  const missing: string[] = [];
  const warnList: string[] = [];

  for (const { key, hint } of required) {
    const val = process.env[key];
    if (!val || val.trim() === '') {
      missing.push(`  ❌  ${key} is not set.\n      → ${hint}`);
    }
  }

  for (const { key, hint } of warnings) {
    const val = process.env[key];
    if (!val || val.trim() === '') {
      warnList.push(`  ⚠️   ${key} is not set (falling back to anon key).\n      → ${hint}`);
    }
  }

  // Extra format validation
  const groqKey = process.env.GROQ_API_KEY?.trim();
  if (groqKey && !groqKey.startsWith('gsk_')) {
    missing.push(`  ❌  GROQ_API_KEY format invalid (must start with "gsk_"). Got: "${groqKey.slice(0, 8)}..."`);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (supabaseUrl && !supabaseUrl.startsWith('https://')) {
    missing.push(`  ❌  NEXT_PUBLIC_SUPABASE_URL must start with "https://". Got: "${supabaseUrl.slice(0, 20)}..."`);
  }
  if (supabaseUrl?.endsWith('/')) {
    warnList.push(`  ⚠️   NEXT_PUBLIC_SUPABASE_URL has a trailing slash — this can break Supabase SDK URL construction.`);
  }

  return { ok: missing.length === 0, missing, warnings: warnList };
}

/**
 * Throws a descriptive error if any required server env var is missing.
 * Call this at the top of API route handlers.
 */
export function assertServerEnv(): void {
  const { ok, missing, warnings } = checkServerEnv();

  if (warnings.length > 0) {
    console.warn(
      `[Prepr] ⚠️  Environment warnings:\n${warnings.join('\n')}`
    );
  }

  if (!ok) {
    const message =
      `[Prepr] 🚨 Missing required environment variables. ` +
      `Add them to .env.local and restart the dev server.\n\n` +
      missing.join('\n');
    console.error(message);
    throw new Error(message);
  }
}
