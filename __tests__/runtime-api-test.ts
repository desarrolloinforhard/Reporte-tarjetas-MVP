import { apiModeForUrl, normalizeApiBaseUrl } from '@/config/runtime-api';

describe('configuración técnica de API', () => {
  it('normaliza una IP de red local y agrega el contrato base', () => {
    expect(normalizeApiBaseUrl('192.168.1.111:5001', 'lan')).toBe(
      'http://192.168.1.111:5001/api/v1',
    );
  });

  it('normaliza un servidor remoto con HTTPS', () => {
    expect(normalizeApiBaseUrl('api.inforhard.com', 'remote')).toBe(
      'https://api.inforhard.com/api/v1',
    );
  });

  it('reconoce localhost, red local y remoto', () => {
    expect(apiModeForUrl('http://localhost:5001/api/v1')).toBe('local');
    expect(apiModeForUrl('http://192.168.1.111:5001/api/v1')).toBe('lan');
    expect(apiModeForUrl('https://api.inforhard.com/api/v1')).toBe('remote');
  });
});
