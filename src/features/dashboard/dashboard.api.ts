import { z } from 'zod';

import { apiRequest } from '@/api/client';

const providerSummarySchema = z
  .object({
    provider: z.string(),
    total_amount: z.number(),
    net_amount: z.number(),
    refund_amount: z.number(),
    payments_count: z.number(),
    approved_count: z.number(),
    rejected_count: z.number(),
    pending_count: z.number(),
    refunds_count: z.number(),
    totals_exact: z.boolean(),
  })
  .passthrough();

const reportSummarySchema = z
  .object({
    total_amount: z.number(),
    net_amount: z.number(),
    refund_amount: z.number(),
    payments_count: z.number(),
    approved_count: z.number(),
    rejected_count: z.number(),
    pending_count: z.number(),
    refunds_count: z.number(),
    by_provider: z.array(providerSummarySchema),
    summary_mode: z.string(),
    totals_exact: z.boolean(),
    source_note: z.string(),
  })
  .passthrough();

const dailyPaymentSchema = z
  .object({
    date: z.string(),
    provider: z.string(),
    payments_count: z.number(),
    total_amount: z.number(),
    net_amount: z.number(),
    refund_amount: z.number(),
  })
  .passthrough();

const syncStatusSchema = z
  .object({
    overall_status: z.string(),
    providers: z.array(
      z
        .object({
          provider: z.string(),
          status: z.string(),
          imported_today: z.number(),
        })
        .passthrough(),
    ),
  })
  .passthrough();

const reconciliationSummarySchema = z
  .object({
    total_payments: z.number(),
    matched_count: z.number(),
    sale_not_found_count: z.number(),
    amount_mismatch_count: z.number(),
    pending_review_count: z.number(),
    problem_count: z.number().optional(),
    total_difference: z.number(),
  })
  .passthrough();

export type ReportSummary = z.infer<typeof reportSummarySchema>;
export type DailyPayment = z.infer<typeof dailyPaymentSchema>;
export type SyncStatus = z.infer<typeof syncStatusSchema>;

export type DashboardData = {
  summary: ReportSummary;
  reconciliation: z.infer<typeof reconciliationSummarySchema>;
  daily: DailyPayment[];
  sync: SyncStatus;
};

function queryString(from: string, to: string) {
  return new URLSearchParams({
    from,
    to,
    provider: 'all',
    status: 'all',
  }).toString();
}

export async function getDashboardData(from: string, to: string): Promise<DashboardData> {
  const query = queryString(from, to);
  const [summary, reconciliation, daily, sync] = await Promise.all([
    apiRequest(`/reports/summary?${query}`, reportSummarySchema),
    apiRequest(`/reconciliation/summary?${query}`, reconciliationSummarySchema),
    apiRequest(`/metrics/daily-payments?${query}`, z.array(dailyPaymentSchema)),
    apiRequest('/sync/status', syncStatusSchema),
  ]);

  return { summary, reconciliation, daily, sync };
}
