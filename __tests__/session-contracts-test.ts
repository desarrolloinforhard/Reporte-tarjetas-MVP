import {
  currentSessionSchema,
  currentUserSchema,
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
});
