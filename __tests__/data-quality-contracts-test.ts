import { qualitySummarySchema } from '@/features/data-quality/data-quality.api';

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
});
