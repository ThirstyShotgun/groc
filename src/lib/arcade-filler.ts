import { FillerStats } from '@/types/arcade';

export const FILLER_WORDS = [
  'to be honest',
  'you know',
  'kind of',
  'sort of',
  'i mean',
  'basically',
  'actually',
  'literally',
  'honestly',
  'like',
  'um',
  'uh',
  'so',
  'right',
] as const;

// Escaped regex pattern with word boundaries, sorted by phrase length descending
const regexPattern = new RegExp(
  `(\\b(?:${FILLER_WORDS.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b)`,
  'gi'
);

export interface TokenPart {
  text: string;
  isFiller: boolean;
  normalized?: string;
}

/**
 * Splits text into tokens, identifying filler words/phrases with exact whitespace preservation.
 */
export function tokenizeWithFillers(text: string): TokenPart[] {
  if (!text) return [];

  const parts = text.split(regexPattern);
  const fillerSet = new Set<string>(FILLER_WORDS.map((w) => w.toLowerCase()));

  return parts.map((part) => {
    const norm = part.toLowerCase().trim();
    const isFiller = fillerSet.has(norm);
    return {
      text: part,
      isFiller,
      normalized: isFiller ? norm : undefined,
    };
  });
}

/**
 * Calculates total words, filler count, percentage, and breakdown.
 */
export function calculateFillerStats(text: string): FillerStats {
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/).filter(Boolean) : [];
  const totalWords = words.length;

  const tokens = tokenizeWithFillers(text);
  const breakdown: Record<string, number> = {};
  let fillerCount = 0;

  for (const token of tokens) {
    if (token.isFiller && token.normalized) {
      fillerCount++;
      breakdown[token.normalized] = (breakdown[token.normalized] || 0) + 1;
    }
  }

  const fillerPercentage =
    totalWords > 0
      ? Number(Math.min(100, (fillerCount / totalWords) * 100).toFixed(1))
      : 0;

  const detectedList = Object.entries(breakdown)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalWords,
    fillerCount,
    fillerPercentage,
    breakdown,
    detectedList,
  };
}
