import {
  identifySelectedPaymentRole,
  paymentDetailSchema,
  paymentSchema,
} from '@/features/payments/payments.api';

describe('listado de intentos independientes', () => {
  const base = {
    provider: 'mercadopago',
    status_label: '',
    currency: 'ARS',
    fee_amount: 0,
    net_amount: 0,
    refund_amount: 0,
    created_at: '2026-08-03 12:25:36.0000',
    branch_id: '0035',
    branch_name: 'Sucursal 0035',
    terminal_id: 'terminal-35',
    terminal_name: 'Su.01-Ca.09 PV035 (CAE)',
    cashier_id: '1',
    cashier_name: 'Cajero 1',
    payment_method: 'debit_card',
    card_brand: 'visa',
    card_type: null,
    card_last_four: null,
    authorization_code: '',
  };

  it('conserva el intento rechazado y el aprobado de la misma venta', () => {
    const rows = [
      paymentSchema.parse({
        ...base,
        id: 'attempt-rejected',
        external_reference: 'B-0001-00000001',
        status: 'rejected',
        status_label: 'El medio no procesó el pago.',
        amount: 3395,
      }),
      paymentSchema.parse({
        ...base,
        id: 'attempt-approved',
        external_reference: 'B-0001-00000001',
        status: 'approved',
        status_label: '¡Listo! Se acreditó tu pago.',
        amount: 3315,
      }),
    ];

    expect(rows.map((row) => row.id)).toEqual(['attempt-rejected', 'attempt-approved']);
  });

  it('no relaciona operaciones por importe, horario, caja ni cliente intercalado', () => {
    const rejected = paymentSchema.parse({
      ...base,
      id: 'rejected-a',
      external_reference: 'VENTA-A',
      status: 'rejected',
      amount: 1000,
    });
    const otherCustomer = paymentSchema.parse({
      ...base,
      id: 'approved-b',
      external_reference: 'VENTA-B',
      status: 'approved',
      amount: 1000,
    });

    expect([rejected, otherCustomer]).toHaveLength(2);
  });

  it('conserva varios pagos aplicados de una venta dividida', () => {
    const rows = ['applied-1', 'applied-2'].map((id) => paymentSchema.parse({
      ...base,
      id,
      external_reference: 'VENTA-DIVIDIDA',
      status: 'approved',
      amount: 500,
    }));

    expect(rows).toHaveLength(2);
  });
});

describe('paymentSchema - contrato real de Buen Gusto', () => {
  it('acepta campos opcionales nulos enviados por la API productiva', () => {
    const payment = paymentSchema.parse({
      id: 'payment-approved',
      provider: 'mercadopago',
      external_id: 'payment-approved',
      external_reference: 'B-0001-00000002',
      created_at: '2026-08-01 09:33:45.0000',
      amount: 1100,
      net_amount: 1100,
      fee_amount: null,
      refund_amount: 0,
      currency: 'ARS',
      status: 'approved',
      status_label: 'Acreditado',
      payment_method: 'wallet',
      card_brand: null,
      installments: null,
      authorization_code: null,
      terminal_name: 'Su.01-Ca.02 PV028 (CAE)',
      terminal_id: '104625203',
      cashier_name: 'Cajero Nro.18',
      cashier_id: '18',
      branch_id: '0028',
      branch_name: 'Sucursal 0028',
    });

    expect(payment.fee_amount).toBe(0);
    expect(payment.card_brand).toBe('');
    expect(payment.installments).toBeUndefined();
    expect(payment.authorization_code).toBe('');
    expect(payment.created_date).toBe('2026-08-01');
  });

  it('acepta el detalle reducido de producción y completa las secciones del modal', () => {
    const detail = paymentDetailSchema.parse({
      payment: {
      id: 'payment-detail',
        provider: 'mercadopago',
        external_id: 'payment-detail',
        external_reference: 'B-0001-00000003',
        created_at: '2026-08-01 09:57:42.0000',
        amount: 6965.99,
        net_amount: 6965.99,
        fee_amount: null,
        refund_amount: 0,
        currency: 'ARS',
        status: 'approved',
        status_label: 'Acreditado',
        payment_method: 'credit_card',
        card_brand: 'visa',
        installments: null,
        authorization_code: null,
        terminal_name: 'Su.02-Ca.02 PV038 (CAE)',
        terminal_id: '108972824',
        cashier_name: 'Cajero Nro.15',
        cashier_id: '15',
        branch_id: '0038',
        branch_name: 'Sucursal 0038',
      },
      raw: {},
    });

    expect(detail.sale).toBeNull();
    expect(detail.payment_summary.status).toBe('pending_review');
    expect(detail.payment_summary.payment_total).toBe(6965.99);
    expect(detail.reconciliation.difference).toBe(0);
  });
  it('conserva el intento rechazado aunque la venta completa este conciliada', () => {
    const rejectedAttempt = paymentSchema.parse({
      id: 'attempt-rejected',
      provider: 'mercadopago',
      external_id: 'attempt-rejected',
      external_reference: 'B-0001-00000001',
      created_at: '2026-08-03 12:25:00.0000',
      amount: 3395,
      currency: 'ARS',
      status: 'rejected',
      status_label: 'El medio no proceso el pago.',
    });
    const appliedPayment = paymentSchema.parse({
      ...rejectedAttempt,
      id: 'attempt-approved',
      external_id: 'attempt-approved',
      amount: 3315,
      status: 'approved',
      status_label: 'Acreditado',
    });
    const detail = paymentDetailSchema.parse({
      payment: rejectedAttempt,
      sale: {
        external_reference: 'B-0001-00000001',
        availability_status: 'available',
        invoice_total: 3315,
        payments: [appliedPayment],
        payment_attempts: [rejectedAttempt],
      },
      payment_summary: {
        status: 'matched',
        sale_total: 3315,
        payment_total: 3315,
        difference: 0,
        payments_count: 1,
        applied_payments_count: 1,
        payment_attempts_count: 1,
      },
    });

    const identified = identifySelectedPaymentRole(detail);

    expect(identified.payment.status).toBe('rejected');
    expect(identified.payment.current_payment_applied).toBe(false);
    expect(identified.payment.attempt_role).toBe('not_applied');
    expect(identified.payment_summary.status).toBe('pending_review');
  });

  it('mantiene el efectivo como medio de caja sin convertirlo en fila de pago', () => {
    const electronic = paymentSchema.parse({
      id: 'electronic-applied',
      provider: 'mercadopago',
      external_id: 'electronic-applied',
      external_reference: 'B-0001-00000004',
      created_at: '2026-08-03 12:00:00.0000',
      amount: 3000,
      currency: 'ARS',
      status: 'approved',
      status_label: 'Acreditado',
    });
    const cashTender = paymentSchema.parse({
      id: 'sale-tender:B-0001-00000004:2',
      provider: 'supermarket',
      external_reference: 'B-0001-00000004',
      created_at: '2026-08-03 12:00:00.0000',
      amount: 1862.9,
      currency: 'ARS',
      status: 'approved',
      status_label: 'Efectivo',
      payment_method: 'cash',
    });
    const detail = paymentDetailSchema.parse({
      payment: electronic,
      sale: {
        external_reference: electronic.external_reference,
        availability_status: 'available',
        invoice_total: 4862.9,
        payments: [electronic],
        sale_tenders: [
          paymentSchema.parse({ ...cashTender, id: 'sale-tender:1', amount: 3000, status_label: 'Mercado Pago' }),
          cashTender,
        ],
        payment_attempts: [],
      },
      payment_summary: {
        status: 'matched',
        sale_total: 4862.9,
        payment_total: 4862.9,
        difference: 0,
        payments_count: 2,
        applied_payments_count: 2,
        payment_attempts_count: 0,
      },
    });

    expect(detail.sale?.payments).toHaveLength(1);
    expect(detail.sale?.sale_tenders.map((tender) => tender.status_label)).toEqual([
      'Mercado Pago',
      'Efectivo',
    ]);
    expect(detail.payment_summary.applied_payments_count).toBe(2);
  });
});
