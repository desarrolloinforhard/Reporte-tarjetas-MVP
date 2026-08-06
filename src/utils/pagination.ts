export type PaginationInfo = {
  hasMore: boolean;
  itemCount: number;
  offset: number;
  pageSize: number;
  total: number;
  totalExact: boolean;
};

export function paginationLabel(info: PaginationInfo) {
  if (!info.itemCount) return 'Sin resultados en esta página';

  const start = info.offset + 1;
  const end = info.offset + info.itemCount;
  if (info.totalExact) return `${start}–${end} de ${Math.max(info.total, end)}`;
  return `${start}–${end}${info.hasMore ? ' · hay más' : ''}`;
}

export function paginationBadge(info: PaginationInfo) {
  if (info.totalExact) return `${info.total} resultados`;
  return `Página ${Math.floor(info.offset / info.pageSize) + 1}`;
}

export function paginationPageLabel(info: Pick<PaginationInfo, 'offset' | 'pageSize'>) {
  return `Página ${Math.floor(info.offset / info.pageSize) + 1}`;
}
