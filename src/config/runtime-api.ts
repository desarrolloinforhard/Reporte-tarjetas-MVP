import { appEnvironment } from '@/config/environment';
import { getStoredApiBaseUrl, setStoredApiBaseUrl } from '@/config/api-url.storage';

export type ApiMode = 'local' | 'lan' | 'remote';

let runtimeApiBaseUrl = appEnvironment.apiBaseUrl;

export function getApiBaseUrl() {
  return runtimeApiBaseUrl;
}

export async function initializeRuntimeApiBaseUrl() {
  const stored = await getStoredApiBaseUrl();
  if (stored) runtimeApiBaseUrl = stored;
  return runtimeApiBaseUrl;
}

export async function saveRuntimeApiBaseUrl(value: string) {
  runtimeApiBaseUrl = value;
  await setStoredApiBaseUrl(value);
}

export function apiModeForUrl(value: string): ApiMode {
  const url = new URL(value);
  if (['localhost', '127.0.0.1', '::1'].includes(url.hostname)) return 'local';
  return url.protocol === 'http:' ? 'lan' : 'remote';
}

export function normalizeApiBaseUrl(value: string, mode: ApiMode) {
  if (mode === 'local') return appEnvironment.apiBaseUrl;
  const trimmed = value.trim();
  if (!trimmed) throw new Error('Ingresá una URL o IP para la API.');
  const withScheme = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `${mode === 'lan' ? 'http' : 'https'}://${trimmed.replace(/^\/+/, '')}`;
  let parsed: URL;
  try {
    parsed = new URL(withScheme);
  } catch {
    throw new Error('Ingresá una URL válida, por ejemplo 192.168.1.100:5001.');
  }
  const base = `${parsed.protocol}//${parsed.host}${parsed.pathname}`.replace(/\/$/, '');
  return base.toLowerCase().endsWith('/api/v1') ? base : `${base}/api/v1`;
}
