import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Payment, PaymentDetail } from '@/features/payments/payments.api';
import { breakpoints, radii, spacing } from '@/theme/tokens';
import { useAppTheme } from '@/theme/theme-provider';
import { formatDateTime } from '@/utils/date-format';

type Tab = 'summary' | 'products' | 'payments' | 'technical';

const providerLabel = (value: string) =>
  ({ clover: 'Clover', mercadopago: 'Mercado Pago' })[value] || value;
const money = (value: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);
const dateTime = formatDateTime;
const verdict = (status: string) => {
  if (status === 'matched' || status === 'reconciled') return { label: 'Conciliado', tone: 'success' as const };
  if (status === 'rejected') return { label: 'Rechazado', tone: 'danger' as const };
  if (status === 'refunded') return { label: 'Devuelto', tone: 'warning' as const };
  if (status === 'sale_not_found') return { label: 'Venta no encontrada', tone: 'danger' as const };
  return { label: 'Pendiente de revisión', tone: 'warning' as const };
};

function Pair({ label, value }: { label: string; value: string }) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.pair}>
      <Text style={[styles.pairLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.pairValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

function PaymentCard({ payment, attempt = false }: { payment: Payment; attempt?: boolean }) {
  const { colors } = useAppTheme();
  return (
    <View
      style={[
        styles.paymentCard,
        {
          borderColor: attempt ? colors.danger : colors.success,
          backgroundColor: attempt ? colors.dangerSoft : colors.successSoft,
        },
      ]}>
      <View style={styles.rowBetween}>
        <Text style={[styles.paymentCardTitle, { color: colors.text }]}>
          {providerLabel(payment.provider)} · {payment.payment_method}
        </Text>
        <Text style={[styles.paymentAmount, { color: attempt ? colors.danger : colors.success }]}>
          {money(payment.amount)}
        </Text>
      </View>
      <View style={styles.inline}>
        <Badge label={payment.status_label} tone={attempt ? 'danger' : 'success'} />
        <Text style={{ color: colors.textMuted }}>
          {payment.external_reference} · {payment.terminal_name}
        </Text>
      </View>
    </View>
  );
}

export function PaymentDetailModal({
  data,
  error,
  loading,
  onClose,
  onRetry,
  selected,
  visible,
  desktop,
}: {
  data?: PaymentDetail;
  error?: boolean;
  loading: boolean;
  onClose: () => void;
  onRetry?: () => void;
  selected: Payment | null;
  visible: boolean;
  desktop: boolean;
}) {
  const { colors } = useAppTheme();
  const [tab, setTab] = useState<Tab>('summary');
  const close = () => {
    setTab('summary');
    onClose();
  };
  const isAttempt = data?.payment.current_payment_applied === false;
  const isRejectedAttempt = isAttempt && data?.payment.status === 'rejected';
  const isCurrentDayPendingSale =
    Boolean(data && !data.sale && data.payment_summary.status === 'pending_review') && !isAttempt;
  const status = isRejectedAttempt
    ? { label: 'Rechazado · intento no aplicado', tone: 'danger' as const }
    : data && !data.sale && data.payment.status === 'approved'
      ? { label: 'Aprobado', tone: 'success' as const }
      : data && !data.sale && data.payment.status === 'rejected'
        ? { label: 'Rechazado', tone: 'danger' as const }
    : data
      ? verdict(data.payment_summary.status)
      : verdict('');
  const attemptColor = isRejectedAttempt ? colors.danger : colors.warning;
  const attemptBackground = isRejectedAttempt ? colors.dangerSoft : colors.warningSoft;
  const tabs: [Tab, string][] = [
    ['summary', 'Resumen'],
    ...(data?.sale
      ? ([
          ['products', 'Productos'],
          ['payments', 'Pagos asociados'],
        ] as [Tab, string][])
      : []),
    ['technical', 'Datos técnicos'],
  ];

  return (
    <Modal animationType="fade" onRequestClose={close} transparent visible={visible}>
      <View style={[styles.backdrop, { backgroundColor: colors.overlay }]}>
        <View
          style={[
            styles.modal,
            desktop ? styles.modalDesktop : styles.modalMobile,
            { backgroundColor: colors.surfaceElevated },
          ]}>
          <View style={styles.header}>
            <View style={styles.headerTitle}>
              <Text style={[styles.eyebrow, { color: colors.textMuted }]}>DETALLE DE VENTA</Text>
              <Text style={[styles.title, { color: colors.text }]}>
                PAGO {selected?.external_reference || selected?.id}
              </Text>
              <Text style={[styles.meta, { color: colors.textMuted }]}>
                {selected
                  ? `${providerLabel(selected.provider)} · ${dateTime(selected.created_at)} · Referencia externa ${selected.authorization_code || selected.id}`
                  : ''}
              </Text>
            </View>
            <Button onPress={close} variant="ghost">Cerrar</Button>
          </View>

          {loading ? <Text style={{ color: colors.textMuted }}>Cargando detalle…</Text> : null}
          {error && !loading ? (
            <View style={styles.loadError}>
              <Text style={{ color: colors.danger }}>No se pudo cargar el detalle del pago.</Text>
              {onRetry ? <Button onPress={onRetry}>Reintentar</Button> : null}
            </View>
          ) : null}
          {data ? (
            <>
              <Badge label={status.label} tone={status.tone} />
              {data.payment_summary.applied_payments_count > 1 ? (
                <Badge label="Pago combinado" tone="info" />
              ) : null}
              {isAttempt ? (
                <View
                  style={[
                    styles.warning,
                    { backgroundColor: attemptBackground, borderColor: attemptColor },
                  ]}>
                  <Badge
                    label={isRejectedAttempt ? 'Intento rechazado no aplicado' : 'Intento pendiente no aplicado'}
                    tone={isRejectedAttempt ? 'danger' : 'warning'}
                  />
                  <Text style={{ color: colors.text }}>
                    El pago consultado fue un intento rechazado o no aplicado. La venta asociada
                    puede corresponder a un comprobante reutilizado.
                  </Text>
                </View>
              ) : null}

              <View style={[styles.metrics, !desktop && styles.metricsMobile]}>
                {[
                  [isAttempt ? 'VENTA ASOCIADA' : 'TOTAL VENTA', data.payment_summary.sale_total],
                  [
                    isAttempt ? 'PAGOS APLICADOS A LA VENTA' : 'TOTAL PAGOS',
                    data.payment_summary.payment_total,
                  ],
                  ['DIFERENCIA', data.payment_summary.difference],
                ].map(([label, value]) => (
                  <View
                    key={String(label)}
                    style={[
                      styles.metric,
                      {
                        backgroundColor:
                          isAttempt || isCurrentDayPendingSale
                            ? attemptBackground
                            : colors.successSoft,
                        borderColor: colors.border,
                      },
                    ]}>
                    <Text style={[styles.eyebrow, { color: colors.textMuted }]}>{label}</Text>
                    <Text
                      style={[
                        styles.metricValue,
                        {
                          color:
                            isAttempt || isCurrentDayPendingSale
                              ? attemptColor
                              : colors.success,
                        },
                      ]}>
                      {money(Number(value))}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.tabsWrapper}>
                <ScrollView
                  contentContainerStyle={styles.tabsContent}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.tabsScroll}>
                  <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
                    {tabs.map(([key, label]) => (
                      <Pressable
                        key={key}
                        onPress={() => setTab(key)}
                        style={[
                          styles.tab,
                          tab === key && {
                            borderBottomColor: colors.primary,
                            backgroundColor: colors.primarySoft,
                          },
                        ]}>
                        <Text
                          style={{
                            color: tab === key ? '#102018' : colors.text,
                            fontWeight: tab === key ? '800' : '600',
                          }}>
                          {label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
                {!desktop && tab !== 'technical' ? (
                  <View
                    pointerEvents="none"
                    style={[
                      styles.tabsHint,
                      {
                        backgroundColor: colors.primary,
                        borderColor: colors.surfaceElevated,
                      },
                    ]}>
                    <Text style={styles.tabsHintText}>Más →</Text>
                  </View>
                ) : null}
              </View>

              <ScrollView
                contentContainerStyle={styles.body}
                showsVerticalScrollIndicator
                style={[
                  styles.bodyScroll,
                  desktop ? styles.bodyScrollDesktop : styles.bodyScrollMobile,
                ]}>
                {tab === 'summary' ? (
                  data.sale ? (
                    <View style={[styles.columns, !desktop && styles.stack]}>
                      <View
                        style={[
                          styles.panel,
                          { borderColor: colors.border, backgroundColor: colors.primarySoft },
                        ]}>
                        <Badge label={status.label} tone={status.tone} />
                        <Pair label="Total venta" value={money(data.payment_summary.sale_total)} />
                        <Pair label="Total pagos" value={money(data.payment_summary.payment_total)} />
                        <Pair label="Diferencia" value={money(data.payment_summary.difference)} />
                        <Pair
                          label="Medios utilizados"
                          value={String(data.payment_summary.applied_payments_count)}
                        />
                        {isAttempt ? (
                          <Text style={{ color: colors.textMuted }}>
                            Los importes no incluyen este intento rechazado.
                          </Text>
                        ) : null}
                      </View>
                      <View style={[styles.panel, { borderColor: colors.border }]}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Venta</Text>
                        <Pair label="Referencia" value={data.sale.external_reference} />
                        <Pair label="Total facturado" value={money(data.sale.invoice_total)} />
                        <Pair label="Productos" value={String(data.sale.items.length)} />
                        <Pair label="Impuestos" value={String(data.sale.taxes.length)} />
                      </View>
                    </View>
                  ) : (
                    <View
                      style={[
                        styles.warning,
                        {
                          backgroundColor: isCurrentDayPendingSale
                            ? colors.warningSoft
                            : colors.dangerSoft,
                          borderColor: isCurrentDayPendingSale
                            ? colors.warning
                            : colors.danger,
                        },
                      ]}>
                      <Badge
                        label={
                          isCurrentDayPendingSale
                            ? 'Pendiente de cierre de caja'
                            : 'Venta no encontrada'
                        }
                        tone={isCurrentDayPendingSale ? 'warning' : 'danger'}
                      />
                      <Text style={{ color: colors.text }}>
                        {isCurrentDayPendingSale
                          ? 'La venta puede aparecer cuando cierre la caja del día. Este pago queda pendiente de revisión y no se considera una diferencia definitiva.'
                          : 'No hay una venta asociada para esta referencia.'}
                      </Text>
                    </View>
                  )
                ) : null}

                {tab === 'products' && data.sale ? (
                  <ScrollView
                    contentContainerStyle={desktop ? styles.productScrollDesktop : undefined}
                    horizontal>
                    <View
                      style={[
                        styles.productTable,
                        desktop && styles.productTableDesktop,
                        { borderColor: colors.border },
                      ]}>
                      <View style={[styles.productRow, { backgroundColor: colors.surfaceMuted }]}>
                        {['CÓDIGO', 'PRODUCTO', 'CANT.', 'PRECIO', 'TOTAL'].map((label, index) => (
                          <Text
                            key={label}
                            style={[
                              styles.productCell,
                              desktop && styles.productCellDesktop,
                              index === 1 && styles.productName,
                              index === 1 && desktop && styles.productNameDesktop,
                              { color: colors.text },
                            ]}>
                            {label}
                          </Text>
                        ))}
                      </View>
                      {data.sale.items.map((item, index) => (
                        <View
                          key={`${item.code}-${item.description}-${index}`}
                          style={[styles.productRow, { borderBottomColor: colors.border }]}>
                          <Text
                            style={[
                              styles.productCell,
                              desktop && styles.productCellDesktop,
                              { color: colors.text },
                            ]}>
                            {item.code}
                          </Text>
                          <Text
                            style={[
                              styles.productCell,
                              styles.productName,
                              desktop && styles.productCellDesktop,
                              desktop && styles.productNameDesktop,
                              { color: colors.text },
                            ]}>
                            {item.description}
                          </Text>
                          <Text
                            style={[
                              styles.productCell,
                              desktop && styles.productCellDesktop,
                              { color: colors.text },
                            ]}>
                            {item.quantity}
                          </Text>
                          <Text
                            style={[
                              styles.productCell,
                              desktop && styles.productCellDesktop,
                              { color: colors.text },
                            ]}>
                            {money(item.unit_price)}
                          </Text>
                          <Text
                            style={[
                              styles.productCell,
                              desktop && styles.productCellDesktop,
                              { color: colors.text },
                            ]}>
                            {money(item.total)}
                          </Text>
                        </View>
                      ))}
                      {data.sale.taxes.map((tax, index) => (
                        <Text
                          key={`${tax.vat_rate}-${tax.base_amount}-${index}`}
                          style={{ color: colors.textMuted, padding: 10 }}>
                          IVA {tax.vat_rate}% · Base {money(tax.base_amount)} · IVA{' '}
                          {money(tax.vat_amount)}
                        </Text>
                      ))}
                    </View>
                  </ScrollView>
                ) : null}

                {tab === 'payments' && data.sale ? (
                  <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Pagos electrónicos asociados</Text>
                    {data.sale.payments.map((payment, index) => (
                      <PaymentCard key={`${payment.provider}:${payment.id}:${index}`} payment={payment} />
                    ))}
                    {data.sale.sale_tenders.length ? (
                      <>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Medios aplicados en caja</Text>
                        <Text style={{ color: colors.textMuted }}>
                          Son los medios registrados por la venta; no crean filas en el listado de Pagos.
                        </Text>
                        {data.sale.sale_tenders.map((payment, index) => (
                          <PaymentCard key={`tender:${payment.id}:${index}`} payment={payment} />
                        ))}
                      </>
                    ) : null}
                    {data.sale.payment_attempts.length ? (
                      <>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                          Intentos no aplicados ({data.sale.payment_attempts.length})
                        </Text>
                        <Text style={{ color: colors.textMuted }}>
                          Se muestran para auditoría y no forman parte del total cobrado.
                        </Text>
                        {data.sale.payment_attempts.map((payment, index) => (
                          <PaymentCard attempt key={`${payment.provider}:${payment.id}:${index}`} payment={payment} />
                        ))}
                      </>
                    ) : null}
                  </View>
                ) : null}

                {tab === 'technical' ? (
                  <View style={[styles.columns, !desktop && styles.stack]}>
                    <View style={[styles.panel, { borderColor: colors.border }]}>
                      <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Detalle del pago
                      </Text>
                      {[
                        ['Proveedor', providerLabel(data.payment.provider)],
                        ['Importe', money(data.payment.amount)],
                        ['Neto', money(data.payment.net_amount)],
                        ['Comisión', money(data.payment.fee_amount)],
                        ['Fecha', dateTime(data.payment.created_at)],
                        ['Método', data.payment.payment_method],
                        ['Tarjeta', `${data.payment.card_brand} ${data.payment.card_last_four || ''}`],
                        ['Cuotas', String(data.payment.installments || 1)],
                        ['Autorización', data.payment.authorization_code || '—'],
                        ['Terminal', data.payment.terminal_name],
                        ['Cajero', data.payment.cashier_name],
                        ['Sucursal', data.payment.branch_name],
                        ['Referencia', data.payment.external_reference],
                        ['ID externo', data.payment.external_id || '—'],
                      ].map(([label, value]) => (
                        <Pair
                          key={String(label)}
                          label={String(label)}
                          value={String(value || '—')}
                        />
                      ))}
                    </View>
                    <View style={[styles.panel, { borderColor: colors.border }]}>
                      <Text style={[styles.sectionTitle, { color: colors.text }]}>Datos de venta</Text>
                      {data.sale ? (
                        <>
                          <Pair label="Referencia" value={data.sale.external_reference} />
                          <Pair label="Total venta" value={money(data.sale.invoice_total)} />
                          <Pair label="Items" value={String(data.sale.items.length)} />
                          <Pair label="Impuestos" value={String(data.sale.taxes.length)} />
                          <Pair label="Estado disponibilidad" value={data.sale.availability_status} />
                        </>
                      ) : (
                        <Text style={{ color: colors.textMuted }}>Sin datos de venta.</Text>
                      )}
                    </View>
                  </View>
                ) : null}
              </ScrollView>
            </>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  loadError: { gap: spacing.md, alignItems: 'flex-start' },
  backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.md },
  modal: {
    width: '100%',
    padding: spacing.md,
    gap: spacing.sm,
    overflow: 'hidden',
    minHeight: 0,
  },
  modalDesktop: {
    maxWidth: 940,
    height: '96%',
    maxHeight: '96%',
    borderRadius: radii.xl,
  },
  modalMobile: {
    height: '96%',
    maxHeight: '96%',
    padding: 12,
    borderRadius: radii.lg,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  headerTitle: { flex: 1, gap: 4 },
  eyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6 },
  title: { fontSize: 22, fontWeight: '900' },
  meta: { fontSize: 12 },
  warning: { borderWidth: 1, borderRadius: radii.md, padding: 10, gap: 6 },
  metrics: { flexDirection: 'row', gap: spacing.sm },
  metricsMobile: { flexWrap: 'wrap' },
  metric: {
    flex: 1,
    flexBasis: 125,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: 10,
    gap: 2,
  },
  metricValue: { fontSize: 17, fontWeight: '900' },
  tabsWrapper: { position: 'relative', flexGrow: 0, flexShrink: 0 },
  tabsScroll: { flexGrow: 0, flexShrink: 0, height: 46, maxHeight: 46 },
  tabsContent: { minWidth: '100%', height: 46 },
  tabs: {
    minWidth: '100%',
    height: 46,
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    minWidth: 150,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 11,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabsHint: {
    position: 'absolute',
    right: 2,
    top: 8,
    minHeight: 30,
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: radii.pill,
    paddingHorizontal: 10,
  },
  tabsHintText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900' },
  bodyScroll: { flex: 1, minHeight: 0 },
  bodyScrollDesktop: { minHeight: 190 },
  bodyScrollMobile: { minHeight: 150 },
  body: { paddingTop: spacing.sm, paddingBottom: spacing.xl, flexGrow: 1 },
  columns: { flexDirection: 'row', gap: spacing.md },
  stack: { flexDirection: 'column' },
  panel: { flex: 1, borderWidth: 1, borderRadius: radii.md, padding: spacing.md, gap: spacing.sm },
  pair: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  pairLabel: { flex: 1, fontSize: 13 },
  pairValue: { flex: 1, fontSize: 13, fontWeight: '700', textAlign: 'right' },
  section: { gap: spacing.md },
  sectionTitle: { fontSize: 16, fontWeight: '900' },
  paymentCard: { borderWidth: 1, borderRadius: radii.md, padding: spacing.md, gap: spacing.sm },
  paymentCardTitle: { flex: 1, fontWeight: '800' },
  paymentAmount: { fontSize: 16, fontWeight: '900' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  inline: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm },
  productTable: { minWidth: breakpoints.tablet, borderWidth: 1, borderRadius: radii.md, overflow: 'hidden' },
  productScrollDesktop: { width: '100%' },
  productTableDesktop: { width: '100%', minWidth: '100%' },
  productRow: { flexDirection: 'row', minHeight: 36, alignItems: 'center', borderBottomWidth: 1 },
  productCell: { width: 110, paddingHorizontal: 8, fontSize: 12 },
  productCellDesktop: { width: 'auto', flex: 1 },
  productName: { width: 280 },
  productNameDesktop: { width: 'auto', flex: 2.2 },
});
