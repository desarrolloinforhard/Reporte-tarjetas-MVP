import { paginationBadge, paginationLabel } from '@/utils/pagination';

describe('pagination labels', () => {
  test('does not present an approximate backend total as exact', () => {
    const info = {
      hasMore: true,
      itemCount: 20,
      offset: 40,
      pageSize: 20,
      total: 61,
      totalExact: false,
    };

    expect(paginationBadge(info)).toBe('Página 3');
    expect(paginationLabel(info)).toBe('41–60 · hay más');
  });

  test('uses the received row count and exact total on the final page', () => {
    expect(
      paginationLabel({
        hasMore: false,
        itemCount: 11,
        offset: 60,
        pageSize: 20,
        total: 71,
        totalExact: true,
      }),
    ).toBe('61–71 de 71');
  });

  test('never creates an inverted range for an empty page', () => {
    expect(
      paginationLabel({
        hasMore: false,
        itemCount: 0,
        offset: 660,
        pageSize: 20,
        total: 261,
        totalExact: true,
      }),
    ).toBe('Sin resultados en esta página');
  });
});
