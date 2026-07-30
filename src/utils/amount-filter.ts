export function normalizeAmountFilter(value: string) {
  const sanitized = value.trim().replace(/\s/g, '').replace(/[$A-Za-z]/g, '');
  if (!sanitized) return '';

  const normalized = sanitized.includes(',')
    ? sanitized.replace(/\./g, '').replace(',', '.')
    : /^\d{1,3}(?:\.\d{3})+$/.test(sanitized)
      ? sanitized.replace(/\./g, '')
      : sanitized;
  const amount = Number(normalized);

  return Number.isFinite(amount) && amount >= 0 ? String(amount) : '';
}

export function setNormalizedAmountParam(
  params: URLSearchParams,
  key: 'min_amount' | 'max_amount',
  value: unknown,
) {
  const amount = normalizeAmountFilter(String(value ?? ''));
  if (amount) params.set(key, amount);
}
