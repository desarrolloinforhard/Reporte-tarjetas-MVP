import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';

import { AppColors, darkColors, lightColors } from '@/theme/tokens';
import {
  getStoredThemePreference,
  setStoredThemePreference,
} from '@/theme/theme.storage';

export type ThemePreference = 'system' | 'light' | 'dark';

type ThemeContextValue = {
  colors: AppColors;
  isDark: boolean;
  preference: ThemePreference;
  savedPreference: ThemePreference;
  savePreference: (preference: ThemePreference) => Promise<void>;
  setPreference: (preference: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function AppThemeProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme();
  const [preference, setPreference] = useState<ThemePreference>('system');
  const [savedPreference, setSavedPreference] = useState<ThemePreference>('system');
  const isDark = preference === 'dark' || (preference === 'system' && systemScheme === 'dark');

  useEffect(() => {
    let active = true;
    void getStoredThemePreference().then((stored) => {
      if (!active || !stored) return;
      setPreference(stored);
      setSavedPreference(stored);
    });
    return () => {
      active = false;
    };
  }, []);

  const savePreference = useCallback(async (nextPreference: ThemePreference) => {
    await setStoredThemePreference(nextPreference);
    setPreference(nextPreference);
    setSavedPreference(nextPreference);
  }, []);

  const value = useMemo(
    () => ({
      colors: isDark ? darkColors : lightColors,
      isDark,
      preference,
      savedPreference,
      savePreference,
      setPreference,
    }),
    [isDark, preference, savedPreference, savePreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useAppTheme debe utilizarse dentro de AppThemeProvider.');
  }

  return context;
}
