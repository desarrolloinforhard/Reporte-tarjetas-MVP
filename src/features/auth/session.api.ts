import { apiRequest } from '@/api/client';
import {
  currentSessionSchema,
  currentUserSchema,
  type CurrentSession,
  type CurrentUser,
} from '@/features/auth/session.contracts';

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
