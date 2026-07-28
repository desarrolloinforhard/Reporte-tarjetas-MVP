export function getStoredRefreshToken(): Promise<string | null>;
export function setStoredRefreshToken(token: string | null): Promise<void>;
