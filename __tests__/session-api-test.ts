import { apiRequest } from '@/api/client';
import {
  changePassword,
  getCurrentSession,
  getCurrentUser,
  loginForPlatform,
  logoutSessionForPlatform,
  requestPasswordReset,
} from '@/features/auth/session.api';

jest.mock('@/api/client', () => ({
  apiRequest: jest.fn(),
}));

const mockedApiRequest = jest.mocked(apiRequest);

describe('API de autenticación web', () => {
  beforeEach(() => {
    mockedApiRequest.mockReset();
  });

  test('inicia sesión contra el endpoint API y envía credenciales como JSON', async () => {
    mockedApiRequest.mockResolvedValueOnce({} as never);

    await loginForPlatform('web', 'operador', 'secreto-local');

    expect(mockedApiRequest).toHaveBeenCalledWith(
      '/sessions/login',
      expect.anything(),
      {
        method: 'POST',
        credentials: 'include',
        body: {
          username: 'operador',
          password: 'secreto-local',
          client_type: 'web',
        },
      },
    );
  });

  test('limita el tiempo de restauración para no bloquear el inicio si la API guardada no responde', async () => {
    mockedApiRequest.mockResolvedValueOnce({} as never);

    await getCurrentSession();

    expect(mockedApiRequest).toHaveBeenCalledWith(
      '/sessions/current',
      expect.anything(),
      { credentials: 'include', timeoutMs: 8_000 },
    );

    mockedApiRequest.mockResolvedValueOnce({} as never);
    await getCurrentUser();

    expect(mockedApiRequest).toHaveBeenCalledWith(
      '/users/me',
      expect.anything(),
      { credentials: 'include', timeoutMs: 8_000 },
    );
  });

  test('cierra la sesión API sin enviar credenciales ni tokens en web', async () => {
    mockedApiRequest.mockResolvedValueOnce({} as never);

    await logoutSessionForPlatform('web');

    expect(mockedApiRequest).toHaveBeenCalledWith(
      '/sessions/logout',
      expect.anything(),
      {
        method: 'POST',
        credentials: 'include',
      },
    );
  });

  test('solicita recuperación sin revelar datos de la cuenta', async () => {
    mockedApiRequest.mockResolvedValueOnce({ accepted: true } as never);

    await requestPasswordReset('propietario@empresa.invalid');

    expect(mockedApiRequest).toHaveBeenCalledWith(
      '/sessions/password-reset/request',
      expect.anything(),
      {
        method: 'POST',
        body: { username_or_email: 'propietario@empresa.invalid' },
      },
    );
  });

  test('cambia contraseña con el contrato protegido de sesión', async () => {
    mockedApiRequest.mockResolvedValueOnce({} as never);

    await changePassword('actual-segura', 'nueva-segura');

    expect(mockedApiRequest).toHaveBeenCalledWith(
      '/sessions/password/change',
      expect.anything(),
      {
        method: 'POST',
        credentials: 'include',
        body: {
          current_password: 'actual-segura',
          new_password: 'nueva-segura',
          client_type: expect.any(String),
        },
      },
    );
  });
});
