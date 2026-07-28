import { useQuery } from '@tanstack/react-query';
import { StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FeedbackState } from '@/components/ui/feedback-state';
import { ScreenFrame } from '@/components/layout/screen-frame';
import { getDashboardData } from '@/features/dashboard/dashboard.api';
import { radii, spacing } from '@/theme/tokens';
import { useAppTheme } from '@/theme/theme-provider';

function dateDaysAgo(days: number) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

function currency(value: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(value);
}

function providerName(value: string) {
  const names: Record<string, string> = {
    clover: 'Clover',
    mercadopago: 'Mercado Pago',
    payway: 'Payway',
  };
  return names[value] || value;
}

export function DashboardScreen() {
  const { colors } = useAppTheme();
  const from = dateDaysAgo(7);
  const to = dateDaysAgo(0);
  const dashboardQuery = useQuery({
    queryKey: ['dashboard', from, to],
    queryFn: () => getDashboardData(from, to),
  });

  const summary = dashboardQuery.data?.summary;
  const maxProviderAmount = Math.max(
    1,
    ...(summary?.by_provider.map((provider) => provider.total_amount) || []),
  );
  const metrics = summary
    ? [
        {
          label: 'Total procesado',
          value: currency(summary.total_amount),
          detail: `${summary.payments_count} operaciones`,
          tone: 'success' as const,
        },
        {
          label: 'Aprobados',
          value: String(summary.approved_count),
          detail: 'Operaciones confirmadas',
          tone: 'success' as const,
        },
        {
          label: 'Rechazados',
          value: String(summary.rejected_count),
          detail: 'Operaciones no aprobadas',
          tone: 'danger' as const,
        },
        {
          label: 'Devoluciones',
          value: String(summary.refunds_count),
          detail: currency(summary.refund_amount),
          tone: 'warning' as const,
        },
      ]
    : [];

  return (
    <ScreenFrame
      actions={
        <>
          <Button variant="secondary">Últimos 7 días</Button>
          <Button onPress={() => dashboardQuery.refetch()}>
            {dashboardQuery.isFetching ? 'Actualizando…' : 'Actualizar'}
          </Button>
        </>
      }
      description="Visión consolidada de pagos, conciliación y estado de sincronización."
      title="Resumen operativo">
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
            Los datos son fixtures sintéticos y no contienen información de clientes.
          </Text>
        </View>
        <Badge label="Ambiente seguro" tone="info" />
      </View>

      {dashboardQuery.isPending ? (
        <FeedbackState
          eyebrow="Conectando"
          title="Cargando resumen"
          description="Consultando el backend aislado de desarrollo."
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
      <View style={styles.metricGrid}>
        {metrics.map((metric) => (
          <Card key={metric.label} style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>{metric.label}</Text>
              <Badge
                label={metric.tone === 'success' ? 'Correcto' : 'Atención'}
                tone={metric.tone}
              />
            </View>
            <Text style={[styles.metricValue, { color: colors.text }]}>{metric.value}</Text>
            <Text style={[styles.metricDetail, { color: colors.textMuted }]}>{metric.detail}</Text>
          </Card>
        ))}
      </View>

      <View style={styles.contentGrid}>
        <Card
          description="Participación del fixture en los últimos 7 días"
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
                        width: `${Math.round((provider.total_amount / maxProviderAmount) * 100)}%`,
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
          ].map(([label, status]) => (
            <View
              key={label}
              style={[styles.statusRow, { borderBottomColor: colors.border }]}>
              <View style={[styles.statusDot, { backgroundColor: colors.warning }]} />
              <Text style={[styles.statusLabel, { color: colors.text }]}>{label}</Text>
              <Text style={[styles.statusValue, { color: colors.textMuted }]}>{status}</Text>
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
  noticeSymbolText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  noticeCopy: {
    flex: 1,
    minWidth: 220,
    gap: 2,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  noticeDescription: {
    fontSize: 12,
    lineHeight: 18,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  metricCard: {
    flexGrow: 1,
    flexBasis: 220,
    minWidth: 210,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  metricLabel: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
  },
  metricValue: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '900',
  },
  metricDetail: {
    fontSize: 12,
  },
  contentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  contentCard: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 380,
    minWidth: 280,
    maxWidth: '100%',
  },
  providerList: {
    gap: spacing.md,
  },
  providerRow: {
    gap: spacing.sm,
  },
  providerHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  providerName: {
    fontSize: 13,
    fontWeight: '800',
  },
  providerAmount: {
    fontSize: 12,
    fontWeight: '700',
  },
  track: {
    height: 8,
    borderRadius: radii.pill,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    borderRadius: radii.pill,
  },
  statusRow: {
    minHeight: 48,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  statusLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
  },
  statusValue: {
    fontSize: 12,
  },
});
