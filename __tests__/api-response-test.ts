import { z } from 'zod';

import { apiResponseSchema } from '@/api/api-response';

describe('apiResponseSchema', () => {
  test('acepta el contrato exitoso actual del backend', () => {
    const schema = apiResponseSchema(z.object({ status: z.string() }));
    const result = schema.parse({
      ok: true,
      data: { status: 'ok' },
      meta: { api_contract_version: '2026-07-18.1', request_id: 'request-1' },
      error: null,
    });

    expect(result.ok).toBe(true);
  });

  test('acepta errores de dominio estables', () => {
    const schema = apiResponseSchema(z.unknown());
    const result = schema.parse({
      ok: false,
      data: null,
      meta: { request_id: 'request-2' },
      error: { code: 'DATE_RANGE_INVALID', message: 'Rango inválido' },
    });

    expect(result.ok).toBe(false);
  });
});
