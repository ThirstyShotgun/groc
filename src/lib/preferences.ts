export interface UserPreferences {
  defaultDifficulty: 'entry' | 'mid' | 'senior';
  timerEnabled: boolean;
  timerSeconds: number;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  defaultDifficulty: 'mid',
  timerEnabled: true,
  timerSeconds: 90
};

const STORAGE_KEY = 'prepr_user_preferences';

export function getPreferences(): UserPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(prefs: Partial<UserPreferences>): UserPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    const current = getPreferences();
    const updated = { ...current, ...prefs };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('prepr:preferences_changed'));
    return updated;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}
