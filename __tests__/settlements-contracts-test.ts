import {
  settlementSchema,
  settlementsSummarySchema,
} from '@/features/settlements/settlements.api';

describe('contratos de liquidaciones', () => {
  test('acepta una liquidación estimada compatible con API v1', () => {
    const result = settlementSchema.parse({
      id: 'clover:fixture-clover-1',
      provider: 'clover',
      settlement_id: 'fixture-clover-1',
      settlement_date: '2026-07-29',
      settlement_date_basis: 'created_at_plus_1_day',
      transaction_date: '2026-07-28T15:30:00.000Z',
      transaction_type: 'payment',
      external_reference: '0001-00001001',
      payment_id: 'fixture-clover-1',
      gross_amount: 124500,
      fee_amount: 0,
      tax_amount: 0,
      refund_amount: 0,
      net_amount: 124500,
      currency: 'ARS',
      status: 'settled',
      status_label: 'Liquidado estimado',
      branch_id: '001',
      branch_name: 'Casa Central',
      terminal_id: 'POS-01',
      terminal_name: 'Caja 1',
      data_source: 'payment_estimate',
      estimated: true,
    });

    expect(result.estimated).toBe(true);
    expect(result.net_amount).toBe(124500);
  });

  test('acepta el resumen de liquidaciones sintéticas', () => {
    const result = settlementsSummarySchema.parse({
      settlements_count: 12,
      gross_amount: 1250000,
      fee_amount: 0,
      tax_amount: 0,
      refund_amount: 116000,
      net_amount: 1134000,
      settled_count: 7,
      pending_count: 1,
      rejected_count: 2,
      cancelled_count: 1,
      estimated_count: 12,
      currency: 'ARS',
      data_source: 'payment_estimate',
      estimated: true,
      source_note: 'Fixture de desarrollo.',
    });

    expect(result.settlements_count).toBe(12);
    expect(result.data_source).toBe('payment_estimate');
  });
});
