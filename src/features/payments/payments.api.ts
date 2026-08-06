import { z } from 'zod';

import { ApiError } from '@/api/api-error';
import { apiRequest, apiRequestWithMeta } from '@/api/client';
import { normalizeAmountFilter, setNormalizedAmountParam } from '@/utils/amount-filter';

const nullableString = z.string().nullish().transform((value) => value ?? '');
const nullableNumber = z.number().nullish().transform((value) => value ?? 0);

export const paymentBaseSchema = z.object({
  id: z.string(),
  provider: z.string(),
  status: z.string(),
  status_label: z.string(),
  amount: z.number(),
  currency: z.string(),
  fee_amount: nullableNumber,
  net_amount: nullableNumber,
  refund_amount: nullableNumber,
  created_date: z.string().optional(),
  created_at: z.string(),
  branch_id: nullableString,
  branch_name: nullableString,
  terminal_id: nullableString,
  terminal_name: nullableString,
  cashier_id: nullableString,
  cashier_name: nullableString,
  payment_method: nullableString,
  card_brand: nullableString,
  card_type: z.string().nullish(),
  card_last_four: z.string().nullish(),
  external_reference: nullableString,
  authorization_code: nullableString,
  external_id: z.string().nullish().transform((value) => value ?? undefined),
  installments: z.number().nullish().transform((value) => value ?? undefined),
  current_payment_applied: z.boolean().optional(),
  attempt_role: z.string().optional(),
  reference_reused: z.boolean().optional(),
  prior_attempt_count: z.number().optional(),
  prior_attempt_amount: z.number().optional(),
  prior_attempt_status_label: z.string().optional(),
});

export const paymentSchema = paymentBaseSchema.transform((payment) => ({
  ...payment,
  created_date: payment.created_date || payment.created_at.slice(0, 10),
  card_type: payment.card_type || '',
  card_last_four: payment.card_last_four ?? null,
}));

export const paymentsSummarySchema = z.object({
  payments_count: z.number(),
  approved_count: z.number(),
  rejected_count: z.number(),
  pending_count: z.number(),
  refunded_count: z.number(),
  total_collected_amount: z.number(),
  approved_amount: z.number(),
  rejected_amount: z.number(),
  pending_amount: z.number(),
  refund_amount: z.number(),
  net_amount: z.number(),
  currency: z.string(),
});

const optionSchema = z.object({ id: z.string(), name: z.string() });

const saleItemSchema = z.object({
  code: z.union([z.string(), z.number()]).transform(String),
  description: z.string(),
  quantity: z.number(),
  unit_price: z.number(),
  total: z.number(),
});

const saleTaxSchema = z.object({
  vat_rate: z.number(),
  base_amount: z.number(),
  vat_amount: z.number(),
});

const productionSaleSchema = z.object({
  sale: z.object({
    external_reference: z.string(),
    gross_amount: z.number(),
  }).passthrough(),
  external_reference: z.string().optional(),
  invoice_total: z.number().optional(),
  items: z.array(saleItemSchema).default([]),
  taxes: z.array(saleTaxSchema).default([]),
  payments: z.array(paymentSchema).default([]),
  sale_tenders: z.array(paymentSchema).default([]),
  payment_attempts: z.array(paymentSchema).default([]),
  electronic_payments: z.array(paymentSchema).default([]),
  payment_summary: z.object({
    status: z.string(),
    sale_total: z.number(),
    payment_total: z.number(),
    difference: z.number(),
    payments_count: z.number(),
    applied_payments_count: z.number(),
    payment_attempts_count: z.number(),
  }),
}).passthrough();
export const paymentCatalogsSchema = z.object({
  providers: z.array(z.string()),
  branches: z.array(optionSchema),
  terminals: z.array(optionSchema.extend({ branch_id: z.string() })),
  cashiers: z.array(optionSchema),
  statuses: z.array(z.string()),
  payment_methods: z.array(z.string()),
  card_brands: z.array(z.string()),
});

export const paymentDetailSchema = z.object({
  payment: paymentSchema,
  sale: z.object({
    external_reference: z.string(),
    availability_status: z.string(),
    invoice_total: z.number(),
    gross_amount: z.number().optional(),
    items: z.array(z.object({
      code: z.string(),
      description: z.string(),
      quantity: z.number(),
      unit_price: z.number(),
      total: z.number(),
    })).default([]),
    taxes: z.array(z.object({
      vat_rate: z.number(),
      base_amount: z.number(),
      vat_amount: z.number(),
    })).default([]),
    payments: z.array(paymentSchema).default([]),
    sale_tenders: z.array(paymentSchema).default([]),
    payment_attempts: z.array(paymentSchema).default([]),
    electronic_payments: z.array(paymentSchema).default([]),
    applied_payments_count: z.number().optional(),
  }).nullable().optional().default(null),
  payment_summary: z.object({
    status: z.string(),
    sale_total: z.number(),
    payment_total: z.number(),
    difference: z.number(),
    payments_count: z.number(),
    applied_payments_count: z.number(),
    payment_attempts_count: z.number(),
  }).optional(),
  reconciliation: z.object({
    status: z.string(),
    difference: z.number(),
  }).optional(),
  raw: z.record(z.string(), z.unknown()).optional().default({}),
}).transform((detail) => {
  const saleTotal = detail.sale?.invoice_total ?? 0;
  const paymentTotal = detail.sale
    ? detail.sale.payments.reduce((total, payment) => total + payment.amount, 0)
    : detail.payment.amount;
  const fallbackStatus = detail.sale
    ? Math.abs(saleTotal - paymentTotal) < 0.01
      ? 'reconciled'
      : 'amount_mismatch'
    : detail.payment.status === 'rejected'
      ? 'rejected'
      : detail.payment.status === 'refunded'
        ? 'refunded'
        : 'pending_review';
  const difference = detail.sale ? saleTotal - paymentTotal : 0;

  return {
    ...detail,
    payment_summary: detail.payment_summary ?? {
      status: fallbackStatus,
      sale_total: saleTotal,
      payment_total: paymentTotal,
      difference,
      payments_count: detail.sale?.payments.length ?? 1,
      applied_payments_count: detail.sale?.payments.length ?? 1,
      payment_attempts_count: detail.sale?.payment_attempts.length ?? 0,
    },
    reconciliation: detail.reconciliation ?? {
      status: fallbackStatus,
      difference,
    },
  };
});

export type Payment = z.infer<typeof paymentSchema>;
export type PaymentDetail = z.infer<typeof paymentDetailSchema>;
export type PaymentFilters = {
  provider?: string;
  status?: string;
  branch_id?: string;
  terminal_id?: string;
  payment_method?: string;
  card_brand?: string;
  cashier_id?: string;
  external_reference?: string;
  min_amount?: string;
  max_amount?: string;
  from: string;
  to: string;
  limit: number;
  offset: number;
};

export const normalizePaymentAmountFilter = normalizeAmountFilter;

export function identifySelectedPaymentRole(detail: PaymentDetail): PaymentDetail {
  if (!detail.sale) return detail;

  const selectedIds = new Set(
    [detail.payment.id, detail.payment.external_id].filter(Boolean).map(String),
  );
  const matchesSelected = (payment: Payment) =>
    [payment.id, payment.external_id].filter(Boolean).some((value) =>
      selectedIds.has(String(value)),
    );
  const isRejectedAttempt = detail.sale.payment_attempts.some(matchesSelected);
  const isAppliedPayment = detail.sale.payments.some(matchesSelected);

  if (!isRejectedAttempt && !isAppliedPayment) return detail;

  return {
    ...detail,
    payment: {
      ...detail.payment,
      current_payment_applied: !isRejectedAttempt,
      attempt_role: isRejectedAttempt ? 'not_applied' : detail.payment.attempt_role,
    },
    payment_summary: isRejectedAttempt
      ? { ...detail.payment_summary, status: 'pending_review' }
      : detail.payment_summary,
    reconciliation: isRejectedAttempt
      ? { ...detail.reconciliation, status: 'pending_review' }
      : detail.reconciliation,
  };
}

function query(filters: PaymentFilters, includePagination = true) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if ((!includePagination && (key === 'limit' || key === 'offset')) || value === '' || value === undefined) return;
    if (key === 'min_amount' || key === 'max_amount') {
      setNormalizedAmountParam(params, key, value);
      return;
    }
    params.set(key, String(value));
  });
  return params.toString();
}

export async function getPayments(filters: PaymentFilters) {
  const result = await apiRequestWithMeta(`/payments?${query(filters)}`, z.array(paymentSchema));
  return {
    items: result.data,
    total: Number(result.meta.total || 0),
    hasMore: Boolean(result.meta.has_more),
    totalExact:
      result.meta.total_exact === true ||
      (result.meta.total_exact === undefined && !result.meta.has_more),
  };
}

export async function getAllPayments(filters: PaymentFilters) {
  const rows: Payment[] = [];
  let offset = 0;
  const limit = 100;
  while (true) {
    const page = await getPayments({ ...filters, limit, offset });
    rows.push(...page.items);
    if (!page.hasMore || rows.length >= page.total) return rows;
    offset += limit;
  }
}

export function getPaymentsSummary(filters: PaymentFilters) {
  return apiRequest(`/payments/summary?${query(filters, false)}`, paymentsSummarySchema);
}

export function getPaymentCatalogs() {
  return apiRequest('/payments/catalogs', paymentCatalogsSchema).catch(async () => {
    const providerSchema = z.array(z.object({ id: z.string(), name: z.string() }));
    const branchSchema = z.array(z.object({ id: z.string(), name: z.string() }));
    const terminalSchema = z.array(z.object({
      id: z.string(),
      name: z.string(),
      branch_id: z.string().nullish(),
    }));
    const statusesSchema = z.object({
      payments: z.array(z.object({ id: z.string(), label: z.string() })),
    });
    const methodsSchema = z.object({
      payment_methods: z.array(z.object({ id: z.string(), label: z.string() })),
      card_brands: z.array(z.object({ id: z.string(), label: z.string() })),
    });
    const [providers, branches, terminals, statuses, methods] = await Promise.all([
      apiRequest('/providers', providerSchema),
      apiRequest('/branches', branchSchema),
      apiRequest('/terminals', terminalSchema),
      apiRequest('/catalog/statuses?domain=payments', statusesSchema),
      apiRequest('/catalog/payment-methods', methodsSchema),
    ]);

    return paymentCatalogsSchema.parse({
      providers: providers.map((provider) => provider.id),
      branches,
      terminals: terminals.map((terminal) => ({
        ...terminal,
        branch_id: terminal.branch_id || '',
      })),
      cashiers: [],
      statuses: statuses.payments.map((status) => status.id).filter((id) => id !== 'all'),
      payment_methods: methods.payment_methods.map((method) => method.id),
      card_brands: methods.card_brands.map((brand) => brand.id),
    });
  });
}

export async function getPaymentDetail(provider: string, id: string) {
  const detail = await apiRequest(
    `/payments/${encodeURIComponent(provider)}/${encodeURIComponent(id)}`,
    paymentDetailSchema,
    { timeoutMs: 15000 },
  );

  if (detail.sale || !detail.payment.external_reference) {
    return identifySelectedPaymentRole(detail);
  }

  try {
    const saleData = await apiRequest(
      `/sales/${encodeURIComponent(detail.payment.external_reference)}`,
      productionSaleSchema,
      { timeoutMs: 15000 },
    );
    const sale = {
      external_reference:
        saleData.external_reference || saleData.sale.external_reference,
      availability_status: 'available',
      invoice_total: saleData.invoice_total ?? saleData.sale.gross_amount,
      gross_amount: saleData.sale.gross_amount,
      items: saleData.items,
      taxes: saleData.taxes,
      payments: saleData.payments,
      sale_tenders: saleData.sale_tenders,
      payment_attempts: saleData.payment_attempts,
      electronic_payments: saleData.electronic_payments,
      applied_payments_count: saleData.payment_summary.applied_payments_count,
    };

    return identifySelectedPaymentRole(paymentDetailSchema.parse({
      ...detail,
      sale,
      payment_summary: saleData.payment_summary,
      reconciliation: {
        status: saleData.payment_summary.status,
        difference: saleData.payment_summary.difference,
      },
    }));
  } catch (error) {
    if (
      error instanceof ApiError &&
      ['SALE_NOT_FOUND', 'SALE_PENDING_CASH_REGISTER_CLOSE'].includes(error.code)
    ) {
      const status = detail.payment.status === 'rejected'
        ? 'rejected'
        : error.code === 'SALE_NOT_FOUND'
          ? 'sale_not_found'
          : 'pending_review';
      return paymentDetailSchema.parse({
        ...detail,
        payment_summary: {
          ...detail.payment_summary,
          status,
        },
        reconciliation: { status, difference: 0 },
      });
    }
    throw error;
  }
}
