export function getStoredRefreshToken(): Promise<string | null>;
export function setStoredRefreshToken(token: string | null): Promise<void>;
export function getStoredSessionMarker(): Promise<boolean>;
export function setStoredSessionMarker(active: boolean): Promise<void>;
