export async function getStoredRefreshToken() {
  return null;
}

export async function setStoredRefreshToken(_token: string | null) {
  // Web mantiene la sesión exclusivamente en una cookie HttpOnly.
}
