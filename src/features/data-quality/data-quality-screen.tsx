import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { ScreenFrame } from '@/components/layout/screen-frame';
import { Badge } from '@/components/ui/badge';
import { AmountField } from '@/components/ui/amount-field';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DatePickerField } from '@/components/ui/date-picker-field';
import { FeedbackState } from '@/components/ui/feedback-state';
import { FilterLoadingNotice } from '@/components/ui/filter-loading-notice';
import { SelectField } from '@/components/ui/select-field';
import { TextField } from '@/components/ui/text-field';
import { getDataQuality, getQualityPaymentDetail, QualityCategory, QualityFinding, QualityFilters } from '@/features/data-quality/data-quality.api';
import { PaymentDetailModal } from '@/features/payments/payment-detail-modal';
import { breakpoints, radii, spacing } from '@/theme/tokens';
import { useAppTheme } from '@/theme/theme-provider';
import { formatDate, formatDateTime } from '@/utils/date-format';
import { paginationPageLabel } from '@/utils/pagination';

const tabs: { key: QualityCategory; label: string }[] = [
  { key: 'duplicates', label: 'Duplicados' },
  { key: 'missing', label: 'Referencias faltantes' },
  { key: 'orphans', label: 'Pagos sin venta' },
  { key: 'outliers', label: 'Importes atípicos' },
];
const providerOptions = [
  { value: '', label: 'Todos' },
  { value: 'clover', label: 'Clover' },
  { value: 'mercadopago', label: 'Mercado Pago' },
];
const providerLabel = (value: string) => ({ clover: 'Clover', mercadopago: 'Mercado Pago' })[value] || value;
const PAGE_SIZE = 20;
const money = (value: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);
function isoDaysAgo(days: number) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

export function DataQualityScreen() {
  const { colors, isDark } = useAppTheme();
  const { width } = useWindowDimensions();
  const desktop = width >= breakpoints.tablet;
  const filtersSidebar = Platform.OS === 'web' && width >= breakpoints.desktop;
  const [activeTab, setActiveTab] = useState<QualityCategory>('duplicates');
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [selected, setSelected] = useState<QualityFinding | null>(null);
  const [paymentDetailVisible, setPaymentDetailVisible] = useState(false);
  const [referenceDraft, setReferenceDraft] = useState('');
  const [pageOffset, setPageOffset] = useState(0);
  const [filters, setFilters] = useState<QualityFilters>({
    from: isoDaysAgo(30),
    to: isoDaysAgo(0),
    provider: '',
    external_reference: '',
    min_amount: '',
    max_amount: '',
  });
  const [filterDraft, setFilterDraft] = useState<QualityFilters>(filters);
  const [filterApplyStartedAt, setFilterApplyStartedAt] = useState(0);
  const [filterApplyKey, setFilterApplyKey] = useState('');
  const rangeError = filterDraft.from > filterDraft.to;
  const queryKey = useMemo(() => JSON.stringify(filters), [filters]);
  const qualityQuery = useQuery({
    queryKey: ['data-quality', queryKey],
    queryFn: () => getDataQuality(filters),
    refetchOnWindowFocus: false,
    staleTime: 60_000,
  });
  const isApplyingFilters =
    filterApplyKey === queryKey &&
    qualityQuery.isFetching &&
    Math.max(qualityQuery.dataUpdatedAt, qualityQuery.errorUpdatedAt) < filterApplyStartedAt;
  const detailQuery = useQuery({
    queryKey: ['quality-detail', selected?.provider, selected?.payment_id],
    queryFn: () => getQualityPaymentDetail(selected!.provider, selected!.payment_id),
    enabled: Boolean(selected),
  });
  const normalizedReference = referenceDraft.trim().toLowerCase();
  const rows = (qualityQuery.data?.[activeTab] || []).filter((row) =>
    !normalizedReference || row.external_reference.toLowerCase().includes(normalizedReference),
  );
  const pageRows = rows.slice(pageOffset, pageOffset + PAGE_SIZE);
  const summary = qualityQuery.data?.summary;
  const activeCategoryUnavailable = Boolean(
    qualityQuery.data?.unavailableCategories.includes(activeTab),
  );
  const setDraftFilter = (key: keyof QualityFilters, value: string) =>
    setFilterDraft((current) => ({ ...current, [key]: value }));
  const applyFilters = () => {
    if (rangeError) return;
    const nextFilters = { ...filterDraft, external_reference: '' };
    setPageOffset(0);
    setFilterApplyStartedAt(Date.now());
    setFilterApplyKey(JSON.stringify(nextFilters));
    setFilters(nextFilters);
    if (!desktop) setFiltersVisible(false);
  };
  const rowColor = (row: QualityFinding) =>
    row.category === 'orphans' && row.reason === 'sale_not_found'
      ? (isDark ? colors.dangerSoft : '#F4BBB6')
      : (isDark ? colors.warningSoft : '#F5D184');
  const openFinding = (row: QualityFinding) => {
    setSelected(row);
    setPaymentDetailVisible(false);
  };

  return (
    <ScreenFrame description="Diagnóstico operativo de la información." hideHeader title="Calidad de datos">
      {!desktop ? (
        <View style={[styles.mobileFilters, { borderColor: colors.accent, backgroundColor: colors.surface }]}>
          <Text style={[styles.filterSummary, { color: colors.text }]}>{formatDate(filters.from)} — {formatDate(filters.to)}</Text>
          <Button variant="secondary" onPress={() => setFiltersVisible((value) => !value)}>{filtersVisible ? 'Ocultar filtros' : 'Mostrar filtros'}</Button>
        </View>
      ) : null}
      <FilterLoadingNotice visible={isApplyingFilters && qualityQuery.isFetching} />
      <View style={[styles.workspace, filtersSidebar && styles.workspaceDesktop]}>
      {desktop || filtersVisible ? (
        <Card
          title="Período de análisis"
          style={{
            ...styles.section,
            ...(filtersSidebar ? styles.sidebarFilters : {}),
            ...(filtersSidebar
              ? { left: Math.max(spacing.lg, (width - 1440) / 2 + spacing.lg) }
              : {}),
            borderColor: filtersSidebar ? colors.border : colors.accent,
          }}>
          <View style={styles.filters}>
            <View style={styles.filter}><DatePickerField label="Desde" value={filterDraft.from} onChange={(value) => setDraftFilter('from', value)} /></View>
            <View style={styles.filter}><DatePickerField label="Hasta" value={filterDraft.to} onChange={(value) => setDraftFilter('to', value)} /></View>
            <View style={styles.filter}><AmountField label="Importe mínimo" value={filterDraft.min_amount || ''} placeholder="Ej.: 10.000" onChangeText={(value) => setDraftFilter('min_amount', value)} /></View>
            <View style={styles.filter}><AmountField label="Importe máximo" value={filterDraft.max_amount || ''} placeholder="Ej.: 124.500,50" onChangeText={(value) => setDraftFilter('max_amount', value)} /></View>
            <View style={styles.filter}><SelectField label="Proveedor" value={filterDraft.provider || ''} options={providerOptions} onChange={(value) => setDraftFilter('provider', value)} /></View>
          </View>
          {rangeError ? <Text style={{ color: colors.danger }}>La fecha Desde no puede ser posterior a Hasta.</Text> : null}
          <Button disabled={rangeError} loading={isApplyingFilters && qualityQuery.isFetching} onPress={applyFilters}>
            Aplicar filtros
          </Button>
        </Card>
      ) : null}

      <View style={[styles.mainContent, filtersSidebar && styles.mainContentDesktop]}>
      {qualityQuery.isPending && !qualityQuery.data && !isApplyingFilters ? <FeedbackState title="Analizando calidad de datos" description="Revisando los datos sintéticos del período." /> : null}
      {qualityQuery.isError ? <FeedbackState title="No se pudo completar el análisis" description="Verificá la sesión y el backend aislado." actionLabel="Reintentar" onAction={() => qualityQuery.refetch()} /> : null}
      {qualityQuery.data ? (
        <Card title="Calidad de datos" style={{ ...styles.section, borderColor: colors.accent }}>
          <Text style={[styles.muted, { color: colors.textMuted }]}>Control de duplicados, referencias, ventas asociadas e importes.</Text>
          {qualityQuery.data.unavailableCategories.length ? (
            <View style={[styles.partialWarning, { backgroundColor: colors.warningSoft, borderColor: colors.warning }]}>
              <Text style={{ color: colors.text, fontWeight: '700' }}>Análisis parcial</Text>
              <Text style={{ color: colors.textMuted }}>
                No respondieron: {qualityQuery.data.unavailableCategories.map((category) =>
                  tabs.find((tab) => tab.key === category)?.label || category,
                ).join(', ')}. Se muestran solamente los datos del período que sí respondieron.
              </Text>
            </View>
          ) : null}
          {summary ? (
            <View style={[styles.metrics, styles.metricsEmbedded, { borderColor: colors.border }]}>
              {[
                ['Revisados', summary.checked_count],
                ['Válidos', summary.valid_count],
                ['Advertencias', summary.warning_count],
                ['Errores', summary.error_count],
              ].map(([label, value]) => (
                <View key={String(label)} style={[styles.metric, !desktop && styles.metricMobile, { borderColor: colors.border }]}>
                  <Text style={[styles.metricLabel, { color: colors.textMuted }]}>{label}</Text>
                  <Text
                    adjustsFontSizeToFit
                    minimumFontScale={0.55}
                    numberOfLines={1}
                    style={[styles.metricValue, { color: colors.text }]}>
                    {value}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
          <TextField
            label="Buscar referencia"
            onChangeText={setReferenceDraft}
            placeholder="Número de referencia"
            value={referenceDraft}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.tabs}>
              {tabs.map((tab) => (
                <Pressable key={tab.key} onPress={() => { setActiveTab(tab.key); setPageOffset(0); }} style={[styles.tab, activeTab === tab.key && { backgroundColor: colors.primarySoft, borderBottomColor: colors.primary }]}>
                  <Text
                    style={{
                      color: activeTab === tab.key ? (isDark ? '#FFFFFF' : '#102018') : colors.text,
                      fontWeight: '700',
                    }}>
                    {tab.label}
                  </Text>
                  <Badge
                    label={qualityQuery.data.unavailableCategories.includes(tab.key) ? '—' : String(qualityQuery.data[tab.key].length)}
                    tone={qualityQuery.data.unavailableCategories.includes(tab.key) || qualityQuery.data[tab.key].length ? 'warning' : 'success'}
                  />
                </Pressable>
              ))}
            </View>
          </ScrollView>
          {activeCategoryUnavailable ? (
            <FeedbackState
              title="Categoría no disponible"
              description="El servidor demoró demasiado. No se interpreta como cero ni como ausencia de hallazgos."
            />
          ) : null}
          {!rows.length && !activeCategoryUnavailable ? <FeedbackState title="Sin hallazgos" description="No se detectaron casos en esta categoría." /> : null}
          {desktop && rows.length ? (
            <ScrollView horizontal contentContainerStyle={styles.tableScroll}>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader, { backgroundColor: colors.surfaceMuted }]}>
                  {['FECHA', 'PROVEEDOR', 'REFERENCIA', 'IMPORTE', 'HALLAZGO'].map((label, index) => (
                    <Text
                      key={label}
                      style={[
                        styles.cell,
                        styles.headerText,
                        index === 3 && styles.numberCell,
                        index === 4 && styles.issueCell,
                        { color: colors.text },
                      ]}>
                      {label}
                    </Text>
                  ))}
                </View>
                {pageRows.map((row, index) => <QualityRow key={`${row.category}-${row.provider}-${row.payment_id}-${pageOffset + index}`} row={row} color={rowColor(row)} textColor={colors.text} onPress={() => openFinding(row)} />)}
              </View>
            </ScrollView>
          ) : null}
          {!desktop && rows.length ? <View style={styles.cards}>{pageRows.map((row, index) => (
            <Pressable key={`${row.category}-${row.provider}-${row.payment_id}-${pageOffset + index}`} onPress={() => openFinding(row)}>
              <Card style={{ ...styles.findingCard, backgroundColor: rowColor(row) }}>
                <View style={styles.rowBetween}><Text style={[styles.amount, { color: colors.text }]}>{money(row.amount)}</Text><Badge label={providerLabel(row.provider)} tone="warning" /></View>
                <Text style={{ color: colors.text, fontWeight: '700' }}>{row.issue}</Text>
                <View style={styles.rowBetween}><Text style={[styles.muted, { color: colors.textMuted }]}>{row.external_reference}</Text><Text style={[styles.muted, { color: colors.textMuted }]}>{formatDateTime(row.created_at)}</Text></View>
              </Card>
            </Pressable>
          ))}</View> : null}
          {rows.length > PAGE_SIZE ? (
            <View style={styles.pagination}>
              <Button
                disabled={pageOffset === 0}
                onPress={() => setPageOffset((value) => Math.max(0, value - PAGE_SIZE))}
                style={styles.paginationButton}
                variant="secondary">
                Anterior
              </Button>
              <View style={styles.paginationStatus}>
                <Text numberOfLines={1} style={[styles.paginationPage, { color: colors.text }]}>
                  {paginationPageLabel({ offset: pageOffset, pageSize: PAGE_SIZE })}
                </Text>
                <Text adjustsFontSizeToFit minimumFontScale={0.72} numberOfLines={1} style={[styles.paginationText, { color: colors.textMuted }]}>
                  {pageOffset + 1}{'\u2013'}{Math.min(pageOffset + PAGE_SIZE, rows.length)} de {rows.length}
                </Text>
              </View>
              <Button
                disabled={pageOffset + PAGE_SIZE >= rows.length}
                onPress={() => setPageOffset((value) => value + PAGE_SIZE)}
                style={styles.paginationButton}
                variant="secondary">
                Siguiente
              </Button>
            </View>
          ) : null}
        </Card>
      ) : null}
      </View>
      </View>

      <QualityFindingModal
        finding={selected}
        onClose={() => setSelected(null)}
        onViewPayment={() => setPaymentDetailVisible(true)}
        visible={Boolean(selected) && !paymentDetailVisible}
      />
      <PaymentDetailModal
        key={selected?.payment_id || 'quality-detail'}
        data={detailQuery.data}
        desktop={desktop}
        loading={detailQuery.isPending && Boolean(selected)}
        onClose={() => setPaymentDetailVisible(false)}
        selected={detailQuery.data?.payment || null}
        visible={Boolean(selected) && paymentDetailVisible}
      />
    </ScreenFrame>
  );
}

function findingContent(finding: QualityFinding) {
  if (finding.category === 'duplicates') {
    return {
      title: 'Posible pago duplicado',
      severity: 'Advertencia',
      tone: 'warning' as const,
      reason: 'El pago comparte el mismo proveedor e ID externo exacto con otro registro.',
      recommendation: 'Compará ambas referencias y proveedores antes de realizar cualquier corrección. Este análisis no elimina ni modifica registros.',
      affected: 'Referencia, fecha, importe y proveedor',
    };
  }
  if (finding.category === 'missing') {
    return {
      title: 'Información incompleta',
      severity: 'Advertencia',
      tone: 'warning' as const,
      reason: `Faltan campos necesarios: ${(finding.missing_fields || []).join(', ') || 'sin identificar'}.`,
      recommendation: 'Revisá el origen del pago y su sincronización. Completá el dato únicamente mediante el proceso controlado del backend.',
      affected: (finding.missing_fields || []).join(', ') || 'Campos del pago',
    };
  }
  if (finding.category === 'orphans') {
    const pendingClose = finding.reason === 'sale_pending_cash_register_close';
    return {
      title: pendingClose ? 'Venta pendiente de cierre de caja' : 'Pago sin venta asociada',
      severity: pendingClose ? 'Revisión pendiente' : 'Error',
      tone: pendingClose ? 'warning' as const : 'danger' as const,
      reason: pendingClose
        ? 'El pago es del día actual y la venta puede aparecer cuando cierre la caja.'
        : 'No se encontró una venta asociada para la referencia del pago.',
      recommendation: pendingClose
        ? 'Esperá el cierre de caja y volvé a ejecutar el análisis. No se considera una diferencia definitiva.'
        : 'Verificá la referencia en ventas y el estado de sincronización de la sucursal.',
      affected: 'Relación entre pago, venta y cierre de caja',
    };
  }
  return {
    title: 'Importe atípico',
    severity: 'Advertencia',
    tone: 'warning' as const,
    reason: `El importe del pago ${money(finding.amount)} difiere del valor de referencia ${money(finding.reference_amount || 0)}.`,
    recommendation: 'Compará el comprobante, la venta y sus devoluciones antes de confirmar una diferencia.',
    affected: 'Importe cobrado y total de venta',
  };
}

function QualityFindingModal({
  finding,
  visible,
  onClose,
  onViewPayment,
}: {
  finding: QualityFinding | null;
  visible: boolean;
  onClose: () => void;
  onViewPayment: () => void;
}) {
  const { colors } = useAppTheme();
  if (!finding) return null;
  const content = findingContent(finding);
  const accent = content.tone === 'danger' ? colors.danger : colors.warning;
  const soft = content.tone === 'danger' ? colors.dangerSoft : colors.warningSoft;
  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <View style={[styles.modalBackdrop, { backgroundColor: colors.overlay }]}>
        <View style={[styles.findingModal, { backgroundColor: colors.surfaceElevated, borderTopColor: accent }]}>
          <View style={styles.findingHeader}>
            <View style={styles.findingHeading}>
              <Text style={[styles.findingEyebrow, { color: colors.textMuted }]}>DETALLE DEL HALLAZGO</Text>
              <Text style={[styles.findingTitle, { color: colors.text }]}>{content.title}</Text>
              <Text style={[styles.muted, { color: colors.textMuted }]}>
                {providerLabel(finding.provider)} · {finding.external_reference}
              </Text>
            </View>
            <Button variant="ghost" onPress={onClose}>Cerrar</Button>
          </View>
          <Badge label={content.severity} tone={content.tone} />
          <ScrollView contentContainerStyle={styles.findingBody}>
            <View style={[styles.findingReason, { backgroundColor: soft, borderColor: accent }]}>
              <Text style={[styles.findingSectionTitle, { color: colors.text }]}>Por qué se detectó</Text>
              <Text style={[styles.findingText, { color: colors.text }]}>{content.reason}</Text>
            </View>
            <View style={[styles.findingInfo, { borderColor: colors.border }]}>
              <Text style={[styles.findingSectionTitle, { color: colors.text }]}>Datos afectados</Text>
              <Text style={[styles.findingText, { color: colors.textMuted }]}>{content.affected}</Text>
              <View style={styles.findingPairs}>
                <Text style={[styles.findingText, styles.findingPairLabel, { color: colors.textMuted }]}>Fecha</Text>
                <Text style={[styles.findingValue, styles.findingPairValue, { color: colors.text }]}>{formatDateTime(finding.created_at)}</Text>
                <Text style={[styles.findingText, styles.findingPairLabel, { color: colors.textMuted }]}>Importe</Text>
                <Text style={[styles.findingValue, styles.findingPairValue, { color: colors.text }]}>{money(finding.amount)}</Text>
              </View>
            </View>
            <View style={[styles.findingInfo, { borderColor: colors.border }]}>
              <Text style={[styles.findingSectionTitle, { color: colors.text }]}>Recomendación</Text>
              <Text style={[styles.findingText, { color: colors.text }]}>{content.recommendation}</Text>
            </View>
          </ScrollView>
          <View style={styles.findingActions}>
            <Button variant="secondary" onPress={onClose}>Volver</Button>
            <Button onPress={onViewPayment}>Ver detalle del pago</Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function QualityRow({ row, color, textColor, onPress }: { row: QualityFinding; color: string; textColor: string; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.tableRow, { backgroundColor: color }]}>
    <Text style={[styles.cell, { color: textColor }]}>{formatDateTime(row.created_at)}</Text>
    <Text style={[styles.cell, { color: textColor }]}>{providerLabel(row.provider)}</Text>
    <Text style={[styles.cell, { color: textColor }]}>{row.external_reference}</Text>
    <Text style={[styles.cell, styles.numberCell, { color: textColor }]}>{money(row.amount)}</Text>
    <Text style={[styles.cell, styles.issueCell, { color: textColor }]}>{row.issue}</Text>
  </Pressable>;
}

const styles = StyleSheet.create({
  workspace: { gap: spacing.lg },
  workspaceDesktop: { paddingLeft: 304, alignItems: 'flex-start' },
  mainContent: { gap: spacing.lg },
  mainContentDesktop: { flex: 1, minWidth: 0 },
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
  section: { borderTopWidth: 4 },
  mobileFilters: { borderWidth: 1, borderTopWidth: 4, borderRadius: radii.lg, padding: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  filterSummary: { flex: 1, fontSize: 12, fontWeight: '600' },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  filter: { flexGrow: 1, flexBasis: 220, minWidth: 190 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap' },
  metricsEmbedded: { overflow: 'hidden', borderWidth: 1, borderRadius: radii.md },
  metric: { flexGrow: 1, flexBasis: 170, minHeight: 72, padding: spacing.md, justifyContent: 'center', gap: 4, borderRightWidth: 1 },
  metricMobile: { flexGrow: 0, flexBasis: '50%', minHeight: 84 },
  metricLabel: { fontSize: 11, fontWeight: '600' },
  metricValue: { fontSize: 19, fontWeight: '700' },
  partialWarning: { borderWidth: 1, borderRadius: radii.md, padding: spacing.md, gap: spacing.xs },
  pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.xs },
  paginationButton: { width: 96, flexShrink: 0 },
  paginationStatus: { flex: 1, minWidth: 0, alignItems: 'center' },
  paginationPage: { fontSize: 13, fontWeight: '700' },
  paginationText: { width: '100%', textAlign: 'center', fontSize: 12 },
  tabs: { flexDirection: 'row', minWidth: '100%' },
  tab: { minWidth: 180, minHeight: 48, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tableScroll: { flexGrow: 1 },
  table: { minWidth: 800, width: '100%' },
  tableRow: { minHeight: 40, flexDirection: 'row', alignItems: 'center' },
  tableHeader: { borderRadius: radii.sm },
  cell: { flex: 1, minWidth: 130, paddingHorizontal: 8, fontSize: 12 },
  issueCell: { flex: 1.5, fontWeight: '600' },
  headerText: { fontSize: 10, fontWeight: '800' },
  numberCell: { textAlign: 'right', fontVariant: ['tabular-nums'] },
  cards: { gap: spacing.sm },
  findingCard: { padding: spacing.md },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  amount: { fontSize: 18, fontWeight: '700' },
  modalBackdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.md },
  findingModal: { width: '100%', maxWidth: 720, maxHeight: '90%', borderTopWidth: 6, borderRadius: radii.xl, padding: spacing.md, gap: spacing.md, overflow: 'hidden' },
  findingHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md },
  findingHeading: { flex: 1, gap: 4 },
  findingEyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  findingTitle: { fontSize: 22, fontWeight: '700' },
  findingBody: { gap: spacing.md },
  findingReason: { borderWidth: 1, borderRadius: radii.lg, padding: spacing.md, gap: spacing.xs },
  findingInfo: { borderWidth: 1, borderRadius: radii.lg, padding: spacing.md, gap: spacing.sm },
  findingSectionTitle: { fontSize: 15, fontWeight: '700' },
  findingText: { fontSize: 13, lineHeight: 19 },
  findingValue: { fontSize: 13, lineHeight: 19, fontWeight: '700', textAlign: 'right' },
  findingPairs: { marginTop: spacing.xs, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  findingPairLabel: { width: '42%' },
  findingPairValue: { flex: 1, minWidth: '52%' },
  findingActions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: spacing.sm },
});
