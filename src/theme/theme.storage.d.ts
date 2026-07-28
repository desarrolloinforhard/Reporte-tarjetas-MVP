import type { ThemePreference } from '@/theme/theme-provider';

export function getStoredThemePreference(): Promise<ThemePreference | null>;
export function setStoredThemePreference(preference: ThemePreference): Promise<void>;
