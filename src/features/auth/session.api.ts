import { apiRequest } from '@/api/client';
import {
  authResultSchema,
  currentSessionSchema,
  currentUserSchema,
  logoutResultSchema,
  type AuthResult,
  type CurrentSession,
  type CurrentUser,
} from '@/features/auth/session.contracts';
import { Platform } from 'react-native';

const clientType = Platform.OS === 'web' ? 'web' : 'native';

export function getCurrentSession(): Promise<CurrentSession> {
  return apiRequest('/sessions/current', currentSessionSchema, {
    credentials: 'include',
  });
}

export function getCurrentUser(): Promise<CurrentUser> {
  return apiRequest('/users/me', currentUserSchema, {
    credentials: 'include',
  });
}

export function login(username: string, password: string): Promise<AuthResult> {
  return apiRequest('/sessions/login', authResultSchema, {
    method: 'POST',
    credentials: 'include',
    body: {
      username,
      password,
      client_type: clientType,
    },
  });
}

export function refreshSession(refreshToken?: string | null): Promise<AuthResult> {
  return apiRequest('/sessions/refresh', authResultSchema, {
    method: 'POST',
    credentials: 'include',
    body: {
      client_type: clientType,
      ...(refreshToken ? { refresh_token: refreshToken } : {}),
    },
  });
}

export function logoutSession(refreshToken?: string | null) {
  return apiRequest('/sessions/logout', logoutResultSchema, {
    method: 'POST',
    credentials: 'include',
    body: {
      client_type: clientType,
      ...(refreshToken ? { refresh_token: refreshToken } : {}),
    },
  });
}
