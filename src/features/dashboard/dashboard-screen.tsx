import { useQuery } from '@tanstack/react-query';
import { Href, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenFrame } from '@/components/layout/screen-frame';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FeedbackState } from '@/components/ui/feedback-state';
import {
  DailyPayment,
  getDailyPayments,
  getDashboardData,
  ProviderComparison,
} from '@/features/dashboard/dashboard.api';
import { radii, spacing } from '@/theme/tokens';
import { useAppTheme } from '@/theme/theme-provider';
import { formatDate } from '@/utils/date-format';

type Period = 'today' | 'week' | 'month';

function iso(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function startOfDay() {
  const value = new Date();
  value.setHours(12, 0, 0, 0);
  return value;
}

function addDays(date: Date, days: number) {
  const value = new Date(date);
  value.setDate(value.getDate() + days);
  return value;
}

function monthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 12);
}

function monthEnd(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 12);
}

function currency(value: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 2,
  }).format(value);
}

function providerName(value: string) {
  return ({ clover: 'Clover', mercadopago: 'Mercado Pago' })[value] || value;
}

const providerLogos = {
  clover: require('../../../assets/providers/clover.png'),
  mercadopago: require('../../../assets/providers/mercado-pago.png'),
};

function percentage(value: number) {
  return `${value.toLocaleString('es-AR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}

function previousWeekday(date: string) {
  return addDays(new Date(`${date}T12:00:00`), -1)
    .toLocaleDateString('es-AR', { weekday: 'long' })
    .toLowerCase();
}

function weekday(date: string) {
  return new Date(`${date}T12:00:00`)
    .toLocaleDateString('es-AR', { weekday: 'long' })
    .toLowerCase();
}

function comparisonText(value: number | null, subject: string) {
  if (value === null) return `No hay datos anteriores para comparar ${subject}.`;
  if (value > 0) return `${subject} subió ${percentage(Math.abs(value))}.`;
  if (value < 0) return `${subject} bajó ${percentage(Math.abs(value))}.`;
  return `${subject} no cambió.`;
}

type DailyComparison = {
  date: string;
  amount: number;
  variation: number | null;
};

function dailyComparison(rows: DailyPayment[], from: string, to: string): DailyComparison[] {
  const totals = new Map<string, number>();
  for (const row of rows) {
    totals.set(row.date, (totals.get(row.date) || 0) + row.total_amount);
  }

  const result: DailyComparison[] = [];
  let cursor = new Date(`${from}T12:00:00`);
  const last = new Date(`${to}T12:00:00`);
  let previous = totals.get(iso(addDays(cursor, -1))) || 0;

  while (cursor <= last) {
    const date = iso(cursor);
    const amount = totals.get(date) || 0;
    const variation = previous ? ((amount - previous) / previous) * 100 : null;
    result.push({ date, amount, variation });
    previous = amount;
    cursor = addDays(cursor, 1);
  }
  return result;
}

export function DashboardScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const currentMonth = monthStart(startOfDay());
  const [period, setPeriod] = useState<Period>('today');
  const [visibleMonth, setVisibleMonth] = useState(currentMonth);

  const range = useMemo(() => {
    const today = startOfDay();
    if (period === 'today') return { from: iso(today), to: iso(today) };
    if (period === 'week') return { from: iso(addDays(today, -6)), to: iso(today) };
    const end = monthEnd(visibleMonth);
    return {
      from: iso(monthStart(visibleMonth)),
      to: iso(visibleMonth.getTime() === currentMonth.getTime() ? today : end),
    };
  }, [currentMonth, period, visibleMonth]);

  const previousRange = useMemo(() => {
    const previous = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1, 12);
    return { from: iso(monthStart(previous)), to: iso(monthEnd(previous)) };
  }, [visibleMonth]);

  const dashboardQuery = useQuery({
    queryKey: ['dashboard', range.from, range.to],
    queryFn: () => getDashboardData(range.from, range.to),
  });
  const previousMonthQuery = useQuery({
    queryKey: ['dashboard-comparison', previousRange.from, previousRange.to],
    queryFn: () => getDashboardData(previousRange.from, previousRange.to),
    enabled: period === 'month',
  });
  const dailyQuery = useQuery({
    queryKey: ['dashboard-daily-comparison', range.from, range.to],
    queryFn: () => getDailyPayments(iso(addDays(new Date(`${range.from}T12:00:00`), -1)), range.to),
    enabled: period === 'week',
  });

  const summary = dashboardQuery.data?.summary;
  const reconciliation = dashboardQuery.data?.reconciliation;
  const problemCount = reconciliation
    ? (reconciliation.problem_count ??
      reconciliation.sale_not_found_count +
        reconciliation.amount_mismatch_count +
        reconciliation.pending_review_count)
    : 0;
  const previousAmount = previousMonthQuery.data?.summary.total_amount || 0;
  const monthVariation =
    period === 'month' && summary && previousAmount
      ? ((summary.total_amount - previousAmount) / previousAmount) * 100
      : null;
  const monthDifference = summary ? summary.total_amount - previousAmount : 0;
  const dailyRows = useMemo(
    () => dailyComparison(dailyQuery.data || [], range.from, range.to),
    [dailyQuery.data, range.from, range.to],
  );
  const maxDailyAmount = Math.max(1, ...dailyRows.map((row) => row.amount));
  const updatedAt = dashboardQuery.dataUpdatedAt
    ? new Intl.DateTimeFormat('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(dashboardQuery.dataUpdatedAt)
    : '';

  const navigate = (
    pathname: '/pagos' | '/conciliacion',
    options: { status?: string; provider?: string; from?: string; to?: string } = {},
  ) =>
    router.push({
      pathname,
      params: {
        from: options.from || range.from,
        to: options.to || range.to,
        ...(options.status ? { status: options.status } : {}),
        ...(options.provider ? { provider: options.provider } : {}),
      },
    } as Href);

  const metrics = summary
    ? [
        { label: 'Pagos', value: String(summary.payments_count), action: () => navigate('/pagos') },
        { label: 'Total cobrado', value: currency(summary.total_amount) },
        {
          label: 'Aprobados',
          value: String(summary.approved_count),
          action: () => navigate('/pagos', { status: 'approved' }),
        },
        {
          label: 'Devueltos',
          value: String(summary.refunds_count),
          warning: true,
          action: () => navigate('/pagos', { status: 'refunded' }),
        },
        {
          label: 'Pendientes',
          value: String(summary.pending_count),
          warning: true,
          action: () => navigate('/pagos', { status: 'pending' }),
        },
        {
          label: 'Con problema',
          value: String(problemCount),
          danger: true,
          action: () => navigate('/conciliacion'),
        },
      ]
    : [];

  return (
    <ScreenFrame
      contentStyle={styles.dashboardContent}
      description="Visión consolidada de pagos, comparaciones y estado operativo."
      hideHeader
      title="Resumen operativo">
      <View
        style={[
          styles.periodTabs,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}>
        {(
          [
            ['today', 'HOY'],
            ['week', 'ÚLTIMOS 7 DÍAS'],
            ['month', 'ESTE MES'],
          ] as [Period, string][]
        ).map(([key, label]) => (
          <Pressable
            accessibilityRole="tab"
            key={key}
            onPress={() => setPeriod(key)}
            style={[
              styles.periodTab,
              period === key && { backgroundColor: colors.primary },
            ]}>
            <Text
              style={[
                styles.periodLabel,
                { color: colors.text },
              ]}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      {period === 'month' ? (
        <View style={styles.monthNavigation}>
          <Button
            onPress={() =>
              setVisibleMonth(
                new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1, 12),
              )
            }
            variant="secondary">
            ‹
          </Button>
          <Text style={[styles.monthLabel, { color: colors.text }]}>
            {visibleMonth
              .toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
              .toUpperCase()}
          </Text>
          <Button
            disabled={visibleMonth.getTime() >= currentMonth.getTime()}
            onPress={() =>
              setVisibleMonth(
                new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1, 12),
              )
            }
            variant="secondary">
            ›
          </Button>
        </View>
      ) : null}

      {dashboardQuery.isPending ? (
        <FeedbackState
          description="Consultando el backend aislado de desarrollo."
          eyebrow="Conectando"
          title="Cargando resumen"
        />
      ) : null}
      {dashboardQuery.isError ? (
        <FeedbackState
          actionLabel="Reintentar"
          description="Verificá que paquete-webserver-dev esté ejecutándose en el puerto 5001."
          eyebrow="Sin conexión"
          onAction={() => dashboardQuery.refetch()}
          title="No se pudo cargar Inicio"
        />
      ) : null}

      {summary ? (
        <>
          <View
            style={[
              styles.metricsCard,
              { backgroundColor: colors.surface, borderColor: colors.accent },
            ]}>
            {metrics.map((metric, index) => {
              const content = (
                <View
                  style={[
                    styles.metric,
                    index > 0 && { borderLeftColor: colors.border, borderLeftWidth: 1 },
                  ]}>
                  <Text style={[styles.metricLabel, { color: colors.textMuted }]}>
                    {metric.label.toUpperCase()}
                    {metric.action ? ' ›' : ''}
                  </Text>
                  <Text
                    style={[
                      styles.metricValue,
                      {
                        color: metric.danger
                          ? colors.danger
                          : metric.warning
                            ? colors.warning
                            : colors.success,
                      },
                    ]}>
                    {metric.value}
                  </Text>
                </View>
              );
              return metric.action ? (
                <Pressable
                  accessibilityLabel={`${metric.label}: ${metric.value}`}
                  accessibilityRole="button"
                  key={metric.label}
                  onPress={metric.action}
                  style={styles.metricPressable}>
                  {content}
                </Pressable>
              ) : (
                <View key={metric.label} style={styles.metricPressable}>
                  {content}
                </View>
              );
            })}
          </View>

          {period === 'month' ? (
            <MonthComparison
              current={summary.total_amount}
              difference={monthDifference}
              loading={previousMonthQuery.isPending}
              previous={previousAmount}
              variation={monthVariation}
            />
          ) : null}

          {period === 'week' ? (
            <View style={styles.analysisSplit}>
              <DailyEvolution
                compact
                loading={dailyQuery.isPending}
                maxAmount={maxDailyAmount}
                onSelect={(date) => navigate('/pagos', { from: date, to: date })}
                rows={dailyRows}
              />
              <ProviderComparisonSection
                compact
                onSelect={(provider) => navigate('/pagos', { provider })}
                rows={dashboardQuery.data?.providers || []}
              />
            </View>
          ) : null}

          {period !== 'week' ? (
            <ProviderComparisonSection
              onSelect={(provider) => navigate('/pagos', { provider })}
              rows={dashboardQuery.data?.providers || []}
            />
          ) : null}

          <Card
            accessory={<Badge label="Operativo" tone="success" />}
            description="Servicios requeridos por la aplicación"
            title="Estado del sistema">
            <View style={styles.systemGrid}>
              {[
                ['API de desarrollo', 'Conectada'],
                ['Base de datos', 'Aislada / sin ODBC'],
                ['Sincronización', dashboardQuery.data?.sync.overall_status || 'Sin datos'],
                ['Actualización', 'Cada 5 segundos'],
              ].map(([label, statusValue]) => (
                <View
                  key={label}
                  style={[styles.statusRow, { borderBottomColor: colors.border }]}>
                  <View style={[styles.statusDot, { backgroundColor: colors.warning }]} />
                  <Text style={[styles.statusLabel, { color: colors.text }]}>{label}</Text>
                  <Text style={[styles.statusValue, { color: colors.textMuted }]}>
                    {statusValue}
                  </Text>
                </View>
              ))}
            </View>
          </Card>

          <View
            style={[styles.notice, { backgroundColor: colors.infoSoft, borderColor: colors.info }]}>
            <View style={[styles.noticeSymbol, { backgroundColor: colors.info }]}>
              <Text style={styles.noticeSymbolText}>DEV</Text>
            </View>
            <View style={styles.noticeCopy}>
              <Text style={[styles.noticeTitle, { color: colors.text }]}>
                Backend de desarrollo conectado
              </Text>
              <Text style={[styles.noticeDescription, { color: colors.textMuted }]}>
                Datos sintéticos del {formatDate(range.from)} al {formatDate(range.to)}.
                {updatedAt ? ` Actualizado automáticamente a las ${updatedAt}.` : ''}
              </Text>
            </View>
            <Badge label="Ambiente seguro" tone="info" />
          </View>
        </>
      ) : null}
    </ScreenFrame>
  );
}

function MonthComparison({
  current,
  previous,
  difference,
  variation,
  loading,
}: {
  current: number;
  previous: number;
  difference: number;
  variation: number | null;
  loading: boolean;
}) {
  const { colors } = useAppTheme();
  const positive = variation !== null && variation >= 0;
  const accent = variation === null ? colors.textMuted : positive ? colors.success : colors.danger;

  return (
    <Card
      accessory={
        <Badge
          label={loading ? 'Comparando' : variation === null ? 'Sin base' : positive ? 'Subió' : 'Bajó'}
          tone={variation === null ? 'neutral' : positive ? 'success' : 'danger'}
        />
      }
      description="Comparación del total cobrado con el mes calendario anterior"
      style={{ ...styles.comparisonCard, borderColor: colors.accent }}
      title="Evolución mensual">
      <View style={styles.comparisonMetrics}>
        <ComparisonValue label="MES SELECCIONADO" value={currency(current)} />
        <ComparisonValue label="MES ANTERIOR" value={loading ? 'Consultando…' : currency(previous)} />
        <ComparisonValue
          color={accent}
          label="DIFERENCIA"
          value={loading ? 'Consultando…' : currency(difference)}
        />
        <ComparisonValue
          color={accent}
          label="VARIACIÓN"
          value={loading || variation === null ? 'Sin base comparable' : percentage(variation)}
        />
      </View>
      {!loading ? (
        <Text style={[styles.comparisonExplanation, { color: accent }]}>
          {comparisonText(variation, 'El total cobrado')}
        </Text>
      ) : null}
    </Card>
  );
}

function ComparisonValue({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.comparisonValue, { borderColor: colors.border }]}>
      <Text style={[styles.comparisonLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.comparisonNumber, { color: color || colors.text }]}>{value}</Text>
    </View>
  );
}

function DailyEvolution({
  rows,
  maxAmount,
  loading,
  compact = false,
  onSelect,
}: {
  rows: DailyComparison[];
  maxAmount: number;
  loading: boolean;
  compact?: boolean;
  onSelect: (date: string) => void;
}) {
  const { colors, isDark } = useAppTheme();
  const dataTextColor = isDark ? '#102018' : colors.text;
  const dataMutedColor = isDark ? '#526158' : colors.textMuted;
  const dataBorderColor = isDark ? '#D4E1D8' : colors.border;
  const dataTrackColor = isDark ? '#E8F0EB' : colors.surfaceMuted;
  return (
    <Card
      description="Importe cobrado y variación respecto del día anterior"
      style={compact ? styles.splitCard : undefined}
      title="Pagos por día">
      {loading ? (
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>Calculando evolución…</Text>
      ) : (
        <View
          style={[
            styles.dailyList,
            isDark && {
              backgroundColor: '#FFFFFF',
              borderColor: dataBorderColor,
            },
          ]}>
          {rows.map((row) => {
            const positive = row.variation !== null && row.variation >= 0;
            const variationColor =
              row.variation === null
                ? dataMutedColor
                : positive
                  ? isDark
                    ? '#008A45'
                    : colors.success
                  : isDark
                    ? '#C62828'
                    : colors.danger;
            return (
              <Pressable
                accessibilityLabel={`Ver pagos del ${formatDate(row.date)}`}
                accessibilityRole="button"
                key={row.date}
                onPress={() => onSelect(row.date)}
                style={({ pressed }) => [
                  styles.dailyRow,
                  compact && styles.dailyRowCompact,
                  {
                    backgroundColor: pressed
                      ? '#F0F8F3'
                      : isDark
                        ? '#FFFFFF'
                        : 'transparent',
                    borderBottomColor: dataBorderColor,
                  },
                ]}>
                <View style={[styles.dailyDate, compact && styles.dailyDateCompact]}>
                  <Text style={[styles.dailyDayName, { color: dataMutedColor }]}>
                    {weekday(row.date)}
                  </Text>
                  <Text style={[styles.dailyDateValue, { color: dataTextColor }]}>
                    {formatDate(row.date)}
                  </Text>
                </View>
                <View style={[styles.dailyAmountArea, compact && styles.dailyAmountAreaCompact]}>
                  <View style={[styles.dailyTrack, { backgroundColor: dataTrackColor }]}>
                    <View
                      style={[
                        styles.dailyBar,
                        {
                          backgroundColor: colors.primary,
                          width: `${Math.round((row.amount / maxAmount) * 100)}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.dailyAmount,
                      compact && styles.dailyAmountCompact,
                      { color: dataTextColor },
                    ]}>
                    {currency(row.amount)}
                  </Text>
                </View>
                <View style={[styles.dailyVariation, compact && styles.dailyVariationCompact]}>
                  <Text style={[styles.dailyVariationValue, { color: variationColor }]}>
                    {row.variation === null
                      ? 'Sin dato previo'
                      : `${positive ? '↑' : '↓'} ${percentage(Math.abs(row.variation))}`}
                  </Text>
                  <Text style={[styles.dailyVariationCopy, { color: dataMutedColor }]}>
                    vs. {previousWeekday(row.date)}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}
    </Card>
  );
}

function ProviderComparisonSection({
  rows,
  compact = false,
  onSelect,
}: {
  rows: ProviderComparison[];
  compact?: boolean;
  onSelect: (provider: string) => void;
}) {
  const { colors } = useAppTheme();
  return (
    <Card
      description="Rendimiento del período seleccionado. Tocá un proveedor para abrir sus pagos."
      style={compact ? styles.splitCard : undefined}
      title="Comparación por proveedor">
      {!rows.length ? (
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
          No hay proveedores con actividad en el período.
        </Text>
      ) : (
        <View style={[styles.providerGrid, compact && styles.providerGridCompact]}>
          {rows.map((row) => (
            <Pressable
              accessibilityRole="button"
              key={row.provider}
              onPress={() => onSelect(row.provider)}
              style={({ pressed }) => [
                styles.providerCard,
                compact && styles.providerCardCompact,
                {
                  backgroundColor: pressed ? '#F0F8F3' : '#FFFFFF',
                  borderColor: '#D4E1D8',
                },
              ]}>
              <View style={styles.providerHeader}>
                {providerLogos[row.provider as keyof typeof providerLogos] ? (
                  <View style={styles.providerLogoFrame}>
                    <Image
                      accessibilityLabel={`Logo de ${providerName(row.provider)}`}
                      resizeMode="contain"
                      source={providerLogos[row.provider as keyof typeof providerLogos]}
                      style={styles.providerLogo}
                    />
                  </View>
                ) : (
                  <Text style={[styles.providerTitle, { color: '#102018' }]}>
                    {providerName(row.provider)}
                  </Text>
                )}
                <Text style={[styles.providerLink, { color: colors.primary }]}>Ver pagos ›</Text>
              </View>
              <Text
                style={[
                  styles.providerTotal,
                  compact && styles.providerTotalCompact,
                  { color: '#008A45' },
                ]}>
                {currency(row.total_amount)}
              </Text>
              <View style={styles.providerMetrics}>
                <ProviderValue label="Pagos" value={String(row.payments_count)} />
                <ProviderValue label="Aprobación" value={percentage(row.approved_rate)} />
                <ProviderValue label="Rechazo" value={percentage(row.rejected_rate)} />
                <ProviderValue label="Ticket promedio" value={currency(row.average_ticket)} />
                <ProviderValue label="Devuelto" value={currency(row.refund_amount)} />
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </Card>
  );
}

function ProviderValue({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.providerValue}>
      <Text style={[styles.providerValueLabel, { color: '#526158' }]}>{label}</Text>
      <Text style={[styles.providerValueNumber, { color: '#102018' }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  dashboardContent: {
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  periodTabs: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: radii.pill,
    padding: 3,
    gap: 3,
  },
  periodTab: {
    flex: 1,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    paddingHorizontal: 6,
  },
  periodLabel: { fontSize: 11, fontWeight: '700', textAlign: 'center' },
  monthNavigation: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  monthLabel: { fontSize: 16, fontWeight: '700' },
  metricsCard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderWidth: 1,
    borderTopWidth: 4,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  metricPressable: { flexGrow: 1, flexBasis: 155, minWidth: 145 },
  metric: { minHeight: 78, justifyContent: 'center', padding: spacing.md, gap: 6 },
  metricLabel: { fontSize: 10, fontWeight: '700' },
  metricValue: { fontSize: 18, fontWeight: '700' },
  comparisonCard: { borderTopWidth: 4 },
  comparisonMetrics: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  comparisonValue: {
    flexGrow: 1,
    flexBasis: 190,
    minHeight: 76,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    justifyContent: 'center',
    gap: 5,
  },
  comparisonLabel: { fontSize: 10, fontWeight: '700' },
  comparisonNumber: { fontSize: 18, fontWeight: '800' },
  comparisonExplanation: { fontSize: 13, fontWeight: '700' },
  analysisSplit: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'stretch',
    gap: spacing.md,
  },
  splitCard: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 480,
    minWidth: 300,
    maxWidth: '100%',
  },
  dailyList: {
    gap: 0,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  dailyRow: {
    minHeight: 62,
    borderBottomWidth: 1,
    borderRadius: radii.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  dailyDate: { width: 88, gap: 2 },
  dailyDateCompact: { width: 72 },
  dailyDayName: { fontSize: 9, fontWeight: '600', textTransform: 'capitalize' },
  dailyDateValue: { fontSize: 11, fontWeight: '700' },
  dailyAmountArea: {
    flex: 1,
    minWidth: 230,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dailyAmountAreaCompact: { minWidth: 150, gap: 6 },
  dailyTrack: { flex: 1, minWidth: 100, height: 9, borderRadius: radii.pill, overflow: 'hidden' },
  dailyBar: { height: '100%', borderRadius: radii.pill },
  dailyAmount: { width: 125, textAlign: 'right', fontSize: 12, fontWeight: '700' },
  dailyAmountCompact: { width: 98, fontSize: 11 },
  dailyVariation: { width: 135, alignItems: 'flex-end' },
  dailyVariationCompact: { width: 108 },
  dailyRowCompact: {
    minHeight: 48,
    gap: 8,
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  dailyVariationValue: { fontSize: 12, fontWeight: '800' },
  dailyVariationCopy: { fontSize: 9 },
  notice: {
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.md,
  },
  noticeSymbol: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noticeSymbolText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900' },
  noticeCopy: { flex: 1, minWidth: 220, gap: 2 },
  noticeTitle: { fontSize: 14, fontWeight: '700' },
  noticeDescription: { fontSize: 12, lineHeight: 18 },
  providerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  providerGridCompact: { gap: spacing.sm },
  providerCard: {
    flexGrow: 1,
    flexBasis: 330,
    minWidth: 270,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  providerCardCompact: {
    flexBasis: '100%',
    minWidth: 0,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  providerHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  providerTitle: { fontSize: 16, fontWeight: '800' },
  providerLogoFrame: {
    width: 126,
    height: 38,
    borderRadius: radii.sm,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: 5,
    paddingVertical: 4,
  },
  providerLogo: {
    width: 116,
    height: 30,
  },
  providerLink: { fontSize: 11, fontWeight: '700' },
  providerTotal: { fontSize: 21, fontWeight: '800' },
  providerTotalCompact: { fontSize: 17 },
  providerMetrics: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  providerValue: { flexGrow: 1, flexBasis: 95, gap: 3 },
  providerValueLabel: { fontSize: 10 },
  providerValueNumber: { fontSize: 12, fontWeight: '700' },
  systemGrid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: spacing.lg },
  statusRow: {
    flexGrow: 1,
    flexBasis: 280,
    minHeight: 48,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusDot: { width: 9, height: 9, borderRadius: 5 },
  statusLabel: { flex: 1, fontSize: 13, fontWeight: '600' },
  statusValue: { fontSize: 12 },
  emptyText: { fontSize: 12, paddingVertical: spacing.md },
});
