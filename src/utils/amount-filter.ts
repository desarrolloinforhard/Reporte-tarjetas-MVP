export function formatAmountFilterInput(value: string) {
  const sanitized = value.replace(/[^\d,.]/g, '');
  if (!sanitized) return '';

  const commaIndex = sanitized.indexOf(',');
  const integerSource = commaIndex >= 0 ? sanitized.slice(0, commaIndex) : sanitized;
  const decimalSource = commaIndex >= 0 ? sanitized.slice(commaIndex + 1) : '';
  const integerDigits = integerSource.replace(/\D/g, '').replace(/^0+(?=\d)/, '') || '0';
  const groupedInteger = integerDigits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  if (commaIndex < 0) return groupedInteger;
  return `${groupedInteger},${decimalSource.replace(/\D/g, '').slice(0, 2)}`;
}

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
