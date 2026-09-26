export type ArcadeGameType = 'filler_reflex' | 'pitch_60';

export interface ArcadeScoreMetadata {
  filler_count?: number;
  total_words?: number;
  tip?: string;
  feedback?: string;
  pitch_text?: string;
  breakdown?: Record<string, number>;
  clarity_score?: number;
  conciseness_score?: number;
  relevance_score?: number;
}

export interface ArcadeScoreRecord {
  id: string;
  game_type: ArcadeGameType;
  score_value: number;
  metadata?: ArcadeScoreMetadata;
  created_at: string;
}

export interface FillerStats {
  totalWords: number;
  fillerCount: number;
  fillerPercentage: number;
  breakdown: Record<string, number>;
  detectedList: Array<{ word: string; count: number }>;
}

export interface PersonalBests {
  fillerReflexBest: number | null; // lowest percentage
  pitchBest: number | null; // highest score
  fillerHistory: ArcadeScoreRecord[];
  pitchHistory: ArcadeScoreRecord[];
}
