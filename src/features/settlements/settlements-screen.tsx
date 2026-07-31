import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { AmountField } from '@/components/ui/amount-field';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DatePickerField } from '@/components/ui/date-picker-field';
import { ExportDialog } from '@/components/ui/export-dialog';
import { FeedbackState } from '@/components/ui/feedback-state';
import { SelectField } from '@/components/ui/select-field';
import { TextField } from '@/components/ui/text-field';
import { ScreenFrame } from '@/components/layout/screen-frame';
import {
  getAllSettlements,
  getSettlements,
  getSettlementsSummary,
  Settlement,
  SettlementFilters,
} from '@/features/settlements/settlements.api';
import { breakpoints, radii, spacing } from '@/theme/tokens';
import { useAppTheme } from '@/theme/theme-provider';
import { formatDate } from '@/utils/date-format';
import { exportCsv } from '@/utils/file-export';

const PAGE_SIZE = 20;
const providers: Record<string, string> = {
  clover: 'Clover',
  mercadopago: 'Mercado Pago',
};
const statuses = [
  { value: '', label: 'Todos' },
  { value: 'settled', label: 'Liquidados' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'rejected', label: 'Rechazados' },
  { value: 'cancelled', label: 'Cancelados' },
];
const providerOptions = [
  { value: '', label: 'Todos' },
  ...Object.entries(providers).map(([value, label]) => ({ value, label })),
];

function daysAgo(days: number) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

function money(value: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 2,
  }).format(value);
}

function date(value: string | null) {
  return formatDate(value);
}

function tone(status: string): 'success' | 'danger' | 'warning' | 'neutral' {
  if (status === 'settled') return 'success';
  if (status === 'rejected') return 'danger';
  if (status === 'pending' || status === 'cancelled') return 'warning';
  return 'neutral';
}

function rowBackground(
  status: string,
  colors: ReturnType<typeof useAppTheme>['colors'],
  isDark: boolean,
) {
  if (!isDark) {
    if (status === 'settled') return '#B9E4CB';
    if (status === 'rejected') return '#F4BBB6';
    if (status === 'pending' || status === 'cancelled') return '#F5D184';
    return colors.surface;
  }
  if (status === 'settled') return colors.successSoft;
  if (status === 'rejected') return colors.dangerSoft;
  if (status === 'pending' || status === 'cancelled') return colors.warningSoft;
  return colors.surface;
}

function statusPalette(
  status: string,
  colors: ReturnType<typeof useAppTheme>['colors'],
) {
  if (status === 'settled') return { accent: colors.success, soft: colors.successSoft };
  if (status === 'rejected') return { accent: colors.danger, soft: colors.dangerSoft };
  if (status === 'pending' || status === 'cancelled') {
    return { accent: colors.warning, soft: colors.warningSoft };
  }
  return { accent: colors.primary, soft: colors.primarySoft };
}

function transactionLabel(value: string) {
  return {
    payment: 'Pago',
    rejected_payment: 'Pago rechazado',
    refund: 'Devolución',
  }[value] || value.replaceAll('_', ' ');
}

function validateRange(from: string, to: string) {
  const fromDate = new Date(`${from}T12:00:00`);
  const toDate = new Date(`${to}T12:00:00`);
  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
    return 'Seleccioná fechas válidas.';
  }
  const days = Math.round((toDate.getTime() - fromDate.getTime()) / 86_400_000);
  if (days < 0) return 'La fecha Desde no puede ser posterior a Hasta.';
  if (days > 61) return 'El rango no puede superar 61 días.';
  return null;
}

export function SettlementsScreen() {
  const { colors, isDark } = useAppTheme();
  const { width } = useWindowDimensions();
  const desktop = width >= breakpoints.tablet;
  const filtersSidebar = Platform.OS === 'web' && width >= breakpoints.desktop;
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [exportVisible, setExportVisible] = useState(false);
  const [selected, setSelected] = useState<Settlement | null>(null);
  const [filters, setFilters] = useState<SettlementFilters>({
    from: daysAgo(30),
    to: daysAgo(0),
    provider: '',
    status: '',
    external_reference: '',
    min_amount: '',
    max_amount: '',
    limit: PAGE_SIZE,
    offset: 0,
  });
  const filterKey = useMemo(() => JSON.stringify(filters), [filters]);
  const rangeError = useMemo(
    () => validateRange(filters.from, filters.to),
    [filters.from, filters.to],
  );
  const listQuery = useQuery({
    queryKey: ['settlements', filterKey],
    queryFn: () => getSettlements(filters),
    enabled: !rangeError,
  });
  const summaryQuery = useQuery({
    queryKey: ['settlements-summary', filterKey],
    queryFn: () => getSettlementsSummary(filters),
    enabled: !rangeError,
  });
  const setFilter = (key: keyof SettlementFilters, value: string | number) =>
    setFilters((current) => ({
      ...current,
      [key]: value,
      offset: key === 'offset' ? Number(value) : 0,
    }));
  async function handleExport() {
    const rows = await getAllSettlements(filters);
    if (!rows.length) throw new Error('No hay liquidaciones para exportar.');
    await exportCsv(`liquidaciones_${filters.from}_${filters.to}`, [
      { label: 'Fecha liquidación', value: (row: Settlement) => date(row.settlement_date) },
      { label: 'Fecha transacción', value: (row: Settlement) => date(row.transaction_date) },
      { label: 'Proveedor', value: (row: Settlement) => providers[row.provider] || row.provider },
      { label: 'Tipo', value: (row: Settlement) => transactionLabel(row.transaction_type) },
      { label: 'Referencia', value: (row: Settlement) => row.external_reference },
      { label: 'Bruto', value: (row: Settlement) => row.gross_amount.toFixed(2) },
      { label: 'Comisión', value: (row: Settlement) => row.fee_amount.toFixed(2) },
      { label: 'Impuestos', value: (row: Settlement) => row.tax_amount.toFixed(2) },
      { label: 'Devuelto', value: (row: Settlement) => row.refund_amount.toFixed(2) },
      { label: 'Neto', value: (row: Settlement) => row.net_amount.toFixed(2) },
      { label: 'Estado', value: (row: Settlement) => row.status_label },
      { label: 'Sucursal', value: (row: Settlement) => row.branch_name },
      { label: 'Terminal', value: (row: Settlement) => row.terminal_name },
    ], rows);
  }
  const summary = summaryQuery.data;
  const metrics = summary
    ? [
        ['Liquidaciones', String(summary.settlements_count), 'neutral'],
        ['Bruto', money(summary.gross_amount), 'success'],
        ['Comisiones', money(summary.fee_amount), 'warning'],
        ['Neto', money(summary.net_amount), 'success'],
      ] as const
    : [];

  return (
    <ScreenFrame
      actions={<Badge label="Estimación segura" tone="warning" />}
      description="Seguimiento de acreditaciones estimadas desde pagos del ambiente aislado."
      hideHeader
      title="Liquidaciones">
      {!desktop ? (
        <View style={[styles.mobileFilterBar, { backgroundColor: colors.surface, borderColor: colors.accent }]}>
          <Text style={[styles.filterSummary, { color: colors.text }]}>
            {formatDate(filters.from)} — {formatDate(filters.to)}
          </Text>
          <Button onPress={() => setFiltersVisible((visible) => !visible)} variant="secondary">
            {filtersVisible ? 'Ocultar filtros' : 'Mostrar filtros'}
          </Button>
        </View>
      ) : null}

      <View style={[styles.workspace, filtersSidebar && styles.workspaceDesktop]}>
      {desktop || filtersVisible ? (
        <Card
          style={{
            ...styles.filtersCard,
            ...(filtersSidebar ? styles.sidebarFilters : {}),
            ...(filtersSidebar
              ? { left: Math.max(spacing.lg, (width - 1440) / 2 + spacing.lg) }
              : {}),
            borderColor: filtersSidebar ? colors.border : colors.accent,
          }}
          title="Filtros">
          <View style={styles.filterGrid}>
            <View style={styles.filterItem}>
              <DatePickerField
                label="Desde"
                onChange={(value) => setFilter('from', value)}
                value={filters.from}
              />
            </View>
            <View style={styles.filterItem}>
              <DatePickerField
                label="Hasta"
                onChange={(value) => setFilter('to', value)}
                value={filters.to}
              />
            </View>
            <View style={styles.filterItem}>
              <AmountField
                label="Importe mínimo"
                onChangeText={(value) => setFilter('min_amount', value)}
                placeholder="Ej.: 10.000"
                value={filters.min_amount || ''}
              />
            </View>
            <View style={styles.filterItem}>
              <AmountField
                label="Importe máximo"
                onChangeText={(value) => setFilter('max_amount', value)}
                placeholder="Ej.: 124.500,50"
                value={filters.max_amount || ''}
              />
            </View>
            <View style={styles.filterItem}>
              <SelectField
                label="Proveedor"
                onChange={(value) => setFilter('provider', value)}
                options={providerOptions}
                value={filters.provider ?? ''}
              />
            </View>
            <View style={styles.filterItem}>
              <SelectField
                label="Estado"
                onChange={(value) => setFilter('status', value)}
                options={statuses}
                value={filters.status ?? ''}
              />
            </View>
          </View>
          <Text
            accessibilityLiveRegion="polite"
            style={[
              styles.filterHint,
              { color: rangeError ? colors.danger : colors.textMuted },
            ]}>
            {rangeError || 'Rango máximo de consulta: 61 días.'}
          </Text>
        </Card>
      ) : null}

      <View style={[styles.mainContent, filtersSidebar && styles.mainContentDesktop]}>
      {listQuery.isPending ? (
        <FeedbackState description="Consultando fixtures sin acceso a ODBC." title="Cargando liquidaciones" />
      ) : null}
      {listQuery.isError ? (
        <FeedbackState
          actionLabel="Reintentar"
          description="Verificá que el backend aislado siga activo en el puerto 5001."
          onAction={() => listQuery.refetch()}
          title="No se pudieron cargar las liquidaciones"
        />
      ) : null}
      {listQuery.data?.items.length ? (
        <Card
          style={{ ...styles.resultsCard, borderColor: colors.accent }}
          title="Liquidaciones">
          <View
            style={[
              styles.metricsRow,
              styles.integratedMetrics,
              { borderColor: colors.border },
            ]}>
            {metrics.map(([label, value]) => (
              <View
                key={label}
                style={[
                  styles.metric,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}>
                <Text style={[styles.metricLabel, { color: colors.textMuted }]}>{label}</Text>
                <Text style={[styles.metricValue, { color: colors.text }]}>{value}</Text>
              </View>
            ))}
          </View>
          <View style={styles.resultsSearch}>
            <View style={styles.resultsSearchField}>
              <TextField
                label="Buscar referencia"
                onChangeText={(value) => setFilter('external_reference', value)}
                placeholder="Número de referencia"
                value={filters.external_reference}
              />
            </View>
            <Button disabled={!listQuery.data.total} onPress={() => setExportVisible(true)} variant="secondary">Exportar</Button>
          </View>
          {desktop ? (
            <ScrollView
              contentContainerStyle={styles.tableScrollContent}
              horizontal
              style={styles.tableViewport}
              showsHorizontalScrollIndicator>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader, { backgroundColor: colors.surfaceMuted }]}>
                  {['FECHA LIQ.', 'PROVEEDOR', 'TIPO', 'REFERENCIA', 'BRUTO', 'COMISIÓN', 'NETO', 'ESTADO'].map((label, index) => (
                    <Text
                      key={label}
                      style={[
                        styles.cell,
                        styles.headerText,
                        index >= 4 && index <= 6 && styles.numberCell,
                        { color: colors.text },
                      ]}>
                      {label}
                    </Text>
                  ))}
                </View>
                {listQuery.data.items.map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() => setSelected(item)}
                    style={[
                      styles.tableRow,
                      {
                        backgroundColor: rowBackground(item.status, colors, isDark),
                        borderColor: colors.border,
                      },
                    ]}>
                    <Text style={[styles.cell, { color: colors.text }]}>{date(item.settlement_date)}</Text>
                    <Text style={[styles.cell, { color: colors.text }]}>{providers[item.provider] || item.provider}</Text>
                    <Text style={[styles.cell, { color: colors.text }]}>{transactionLabel(item.transaction_type)}</Text>
                    <Text style={[styles.cell, { color: colors.text }]}>{item.external_reference}</Text>
                    <Text style={[styles.cell, styles.numberCell, { color: colors.text }]}>{money(item.gross_amount)}</Text>
                    <Text style={[styles.cell, styles.numberCell, { color: colors.text }]}>{money(item.fee_amount)}</Text>
                    <Text style={[styles.cell, styles.numberCell, { color: colors.text }]}>{money(item.net_amount)}</Text>
                    <Text style={[styles.cell, styles.statusText, { color: colors.text }]}>
                      {item.status_label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          ) : (
            <View style={styles.cards}>
              {listQuery.data.items.map((item) => (
                <Pressable key={item.id} onPress={() => setSelected(item)}>
                  <Card
                    style={{
                      ...styles.itemCard,
                      backgroundColor: rowBackground(item.status, colors, isDark),
                    }}>
                    <View style={styles.rowBetween}>
                      <Text style={[styles.itemAmount, { color: colors.text }]}>{money(item.net_amount)}</Text>
                      <Badge label={item.status_label} tone={tone(item.status)} />
                    </View>
                    <Text style={[styles.muted, { color: colors.textMuted }]}>
                      {providers[item.provider] || item.provider} · {item.transaction_type}
                    </Text>
                    <View style={styles.rowBetween}>
                      <Text style={[styles.muted, { color: colors.textMuted }]}>{date(item.settlement_date)}</Text>
                      <Text style={[styles.muted, { color: colors.textMuted }]}>{item.external_reference}</Text>
                    </View>
                  </Card>
                </Pressable>
              ))}
            </View>
          )}
          <View style={styles.pagination}>
            <Button disabled={filters.offset === 0} onPress={() => setFilter('offset', Math.max(0, filters.offset - PAGE_SIZE))} variant="secondary">Anterior</Button>
            <Text style={[styles.muted, { color: colors.textMuted }]}>
              {filters.offset + 1}–{Math.min(filters.offset + PAGE_SIZE, listQuery.data.total)} de {listQuery.data.total}
            </Text>
            <Button disabled={!listQuery.data.hasMore} onPress={() => setFilter('offset', filters.offset + PAGE_SIZE)} variant="secondary">Siguiente</Button>
          </View>
        </Card>
      ) : null}

      </View>
      </View>

      <ExportDialog formats={['csv']} onClose={() => setExportVisible(false)} onExport={handleExport} visible={exportVisible} />

      <Modal animationType="fade" onRequestClose={() => setSelected(null)} transparent visible={Boolean(selected)}>
        <Pressable onPress={() => setSelected(null)} style={[styles.backdrop, { backgroundColor: colors.overlay }]}>
          <Pressable
            onPress={(event) => event.stopPropagation()}
            style={[
              styles.detailModal,
              {
                backgroundColor: colors.surfaceElevated,
                borderTopColor: selected
                  ? statusPalette(selected.status, colors).accent
                  : colors.accent,
              },
            ]}>
            {selected ? (
              <>
                <View
                  style={[
                    styles.detailHeader,
                    { backgroundColor: statusPalette(selected.status, colors).soft },
                  ]}>
                  <View style={styles.detailHeading}>
                    <Text style={[styles.detailEyebrow, { color: colors.textMuted }]}>
                      DETALLE DE LIQUIDACIÓN
                    </Text>
                    <Text style={[styles.detailTitle, { color: colors.text }]}>
                      {selected.external_reference}
                    </Text>
                    <Badge label={selected.status_label} tone={tone(selected.status)} />
                  </View>
                  <Button onPress={() => setSelected(null)} variant="ghost">Cerrar</Button>
                </View>

                <View style={styles.detailSummary}>
                  {[
                    ['Bruto', money(selected.gross_amount)],
                    ['Comisión', money(selected.fee_amount)],
                    ['Neto', money(selected.net_amount)],
                  ].map(([label, value]) => (
                    <View
                      key={label}
                      style={[styles.detailSummaryItem, { borderColor: colors.border }]}>
                      <Text style={[styles.detailSummaryLabel, { color: colors.textMuted }]}>
                        {label}
                      </Text>
                      <Text style={[styles.detailSummaryValue, { color: colors.text }]}>
                        {value}
                      </Text>
                    </View>
                  ))}
                </View>

                <ScrollView contentContainerStyle={styles.detailRows}>
                  <Text style={[styles.detailSectionTitle, { color: colors.text }]}>
                    Información
                  </Text>
                  {[
                    ['Proveedor', providers[selected.provider] || selected.provider],
                    ['Fecha de liquidación', date(selected.settlement_date)],
                    ['Fecha de transacción', date(selected.transaction_date)],
                    ['Referencia', selected.external_reference],
                    ['Sucursal', selected.branch_name || '—'],
                    ['Terminal', selected.terminal_name || '—'],
                    ['Impuestos', money(selected.tax_amount)],
                    ['Devolución', money(selected.refund_amount)],
                  ].map(([label, value]) => (
                    <View key={label} style={[styles.detailRow, { borderColor: colors.border }]}>
                      <Text style={[styles.detailLabel, { color: colors.textMuted }]}>{label}</Text>
                      <Text style={[styles.detailValue, { color: colors.text }]}>{value}</Text>
                    </View>
                  ))}
                </ScrollView>
              </>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
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
  filtersCard: { borderTopWidth: 4 },
  filterGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  filterItem: { flexGrow: 1, flexShrink: 1, flexBasis: 210, minWidth: 180 },
  filterHint: { marginTop: spacing.sm, fontSize: 11, lineHeight: 16 },
  metricsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  integratedMetrics: {
    borderWidth: 1,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  metric: { flexGrow: 1, flexBasis: 180, minHeight: 78, padding: spacing.md, justifyContent: 'center', borderRightWidth: 1, borderBottomWidth: 1, gap: 6 },
  metricLabel: { fontSize: 12, fontWeight: '600' },
  metricValue: { fontSize: 19, fontWeight: '700' },
  resultsCard: { borderTopWidth: 4 },
  resultsSearch: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end', gap: spacing.sm },
  resultsSearchField: { flex: 1, minWidth: 220 },
  tableScrollContent: { flexGrow: 1 },
  tableViewport: { width: '100%', maxWidth: '100%', alignSelf: 'stretch' },
  table: { minWidth: 1120, width: '100%', flexGrow: 1 },
  tableRow: { minHeight: 38, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1 },
  tableHeader: { borderRadius: radii.sm, borderBottomWidth: 0 },
  cell: { width: 140, flexGrow: 1, paddingHorizontal: 8, fontSize: 12 },
  headerText: { fontSize: 10, fontWeight: '700' },
  numberCell: { textAlign: 'right', fontVariant: ['tabular-nums'] },
  statusText: { fontWeight: '600' },
  cards: { gap: spacing.sm },
  itemCard: { padding: spacing.md },
  itemAmount: { fontSize: 18, fontWeight: '700' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  pagination: { marginTop: spacing.sm, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.md },
  detailModal: { width: '100%', maxWidth: 720, maxHeight: '88%', borderTopWidth: 6, borderRadius: radii.xl, padding: spacing.md, gap: spacing.md, overflow: 'hidden' },
  detailHeader: { borderRadius: radii.lg, padding: spacing.md, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md },
  detailHeading: { flex: 1, alignItems: 'flex-start', gap: 5 },
  detailEyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  detailTitle: { fontSize: 21, fontWeight: '700' },
  detailSummary: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  detailSummaryItem: { flexGrow: 1, flexBasis: 170, minHeight: 76, borderWidth: 1, borderRadius: radii.md, padding: spacing.md, justifyContent: 'center', gap: 4 },
  detailSummaryLabel: { fontSize: 11, fontWeight: '600' },
  detailSummaryValue: { fontSize: 18, fontWeight: '700', fontVariant: ['tabular-nums'] },
  detailSectionTitle: { marginBottom: spacing.xs, fontSize: 15, fontWeight: '700' },
  detailRows: { gap: 0, paddingBottom: spacing.md },
  detailRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderBottomWidth: 1 },
  detailLabel: { flex: 1, fontSize: 13 },
  detailValue: { flex: 1.5, fontSize: 13, fontWeight: '600', textAlign: 'right' },
});
