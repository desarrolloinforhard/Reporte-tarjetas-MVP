import { StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScreenFrame } from '@/components/layout/screen-frame';
import { radii, spacing } from '@/theme/tokens';
import { useAppTheme } from '@/theme/theme-provider';

const metrics = [
  { label: 'Total procesado', value: '$ 12.458.920', detail: '1.284 operaciones', tone: 'success' as const },
  { label: 'Conciliados', value: '96,8 %', detail: '1.243 pagos', tone: 'success' as const },
  { label: 'Con diferencias', value: '24', detail: 'Requieren revisión', tone: 'warning' as const },
  { label: 'Ventas faltantes', value: '17', detail: 'Pendientes de análisis', tone: 'danger' as const },
];

const providers = [
  { name: 'Clover', amount: '$ 6.840.320', share: 72 },
  { name: 'Payway', amount: '$ 3.971.600', share: 51 },
  { name: 'Mercado Pago', amount: '$ 1.647.000', share: 29 },
];

export function DashboardScreen() {
  const { colors } = useAppTheme();

  return (
    <ScreenFrame
      actions={
        <>
          <Button variant="secondary">Últimos 7 días</Button>
          <Button>Actualizar</Button>
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
            Vista previa con datos simulados
          </Text>
          <Text style={[styles.noticeDescription, { color: colors.textMuted }]}>
            El diseño puede probarse en web y móvil sin acceder a información de clientes.
          </Text>
        </View>
        <Badge label="Ambiente seguro" tone="info" />
      </View>

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
          description="Participación estimada del período seleccionado"
          style={styles.contentCard}
          title="Volumen por proveedor">
          <View style={styles.providerList}>
            {providers.map((provider) => (
              <View key={provider.name} style={styles.providerRow}>
                <View style={styles.providerHeading}>
                  <Text style={[styles.providerName, { color: colors.text }]}>{provider.name}</Text>
                  <Text style={[styles.providerAmount, { color: colors.textMuted }]}>
                    {provider.amount}
                  </Text>
                </View>
                <View style={[styles.track, { backgroundColor: colors.surfaceMuted }]}>
                  <View
                    style={[
                      styles.progress,
                      { backgroundColor: colors.primary, width: `${provider.share}%` },
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
            ['API de desarrollo', 'Pendiente de URL'],
            ['Base de pruebas', 'Sin conexión'],
            ['Sincronización', 'Modo simulado'],
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
