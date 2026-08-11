export async function getStoredRefreshToken() {
  return null;
}

export async function setStoredRefreshToken(_token: string | null) {
  // Web mantiene la sesión exclusivamente en una cookie HttpOnly.
}

const SESSION_MARKER_KEY = 'inforhard.reportes.session-marker';

export async function getStoredSessionMarker() {
  return globalThis.localStorage?.getItem(SESSION_MARKER_KEY) === 'active';
}

export async function setStoredSessionMarker(active: boolean) {
  if (active) {
    globalThis.localStorage?.setItem(SESSION_MARKER_KEY, 'active');
  } else {
    globalThis.localStorage?.removeItem(SESSION_MARKER_KEY);
  }
}
