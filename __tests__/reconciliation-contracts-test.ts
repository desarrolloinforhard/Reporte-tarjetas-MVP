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

  it('mantiene visibles las metricas con el resumen del backend operativo anterior', () => {
    const summary = reconciliationSummarySchema.parse({
      total_payments: 269,
      matched_count: 263,
      sale_not_found_count: 4,
      amount_mismatch_count: 2,
      pending_review_count: 0,
      total_difference: 1250,
      total_exact: true,
      reconciliation_mode: 'legacy',
      by_provider: {},
      by_branch: {},
    });

    expect(summary.total_payments).toBe(269);
    expect(summary.total_payment_amount).toBe(0);
    expect(summary.total_sale_amount).toBe(0);
    expect(summary.amount_mismatch_amount).toBe(0);
  });

  it('normaliza los nombres historicos del desglose monetario', () => {
    const summary = reconciliationSummarySchema.parse({
      total_payments: 3,
      matched_count: 1,
      sale_not_found_count: 1,
      amount_mismatch_count: 1,
      pending_review_count: 0,
      total_difference: 350,
      amount_mismatch_difference_total: 200,
      sale_not_found_amount_total: 150,
      real_difference_total: 200,
    });

    expect(summary.amount_mismatch_amount).toBe(200);
    expect(summary.sale_not_found_amount).toBe(150);
    expect(summary.real_difference_amount).toBe(200);
  });
});
