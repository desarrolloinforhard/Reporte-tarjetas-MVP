import { formatAmountFilterInput, normalizeAmountFilter } from '@/utils/amount-filter';

describe('filtros de importe', () => {
  it('muestra separadores argentinos mientras se escribe', () => {
    expect(formatAmountFilterInput('180000')).toBe('180.000');
    expect(formatAmountFilterInput('124500,50')).toBe('124.500,50');
    expect(formatAmountFilterInput('1.234.567,8')).toBe('1.234.567,8');
  });

  it('envía el importe normalizado al backend', () => {
    expect(normalizeAmountFilter('180.000')).toBe('180000');
    expect(normalizeAmountFilter('124.500,50')).toBe('124500.5');
  });
});
