import { apiRequest } from '@/api/client';
import {
  loginForPlatform,
  logoutSessionForPlatform,
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
});
