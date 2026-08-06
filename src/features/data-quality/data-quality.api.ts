import { z } from 'zod';

import { apiRequest, apiRequestWithMeta } from '@/api/client';
import { paymentDetailSchema } from '@/features/payments/payments.api';
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

const qualityPaymentSourceSchema = z
  .object({
    id: z.string().optional(),
    payment_id: z.string().optional(),
    provider: z.string(),
    external_id: z.string().nullish(),
    external_reference: z.string().nullish(),
    created_at: z.string(),
    amount: z.number(),
    status: z.string().default('unknown'),
    status_label: z.string().default(''),
    currency: z.string().default('ARS'),
    missing_fields: z.array(z.string()).optional(),
    reason: z.string().optional(),
    reason_label: z.string().optional(),
    reference_amount: z.number().optional(),
  })
  .transform((payment) => ({
    ...payment,
    id: payment.id ?? payment.payment_id ?? '',
    payment_id: payment.payment_id ?? payment.id ?? '',
    external_id: payment.external_id ?? undefined,
    external_reference: payment.external_reference ?? '',
    created_date: payment.created_at.slice(0, 10),
  }));

export const duplicateGroupSchema = z.object({
  duplicate_key: z.string(),
  strategy: z.string(),
  count: z.number(),
  payments: z.array(qualityPaymentSourceSchema),
});

export const findingSchema = qualityPaymentSourceSchema;

export type QualityCategory = 'duplicates' | 'missing' | 'orphans' | 'outliers';
export type QualityUnavailableCategory = 'summary' | QualityCategory;
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

export function nextQualityPageOffset(
  meta: Record<string, unknown>,
  offset: number,
  receivedCount: number,
) {
  if (receivedCount === 0) return null;
  const nextOffset = Number(meta.next_offset ?? offset + receivedCount);
  if (!Number.isFinite(nextOffset) || nextOffset <= offset) return null;
  if (typeof meta.has_more === 'boolean') return meta.has_more ? nextOffset : null;
  const total = Number(meta.total);
  return Number.isFinite(total) && nextOffset < total ? nextOffset : null;
}

export async function getDataQuality(filters: QualityFilters) {
  const allPages = async <T>(path: string, schema: z.ZodType<T>) => {
    const items: T[] = [];
    let offset = 0;
    while (offset < 10_000) {
      const page = await apiRequestWithMeta(
        `${path}?${params(filters, offset)}`,
        z.array(schema),
        { timeoutMs: path.includes('orphan-payments') ? 12_000 : 30_000 },
      );
      items.push(...page.data);
      const nextOffset = nextQualityPageOffset(page.meta, offset, page.data.length);
      if (nextOffset === null) return items;
      offset = nextOffset;
    }
    return items;
  };
  const query = params(filters);
  const [summaryResult, duplicateGroupsResult, missingResult, orphansResult, outliersResult] =
    await Promise.allSettled([
    apiRequest(`/data-quality/payments?${query}`, qualitySummarySchema, { timeoutMs: 30_000 }),
    allPages('/data-quality/duplicates', duplicateGroupSchema),
    allPages('/data-quality/missing-references', findingSchema),
    allPages('/data-quality/orphan-payments', findingSchema),
    allPages('/data-quality/amount-outliers', findingSchema),
  ]);
  if (summaryResult.status === 'rejected') throw summaryResult.reason;
  const unavailableCategories: QualityUnavailableCategory[] = [];
  const available = <T>(
    result: PromiseSettledResult<T[]>,
    category: QualityCategory,
  ): T[] => {
    if (result.status === 'fulfilled') return result.value;
    unavailableCategories.push(category);
    return [];
  };
  const duplicateGroups = available(duplicateGroupsResult, 'duplicates');
  const missing = available(missingResult, 'missing');
  const orphans = available(orphansResult, 'orphans');
  const outliers = available(outliersResult, 'outliers');
  const duplicates: QualityFinding[] = duplicateGroups.flatMap((group) =>
    group.payments.map((payment) => ({
      ...payment,
      category: 'duplicates',
      issue: `Posible duplicado · grupo de ${group.count}`,
    })),
  );
  return {
    summary: summaryResult.value,
    unavailableCategories,
    duplicates,
    missing: missing.map((item) => ({ ...item, category: 'missing' as const, issue: `Faltan: ${(item.missing_fields || []).join(', ')}` })),
    orphans: orphans.map((item) => ({ ...item, category: 'orphans' as const, issue: item.reason_label || 'Venta no encontrada' })),
    outliers: outliers.map((item) => ({ ...item, category: 'outliers' as const, issue: item.reason_label || 'Importe atípico' })),
  };
}

export function getQualityPaymentDetail(provider: string, paymentId: string) {
  return apiRequest(`/payments/${encodeURIComponent(provider)}/${encodeURIComponent(paymentId)}`, paymentDetailSchema);
}
