import { apiRequest } from '@/api/client';
import {
  authResultSchema,
  currentSessionSchema,
  currentUserSchema,
  logoutResultSchema,
  passwordResetRequestSchema,
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

export async function getTrustedLocalSession(): Promise<{
  session: CurrentSession;
  user: CurrentUser;
} | null> {
  const [session, user] = await Promise.all([getCurrentSession(), getCurrentUser()]);
  if (!session.authenticated || session.auth_mode !== 'local' || !user.is_authenticated) {
    return null;
  }
  return { session, user };
}

export function login(username: string, password: string): Promise<AuthResult> {
  return loginForPlatform(Platform.OS, username, password);
}

export function loginForPlatform(
  platform: typeof Platform.OS,
  username: string,
  password: string,
): Promise<AuthResult> {
  const webClient = platform === 'web';

  return apiRequest('/sessions/login', authResultSchema, {
    method: 'POST',
    credentials: 'include',
    body: {
      username,
      password,
      client_type: webClient ? 'web' : 'native',
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
  return logoutSessionForPlatform(Platform.OS, refreshToken);
}

export function requestPasswordReset(usernameOrEmail: string) {
  return apiRequest('/sessions/password-reset/request', passwordResetRequestSchema, {
    method: 'POST',
    body: { username_or_email: usernameOrEmail },
  });
}

export function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<AuthResult> {
  return apiRequest('/sessions/password/change', authResultSchema, {
    method: 'POST',
    credentials: 'include',
    body: {
      current_password: currentPassword,
      new_password: newPassword,
      client_type: clientType,
    },
  });
}

export function logoutSessionForPlatform(
  platform: typeof Platform.OS,
  refreshToken?: string | null,
) {
  const webClient = platform === 'web';

  return apiRequest('/sessions/logout', logoutResultSchema, {
    method: 'POST',
    credentials: 'include',
    ...(webClient
      ? {}
      : {
          body: {
            client_type: clientType,
            ...(refreshToken ? { refresh_token: refreshToken } : {}),
          },
        }),
  });
}
