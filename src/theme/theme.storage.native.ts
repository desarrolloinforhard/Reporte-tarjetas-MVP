import * as SecureStore from 'expo-secure-store';

import type { ThemePreference } from '@/theme/theme-provider';

const THEME_PREFERENCE_KEY = 'inforhard.theme.preference';

export async function getStoredThemePreference(): Promise<ThemePreference | null> {
  const value = await SecureStore.getItemAsync(THEME_PREFERENCE_KEY);
  return value === 'system' || value === 'light' || value === 'dark' ? value : null;
}

export async function setStoredThemePreference(preference: ThemePreference) {
  await SecureStore.setItemAsync(THEME_PREFERENCE_KEY, preference);
}
