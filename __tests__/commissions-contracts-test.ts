import { completeNet, commissionsOverviewSchema } from '@/features/commissions/commissions.api';

const data = {
  range: { from: '2026-11-01', to: '2026-11-01' },
  queried_at: '2026-11-01T15:00:00Z',
  status: 'incomplete' as const,
  summary: { observed: 2, calculated: 1, pending: 1, excluded: 0, without_due_date: 0,
    gross_amount: null, fee_amount: null, net_amount: null },
  terms: { effective_on: '2026-11-01', revision: 0,
    items: [{ id: 'clover_debit', label: 'Clover · Débito', status: 'missing' as const,
      percentage: null, unit: null, value: null, calendar: null, effective_from: null }] },
};

test('el neto parcial nunca se presenta como definitivo', () => {
  const parsed = commissionsOverviewSchema.parse(data);
  expect(completeNet(parsed)).toBeNull();
  expect(completeNet({ ...parsed, status: 'complete', summary: { ...parsed.summary, net_amount: '99.00' } })).toBe('99.00');
});
