import { useQuery } from '@tanstack/react-query';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { ScreenFrame } from '@/components/layout/screen-frame';
import { Badge } from '@/components/ui/badge';
import { AmountField } from '@/components/ui/amount-field';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ExportDialog } from '@/components/ui/export-dialog';
import { FeedbackState } from '@/components/ui/feedback-state';
import { TextField } from '@/components/ui/text-field';
import {
  getAllPayments,
  getPaymentCatalogs,
  getPaymentDetail,
  getPayments,
  getPaymentsSummary,
  Payment,
  PaymentFilters,
} from '@/features/payments/payments.api';
import { PaymentDetailModal } from '@/features/payments/payment-detail-modal';
import { breakpoints, radii, spacing, typography } from '@/theme/tokens';
import { useAppTheme } from '@/theme/theme-provider';
import { formatDate, formatDateTime } from '@/utils/date-format';
import { exportCsv } from '@/utils/file-export';

const PAGE_SIZE = 20;
const providers: Record<string, string> = {
  clover: 'Clover',
  mercadopago: 'Mercado Pago',
};
const statuses: Record<string, string> = {
  approved: 'Aprobado',
  rejected: 'Rechazado',
  pending: 'Pendiente',
  refunded: 'Devuelto',
};
const readable = (value: string) =>
  value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

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
    maximumFractionDigits: 0,
  }).format(value);
}

function dateTime(value: string) {
  return formatDateTime(value);
}

function isoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function DatePickerField({
  label,
  value,
  onChange,
  compact = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
}) {
  const { colors } = useAppTheme();
  const initialDate = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T12:00:00`)
    : new Date();
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(
    new Date(initialDate.getFullYear(), initialDate.getMonth(), 1),
  );
  const calendarDays = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: firstWeekday + daysInMonth }, (_, index) =>
      index < firstWeekday ? null : new Date(year, month, index - firstWeekday + 1),
    );
  }, [visibleMonth]);
  const monthLabel = new Intl.DateTimeFormat('es-AR', {
    month: 'long',
    year: 'numeric',
  }).format(visibleMonth);

  const showCalendar = () => {
    setVisibleMonth(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
    setOpen(true);
  };

  return (
    <View style={[styles.selectGroup, compact && styles.sidebarSelectGroup]}>
      <Text
        style={[styles.fieldLabel, compact && styles.sidebarFieldLabel, { color: colors.text }]}>
        {label}
      </Text>
      <Pressable
        accessibilityLabel={`${label}: ${formatDate(value)}. Abrir calendario`}
        accessibilityRole="button"
        onPress={showCalendar}
        style={[
          styles.selectField,
          compact && styles.sidebarSelectField,
          { backgroundColor: colors.surface, borderColor: colors.borderStrong },
        ]}>
        <Text
          style={[styles.selectValue, compact && styles.sidebarSelectValue, { color: colors.text }]}>
          {formatDate(value)}
        </Text>
        <Ionicons color={colors.primary} name="calendar-outline" size={18} />
      </Pressable>
      <Modal
        animationType="fade"
        onRequestClose={() => setOpen(false)}
        transparent
        visible={open}>
        <Pressable
          onPress={() => setOpen(false)}
          style={[styles.selectBackdrop, { backgroundColor: colors.overlay }]}>
          <Pressable
            accessibilityViewIsModal
            onPress={(event) => event.stopPropagation()}
            style={[styles.calendarModal, { backgroundColor: colors.surfaceElevated }]}>
            <View style={styles.calendarHeader}>
              <Button
                accessibilityLabel="Mes anterior"
                onPress={() =>
                  setVisibleMonth(
                    (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1),
                  )
                }
                variant="ghost">
                ‹
              </Button>
              <Text style={[styles.calendarTitle, { color: colors.text }]}>{monthLabel}</Text>
              <Button
                accessibilityLabel="Mes siguiente"
                onPress={() =>
                  setVisibleMonth(
                    (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1),
                  )
                }
                variant="ghost">
                ›
              </Button>
            </View>
            <View style={styles.calendarGrid}>
              {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day) => (
                <Text key={day} style={[styles.calendarWeekday, { color: colors.textMuted }]}>
                  {day}
                </Text>
              ))}
              {calendarDays.map((date, index) =>
                date ? (
                  <Pressable
                    accessibilityRole="button"
                    key={isoDate(date)}
                    onPress={() => {
                      onChange(isoDate(date));
                      setOpen(false);
                    }}
                    style={[
                      styles.calendarDay,
                      isoDate(date) === value && { backgroundColor: colors.primary },
                    ]}>
                    <Text
                      style={[
                        styles.calendarDayText,
                        { color: isoDate(date) === value ? colors.onPrimary : colors.text },
                      ]}>
                      {date.getDate()}
                    </Text>
                  </Pressable>
                ) : (
                  <View key={`empty-${index}`} style={styles.calendarDay} />
                ),
              )}
            </View>
            <View style={styles.calendarActions}>
              <Button
                onPress={() => {
                  onChange(isoDate(new Date()));
                  setOpen(false);
                }}
                variant="secondary">
                Hoy
              </Button>
              <Button onPress={() => setOpen(false)} variant="ghost">
                Cerrar
              </Button>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function tone(status: string): 'success' | 'danger' | 'warning' | 'neutral' {
  if (status === 'approved') return 'success';
  if (status === 'rejected') return 'danger';
  if (status === 'pending') return 'warning';
  return 'neutral';
}

function rowBackground(
  status: string,
  colors: ReturnType<typeof useAppTheme>['colors'],
  isDark: boolean,
) {
  if (!isDark) {
    if (status === 'approved') return '#B9E4CB';
    if (status === 'rejected') return '#F4BBB6';
    if (status === 'pending' || status === 'refunded') return '#F5D184';
    return colors.surface;
  }
  if (status === 'approved') return colors.successSoft;
  if (status === 'rejected') return colors.dangerSoft;
  if (status === 'pending' || status === 'refunded') return colors.warningSoft;
  return colors.surface;
}

function paymentMethod(payment: Payment) {
  return payment.card_last_four
    ? `${payment.card_brand} •••• ${payment.card_last_four}`
    : payment.payment_method;
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
  compact = false,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  compact?: boolean;
}) {
  const { colors } = useAppTheme();
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find((option) => option.value === value)?.label || 'Todos';

  return (
    <View style={[styles.selectGroup, compact && styles.sidebarSelectGroup]}>
      <Text
        style={[styles.fieldLabel, compact && styles.sidebarFieldLabel, { color: colors.text }]}>
        {label}
      </Text>
      <Pressable
        accessibilityLabel={`${label}: ${selectedLabel}`}
        accessibilityRole="button"
        onPress={() => setOpen(true)}
        style={[
          styles.selectField,
          compact && styles.sidebarSelectField,
          {
            backgroundColor: colors.surface,
            borderColor: value ? colors.primary : colors.borderStrong,
          },
        ]}>
        <Text
          numberOfLines={1}
          style={[
            styles.selectValue,
            compact && styles.sidebarSelectValue,
            { color: value ? colors.text : colors.textMuted },
          ]}>
          {selectedLabel}
        </Text>
        <Text style={[styles.selectArrow, { color: colors.primary }]}>⌄</Text>
      </Pressable>
      <Modal
        animationType="fade"
        onRequestClose={() => setOpen(false)}
        transparent
        visible={open}>
        <Pressable
          onPress={() => setOpen(false)}
          style={[styles.selectBackdrop, { backgroundColor: colors.overlay }]}>
          <Pressable
            accessibilityViewIsModal
            onPress={(event) => event.stopPropagation()}
            style={[styles.selectMenu, { backgroundColor: colors.surfaceElevated }]}>
            <View style={styles.selectMenuHeader}>
              <Text style={[styles.selectMenuTitle, { color: colors.text }]}>{label}</Text>
              <Button onPress={() => setOpen(false)} variant="ghost">
                Cerrar
              </Button>
            </View>
            <ScrollView contentContainerStyle={styles.selectOptions}>
              {options.map((option) => {
                const selected = option.value === value;
                return (
                  <Pressable
                    accessibilityRole="button"
                    key={option.value}
                    onPress={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    style={[
                      styles.selectOption,
                      {
                        backgroundColor: selected ? colors.primarySoft : colors.surface,
                        borderColor: selected ? colors.primary : colors.border,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.selectOptionLabel,
                        { color: selected ? colors.primary : colors.text },
                      ]}>
                      {option.label}
                    </Text>
                    {selected ? (
                      <Text style={[styles.selectCheck, { color: colors.primary }]}>✓</Text>
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function PaymentRow({
  payment,
  desktop,
  onPress,
}: {
  payment: Payment;
  desktop: boolean;
  onPress: () => void;
}) {
  const { colors, isDark } = useAppTheme();
  if (!desktop) {
    return (
      <Pressable onPress={onPress}>
        <Card
          style={{
            ...styles.paymentCard,
            backgroundColor: rowBackground(payment.status, colors, isDark),
          }}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={[styles.paymentAmount, { color: colors.text }]}>
                {money(payment.amount)}
              </Text>
              <Text style={[styles.muted, { color: colors.textMuted }]}>
                {providers[payment.provider] || payment.provider} · {paymentMethod(payment)}
              </Text>
            </View>
            <Badge label={payment.status_label} tone={tone(payment.status)} />
          </View>
          <View style={styles.rowBetween}>
            <Text style={[styles.muted, { color: colors.textMuted }]}>
              {formatDate(payment.created_date)}
            </Text>
            <Text style={[styles.muted, { color: colors.textMuted }]}>{payment.branch_name}</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={[styles.muted, { color: colors.textMuted }]}>
              Devuelto: {money(payment.refund_amount)}
            </Text>
            <Text style={[styles.muted, { color: colors.textMuted }]}>
              {payment.terminal_name}
            </Text>
          </View>
        </Card>
      </Pressable>
    );
  }
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.tableRow,
        {
          backgroundColor: rowBackground(payment.status, colors, isDark),
          borderBottomColor: colors.border,
        },
      ]}>
      <Text style={[styles.dateCell, { color: colors.text }]}>
        {dateTime(payment.created_at)}
      </Text>
      <Text style={[styles.providerCell, { color: colors.text }]}>
        {providers[payment.provider] || payment.provider}
      </Text>
      <Text numberOfLines={1} style={[styles.statusCell, { color: colors.text }]}>
        {payment.status_label}
      </Text>
      <Text style={[styles.moneyCell, { color: colors.text }]}>
        {money(payment.amount)}
      </Text>
      <Text style={[styles.refundCell, { color: colors.text }]}>
        {money(payment.refund_amount)}
      </Text>
      <Text style={[styles.methodCell, { color: colors.text }]}>
        {readable(payment.payment_method)}
      </Text>
      <Text style={[styles.cardCell, { color: colors.text }]}>
        {readable(payment.card_brand)}
      </Text>
      <Text style={[styles.lastFourCell, { color: colors.text }]}>
        {payment.card_last_four || '—'}
      </Text>
      <Text numberOfLines={1} style={[styles.terminalCell, { color: colors.text }]}>
        {payment.terminal_name}
      </Text>
    </Pressable>
  );
}

export function PaymentsScreen() {
  const { colors, isDark } = useAppTheme();
  const { width } = useWindowDimensions();
  const desktop = width >= breakpoints.tablet;
  const filtersSidebar = Platform.OS === 'web' && width >= breakpoints.desktop;
  const routeParams = useLocalSearchParams<{
    from?: string;
    to?: string;
    status?: string;
    provider?: string;
  }>();
  const [filters, setFilters] = useState<PaymentFilters>({
    from: routeParams.from || daysAgo(30),
    to: routeParams.to || daysAgo(0),
    provider: routeParams.provider || '',
    status: routeParams.status || '',
    external_reference: '',
    min_amount: '',
    max_amount: '',
    limit: PAGE_SIZE,
    offset: 0,
  });
  const [mobileFiltersVisible, setMobileFiltersVisible] = useState(false);
  const [exportVisible, setExportVisible] = useState(false);
  const [selected, setSelected] = useState<Payment | null>(null);
  const filterKey = useMemo(() => JSON.stringify(filters), [filters]);
  const paymentsQuery = useQuery({
    queryKey: ['payments', filterKey],
    queryFn: () => getPayments(filters),
  });
  const summaryQuery = useQuery({
    queryKey: ['payments-summary', filterKey],
    queryFn: () => getPaymentsSummary(filters),
  });
  const catalogsQuery = useQuery({ queryKey: ['payment-catalogs'], queryFn: getPaymentCatalogs });
  const detailQuery = useQuery({
    queryKey: ['payment-detail', selected?.provider, selected?.id],
    queryFn: () => getPaymentDetail(selected!.provider, selected!.id),
    enabled: Boolean(selected),
  });
  const setFilter = (key: keyof PaymentFilters, value: string | number) =>
    setFilters((current) => ({
      ...current,
      [key]: value,
      offset: key === 'offset' ? Number(value) : 0,
    }));
  async function handleExport() {
    const rows = await getAllPayments(filters);
    if (!rows.length) throw new Error('No hay pagos para exportar.');
    await exportCsv(`pagos_${filters.from}_${filters.to}`, [
      { label: 'Fecha', value: (row: Payment) => formatDateTime(row.created_at) },
      { label: 'Proveedor', value: (row: Payment) => providers[row.provider] || row.provider },
      { label: 'Estado', value: (row: Payment) => row.status_label },
      { label: 'Importe', value: (row: Payment) => row.amount.toFixed(2) },
      { label: 'Devuelto', value: (row: Payment) => row.refund_amount.toFixed(2) },
      { label: 'Método', value: (row: Payment) => row.payment_method },
      { label: 'Tarjeta', value: (row: Payment) => row.card_brand },
      { label: 'Últimos 4', value: (row: Payment) => row.card_last_four },
      { label: 'Terminal', value: (row: Payment) => row.terminal_name },
      { label: 'Sucursal', value: (row: Payment) => row.branch_name },
      { label: 'Cajero', value: (row: Payment) => row.cashier_name },
      { label: 'Referencia', value: (row: Payment) => row.external_reference },
    ], rows);
  }
  const metrics = summaryQuery.data
    ? ([
        ['Pagos', String(summaryQuery.data.payments_count), 'neutral'],
        ['Total cobrado', money(summaryQuery.data.total_collected_amount), 'success'],
        ['Aprobados', String(summaryQuery.data.approved_count), 'success'],
        ['Rechazados', String(summaryQuery.data.rejected_count), 'danger'],
        ['Pendientes', String(summaryQuery.data.pending_count), 'warning'],
      ] as const)
    : [];
  const activeFilterCount = [
    filters.provider,
    filters.status,
    filters.branch_id,
    filters.terminal_id,
    filters.payment_method,
    filters.card_brand,
    filters.cashier_id,
    filters.min_amount,
    filters.max_amount,
  ].filter(Boolean).length;

  return (
    <ScreenFrame
      description="Consulta operativa de cobros con filtros, totales y detalle de cada transacción."
      hideHeader
      title="Pagos">
      {!desktop ? (
        <View
          style={[
            styles.mobileFiltersBar,
            {
              backgroundColor: isDark ? colors.surface : '#E8F4ED',
              borderColor: colors.accent,
            },
          ]}>
          <View style={styles.mobileFiltersSummary}>
            <Text style={[styles.mobileFiltersTitle, { color: colors.text }]}>Filtros</Text>
            <Text numberOfLines={1} style={[styles.mobileFiltersPeriod, { color: colors.textMuted }]}>
              {formatDate(filters.from)} — {formatDate(filters.to)}
            </Text>
          </View>
          <Button
            onPress={() => setMobileFiltersVisible((visible) => !visible)}
            style={styles.mobileFiltersButton}
            variant={mobileFiltersVisible ? 'secondary' : 'primary'}>
            {mobileFiltersVisible
              ? 'Ocultar'
              : activeFilterCount
                ? `Mostrar (${activeFilterCount})`
                : 'Mostrar'}
          </Button>
        </View>
      ) : null}

      <View
        style={[
          styles.paymentsWorkspace,
          filtersSidebar && styles.paymentsWorkspaceDesktop,
        ]}>
      {desktop || mobileFiltersVisible ? <Card
        accessory={
          !desktop ? (
            <Button
              onPress={() => setMobileFiltersVisible(false)}
              style={styles.mobileFiltersButton}
              variant="ghost">
              Ocultar
            </Button>
          ) : undefined
        }
        description={filtersSidebar ? undefined : 'Los resultados y totales usan los mismos criterios.'}
        style={{
          ...styles.filtersCard,
          ...(filtersSidebar ? styles.desktopFiltersCard : {}),
          ...(filtersSidebar
            ? { left: Math.max(spacing.lg, (width - 1440) / 2 + spacing.lg) }
            : {}),
          backgroundColor: colors.surface,
          borderColor: filtersSidebar ? colors.border : colors.accent,
          borderTopColor: filtersSidebar ? colors.border : colors.accent,
        }}
        title="Filtros">
        <View style={styles.filterGrid}>
          <View style={styles.filterItem}>
            <DatePickerField
              compact={filtersSidebar}
              label="Desde"
              onChange={(value) => setFilter('from', value)}
              value={filters.from}
            />
          </View>
          <View style={styles.filterItem}>
            <DatePickerField
              compact={filtersSidebar}
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
              style={filtersSidebar ? styles.sidebarTextInput : undefined}
              value={filters.min_amount || ''}
            />
          </View>
          <View style={styles.filterItem}>
            <AmountField
              label="Importe máximo"
              onChangeText={(value) => setFilter('max_amount', value)}
              placeholder="Ej.: 124.500,50"
              style={filtersSidebar ? styles.sidebarTextInput : undefined}
              value={filters.max_amount || ''}
            />
          </View>
          <View style={styles.filterItem}>
            <FilterSelect
              compact={filtersSidebar}
              label="Proveedor"
              onChange={(value) => setFilter('provider', value)}
              options={[
                { value: '', label: 'Todos' },
                ...(catalogsQuery.data?.providers || []).map((value) => ({
                  value,
                  label: providers[value] || value,
                })),
              ]}
              value={filters.provider || ''}
            />
          </View>
          <View style={styles.filterItem}>
            <FilterSelect
              compact={filtersSidebar}
              label="Estado"
              onChange={(value) => setFilter('status', value)}
              options={[
                { value: '', label: 'Todos' },
                ...(catalogsQuery.data?.statuses || []).map((value) => ({
                  value,
                  label: statuses[value] || value,
                })),
              ]}
              value={filters.status || ''}
            />
          </View>
          <View style={styles.filterItem}>
            <FilterSelect
              compact={filtersSidebar}
              label="Sucursal"
              onChange={(value) =>
                setFilters((current) => ({
                  ...current,
                  branch_id: value,
                  terminal_id: '',
                  offset: 0,
                }))
              }
              options={[
                { value: '', label: 'Todas' },
                ...(catalogsQuery.data?.branches || []).map((item) => ({
                  value: item.id,
                  label: item.name,
                })),
              ]}
              value={filters.branch_id || ''}
            />
          </View>
          <View style={styles.filterItem}>
            <FilterSelect
              compact={filtersSidebar}
              label="Terminal"
              onChange={(value) => setFilter('terminal_id', value)}
              options={[
                { value: '', label: 'Todas' },
                ...(catalogsQuery.data?.terminals || [])
                  .filter((item) => !filters.branch_id || item.branch_id === filters.branch_id)
                  .map((item) => ({ value: item.id, label: item.name })),
              ]}
              value={filters.terminal_id || ''}
            />
          </View>
          <View style={styles.filterItem}>
            <FilterSelect
              compact={filtersSidebar}
              label="Medio de pago"
              onChange={(value) => setFilter('payment_method', value)}
              options={[
                { value: '', label: 'Todos' },
                ...(catalogsQuery.data?.payment_methods || []).map((value) => ({
                  value,
                  label: readable(value),
                })),
              ]}
              value={filters.payment_method || ''}
            />
          </View>
          <View style={styles.filterItem}>
            <FilterSelect
              compact={filtersSidebar}
              label="Marca"
              onChange={(value) => setFilter('card_brand', value)}
              options={[
                { value: '', label: 'Todas' },
                ...(catalogsQuery.data?.card_brands || []).map((value) => ({
                  value,
                  label: readable(value),
                })),
              ]}
              value={filters.card_brand || ''}
            />
          </View>
          <View style={styles.filterItem}>
            <FilterSelect
              compact={filtersSidebar}
              label="Cajero"
              onChange={(value) => setFilter('cashier_id', value)}
              options={[
                { value: '', label: 'Todos' },
                ...(catalogsQuery.data?.cashiers || []).map((item) => ({
                  value: item.id,
                  label: item.name,
                })),
              ]}
              value={filters.cashier_id || ''}
            />
          </View>
        </View>
      </Card> : null}

      <View
        style={[
          styles.paymentsMain,
          filtersSidebar && styles.paymentsMainDesktop,
        ]}>
      {paymentsQuery.isPending ? (
        <FeedbackState
          description="Consultando datos del ambiente aislado."
          title="Cargando pagos"
        />
      ) : null}
      {paymentsQuery.isError ? (
        <FeedbackState
          actionLabel="Reintentar"
          description="Verificá que el backend de desarrollo continúe activo en el puerto 5001."
          onAction={() => paymentsQuery.refetch()}
          title="No se pudieron cargar los pagos"
        />
      ) : null}
      {paymentsQuery.data ? (
        <Card
          accessory={<Badge label={`${paymentsQuery.data.total} resultados`} tone="info" />}
          style={{
            ...styles.operationsCard,
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderTopColor: colors.border,
          }}
          title="Operaciones">
          <View
            style={[
              styles.metricsRow,
              styles.integratedMetrics,
              { borderColor: colors.border },
            ]}>
            {metrics.map(([label, value, badgeTone]) => (
              <View
                key={label}
                style={[
                  styles.metricSegment,
                  {
                    backgroundColor: colors.surface,
                    borderColor: isDark ? colors.border : '#B9DAC6',
                  },
                ]}>
                <Text
                  style={[
                    styles.metricLabel,
                    {
                      color:
                        badgeTone === 'success'
                          ? colors.success
                          : badgeTone === 'danger'
                            ? colors.danger
                            : badgeTone === 'warning'
                              ? colors.warning
                              : colors.textMuted,
                    },
                  ]}>
                  {label}
                </Text>
                <Text style={[styles.metricValue, { color: colors.text }]}>{value}</Text>
              </View>
            ))}
          </View>
          <View style={styles.operationsSearch}>
            <View style={styles.operationsSearchField}><TextField
                label="Buscar referencia"
                onChangeText={(value) => setFilter('external_reference', value)}
                placeholder="Número de referencia"
                style={styles.compactInput}
                value={filters.external_reference}
              /></View>
            <Button disabled={!paymentsQuery.data.total} onPress={() => setExportVisible(true)} variant="secondary">Exportar</Button>
          </View>
          {desktop ? (
            <ScrollView
              contentContainerStyle={styles.tableScrollContent}
              horizontal
              style={styles.tableViewport}
              showsHorizontalScrollIndicator>
              <View style={styles.desktopTable}>
                <View style={[styles.tableHeader, { backgroundColor: colors.surfaceMuted }]}>
                  <Text style={[styles.dateCell, styles.tableHeaderText, { color: colors.text }]}>FECHA</Text>
                  <Text style={[styles.providerCell, styles.tableHeaderText, { color: colors.text }]}>PROVEEDOR</Text>
                  <Text style={[styles.statusCell, styles.tableHeaderText, { color: colors.text }]}>ESTADO</Text>
                  <Text style={[styles.moneyCell, styles.tableHeaderText, { color: colors.text }]}>IMPORTE</Text>
                  <Text style={[styles.refundCell, styles.tableHeaderText, { color: colors.text }]}>DEVUELTO</Text>
                  <Text style={[styles.methodCell, styles.tableHeaderText, { color: colors.text }]}>MÉTODO</Text>
                  <Text style={[styles.cardCell, styles.tableHeaderText, { color: colors.text }]}>TARJETA</Text>
                  <Text style={[styles.lastFourCell, styles.tableHeaderText, { color: colors.text }]}>ULT. 4</Text>
                  <Text style={[styles.terminalCell, styles.tableHeaderText, { color: colors.text }]}>TERMINAL</Text>
                </View>
                <View style={styles.tableRows}>
                  {paymentsQuery.data.items.length ? (
                    paymentsQuery.data.items.map((payment) => (
                      <PaymentRow
                        desktop
                        key={`${payment.provider}-${payment.id}`}
                        onPress={() => setSelected(payment)}
                        payment={payment}
                      />
                    ))
                  ) : (
                    <View style={[styles.emptyTableRow, { borderColor: colors.border }]}>
                      <Text style={[styles.emptyTableTitle, { color: colors.text }]}>
                        Sin resultados
                      </Text>
                      <Text style={[styles.muted, { color: colors.textMuted }]}>
                        No hay pagos que coincidan con la referencia o los filtros seleccionados.
                      </Text>
                      {filters.external_reference ? (
                        <Button
                          onPress={() => setFilter('external_reference', '')}
                          variant="secondary">
                          Limpiar búsqueda
                        </Button>
                      ) : null}
                    </View>
                  )}
                </View>
              </View>
            </ScrollView>
          ) : null}
          {!desktop ? (
            <View style={styles.paymentList}>
              {paymentsQuery.data.items.length ? (
                paymentsQuery.data.items.map((payment) => (
                  <PaymentRow
                    desktop={false}
                    key={`${payment.provider}-${payment.id}`}
                    onPress={() => setSelected(payment)}
                    payment={payment}
                  />
                ))
              ) : (
                <View style={[styles.emptyMobileResults, { borderColor: colors.border }]}>
                  <Text style={[styles.emptyTableTitle, { color: colors.text }]}>
                    Sin resultados
                  </Text>
                  <Text style={[styles.muted, { color: colors.textMuted }]}>
                    No hay pagos que coincidan con la referencia o los filtros seleccionados.
                  </Text>
                  {filters.external_reference ? (
                    <Button
                      onPress={() => setFilter('external_reference', '')}
                      variant="secondary">
                      Limpiar búsqueda
                    </Button>
                  ) : null}
                </View>
              )}
            </View>
          ) : null}
          {paymentsQuery.data.items.length ? <View style={styles.pagination}>
            <Button
              disabled={filters.offset === 0}
              onPress={() => setFilter('offset', Math.max(0, filters.offset - PAGE_SIZE))}
              variant="secondary">
              Anterior
            </Button>
            <Text style={[styles.muted, { color: colors.textMuted }]}>
              {filters.offset + 1}–
              {Math.min(filters.offset + PAGE_SIZE, paymentsQuery.data.total)} de{' '}
              {paymentsQuery.data.total}
            </Text>
            <Button
              disabled={!paymentsQuery.data.hasMore}
              onPress={() => setFilter('offset', filters.offset + PAGE_SIZE)}
              variant="secondary">
              Siguiente
            </Button>
          </View> : null}
        </Card>
      ) : null}
      </View>
      </View>

      <ExportDialog formats={['csv']} onClose={() => setExportVisible(false)} onExport={handleExport} visible={exportVisible} />

      <PaymentDetailModal
        data={detailQuery.data}
        desktop={desktop}
        loading={detailQuery.isPending}
        onClose={() => setSelected(null)}
        selected={selected}
        visible={Boolean(selected)}
      />
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  paymentsWorkspace: {
    gap: spacing.lg,
  },
  paymentsWorkspaceDesktop: {
    paddingLeft: 304,
    alignItems: 'flex-start',
  },
  paymentsMain: {
    gap: spacing.lg,
  },
  paymentsMainDesktop: {
    flex: 1,
    minWidth: 0,
    width: '100%',
    maxWidth: '100%',
  },
  desktopFiltersCard: {
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
  emptyTableRow: {
    minHeight: 128,
    borderBottomWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
  },
  emptyMobileResults: {
    minHeight: 180,
    borderWidth: 1,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
  },
  emptyTableTitle: {
    fontSize: typography.body,
    fontWeight: '800',
  },
  mobileFiltersBar: {
    minHeight: 58,
    borderWidth: 1,
    borderTopWidth: 4,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  mobileFiltersSummary: { flex: 1, gap: 2 },
  mobileFiltersTitle: { fontSize: 15, fontWeight: '900' },
  mobileFiltersPeriod: { fontSize: 11, lineHeight: 15 },
  mobileFiltersButton: { minHeight: 36, paddingVertical: 6, paddingHorizontal: 12 },
  filtersCard: { padding: spacing.md, gap: 10, borderTopWidth: 4 },
  filterGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  filterItem: { flexGrow: 1, flexShrink: 1, flexBasis: 210, minWidth: 180 },
  compactInput: { minHeight: 38, height: 38, fontSize: 13 },
  sidebarTextInput: {
    minHeight: 34,
    height: 34,
    paddingHorizontal: 10,
    fontSize: 12,
  },
  selectGroup: { gap: 6 },
  sidebarSelectGroup: { gap: 3 },
  fieldLabel: { fontSize: 13, fontWeight: '700' },
  sidebarFieldLabel: { fontSize: 11 },
  selectField: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
  },
  sidebarSelectField: {
    minHeight: 34,
    height: 34,
    paddingHorizontal: 10,
    borderRadius: radii.sm,
  },
  selectValue: { flex: 1, fontSize: 13, fontWeight: '700' },
  sidebarSelectValue: { fontSize: 12 },
  selectArrow: { fontSize: 20, fontWeight: '900' },
  selectBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  selectMenu: {
    width: '100%',
    maxWidth: 460,
    maxHeight: '78%',
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  selectMenuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  selectMenuTitle: { fontSize: 21, fontWeight: '900' },
  selectOptions: { gap: spacing.sm },
  selectOption: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  selectOptionLabel: { flex: 1, fontSize: 15, fontWeight: '700' },
  selectCheck: { fontSize: 18, fontWeight: '900' },
  calendarModal: {
    width: '100%',
    maxWidth: 390,
    borderRadius: radii.xl,
    padding: spacing.md,
    gap: spacing.md,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  calendarTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calendarWeekday: {
    width: '14.285%',
    paddingVertical: spacing.sm,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  calendarDay: {
    width: '14.285%',
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
  },
  calendarDayText: { fontSize: 14, fontWeight: '600' },
  calendarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  metricsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  integratedMetrics: {
    borderWidth: 1,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  metricSegment: {
    flexGrow: 1,
    flexBasis: 170,
    minWidth: 145,
    minHeight: 82,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    justifyContent: 'space-between',
    gap: spacing.sm,
    borderRightWidth: 1,
    borderBottomWidth: 1,
  },
  metricValue: { fontSize: 21, lineHeight: 26, fontWeight: '900' },
  metricLabel: { fontSize: 11, fontWeight: '700' },
  paymentList: { gap: spacing.sm },
  operationsCard: { borderTopWidth: 1 },
  operationsSearch: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end', gap: spacing.sm },
  operationsSearchField: { flex: 1, minWidth: 220 },
  tableRows: { gap: 1 },
  paymentCard: { padding: spacing.md },
  paymentAmount: { fontSize: 18, fontWeight: '900' },
  muted: { fontSize: 12, lineHeight: 18 },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  tableScrollContent: { flexGrow: 1 },
  tableViewport: { width: '100%', maxWidth: '100%', alignSelf: 'stretch' },
  desktopTable: { minWidth: 1040, width: '100%', flexGrow: 1 },
  tableHeader: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.sm,
  },
  tableRow: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderRadius: 3,
  },
  tableHeaderText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.15 },
  dateCell: {
    width: 135,
    flexGrow: 1.2,
    paddingHorizontal: 7,
    fontSize: 12,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  providerCell: {
    width: 105,
    flexGrow: 1,
    paddingHorizontal: 7,
    fontSize: 12,
    fontWeight: '600',
  },
  statusCell: {
    width: 150,
    flexGrow: 1.2,
    paddingHorizontal: 7,
    fontSize: 12,
    fontWeight: '500',
  },
  moneyCell: {
    width: 115,
    flexGrow: 1,
    paddingHorizontal: 7,
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    textAlign: 'right',
  },
  refundCell: {
    width: 110,
    flexGrow: 0.9,
    paddingHorizontal: 7,
    fontSize: 12,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
    textAlign: 'right',
  },
  methodCell: {
    width: 120,
    flexGrow: 1,
    paddingHorizontal: 7,
    fontSize: 12,
    fontWeight: '500',
  },
  cardCell: {
    width: 100,
    flexGrow: 0.9,
    paddingHorizontal: 7,
    fontSize: 12,
    fontWeight: '500',
  },
  lastFourCell: {
    width: 65,
    flexGrow: 0.55,
    paddingHorizontal: 7,
    fontSize: 12,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  terminalCell: {
    width: 140,
    flexGrow: 1.1,
    paddingHorizontal: 7,
    fontSize: 12,
    fontWeight: '500',
  },
  pagination: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  modalBackdropDesktop: { justifyContent: 'center', padding: spacing.lg },
  modal: {
    width: '100%',
    maxWidth: 720,
    maxHeight: '88%',
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  modalDesktop: {
    maxWidth: 900,
    maxHeight: '84%',
    borderRadius: radii.xl,
  },
  modalTitle: { fontSize: 22, fontWeight: '900' },
  detailList: { gap: spacing.xs, paddingBottom: spacing.xl },
  detailListDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: spacing.lg,
    paddingBottom: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  detailRowDesktop: {
    width: '48%',
    minHeight: 62,
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'center',
    padding: 10,
    gap: 4,
    borderWidth: 1,
    borderRadius: radii.md,
  },
  detailLabel: { flex: 1, fontSize: 13, fontWeight: '700' },
  detailLabelDesktop: { flex: 0, fontSize: 12 },
  detailValue: { flex: 2, fontSize: 13, fontWeight: '700', textAlign: 'right' },
  detailValueDesktop: { flex: 0, textAlign: 'left', fontSize: 14 },
});
