import { z } from 'zod';

import { apiRequest, apiRequestWithMeta } from '@/api/client';
import { paymentDetailSchema } from '@/features/payments/payments.api';
import { setNormalizedAmountParam } from '@/utils/amount-filter';

export const reconciliationStatusSchema = z.enum([
  'matched',
  'sale_not_found',
  'amount_mismatch',
  'pending_review',
]);

export const reconciliationRowSchema = z.object({
  payment_id: z.string(),
  provider: z.string(),
  external_reference: z.string(),
  created_at: z.string(),
  payment_amount: z.number(),
  sale_amount: z.number(),
  difference: z.number(),
  status: reconciliationStatusSchema,
  status_label: z.string().optional(),
  issue_message: z.string(),
  payments_count: z.number(),
  branch_id: z.string().optional(),
  branch_name: z.string().optional(),
  terminal_name: z.string().optional(),
});

export const reconciliationSummarySchema = z.object({
  total_payments: z.number(),
  matched_count: z.number(),
  sale_not_found_count: z.number(),
  amount_mismatch_count: z.number(),
  pending_review_count: z.number(),
  total_payment_amount: z.number(),
  total_sale_amount: z.number(),
  total_difference: z.number(),
  amount_mismatch_amount: z.number().default(0),
  sale_not_found_amount: z.number().default(0),
  pending_review_amount: z.number().default(0),
  real_difference_amount: z.number().default(0),
  total_exact: z.boolean(),
  reconciliation_mode: z.string(),
});

export type ReconciliationRow = z.infer<typeof reconciliationRowSchema>;
export type ReconciliationStatus = z.infer<typeof reconciliationStatusSchema>;
export type ReconciliationFilters = {
  from: string;
  to: string;
  provider?: string;
  reconciliation_status?: string;
  external_reference?: string;
  min_amount?: string;
  max_amount?: string;
  limit: number;
  offset: number;
};

function query(filters: ReconciliationFilters, includePagination = true) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if ((!includePagination && ['limit', 'offset'].includes(key)) || value === '' || value === undefined) return;
    if (key === 'min_amount' || key === 'max_amount') {
      setNormalizedAmountParam(params, key, value);
      return;
    }
    params.set(key, String(value));
  });
  return params.toString();
}

export async function getReconciliationRows(filters: ReconciliationFilters) {
  const result = await apiRequestWithMeta(
    `/reconciliation/payments?${query(filters)}`,
    z.array(reconciliationRowSchema),
  );
  return {
    items: result.data,
    total: Number(result.meta.total || 0),
    hasMore: Boolean(result.meta.has_more),
  };
}

export function getReconciliationSummary(filters: ReconciliationFilters) {
  return apiRequest(
    `/reconciliation/summary?${query(filters, false)}`,
    reconciliationSummarySchema,
  );
}

export function getReconciliationDetail(provider: string, paymentId: string) {
  return apiRequest(
    `/reconciliation/payment/${encodeURIComponent(provider)}/${encodeURIComponent(paymentId)}`,
    paymentDetailSchema,
  );
}
