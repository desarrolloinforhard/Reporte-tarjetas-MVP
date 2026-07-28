import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { queryClient } from '@/config/query-client';
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
