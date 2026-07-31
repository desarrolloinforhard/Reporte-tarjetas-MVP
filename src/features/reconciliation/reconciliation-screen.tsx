import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { ScreenFrame } from '@/components/layout/screen-frame';
import { Badge } from '@/components/ui/badge';
import { AmountField } from '@/components/ui/amount-field';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DatePickerField } from '@/components/ui/date-picker-field';
import { ExportDialog, ExportFormat } from '@/components/ui/export-dialog';
import { FeedbackState } from '@/components/ui/feedback-state';
import { SelectField } from '@/components/ui/select-field';
import { TextField } from '@/components/ui/text-field';
import { PaymentDetailModal } from '@/features/payments/payment-detail-modal';
import {
  getAllReconciliationRows,
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
import { exportCsv, exportPdf } from '@/utils/file-export';

const PAGE_SIZE = 20;
const providers = { clover: 'Clover', mercadopago: 'Mercado Pago' };
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
  const { width } = useWindowDimensions();
  const desktop = width >= breakpoints.tablet;
  const filtersSidebar = Platform.OS === 'web' && width >= breakpoints.desktop;
  const params = useLocalSearchParams<{ from?: string; to?: string; status?: string }>();
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [differencesVisible, setDifferencesVisible] = useState(false);
  const [exportVisible, setExportVisible] = useState(false);
  const [selected, setSelected] = useState<ReconciliationRow | null>(null);
  const [filters, setFilters] = useState<ReconciliationFilters>({
    from: params.from || isoDaysAgo(30),
    to: params.to || isoDaysAgo(0),
    provider: '',
    reconciliation_status: params.status || '',
    external_reference: '',
    min_amount: '',
    max_amount: '',
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
    queryKey: ['reconciliation-summary', filterKey],
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

  async function handleExport(format: ExportFormat) {
    const rows = await getAllReconciliationRows(filters);
    if (!rows.length) throw new Error('No hay filas para exportar.');
    const columns = [
      { label: 'Fecha', value: (row: ReconciliationRow) => formatDateTime(row.created_at) },
      { label: 'Proveedor', value: (row: ReconciliationRow) => providers[row.provider as keyof typeof providers] || row.provider },
      { label: 'Referencia', value: (row: ReconciliationRow) => row.external_reference },
      { label: 'Pago', value: (row: ReconciliationRow) => money(row.payment_amount) },
      { label: 'Venta', value: (row: ReconciliationRow) => money(row.sale_amount) },
      { label: 'Diferencia', value: (row: ReconciliationRow) => money(row.difference) },
      { label: 'Estado', value: (row: ReconciliationRow) => row.status_label || statusLabels[row.status] },
      { label: 'Detalle', value: (row: ReconciliationRow) => row.issue_message },
    ];
    const name = `conciliacion_${filters.from}_${filters.to}`;
    if (format === 'pdf') await exportPdf(name, 'Conciliación de pagos', columns, rows);
    else await exportCsv(name, columns, rows);
  }

  const metrics = summaryQuery.data
    ? [
        ['Pagos', summaryQuery.data.total_payments, ''],
        ['Conciliados', summaryQuery.data.matched_count, 'matched'],
        ['Venta no encontrada', summaryQuery.data.sale_not_found_count, 'sale_not_found'],
        ['Diferencias', summaryQuery.data.amount_mismatch_count, 'amount_mismatch'],
        ['Pendientes', summaryQuery.data.pending_review_count, 'pending_review'],
        ['Total observado', money(summaryQuery.data.total_difference), ''],
      ] as const
    : [];

  return (
    <ScreenFrame
      description="Comparación entre cobros y ventas."
      hideHeader
      title="Conciliación">
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

      <View style={[styles.workspace, filtersSidebar && styles.workspaceDesktop]}>
      {desktop || filtersVisible ? (
        <Card
          style={{
            ...styles.sectionCard,
            ...(filtersSidebar ? styles.sidebarFilters : {}),
            ...(filtersSidebar
              ? { left: Math.max(spacing.lg, (width - 1440) / 2 + spacing.lg) }
              : {}),
            borderColor: filtersSidebar ? colors.border : colors.accent,
          }}
          title="Filtros">
          <View style={styles.filterGrid}>
            <View style={styles.filterItem}><DatePickerField label="Desde" value={filters.from} onChange={(value) => setFilter('from', value)} /></View>
            <View style={styles.filterItem}><DatePickerField label="Hasta" value={filters.to} onChange={(value) => setFilter('to', value)} /></View>
            <View style={styles.filterItem}><AmountField label="Importe mínimo" value={filters.min_amount || ''} placeholder="Ej.: 10.000" onChangeText={(value) => setFilter('min_amount', value)} /></View>
            <View style={styles.filterItem}><AmountField label="Importe máximo" value={filters.max_amount || ''} placeholder="Ej.: 124.500,50" onChangeText={(value) => setFilter('max_amount', value)} /></View>
            <View style={styles.filterItem}><SelectField label="Proveedor" value={filters.provider ?? ''} options={providerOptions} onChange={(value) => setFilter('provider', value)} /></View>
            <View style={styles.filterItem}><SelectField label="Estado" value={filters.reconciliation_status ?? ''} options={statusOptions} onChange={(value) => setFilter('reconciliation_status', value)} /></View>
          </View>
          <Text style={[styles.hint, { color: rangeError ? colors.danger : colors.textMuted }]}>
            {rangeError || 'Seleccioná un rango y estado para acotar los resultados.'}
          </Text>
        </Card>
      ) : null}

      <View style={[styles.mainContent, filtersSidebar && styles.mainContentDesktop]}>
      {listQuery.isPending ? <FeedbackState title="Cargando conciliación" description="Comparando fixtures de pagos y ventas." /> : null}
      {listQuery.isError ? <FeedbackState title="No se pudo cargar la conciliación" description="Verificá que el backend aislado esté activo." actionLabel="Reintentar" onAction={() => listQuery.refetch()} /> : null}
      {listQuery.data ? (
        <Card style={{ ...styles.sectionCard, borderColor: colors.accent }} title="Resultados">
          <View
            style={[
              styles.metrics,
              styles.integratedMetrics,
              desktop && styles.metricsDesktop,
              { borderColor: colors.border },
            ]}>
            {metrics.map(([label, value, status]) => (
              <Pressable
                key={label}
                onPress={() => {
                  if (label === 'Total observado') {
                    setDifferencesVisible(true);
                    return;
                  }
                  setFilter('reconciliation_status', status);
                }}
                style={[
                  styles.metric,
                  desktop && styles.metricDesktop,
                  desktop && label === 'Total observado' && styles.observedMetricDesktop,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}>
                <Text style={[styles.metricLabel, { color: colors.textMuted }]}>{label}</Text>
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  style={[styles.metricValue, { color: colors.text }]}>
                  {value}
                </Text>
              </Pressable>
            ))}
            {summaryQuery.data ? (
              <View
                style={[
                  styles.metric,
                  styles.totalsMetric,
                  desktop && styles.totalsMetricDesktop,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}>
                <Text style={[styles.metricLabel, styles.totalsTitle, { color: colors.text }]}>
                  TOTALES
                </Text>
                <View style={styles.totalLine}>
                  <Text style={[styles.totalLabel, { color: colors.textMuted }]}>Cobrado</Text>
                  <Text style={[styles.totalValue, { color: colors.text }]}>
                    {money(summaryQuery.data.total_payment_amount)}
                  </Text>
                </View>
                <View style={styles.totalLine}>
                  <Text style={[styles.totalLabel, { color: colors.textMuted }]}>En base</Text>
                  <Text style={[styles.totalValue, { color: colors.text }]}>
                    {money(summaryQuery.data.total_sale_amount)}
                  </Text>
                </View>
                <View style={styles.totalLine}>
                  <Text style={[styles.totalLabel, { color: colors.danger }]}>Observado</Text>
                  <Text style={[styles.totalValue, { color: colors.danger }]}>
                    {money(summaryQuery.data.total_difference)}
                  </Text>
                </View>
              </View>
            ) : null}
          </View>
          <View style={styles.resultsSearch}>
            <View style={styles.searchField}>
              <TextField
                label="Buscar referencia"
                onChangeText={(value) => setFilter('external_reference', value)}
                placeholder="Número de referencia"
                value={filters.external_reference}
              />
            </View>
            <Button disabled={!listQuery.data.total} onPress={() => setExportVisible(true)} variant="secondary">
              Exportar
            </Button>
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
                {!listQuery.data.items.length ? (
                  <View style={[styles.emptyTableRow, { borderColor: colors.border }]}>
                    <Text style={[styles.emptyTableTitle, { color: colors.text }]}>Sin resultados</Text>
                    <Text style={[styles.muted, { color: colors.textMuted }]}>No hay registros para los filtros seleccionados.</Text>
                  </View>
                ) : null}
              </View>
            </ScrollView>
          ) : listQuery.data.items.length ? (
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
          ) : (
            <FeedbackState
              title="Sin resultados"
              description="No hay registros para los filtros seleccionados."
            />
          )}
          <View style={styles.pagination}>
            <Button disabled={filters.offset === 0} variant="secondary" onPress={() => setFilter('offset', Math.max(0, filters.offset - PAGE_SIZE))}>Anterior</Button>
            <Text style={[styles.muted, { color: colors.textMuted }]}>
              {listQuery.data.total
                ? `${filters.offset + 1}–${Math.min(filters.offset + PAGE_SIZE, listQuery.data.total)} de ${listQuery.data.total}`
                : '0–0 de 0'}
            </Text>
            <Button disabled={!listQuery.data.hasMore} variant="secondary" onPress={() => setFilter('offset', filters.offset + PAGE_SIZE)}>Siguiente</Button>
          </View>
        </Card>
      ) : null}

      </View>
      </View>

      <ExportDialog
        formats={['csv', 'pdf']}
        onClose={() => setExportVisible(false)}
        onExport={handleExport}
        visible={exportVisible}
      />

      <Modal
        animationType="fade"
        onRequestClose={() => setDifferencesVisible(false)}
        transparent
        visible={differencesVisible}>
        <View style={styles.modalOverlay}>
          <View style={[styles.differencesModal, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderCopy}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Detalle de diferencias</Text>
                <Text style={[styles.modalDescription, { color: colors.textMuted }]}>
                  El total observado puede incluir pagos pendientes de revisión. La diferencia real
                  solo compara pagos con una venta encontrada.
                </Text>
              </View>
              <Button variant="ghost" onPress={() => setDifferencesVisible(false)}>Cerrar</Button>
            </View>

            {summaryQuery.data ? (
              <>
                <View style={styles.differenceCards}>
                  {[
                    {
                      label: 'Diferencias de importe',
                      amount: summaryQuery.data.amount_mismatch_amount,
                      count: summaryQuery.data.amount_mismatch_count,
                      status: 'amount_mismatch',
                      background: colors.dangerSoft,
                      valueColor: colors.danger,
                    },
                    {
                      label: 'Importe sin venta',
                      amount: summaryQuery.data.sale_not_found_amount,
                      count: summaryQuery.data.sale_not_found_count,
                      status: 'sale_not_found',
                      background: colors.warningSoft,
                      valueColor: colors.warning,
                    },
                    {
                      label: 'Pendientes de revisión',
                      amount: summaryQuery.data.pending_review_amount,
                      count: summaryQuery.data.pending_review_count,
                      status: 'pending_review',
                      background: colors.warningSoft,
                      valueColor: colors.warning,
                    },
                    {
                      label: 'Diferencia total real',
                      amount: summaryQuery.data.real_difference_amount,
                      count: null,
                      status: 'amount_mismatch',
                      background: colors.successSoft,
                      valueColor: colors.success,
                    },
                  ].map((item) => (
                    <View
                      key={item.label}
                      style={[
                        styles.differenceCard,
                        { backgroundColor: item.background, borderColor: colors.border },
                      ]}>
                      <Text style={[styles.differenceLabel, { color: colors.textMuted }]}>
                        {item.label}
                      </Text>
                      <Text
                        adjustsFontSizeToFit
                        numberOfLines={1}
                        style={[styles.differenceAmount, { color: item.valueColor }]}>
                        {money(item.amount)}
                      </Text>
                      {item.count === null ? (
                        <Text style={[styles.differenceCount, { color: colors.textMuted }]}>
                          Solo ventas comparables
                        </Text>
                      ) : (
                        <>
                          <Text style={[styles.differenceCount, { color: colors.textMuted }]}>
                            {item.count} {item.count === 1 ? 'caso' : 'casos'}
                          </Text>
                          <Button
                            disabled={item.count === 0}
                            style={styles.viewRowsButton}
                            variant="secondary"
                            onPress={() => {
                              setFilter('reconciliation_status', item.status);
                              setDifferencesVisible(false);
                            }}>
                            Ver filas
                          </Button>
                        </>
                      )}
                    </View>
                  ))}
                </View>
                <Text style={[styles.observedFooter, { color: colors.textMuted }]}>
                  Total observado en la tarjeta: {money(summaryQuery.data.total_difference)}
                </Text>
              </>
            ) : null}
          </View>
        </View>
      </Modal>

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
  workspace: { gap: spacing.lg },
  workspaceDesktop: { paddingLeft: 304, alignItems: 'flex-start' },
  mainContent: { gap: spacing.lg },
  mainContentDesktop: { flex: 1, minWidth: 0, width: '100%', maxWidth: '100%' },
  sidebarFilters: {
    width: 280,
    flexShrink: 0,
    alignSelf: 'flex-start',
    position: 'fixed' as 'relative',
    top: 33,
    zIndex: 2,
    padding: 12,
    gap: 7,
    borderTopWidth: 1,
    borderRadius: radii.md,
  },
  muted: { fontSize: 12, lineHeight: 18 },
  mobileFilterBar: { borderWidth: 1, borderTopWidth: 4, borderRadius: radii.lg, padding: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  filterSummary: { flex: 1, fontSize: 12, fontWeight: '600' },
  sectionCard: { borderTopWidth: 4 },
  resultsSearch: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end', gap: spacing.sm },
  searchField: { flex: 1, minWidth: 220 },
  filterGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  filterItem: { flexGrow: 1, flexShrink: 1, flexBasis: 210, minWidth: 180 },
  hint: { marginTop: spacing.sm, fontSize: 11 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap' },
  integratedMetrics: { width: '100%', overflow: 'hidden', borderWidth: 1, borderRadius: radii.md },
  metricsDesktop: { flexWrap: 'nowrap' },
  metric: { flexGrow: 1, flexBasis: 150, minHeight: 72, padding: spacing.md, justifyContent: 'center', gap: 5, borderRightWidth: 1, borderBottomWidth: 1 },
  metricDesktop: { flexBasis: 0, minWidth: 0, minHeight: 64, paddingVertical: 8, paddingHorizontal: 10 },
  observedMetricDesktop: { flexGrow: 1.45, flexBasis: 135, minWidth: 135 },
  metricLabel: { fontSize: 11, fontWeight: '600' },
  metricValue: { fontSize: 19, fontWeight: '700' },
  totalsMetric: { minWidth: 190, gap: 2 },
  totalsMetricDesktop: { flexGrow: 1.05, flexBasis: 145, minWidth: 145, paddingVertical: 6 },
  totalsTitle: { marginBottom: 1 },
  totalLine: { flexDirection: 'row', justifyContent: 'space-between', gap: 5 },
  totalLabel: { fontSize: 9, lineHeight: 11 },
  totalValue: { fontSize: 10, lineHeight: 11, fontWeight: '700', textAlign: 'right' },
  tableScrollContent: { flexGrow: 1 },
  table: { minWidth: 945, width: '100%' },
  tableRow: { minHeight: 38, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1 },
  tableHeader: { borderRadius: radii.sm, borderBottomWidth: 0 },
  emptyTableRow: { minHeight: 132, borderBottomWidth: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  emptyTableTitle: { fontSize: 16, fontWeight: '700' },
  cell: { flexGrow: 1, flexBasis: 135, minWidth: 135, paddingHorizontal: 8, fontSize: 12 },
  headerText: { fontSize: 10, fontWeight: '700' },
  numberCell: { textAlign: 'right', fontVariant: ['tabular-nums'] },
  statusText: { fontWeight: '600' },
  cards: { gap: spacing.sm },
  resultCard: { padding: spacing.md },
  resultAmount: { fontSize: 18, fontWeight: '700' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  pagination: { marginTop: spacing.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  modalOverlay: { flex: 1, padding: spacing.lg, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.55)' },
  differencesModal: { width: '100%', maxWidth: 900, padding: spacing.lg, borderRadius: radii.lg, gap: spacing.lg },
  modalHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md },
  modalHeaderCopy: { flex: 1, gap: spacing.sm },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  modalDescription: { fontSize: 13, lineHeight: 19 },
  differenceCards: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  differenceCard: { flexGrow: 1, flexBasis: 180, minWidth: 170, minHeight: 180, padding: spacing.md, borderWidth: 1, borderRadius: radii.md, alignItems: 'center', gap: spacing.sm },
  differenceLabel: { minHeight: 32, fontSize: 11, fontWeight: '600', textAlign: 'center', textTransform: 'uppercase' },
  differenceAmount: { width: '100%', fontSize: 18, fontWeight: '700', textAlign: 'center' },
  differenceCount: { minHeight: 18, fontSize: 12, textAlign: 'center' },
  viewRowsButton: { minHeight: 38, marginTop: 'auto', paddingVertical: 7 },
  observedFooter: { fontSize: 12 },
});
