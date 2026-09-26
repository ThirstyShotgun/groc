import { ArcadeGameType, ArcadeScoreMetadata, ArcadeScoreRecord, PersonalBests } from '@/types/arcade';
import { getSupabaseBrowserClient } from './supabase-client';
import { generateUUID } from './supabase';

const LOCAL_STORAGE_ARCADE_KEY = 'prepr_arcade_scores_v1';

function getLocalScores(): ArcadeScoreRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ARCADE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('[ArcadeService] Error reading local arcade scores:', e);
    return [];
  }
}

function saveLocalScore(record: ArcadeScoreRecord) {
  if (typeof window === 'undefined') return;
  try {
    const existing = getLocalScores();
    const updated = [record, ...existing.filter((s) => s.id !== record.id)];
    localStorage.setItem(LOCAL_STORAGE_ARCADE_KEY, JSON.stringify(updated.slice(0, 50)));
  } catch (e) {
    console.warn('[ArcadeService] Error writing local arcade score:', e);
  }
}

/**
 * Saves an arcade game result to Supabase with automatic localStorage fallback.
 */
export async function saveArcadeScore(payload: {
  game_type: ArcadeGameType;
  score_value: number;
  metadata?: ArcadeScoreMetadata;
}): Promise<ArcadeScoreRecord> {
  const record: ArcadeScoreRecord = {
    id: generateUUID(),
    game_type: payload.game_type,
    score_value: payload.score_value,
    metadata: payload.metadata || {},
    created_at: new Date().toISOString(),
  };

  // Always save locally for immediate offline resilience
  saveLocalScore(record);

  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('arcade_scores')
        .insert({
          id: record.id,
          game_type: record.game_type,
          score_value: record.score_value,
          metadata: record.metadata,
        })
        .select()
        .single();

      if (!error && data) {
        return {
          id: data.id,
          game_type: data.game_type,
          score_value: Number(data.score_value),
          metadata: data.metadata,
          created_at: data.created_at,
        };
      }
      console.warn('[ArcadeService] Supabase insert warning (falling back to local cache):', error?.message);
    } catch (err) {
      console.warn('[ArcadeService] Supabase exception during save:', err);
    }
  }

  return record;
}

/**
 * Fetches personal bests and history for both arcade games.
 */
export async function fetchPersonalBests(): Promise<PersonalBests> {
  let allScores: ArcadeScoreRecord[] = [];
  const supabase = getSupabaseBrowserClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('arcade_scores')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data && data.length > 0) {
        allScores = data.map((d) => ({
          id: d.id,
          game_type: d.game_type,
          score_value: Number(d.score_value),
          metadata: d.metadata,
          created_at: d.created_at,
        }));
      }
    } catch (e) {
      console.warn('[ArcadeService] Failed to query Supabase, using local:', e);
    }
  }

  // Merge with local scores to capture any runs made while offline/before sync
  const localScores = getLocalScores();
  const mergedMap = new Map<string, ArcadeScoreRecord>();
  allScores.forEach((s) => mergedMap.set(s.id, s));
  localScores.forEach((s) => {
    if (!mergedMap.has(s.id)) {
      mergedMap.set(s.id, s);
    }
  });

  const merged = Array.from(mergedMap.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const fillerHistory = merged.filter((s) => s.game_type === 'filler_reflex');
  const pitchHistory = merged.filter((s) => s.game_type === 'pitch_60');

  // For filler reflex, lowest filler percentage is the personal best
  const fillerReflexBest =
    fillerHistory.length > 0
      ? Math.min(...fillerHistory.map((s) => s.score_value))
      : null;

  // For pitch, highest score out of 100 is the personal best
  const pitchBest =
    pitchHistory.length > 0
      ? Math.max(...pitchHistory.map((s) => s.score_value))
      : null;

  return {
    fillerReflexBest,
    pitchBest,
    fillerHistory,
    pitchHistory,
  };
}
