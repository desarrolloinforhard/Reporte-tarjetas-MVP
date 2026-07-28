import type { ThemePreference } from '@/theme/theme-provider';

const THEME_PREFERENCE_KEY = 'inforhard.theme.preference';

export async function getStoredThemePreference(): Promise<ThemePreference | null> {
  const value = globalThis.localStorage?.getItem(THEME_PREFERENCE_KEY);
  return value === 'system' || value === 'light' || value === 'dark' ? value : null;
}

export async function setStoredThemePreference(preference: ThemePreference) {
  globalThis.localStorage?.setItem(THEME_PREFERENCE_KEY, preference);
}
