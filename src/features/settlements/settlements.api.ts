import { z } from 'zod';

import { apiRequest, apiRequestWithMeta } from '@/api/client';
import { setNormalizedAmountParam } from '@/utils/amount-filter';

export const settlementSchema = z.object({
  id: z.string(),
  provider: z.string(),
  settlement_id: z.string(),
  settlement_date: z.string().nullable(),
  settlement_date_basis: z.string(),
  transaction_date: z.string(),
  transaction_type: z.string(),
  external_reference: z.string(),
  payment_id: z.string(),
  gross_amount: z.number(),
  fee_amount: z.number(),
  tax_amount: z.number(),
  refund_amount: z.number(),
  net_amount: z.number(),
  currency: z.string(),
  status: z.string(),
  status_label: z.string(),
  branch_id: z.string().nullable(),
  branch_name: z.string().nullable(),
  terminal_id: z.string().nullable(),
  terminal_name: z.string().nullable(),
  data_source: z.string(),
  estimated: z.boolean(),
});

export const settlementsSummarySchema = z.object({
  settlements_count: z.number(),
  gross_amount: z.number(),
  fee_amount: z.number(),
  tax_amount: z.number(),
  refund_amount: z.number(),
  net_amount: z.number(),
  settled_count: z.number(),
  pending_count: z.number(),
  rejected_count: z.number(),
  cancelled_count: z.number(),
  estimated_count: z.number(),
  currency: z.string().optional().default('ARS'),
  data_source: z.string(),
  estimated: z.boolean(),
  source_note: z.string(),
});

export type Settlement = z.infer<typeof settlementSchema>;
export type SettlementFilters = {
  from: string;
  to: string;
  provider?: string;
  status?: string;
  external_reference?: string;
  min_amount?: string;
  max_amount?: string;
  limit: number;
  offset: number;
};

function query(filters: SettlementFilters, includePagination = true) {
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

export async function getSettlements(filters: SettlementFilters) {
  const result = await apiRequestWithMeta(
    `/settlements?${query(filters)}`,
    z.array(settlementSchema),
  );
  return {
    items: result.data,
    total: Number(result.meta.total || 0),
    hasMore: Boolean(result.meta.has_more),
    totalExact:
      result.meta.total_exact === true ||
      (!result.meta.has_more && Number(result.meta.total || 0) < 2000),
    estimated: Boolean(result.meta.estimated),
  };
}

export async function getAllSettlements(filters: SettlementFilters) {
  const rows: Settlement[] = [];
  let offset = 0;
  const limit = 100;
  while (true) {
    const page = await getSettlements({ ...filters, limit, offset });
    rows.push(...page.items);
    if (!page.hasMore || rows.length >= page.total) return rows;
    offset += limit;
  }
}

export function getSettlementsSummary(filters: SettlementFilters) {
  return apiRequest(
    `/settlements/summary?${query(filters, false)}`,
    settlementsSummarySchema,
  );
}
