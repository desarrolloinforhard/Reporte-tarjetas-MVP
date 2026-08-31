import { z } from 'zod';
import { Platform } from 'react-native';

const environmentSchema = z.object({
  apiBaseUrl: z.string().url(),
  name: z.enum(['development', 'staging', 'production', 'test']),
});

export function isApiConfigurationAllowed(
  name: z.infer<typeof environmentSchema>['name'],
  apiBaseUrl: string,
) {
  if (name !== 'production') return true;
  try {
    const url = new URL(apiBaseUrl);
    const localHost = ['localhost', '127.0.0.1', '::1'].includes(url.hostname)
      || /^192\.168\./.test(url.hostname)
      || /^10\./.test(url.hostname);
    return url.protocol === 'https:' && !localHost && url.pathname.replace(/\/$/, '') === '/api/v1';
  } catch {
    return false;
  }
}

const defaultApiUrl = 'http://localhost:5000/api/v1';
const platformApiUrl = Platform.OS === 'web'
  ? process.env.EXPO_PUBLIC_API_URL_WEB
  : process.env.EXPO_PUBLIC_API_URL_NATIVE;

const parsedEnvironment = environmentSchema.parse({
  apiBaseUrl: platformApiUrl || process.env.EXPO_PUBLIC_API_URL || defaultApiUrl,
  name: process.env.EXPO_PUBLIC_APP_ENV || (__DEV__ ? 'development' : 'production'),
});

export const appEnvironment = {
  ...parsedEnvironment,
  apiConfigured: isApiConfigurationAllowed(
    parsedEnvironment.name,
    parsedEnvironment.apiBaseUrl,
  ),
};
