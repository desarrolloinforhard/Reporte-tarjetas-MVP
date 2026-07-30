import { formatDate, formatDateTime } from '@/utils/date-format';

describe('formato de fechas visible', () => {
  it('presenta las fechas ISO como dd/mm/aaaa', () => {
    expect(formatDate('2026-07-29')).toBe('29/07/2026');
    expect(formatDate('2026-07-29T15:30:00.000Z')).toBe('29/07/2026');
  });

  it('mantiene dd/mm/aaaa en fechas con hora', () => {
    expect(formatDateTime('2026-07-29T15:30:00.000Z')).toMatch(
      /^29\/07\/2026,?\s/,
    );
  });
});
