import { z } from 'zod';

import { apiRequest } from '@/api/client';

const money = z.string().regex(/^\d+\.\d{2}$/);
const termSchema = z.object({
  id: z.string(),
  label: z.string(),
  status: z.enum(['missing', 'incomplete', 'complete']),
  percentage: z.string().nullable(),
  unit: z.enum(['instant', 'hours', 'days', 'unknown']).nullable(),
  value: z.number().nullable(),
  calendar: z.enum(['calendar', 'business']).nullable(),
  effective_from: z.string().nullable(),
});

export const commissionsOverviewSchema = z.object({
  range: z.object({ from: z.string(), to: z.string() }),
  queried_at: z.string(),
  status: z.enum(['complete', 'incomplete']),
  summary: z.object({
    observed: z.number(),
    calculated: z.number(),
    pending: z.number(),
    excluded: z.number(),
    without_due_date: z.number(),
    gross_amount: money.nullable(),
    fee_amount: money.nullable(),
    net_amount: money.nullable(),
  }),
  terms: z.object({
    effective_on: z.string(),
    revision: z.number(),
    items: z.array(termSchema),
  }),
});

export type CommissionsOverview = z.infer<typeof commissionsOverviewSchema>;
export type CommissionTerm = z.infer<typeof termSchema>;

export function getCommissionsOverview(from: string, to: string) {
  const query = new URLSearchParams({ from, to });
  return apiRequest(`/finance/overview?${query}`, commissionsOverviewSchema);
}

export function completeNet(overview: CommissionsOverview | undefined): string | null {
  return overview?.status === 'complete' ? overview.summary.net_amount : null;
}
