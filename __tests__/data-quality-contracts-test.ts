import {
  duplicateGroupSchema,
  findingSchema,
  nextQualityPageOffset,
  qualitySummarySchema,
} from '@/features/data-quality/data-quality.api';

describe('contratos de calidad de datos', () => {
  test('acepta el resumen del backend aislado', () => {
    const result = qualitySummarySchema.parse({
      checked_count: 12,
      valid_count: 7,
      warning_count: 5,
      error_count: 0,
      issues_by_type: [{ type: 'duplicate_payment', count: 2 }],
      analysis_mode: 'fixture',
      total_exact: true,
    });
    expect(result.warning_count).toBe(5);
  });

  test('normaliza un hallazgo resumido del backend operativo', () => {
    const result = findingSchema.parse({
      payment_id: 'fixture-payment-1',
      provider: 'mercadopago',
      external_reference: null,
      created_at: '2026-08-05T12:00:00.000Z',
      amount: 3315,
      reason: 'missing_reference',
    });

    expect(result.id).toBe('fixture-payment-1');
    expect(result.external_reference).toBe('');
    expect(result.currency).toBe('ARS');
  });

  test('acepta duplicados resumidos sin inventar datos del pago', () => {
    const result = duplicateGroupSchema.parse({
      duplicate_key: 'fixture-key',
      strategy: 'external_id',
      count: 2,
      payments: [
        {
          id: 'fixture-payment-2',
          provider: 'clover',
          external_id: 'fixture-external-2',
          external_reference: 'fixture-reference-2',
          created_at: '2026-08-05T13:00:00.000Z',
          amount: 4862.9,
          status: 'approved',
        },
      ],
    });

    expect(result.payments[0]!.payment_id).toBe('fixture-payment-2');
    expect(result.payments[0]!.status_label).toBe('');
  });

  test('pagina con el contrato operativo que solo informa total y offset', () => {
    expect(nextQualityPageOffset({ total: 250, limit: 100, offset: 0 }, 0, 100)).toBe(100);
    expect(nextQualityPageOffset({ total: 250, limit: 100, offset: 200 }, 200, 50)).toBeNull();
  });

  test('respeta has_more cuando el backend nuevo lo informa', () => {
    expect(nextQualityPageOffset({ has_more: true, next_offset: 200 }, 100, 100)).toBe(200);
    expect(nextQualityPageOffset({ has_more: false, next_offset: null }, 100, 20)).toBeNull();
  });
});
