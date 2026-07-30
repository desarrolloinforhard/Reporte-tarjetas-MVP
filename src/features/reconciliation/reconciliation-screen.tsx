import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { ScreenFrame } from '@/components/layout/screen-frame';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DatePickerField } from '@/components/ui/date-picker-field';
import { FeedbackState } from '@/components/ui/feedback-state';
import { SelectField } from '@/components/ui/select-field';
import { TextField } from '@/components/ui/text-field';
import { PaymentDetailModal } from '@/features/payments/payment-detail-modal';
import {
  getReconciliationDetail,
  getReconciliationRows,
  getReconciliationSummary,
  ReconciliationFilters,
  ReconciliationRow,
  ReconciliationStatus,
} from '@/features/reconciliation/reconciliation.api';
import { breakpoints, radii, spacing } from '@/theme/tokens';
import { useAppTheme } from '@/theme/theme-provider';
import { formatDate, formatDateTime } from '@/utils/date-format';

const PAGE_SIZE = 20;
const providers = { clover: 'Clover', mercadopago: 'Mercado Pago', payway: 'Payway' };
const providerOptions = [
  { value: '', label: 'Todos' },
  ...Object.entries(providers).map(([value, label]) => ({ value, label })),
];
const statusOptions = [
  { value: '', label: 'Todos' },
  { value: 'matched', label: 'Conciliados' },
  { value: 'sale_not_found', label: 'Venta no encontrada' },
  { value: 'amount_mismatch', label: 'Diferencia de importe' },
  { value: 'pending_review', label: 'Pendientes de revisión' },
];
const statusLabels: Record<ReconciliationStatus, string> = {
  matched: 'Conciliado',
  sale_not_found: 'Venta no encontrada',
  amount_mismatch: 'Diferencia de importe',
  pending_review: 'Pendiente de revisión',
};

function isoDaysAgo(days: number) {
  const value = new Date();
  value.setHours(12, 0, 0, 0);
  value.setDate(value.getDate() - days);
  return value.toISOString().slice(0, 10);
}

function money(value: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 2,
  }).format(value);
}

function validateRange(from: string, to: string) {
  if (from > to) return 'La fecha Desde no puede ser posterior a Hasta.';
  return null;
}

function tone(status: ReconciliationStatus): 'success' | 'danger' | 'warning' {
  if (status === 'matched') return 'success';
  if (status === 'sale_not_found') return 'danger';
  return 'warning';
}

export function ReconciliationScreen() {
  const { colors, isDark } = useAppTheme();
  const desktop = useWindowDimensions().width >= breakpoints.tablet;
  const params = useLocalSearchParams<{ from?: string; to?: string; status?: string }>();
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [selected, setSelected] = useState<ReconciliationRow | null>(null);
  const [filters, setFilters] = useState<ReconciliationFilters>({
    from: params.from || isoDaysAgo(30),
    to: params.to || isoDaysAgo(0),
    provider: '',
    reconciliation_status: params.status || '',
    external_reference: '',
    limit: PAGE_SIZE,
    offset: 0,
  });
  const rangeError = validateRange(filters.from, filters.to);
  const filterKey = useMemo(() => JSON.stringify(filters), [filters]);
  const listQuery = useQuery({
    queryKey: ['reconciliation', filterKey],
    queryFn: () => getReconciliationRows(filters),
    enabled: !rangeError,
  });
  const summaryQuery = useQuery({
    queryKey: ['reconciliation-summary', filters.from, filters.to, filters.provider],
    queryFn: () => getReconciliationSummary(filters),
    enabled: !rangeError,
  });
  const detailQuery = useQuery({
    queryKey: ['reconciliation-detail', selected?.provider, selected?.payment_id],
    queryFn: () => getReconciliationDetail(selected!.provider, selected!.payment_id),
    enabled: Boolean(selected),
  });
  const setFilter = (key: keyof ReconciliationFilters, value: string | number) =>
    setFilters((current) => ({ ...current, [key]: value, offset: key === 'offset' ? Number(value) : 0 }));

  const rowBackground = (status: ReconciliationStatus) => {
    if (status === 'matched') return isDark ? colors.successSoft : '#B9E4CB';
    if (status === 'sale_not_found') return isDark ? colors.dangerSoft : '#F4BBB6';
    return isDark ? colors.warningSoft : '#F5D184';
  };

  const metrics = summaryQuery.data
    ? [
        ['Pagos', summaryQuery.data.total_payments, ''],
        ['Conciliados', summaryQuery.data.matched_count, 'matched'],
        ['Venta no encontrada', summaryQuery.data.sale_not_found_count, 'sale_not_found'],
        ['Diferencias', summaryQuery.data.amount_mismatch_count, 'amount_mismatch'],
        ['Pendientes', summaryQuery.data.pending_review_count, 'pending_review'],
      ] as const
    : [];

  return (
    <ScreenFrame
      description="Comparación entre cobros y ventas."
      hideHeader
      title="Conciliación">
      <View style={styles.heading}>
        <View style={styles.headingCopy}>
          <Text style={[styles.title, { color: colors.text }]}>Conciliación</Text>
          <Text style={[styles.muted, { color: colors.textMuted }]}>
            Comparación entre cobros y ventas usando datos sintéticos.
          </Text>
        </View>
        <Badge label="Sin llamadas externas" tone="info" />
      </View>

      {!desktop ? (
        <View style={[styles.mobileFilterBar, { backgroundColor: colors.surface, borderColor: colors.accent }]}>
          <Text style={[styles.filterSummary, { color: colors.text }]}>
            {formatDate(filters.from)} — {formatDate(filters.to)}
          </Text>
          <Button onPress={() => setFiltersVisible((value) => !value)} variant="secondary">
            {filtersVisible ? 'Ocultar filtros' : 'Mostrar filtros'}
          </Button>
        </View>
      ) : null}

      {desktop || filtersVisible ? (
        <Card style={{ ...styles.sectionCard, borderColor: colors.accent }} title="Filtros">
          <View style={styles.filterGrid}>
            <View style={styles.filterItem}><DatePickerField label="Desde" value={filters.from} onChange={(value) => setFilter('from', value)} /></View>
            <View style={styles.filterItem}><DatePickerField label="Hasta" value={filters.to} onChange={(value) => setFilter('to', value)} /></View>
            <View style={styles.filterItem}><SelectField label="Proveedor" value={filters.provider ?? ''} options={providerOptions} onChange={(value) => setFilter('provider', value)} /></View>
            <View style={styles.filterItem}><SelectField label="Estado" value={filters.reconciliation_status ?? ''} options={statusOptions} onChange={(value) => setFilter('reconciliation_status', value)} /></View>
          </View>
          <Text style={[styles.hint, { color: rangeError ? colors.danger : colors.textMuted }]}>
            {rangeError || 'Seleccioná un rango y estado para acotar los resultados.'}
          </Text>
        </Card>
      ) : null}

      <Card style={{ ...styles.metricsCard, borderColor: colors.accent }}>
        <View style={styles.metrics}>
          {metrics.map(([label, value, status]) => (
            <Pressable
              key={label}
              onPress={() => setFilter('reconciliation_status', status)}
              style={[styles.metric, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>{label}</Text>
              <Text style={[styles.metricValue, { color: colors.text }]}>{value}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      {listQuery.isPending ? <FeedbackState title="Cargando conciliación" description="Comparando fixtures de pagos y ventas." /> : null}
      {listQuery.isError ? <FeedbackState title="No se pudo cargar la conciliación" description="Verificá que el backend aislado esté activo." actionLabel="Reintentar" onAction={() => listQuery.refetch()} /> : null}
      {listQuery.data && !listQuery.data.items.length ? <FeedbackState title="Sin resultados" description="No hay registros para los filtros seleccionados." /> : null}

      {listQuery.data?.items.length ? (
        <Card accessory={<Badge label={`${listQuery.data.total} resultados`} tone="info" />} style={{ ...styles.sectionCard, borderColor: colors.accent }} title="Resultados">
          <View style={styles.resultsSearch}>
            <TextField
              label="Buscar referencia"
              onChangeText={(value) => setFilter('external_reference', value)}
              placeholder="Número de referencia"
              value={filters.external_reference}
            />
          </View>
          {desktop ? (
            <ScrollView
              contentContainerStyle={styles.tableScrollContent}
              horizontal
              showsHorizontalScrollIndicator>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader, { backgroundColor: colors.surfaceMuted }]}>
                  {['FECHA', 'PROVEEDOR', 'REFERENCIA', 'PAGO', 'VENTA', 'DIFERENCIA', 'ESTADO'].map((label, index) => (
                    <Text key={label} style={[styles.cell, styles.headerText, index >= 3 && index <= 5 && styles.numberCell, { color: colors.text }]}>{label}</Text>
                  ))}
                </View>
                {listQuery.data.items.map((item) => (
                  <Pressable key={`${item.provider}-${item.payment_id}`} onPress={() => setSelected(item)} style={[styles.tableRow, { backgroundColor: rowBackground(item.status), borderColor: colors.border }]}>
                    <Text style={[styles.cell, { color: colors.text }]}>{formatDateTime(item.created_at)}</Text>
                    <Text style={[styles.cell, { color: colors.text }]}>{providers[item.provider as keyof typeof providers] || item.provider}</Text>
                    <Text style={[styles.cell, { color: colors.text }]}>{item.external_reference}</Text>
                    <Text style={[styles.cell, styles.numberCell, { color: colors.text }]}>{money(item.payment_amount)}</Text>
                    <Text style={[styles.cell, styles.numberCell, { color: colors.text }]}>{money(item.sale_amount)}</Text>
                    <Text style={[styles.cell, styles.numberCell, { color: colors.text }]}>{money(item.difference)}</Text>
                    <Text style={[styles.cell, styles.statusText, { color: colors.text }]}>{item.status_label || statusLabels[item.status]}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          ) : (
            <View style={styles.cards}>
              {listQuery.data.items.map((item) => (
                <Pressable key={`${item.provider}-${item.payment_id}`} onPress={() => setSelected(item)}>
                  <Card style={{ ...styles.resultCard, backgroundColor: rowBackground(item.status) }}>
                    <View style={styles.rowBetween}>
                      <Text style={[styles.resultAmount, { color: colors.text }]}>{money(item.payment_amount)}</Text>
                      <Badge label={item.status_label || statusLabels[item.status]} tone={tone(item.status)} />
                    </View>
                    <Text style={[styles.muted, { color: colors.textMuted }]}>{providers[item.provider as keyof typeof providers] || item.provider} · {item.external_reference}</Text>
                    <View style={styles.rowBetween}>
                      <Text style={[styles.muted, { color: colors.textMuted }]}>{formatDateTime(item.created_at)}</Text>
                      <Text style={[styles.muted, { color: colors.textMuted }]}>Diferencia {money(item.difference)}</Text>
                    </View>
                  </Card>
                </Pressable>
              ))}
            </View>
          )}
          <View style={styles.pagination}>
            <Button disabled={filters.offset === 0} variant="secondary" onPress={() => setFilter('offset', Math.max(0, filters.offset - PAGE_SIZE))}>Anterior</Button>
            <Text style={[styles.muted, { color: colors.textMuted }]}>{filters.offset + 1}–{Math.min(filters.offset + PAGE_SIZE, listQuery.data.total)} de {listQuery.data.total}</Text>
            <Button disabled={!listQuery.data.hasMore} variant="secondary" onPress={() => setFilter('offset', filters.offset + PAGE_SIZE)}>Siguiente</Button>
          </View>
        </Card>
      ) : null}

      <PaymentDetailModal
        key={selected?.payment_id ?? 'reconciliation-detail'}
        data={detailQuery.data}
        desktop={desktop}
        loading={detailQuery.isPending && Boolean(selected)}
        onClose={() => setSelected(null)}
        selected={detailQuery.data?.payment ?? null}
        visible={Boolean(selected)}
      />
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  heading: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  headingCopy: { flex: 1, minWidth: 220, gap: 3 },
  title: { fontSize: 20, fontWeight: '700' },
  muted: { fontSize: 12, lineHeight: 18 },
  mobileFilterBar: { borderWidth: 1, borderTopWidth: 4, borderRadius: radii.lg, padding: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  filterSummary: { flex: 1, fontSize: 12, fontWeight: '600' },
  sectionCard: { borderTopWidth: 4 },
  resultsSearch: { width: '100%' },
  filterGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  filterItem: { flexGrow: 1, flexShrink: 1, flexBasis: 210, minWidth: 180 },
  hint: { marginTop: spacing.sm, fontSize: 11 },
  metricsCard: { padding: 0, overflow: 'hidden', borderTopWidth: 4 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap' },
  metric: { flexGrow: 1, flexBasis: 150, minHeight: 72, padding: spacing.md, justifyContent: 'center', gap: 5, borderRightWidth: 1, borderBottomWidth: 1 },
  metricLabel: { fontSize: 11, fontWeight: '600' },
  metricValue: { fontSize: 19, fontWeight: '700' },
  tableScrollContent: { flexGrow: 1 },
  table: { minWidth: 945, width: '100%' },
  tableRow: { minHeight: 38, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1 },
  tableHeader: { borderRadius: radii.sm, borderBottomWidth: 0 },
  cell: { flexGrow: 1, flexBasis: 135, minWidth: 135, paddingHorizontal: 8, fontSize: 12 },
  headerText: { fontSize: 10, fontWeight: '700' },
  numberCell: { textAlign: 'right', fontVariant: ['tabular-nums'] },
  statusText: { fontWeight: '600' },
  cards: { gap: spacing.sm },
  resultCard: { padding: spacing.md },
  resultAmount: { fontSize: 18, fontWeight: '700' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  pagination: { marginTop: spacing.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
});
