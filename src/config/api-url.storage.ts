import { Platform } from 'react-native';

const API_URL_KEY = 'inforhard.api.base-url';

export async function getStoredApiBaseUrl() {
  if (Platform.OS === 'web') return globalThis.localStorage?.getItem(API_URL_KEY) || null;
  const SecureStore = await import('expo-secure-store');
  return SecureStore.getItemAsync(API_URL_KEY);
}

export async function setStoredApiBaseUrl(value: string) {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(API_URL_KEY, value);
    return;
  }
  const SecureStore = await import('expo-secure-store');
  await SecureStore.setItemAsync(API_URL_KEY, value);
}
