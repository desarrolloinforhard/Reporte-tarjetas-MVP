import {
  reconciliationRowSchema,
  reconciliationSummarySchema,
} from '@/features/reconciliation/reconciliation.api';

describe('contratos de conciliación', () => {
  it('acepta una fila de conciliación contractual', () => {
    const row = reconciliationRowSchema.parse({
      payment_id: 'fixture-clover-1',
      provider: 'clover',
      external_reference: '0001-00001001',
      created_at: '2026-07-29T15:30:00.000Z',
      payment_amount: 124500,
      sale_amount: 124500,
      difference: 0,
      status: 'matched',
      status_label: 'Conciliado',
      issue_message: '',
      payments_count: 1,
    });
    expect(row.status).toBe('matched');
  });

  it('acepta el resumen con sus cuatro estados', () => {
    const summary = reconciliationSummarySchema.parse({
      total_payments: 12,
      matched_count: 7,
      sale_not_found_count: 1,
      amount_mismatch_count: 1,
      pending_review_count: 3,
      total_payment_amount: 889350,
      total_sale_amount: 886650,
      total_difference: 2700,
      total_exact: true,
      reconciliation_mode: 'fixture',
    });
    expect(
      summary.matched_count +
        summary.sale_not_found_count +
        summary.amount_mismatch_count +
        summary.pending_review_count,
    ).toBe(summary.total_payments);
  });
});
