import {
  authResultSchema,
  currentSessionSchema,
  currentUserSchema,
  logoutResultSchema,
} from '@/features/auth/session.contracts';

describe('contratos de sesión actuales', () => {
  test('acepta la sesión local publicada por el backend existente', () => {
    const session = currentSessionSchema.parse({
      authenticated: true,
      expires_at: null,
      environment: 'development',
      api_base_url: '/api/v1',
      auth_mode: 'local',
      user_id: 'local-admin',
    });

    expect(session.authenticated).toBe(true);
    expect(session.auth_mode).toBe('local');
  });

  test('acepta el usuario actual y sus permisos', () => {
    const user = currentUserSchema.parse({
      id: 'local-admin',
      username: 'admin',
      display_name: 'Administrador',
      role: 'admin',
      permissions: ['payments.read', 'reports.read'],
      capabilities: { exports: true },
      branch_ids: [],
      is_authenticated: true,
    });

    expect(user.permissions).toContain('payments.read');
  });

  test('rechaza una sesión sin identidad', () => {
    expect(() =>
      currentSessionSchema.parse({
        authenticated: true,
        expires_at: null,
        environment: 'development',
        api_base_url: '/api/v1',
        auth_mode: 'local',
        user_id: '',
      }),
    ).toThrow();
  });

  test('acepta login web sin exponer tokens', () => {
    const result = authResultSchema.parse({
      session: {
        authenticated: true,
        expires_at: '2026-07-28T22:00:00.000Z',
        environment: 'development',
        api_base_url: '/api/v1',
        auth_mode: 'fixture',
        user_id: 'fixture-admin',
      },
      user: {
        id: 'fixture-admin',
        username: 'demo',
        display_name: 'Usuario de prueba',
        role: 'admin',
        permissions: ['reports.read'],
        capabilities: { fixture_mode: true },
        branch_ids: [],
        is_authenticated: true,
      },
      token_type: 'Cookie',
      expires_in: 28800,
      access_token: null,
      refresh_token: null,
    });

    expect(result.token_type).toBe('Cookie');
    expect(result.access_token).toBeNull();
  });

  test('acepta tokens nativos y cierre de sesión', () => {
    const native = authResultSchema.parse({
      session: {
        authenticated: true,
        expires_at: '2026-07-28T22:00:00.000Z',
        environment: 'development',
        api_base_url: '/api/v1',
        auth_mode: 'fixture',
        user_id: 'fixture-admin',
      },
      user: {
        id: 'fixture-admin',
        username: 'demo',
        display_name: 'Usuario de prueba',
        role: 'admin',
        permissions: ['reports.read'],
        capabilities: { fixture_mode: true },
        branch_ids: [],
        is_authenticated: true,
      },
      token_type: 'Bearer',
      expires_in: 900,
      access_token: 'access-token',
      refresh_token: 'refresh-token',
    });

    expect(native.refresh_token).toBe('refresh-token');
    expect(logoutResultSchema.parse({ logged_out: true }).logged_out).toBe(true);
  });
});
