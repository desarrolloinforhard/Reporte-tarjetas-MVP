const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})/;

export function formatDate(value: string | null | undefined) {
  if (!value) return '—';
  const match = value.match(ISO_DATE_PATTERN);
  if (match) return `${match[3]}/${match[2]}/${match[1]}`;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(parsed);
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(parsed);
}
