import { z } from 'zod';

import { apiRequest, apiRequestWithMeta } from '@/api/client';
import { normalizeAmountFilter, setNormalizedAmountParam } from '@/utils/amount-filter';

export const paymentSchema = z.object({
  id: z.string(),
  provider: z.string(),
  status: z.string(),
  status_label: z.string(),
  amount: z.number(),
  currency: z.string(),
  fee_amount: z.number(),
  net_amount: z.number(),
  refund_amount: z.number(),
  created_date: z.string(),
  created_at: z.string(),
  branch_id: z.string(),
  branch_name: z.string(),
  terminal_id: z.string(),
  terminal_name: z.string(),
  cashier_id: z.string(),
  cashier_name: z.string(),
  payment_method: z.string(),
  card_brand: z.string(),
  card_type: z.string(),
  card_last_four: z.string().nullable(),
  external_reference: z.string(),
  authorization_code: z.string(),
  external_id: z.string().optional(),
  installments: z.number().optional(),
  current_payment_applied: z.boolean().optional(),
  attempt_role: z.string().optional(),
  reference_reused: z.boolean().optional(),
});

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
    payment_attempts: z.array(paymentSchema).default([]),
    applied_payments_count: z.number().optional(),
  }).nullable(),
  payment_summary: z.object({
    status: z.string(),
    sale_total: z.number(),
    payment_total: z.number(),
    difference: z.number(),
    payments_count: z.number(),
    applied_payments_count: z.number(),
    payment_attempts_count: z.number(),
  }),
  reconciliation: z.object({
    status: z.string(),
    difference: z.number(),
  }),
  raw: z.record(z.string(), z.unknown()),
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
  };
}

export function getPaymentsSummary(filters: PaymentFilters) {
  return apiRequest(`/payments/summary?${query(filters, false)}`, paymentsSummarySchema);
}

export function getPaymentCatalogs() {
  return apiRequest('/payments/catalogs', paymentCatalogsSchema);
}

export function getPaymentDetail(provider: string, id: string) {
  return apiRequest(
    `/payments/${encodeURIComponent(provider)}/${encodeURIComponent(id)}`,
    paymentDetailSchema,
  );
}
