let accessToken: string | null = null;
const unauthenticatedListeners = new Set<() => void>();

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function notifyUnauthenticated() {
  unauthenticatedListeners.forEach((listener) => listener());
}

export function subscribeToUnauthenticated(listener: () => void) {
  unauthenticatedListeners.add(listener);
  return () => {
    unauthenticatedListeners.delete(listener);
  };
}
