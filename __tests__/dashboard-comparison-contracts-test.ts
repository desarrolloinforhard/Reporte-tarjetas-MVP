import {
  dailyPaymentSchema,
  exactProviderComparison,
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
  it('prioriza agregados exactos y conserva proveedores sin pagos', () => {
    const rows = exactProviderComparison(
      {
        total_amount: 1000,
        net_amount: 1000,
        refund_amount: 0,
        payments_count: 10,
        approved_count: 9,
        rejected_count: 1,
        pending_count: 0,
        refunds_count: 0,
        summary_mode: 'aggregate',
        totals_exact: true,
        source_note: 'Agregados SQL',
        by_provider: [
          {
            provider: 'clover',
            total_amount: 0,
            net_amount: 0,
            refund_amount: 0,
            payments_count: 0,
            approved_count: 0,
            rejected_count: 0,
            pending_count: 0,
            refunds_count: 0,
            totals_exact: true,
          },
          {
            provider: 'mercadopago',
            total_amount: 1000,
            net_amount: 1000,
            refund_amount: 0,
            payments_count: 10,
            approved_count: 9,
            rejected_count: 1,
            pending_count: 0,
            refunds_count: 0,
            totals_exact: true,
          },
        ],
      },
      [
        {
          provider: 'mercadopago',
          payments_count: 100,
          approved_rate: 100,
          rejected_rate: 0,
          total_amount: 250,
          average_ticket: 2.5,
          refund_amount: 0,
        },
      ],
    );

    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ provider: 'clover', payments_count: 0, total_amount: 0 });
    expect(rows[1]).toMatchObject({
      provider: 'mercadopago',
      payments_count: 10,
      approved_rate: 90,
      rejected_rate: 10,
      total_amount: 1000,
      average_ticket: 100,
    });
  });
});
