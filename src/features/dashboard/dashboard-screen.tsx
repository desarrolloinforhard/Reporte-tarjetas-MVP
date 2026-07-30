import { useQuery } from '@tanstack/react-query';
import { Href, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenFrame } from '@/components/layout/screen-frame';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FeedbackState } from '@/components/ui/feedback-state';
import { getDashboardData } from '@/features/dashboard/dashboard.api';
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
  return ({ clover: 'Clover', mercadopago: 'Mercado Pago', payway: 'Payway' })[value] || value;
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
    if (period === 'week') {
      const from = new Date(today);
      from.setDate(today.getDate() - 6);
      return { from: iso(from), to: iso(today) };
    }
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

  const summary = dashboardQuery.data?.summary;
  const reconciliation = dashboardQuery.data?.reconciliation;
  const problemCount = reconciliation
    ? (reconciliation.problem_count ??
      reconciliation.sale_not_found_count +
        reconciliation.amount_mismatch_count +
        reconciliation.pending_review_count)
    : 0;
  const previousAmount = previousMonthQuery.data?.summary.total_amount || 0;
  const comparison =
    period === 'month' && summary
      ? previousAmount
        ? ((summary.total_amount - previousAmount) / previousAmount) * 100
        : null
      : null;
  const maxProviderAmount = Math.max(
    1,
    ...(summary?.by_provider.map((provider) => provider.total_amount) || []),
  );

  const navigate = (pathname: '/pagos' | '/conciliacion', status?: string) =>
    router.push({
      pathname,
      params: {
        from: range.from,
        to: range.to,
        ...(status ? { status } : {}),
      },
    } as Href);

  const metrics = summary
    ? [
        {
          label: 'Pagos',
          value: String(summary.payments_count),
          tone: 'success' as const,
          action: () => navigate('/pagos'),
        },
        {
          label: 'Total cobrado',
          value: currency(summary.total_amount),
          tone: 'success' as const,
        },
        {
          label: 'Aprobados',
          value: String(summary.approved_count),
          tone: 'success' as const,
          action: () => navigate('/pagos', 'approved'),
        },
        {
          label: 'Devueltos',
          value: String(summary.refunds_count),
          tone: 'warning' as const,
          action: () => navigate('/pagos', 'refunded'),
        },
        {
          label: 'Pendientes',
          value: String(summary.pending_count),
          tone: 'warning' as const,
          action: () => navigate('/pagos', 'pending'),
        },
        {
          label: 'Con problema',
          value: problemCount ? String(problemCount) : '0',
          tone: 'danger' as const,
          action: () => navigate('/conciliacion'),
        },
      ]
    : [];

  return (
    <ScreenFrame
      description="Visión consolidada de pagos, conciliación y estado de sincronización."
      hideHeader
      title="Resumen operativo">
      <View style={[styles.periodTabs, { borderBottomColor: colors.border }]}>
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
                period === key && { borderBottomColor: colors.primary },
              ]}>
              <Text
                style={[
                  styles.periodLabel,
                  { color: period === key ? colors.primary : colors.text },
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
              .toLocaleDateString('es-AR', { month: 'short', year: 'numeric' })
              .replace('.', '')
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
          <View style={[styles.metricsCard, { borderColor: colors.accent }]}>
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
                        color:
                          metric.tone === 'danger'
                            ? colors.danger
                            : metric.tone === 'warning'
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
            {period === 'month' ? (
              <View
                style={[
                  styles.metricPressable,
                  { borderLeftColor: colors.border, borderLeftWidth: 1 },
                ]}>
                <View style={styles.metric}>
                  <Text style={[styles.metricLabel, { color: colors.textMuted }]}>
                    VS. MES ANTERIOR
                  </Text>
                  <Text
                    style={[
                      styles.metricValue,
                      {
                        color:
                          comparison === null || comparison >= 0
                            ? colors.success
                            : colors.danger,
                      },
                    ]}>
                    {comparison === null ? 'Sin base' : `${comparison.toFixed(1)}%`}
                  </Text>
                </View>
              </View>
            ) : null}
          </View>

          <View
            style={[
              styles.notice,
              { backgroundColor: colors.infoSoft, borderColor: colors.info },
            ]}>
            <View style={[styles.noticeSymbol, { backgroundColor: colors.info }]}>
              <Text style={styles.noticeSymbolText}>DEV</Text>
            </View>
            <View style={styles.noticeCopy}>
              <Text style={[styles.noticeTitle, { color: colors.text }]}>
                Backend de desarrollo conectado
              </Text>
              <Text style={[styles.noticeDescription, { color: colors.textMuted }]}>
                Datos sintéticos del período {formatDate(range.from)} al {formatDate(range.to)}.
              </Text>
            </View>
            <Badge label="Ambiente seguro" tone="info" />
          </View>

          <View style={styles.contentGrid}>
            <Card
              description="Participación del período seleccionado"
              style={styles.contentCard}
              title="Volumen por proveedor">
              <View style={styles.providerList}>
                {summary.by_provider.map((provider) => (
                  <View key={provider.provider} style={styles.providerRow}>
                    <View style={styles.providerHeading}>
                      <Text style={[styles.providerName, { color: colors.text }]}>
                        {providerName(provider.provider)}
                      </Text>
                      <Text style={[styles.providerAmount, { color: colors.textMuted }]}>
                        {currency(provider.total_amount)}
                      </Text>
                    </View>
                    <View style={[styles.track, { backgroundColor: colors.surfaceMuted }]}>
                      <View
                        style={[
                          styles.progress,
                          {
                            backgroundColor: colors.primary,
                            width: `${Math.round(
                              (provider.total_amount / maxProviderAmount) * 100,
                            )}%`,
                          },
                        ]}
                      />
                    </View>
                  </View>
                ))}
              </View>
            </Card>
            <Card
              accessory={<Badge label="Operativo" tone="success" />}
              description="Servicios requeridos por la aplicación"
              style={styles.contentCard}
              title="Estado del sistema">
              {[
                ['API de desarrollo', 'Conectada'],
                ['Base de datos', 'Aislada / sin ODBC'],
                ['Sincronización', dashboardQuery.data?.sync.overall_status || 'Sin datos'],
                ['Evolución diaria', `${dashboardQuery.data?.daily.length || 0} puntos`],
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
            </Card>
          </View>
        </>
      ) : null}
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  periodTabs: { flexDirection: 'row', borderBottomWidth: 1 },
  periodTab: {
    flex: 1,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    paddingHorizontal: 6,
  },
  periodLabel: { fontSize: 12, fontWeight: '700', textAlign: 'center' },
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
  metric: { minHeight: 82, justifyContent: 'center', padding: spacing.md, gap: 6 },
  metricLabel: { fontSize: 11, fontWeight: '700' },
  metricValue: { fontSize: 19, fontWeight: '700' },
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
  contentGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  contentCard: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 380,
    minWidth: 280,
    maxWidth: '100%',
  },
  providerList: { gap: spacing.md },
  providerRow: { gap: spacing.sm },
  providerHeading: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  providerName: { fontSize: 13, fontWeight: '700' },
  providerAmount: { fontSize: 12, fontWeight: '600' },
  track: { height: 8, borderRadius: radii.pill, overflow: 'hidden' },
  progress: { height: '100%', borderRadius: radii.pill },
  statusRow: {
    minHeight: 48,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusDot: { width: 9, height: 9, borderRadius: 5 },
  statusLabel: { flex: 1, fontSize: 13, fontWeight: '600' },
  statusValue: { fontSize: 12 },
});
