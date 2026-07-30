import { z } from 'zod';

import { apiRequest, apiRequestWithMeta } from '@/api/client';
import { paymentDetailSchema, paymentSchema } from '@/features/payments/payments.api';

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

const findingSchema = paymentSchema.extend({
  payment_id: z.string(),
  missing_fields: z.array(z.string()).optional(),
  reason: z.string().optional(),
  reason_label: z.string().optional(),
  reference_amount: z.number().optional(),
});

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
};

function params(filters: QualityFilters) {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });
  query.set('limit', '100');
  return query.toString();
}

export async function getDataQuality(filters: QualityFilters) {
  const query = params(filters);
  const flatRows = async (path: string) =>
    (await apiRequestWithMeta(path, z.array(findingSchema))).data;
  const [summary, duplicateGroups, missing, orphans, outliers] = await Promise.all([
    apiRequest(`/data-quality/payments?${query}`, qualitySummarySchema),
    apiRequest(`/data-quality/duplicates?${query}`, z.array(duplicateGroupSchema)),
    flatRows(`/data-quality/missing-references?${query}`),
    flatRows(`/data-quality/orphan-payments?${query}`),
    flatRows(`/data-quality/amount-outliers?${query}`),
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
