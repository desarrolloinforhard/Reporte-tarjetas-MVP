import { z } from 'zod';
import { Platform } from 'react-native';

const environmentSchema = z.object({
  apiBaseUrl: z.string().url(),
  name: z.enum(['development', 'staging', 'production', 'test']),
});

const defaultApiUrl = 'http://localhost:5000/api/v1';
const platformApiUrl = Platform.OS === 'web'
  ? process.env.EXPO_PUBLIC_API_URL_WEB
  : process.env.EXPO_PUBLIC_API_URL_NATIVE;

export const appEnvironment = environmentSchema.parse({
  apiBaseUrl: platformApiUrl || process.env.EXPO_PUBLIC_API_URL || defaultApiUrl,
  name: process.env.EXPO_PUBLIC_APP_ENV || (__DEV__ ? 'development' : 'production'),
});
