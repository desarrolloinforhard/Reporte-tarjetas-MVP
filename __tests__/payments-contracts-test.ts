import {
  paymentCatalogsSchema,
  paymentDetailSchema,
  paymentSchema,
  paymentsSummarySchema,
} from '@/features/payments/payments.api';

const payment = {
  id: 'fixture-clover-1',
  provider: 'clover',
  status: 'approved',
  status_label: 'Aprobado',
  amount: 124500,
  currency: 'ARS',
  fee_amount: 0,
  net_amount: 124500,
  refund_amount: 0,
  created_date: '2026-07-28',
  created_at: '2026-07-28T15:30:00.000Z',
  branch_id: '001',
  branch_name: 'Casa Central',
  terminal_id: 'POS-01',
  terminal_name: 'Caja 1',
  cashier_id: '01',
  cashier_name: 'Ana',
  payment_method: 'credit_card',
  card_brand: 'visa',
  card_type: 'credit',
  card_last_four: '4242',
  external_reference: '0001-00001001',
  authorization_code: 'AUTH-1001',
};

describe('contratos de pagos', () => {
  it('acepta listado y medios sin tarjeta', () => {
    expect(paymentSchema.parse(payment).id).toBe('fixture-clover-1');
    expect(paymentSchema.parse({ ...payment, card_last_four: null }).card_last_four).toBeNull();
  });

  it('acepta resumen, catálogos y detalle', () => {
    expect(
      paymentsSummarySchema.parse({
        payments_count: 12,
        approved_count: 8,
        rejected_count: 2,
        pending_count: 1,
        refunded_count: 1,
        total_collected_amount: 889350,
        approved_amount: 1005350,
        rejected_amount: 80600,
        pending_amount: 55400,
        refund_amount: 116000,
        net_amount: 889350,
        currency: 'ARS',
      }).payments_count,
    ).toBe(12);
    expect(
      paymentCatalogsSchema.parse({
        providers: ['clover'],
        branches: [{ id: '001', name: 'Casa Central' }],
        terminals: [{ id: 'POS-01', name: 'Caja 1', branch_id: '001' }],
        cashiers: [{ id: '01', name: 'Ana' }],
        statuses: ['approved'],
        payment_methods: ['credit_card'],
        card_brands: ['visa'],
      }).providers,
    ).toContain('clover');
    expect(
      paymentDetailSchema.parse({
        payment,
        sale: {
          external_reference: payment.external_reference,
          availability_status: 'fixture',
          invoice_total: payment.amount,
          items: [],
          taxes: [],
          payments: [payment],
          payment_attempts: [],
        },
        payment_summary: {
          status: 'matched',
          sale_total: payment.amount,
          payment_total: payment.amount,
          difference: 0,
          payments_count: 1,
          applied_payments_count: 1,
          payment_attempts_count: 0,
        },
        reconciliation: { status: 'matched', difference: 0 },
        raw: {},
      }).reconciliation.status,
    ).toBe('matched');
  });
});
