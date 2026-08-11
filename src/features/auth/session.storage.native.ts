import * as SecureStore from 'expo-secure-store';

const REFRESH_TOKEN_KEY = 'inforhard.reportes.refresh-token';
const SESSION_MARKER_KEY = 'inforhard.reportes.session-marker';

export function getStoredRefreshToken() {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function setStoredRefreshToken(token: string | null) {
  if (token) {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
  } else {
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  }
}

export async function getStoredSessionMarker() {
  return (await SecureStore.getItemAsync(SESSION_MARKER_KEY)) === 'active';
}

export async function setStoredSessionMarker(active: boolean) {
  if (active) {
    await SecureStore.setItemAsync(SESSION_MARKER_KEY, 'active');
  } else {
    await SecureStore.deleteItemAsync(SESSION_MARKER_KEY);
  }
}
