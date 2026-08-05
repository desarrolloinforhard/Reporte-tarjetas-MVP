import { z } from 'zod';

import { apiRequest, apiRequestWithMeta } from '@/api/client';
import {
  paymentBaseSchema,
  paymentDetailSchema,
  paymentSchema,
} from '@/features/payments/payments.api';
import { setNormalizedAmountParam } from '@/utils/amount-filter';

export const qualitySummarySchema = z.object({
  checked_count: z.number(),
  valid_count: z.number(),
  warning_count: z.number(),
  error_count: z.number(),
  issues_by_type: z.array(z.object({ type: z.string(), count: z.number() })),
  analysis_mode: z.string().optional(),
  total_exact: z.boolean().optional(),
});

const duplicateGroupSchema = z.object({
  duplicate_key: z.string(),
  strategy: z.string(),
  count: z.number(),
  payments: z.array(paymentSchema),
});

const findingSchema = paymentBaseSchema.extend({
  payment_id: z.string(),
  missing_fields: z.array(z.string()).optional(),
  reason: z.string().optional(),
  reason_label: z.string().optional(),
  reference_amount: z.number().optional(),
}).transform((finding) => ({
  ...finding,
  created_date: finding.created_date || finding.created_at.slice(0, 10),
  card_type: finding.card_type || '',
  card_last_four: finding.card_last_four ?? null,
}));

export type QualityCategory = 'duplicates' | 'missing' | 'orphans' | 'outliers';
export type QualityFinding = z.infer<typeof findingSchema> & {
  category: QualityCategory;
  issue: string;
};
export type QualityFilters = {
  from: string;
  to: string;
  provider?: string;
  external_reference?: string;
  min_amount?: string;
  max_amount?: string;
};

function params(filters: QualityFilters, offset = 0) {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (key === 'min_amount' || key === 'max_amount') {
      setNormalizedAmountParam(query, key, value);
    } else if (value) {
      query.set(key, value);
    }
  });
  query.set('limit', '100');
  query.set('offset', String(offset));
  return query.toString();
}

export async function getDataQuality(filters: QualityFilters) {
  const allPages = async <T>(path: string, schema: z.ZodType<T>) => {
    const items: T[] = [];
    let offset = 0;
    while (offset < 10_000) {
      const page = await apiRequestWithMeta(
        `${path}?${params(filters, offset)}`,
        z.array(schema),
      );
      items.push(...page.data);
      if (!page.meta.has_more || page.data.length === 0) return items;
      offset = Number(page.meta.next_offset ?? offset + page.data.length);
    }
    return items;
  };
  const query = params(filters);
  const [summary, duplicateGroups, missing, orphans, outliers] = await Promise.all([
    apiRequest(`/data-quality/payments?${query}`, qualitySummarySchema),
    allPages('/data-quality/duplicates', duplicateGroupSchema),
    allPages('/data-quality/missing-references', findingSchema),
    allPages('/data-quality/orphan-payments', findingSchema),
    allPages('/data-quality/amount-outliers', findingSchema),
  ]);
  const duplicates: QualityFinding[] = duplicateGroups.flatMap((group) =>
    group.payments.map((payment) => ({
      ...payment,
      payment_id: payment.id,
      category: 'duplicates',
      issue: `Posible duplicado · grupo de ${group.count}`,
    })),
  );
  return {
    summary,
    duplicates,
    missing: missing.map((item) => ({ ...item, category: 'missing' as const, issue: `Faltan: ${(item.missing_fields || []).join(', ')}` })),
    orphans: orphans.map((item) => ({ ...item, category: 'orphans' as const, issue: item.reason_label || 'Venta no encontrada' })),
    outliers: outliers.map((item) => ({ ...item, category: 'outliers' as const, issue: item.reason_label || 'Importe atípico' })),
  };
}

export function getQualityPaymentDetail(provider: string, paymentId: string) {
  return apiRequest(`/payments/${encodeURIComponent(provider)}/${encodeURIComponent(paymentId)}`, paymentDetailSchema);
}
