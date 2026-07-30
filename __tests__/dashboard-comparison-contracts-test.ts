import {
  dailyPaymentSchema,
  providerComparisonSchema,
} from '@/features/dashboard/dashboard.api';

describe('contratos comparativos de Inicio', () => {
  it('acepta la evolución diaria agrupada por proveedor', () => {
    expect(
      dailyPaymentSchema.parse({
        date: '2026-07-30',
        provider: 'clover',
        payments_count: 12,
        total_amount: 245000,
        net_amount: 240000,
        refund_amount: 5000,
      }),
    ).toMatchObject({ date: '2026-07-30', provider: 'clover' });
  });

  it('acepta las métricas comparativas por proveedor', () => {
    expect(
      providerComparisonSchema.parse({
        provider: 'mercadopago',
        payments_count: 20,
        approved_rate: 95,
        rejected_rate: 5,
        total_amount: 850000,
        average_ticket: 42500,
        refund_amount: 0,
      }),
    ).toMatchObject({ provider: 'mercadopago', approved_rate: 95 });
  });
});
