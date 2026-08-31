import { focusManager, QueryClientProvider } from '@tanstack/react-query';
import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, AppState, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { queryClient } from '@/config/query-client';
import { initializeRuntimeApiBaseUrl } from '@/config/runtime-api';
import { SessionProvider, useSession } from '@/features/auth/session-provider';
import { AppThemeProvider, useAppTheme } from '@/theme/theme-provider';

function RootNavigator() {
  const { isDark } = useAppTheme();
  const { authenticated, loading } = useSession();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={!authenticated}>
          <Stack.Screen name="sign-in" />
        </Stack.Protected>
        <Stack.Protected guard={authenticated}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [runtimeReady, setRuntimeReady] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    void initializeRuntimeApiBaseUrl().finally(() => setRuntimeReady(true));
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    const subscription = AppState.addEventListener('change', (status) => {
      focusManager.setFocused(status === 'active');
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web' || !('serviceWorker' in navigator)) return;
    void navigator.serviceWorker.register('/service-worker.js').catch(() => {
      // La aplicación sigue siendo utilizable si el navegador bloquea el worker.
    });
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const shareKey = '_vercel_share';
    const currentUrl = new URL(window.location.href);
    const incomingShareToken = currentUrl.searchParams.get(shareKey);
    if (incomingShareToken) {
      window.sessionStorage.setItem(shareKey, incomingShareToken);
    }

    const shareToken = window.sessionStorage.getItem(shareKey);
    if (!shareToken || (currentUrl.pathname === '/' && incomingShareToken === shareToken)) return;

    // Los Shareable Links de Vercel quedan asociados a la URL que los creó.
    // Expo Router navega a /sign-in al iniciar una sesión anónima; conservar la
    // URL raíz evita que una recarga pierda el permiso temporal del enlace.
    const sharedRootUrl = new URL(window.location.origin);
    sharedRootUrl.searchParams.set(shareKey, shareToken);
    window.history.replaceState(null, '', `${sharedRootUrl.pathname}${sharedRootUrl.search}`);
  }, [pathname]);

  if (!runtimeReady) {
    return <View style={styles.loading}><ActivityIndicator size="large" /></View>;
  }

  return (
    <SafeAreaProvider>
      <AppThemeProvider>
        <QueryClientProvider client={queryClient}>
          <SessionProvider>
            <RootNavigator />
          </SessionProvider>
        </QueryClientProvider>
      </AppThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
