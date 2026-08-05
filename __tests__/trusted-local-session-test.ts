import { apiRequest } from '@/api/client';
import { getTrustedLocalSession } from '@/features/auth/session.api';

jest.mock('@/api/client', () => ({
  apiRequest: jest.fn(),
}));

const mockedApiRequest = jest.mocked(apiRequest);

describe('sesiÃ³n local heredada', () => {
  beforeEach(() => mockedApiRequest.mockReset());

  test('la reconoce sin enviar credenciales', async () => {
    mockedApiRequest
      .mockResolvedValueOnce({
        authenticated: true,
        expires_at: null,
        environment: 'production',
        api_base_url: '/api/v1',
        auth_mode: 'local',
        user_id: 'admin',
      } as never)
      .mockResolvedValueOnce({
        id: 'admin',
        username: 'admin',
        display_name: 'Administrador',
        role: 'admin',
        permissions: [],
        capabilities: {},
        branch_ids: [],
        is_authenticated: true,
      } as never);

    await expect(getTrustedLocalSession()).resolves.toMatchObject({
      session: { auth_mode: 'local' },
      user: { username: 'admin' },
    });
    expect(mockedApiRequest).toHaveBeenCalledTimes(2);
  });

  test('rechaza una sesiÃ³n que no sea local', async () => {
    mockedApiRequest
      .mockResolvedValueOnce({
        authenticated: true,
        auth_mode: 'fixture',
      } as never)
      .mockResolvedValueOnce({ is_authenticated: true } as never);

    await expect(getTrustedLocalSession()).resolves.toBeNull();
  });
});
