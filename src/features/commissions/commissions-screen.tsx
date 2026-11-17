import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { ScreenFrame } from '@/components/layout/screen-frame';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FeedbackState } from '@/components/ui/feedback-state';
import {
  CommissionTerm, completeNet, getCommissionsOverview,
} from '@/features/commissions/commissions.api';
import { spacing } from '@/theme/tokens';
import { useAppTheme } from '@/theme/theme-provider';
import { formatDate } from '@/utils/date-format';

function today() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function dateParam(value: string | string[] | undefined) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value
    ? value : today();
}

function money(value: string) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(Number(value));
}

function deadline(term: CommissionTerm) {
  if (term.unit === 'instant') return 'Inmediato';
  if (term.unit === 'hours') return `${term.value} horas`;
  if (term.unit === 'days') return `${term.value} días ${term.calendar === 'business' ? 'hábiles' : 'corridos'}`;
  return 'Sin definir';
}

export function CommissionsScreen() {
  const params = useLocalSearchParams<{ from?: string; to?: string }>();
  const from = dateParam(params.from);
  const to = dateParam(params.to);
  const router = useRouter();
  const { colors } = useAppTheme();
  const query = useQuery({
    queryKey: ['commissions-overview', from, to],
    queryFn: () => getCommissionsOverview(from, to),
    retry: false,
    staleTime: 60_000,
  });
  const net = completeNet(query.data);

  return (
    <ScreenFrame
      title="Neto y comisiones"
      description={`Ventas del ${formatDate(from)} al ${formatDate(to)}. Consulta de solo lectura.`}
      actions={<Button onPress={() => router.back()} variant="secondary">Volver a Inicio</Button>}>
      {query.isPending ? <FeedbackState title="Consultando comisiones" description="Cargando el cálculo del período." /> : null}
      {query.isError ? (
        <FeedbackState
          title="Neto no disponible"
          description="No se pudo consultar el servicio de comisiones. El total cobrado no reemplaza al neto."
          actionLabel="Reintentar"
          onAction={() => query.refetch()}
        />
      ) : null}
      {query.data ? (
        <>
          <Card title="Lo que queda de las ventas" description="Estimado después de comisiones de los medios de cobro.">
            <Text style={[styles.net, { color: colors.success }]}>{net === null ? 'Incompleto' : money(net)}</Text>
            <Text style={[styles.note, { color: colors.textMuted }]}>
              {net === null
                ? query.data.summary.pending > 0
                  ? `${query.data.summary.pending} pagos necesitan revisión. No mostramos un importe parcial.`
                  : 'Falta confirmar alguna fuente de datos. No mostramos un importe parcial.'
                : `${query.data.summary.calculated} pagos calculados. No es una acreditación confirmada.`}
            </Text>
            <Text style={[styles.note, { color: colors.textMuted }]}>
              No incluye retenciones, percepciones, gastos bancarios ni adelantos. Esos importes se registran por separado.
            </Text>
          </Card>
          <Card title="Porcentajes y plazos guardados" description={`Condiciones vigentes al ${formatDate(to)}. Si hubo cambios dentro del período, cada venta se calcula con la condición de su fecha. No son tasas de cada banco.`}>
            <View style={styles.terms}>
              {query.data.terms.items.map(term => (
                <View key={term.id} style={[styles.term, { borderColor: colors.border, backgroundColor: colors.surfaceMuted }]}>
                  <Text style={[styles.termTitle, { color: colors.text }]}>{term.label}</Text>
                  <Text style={[styles.termRate, { color: term.status === 'complete' ? colors.success : colors.warning }]}>
                    {term.status === 'missing' ? 'Sin condición guardada'
                      : `${term.percentage === null ? 'Comisión sin definir' : `${term.percentage.replace('.', ',')} %`} · Cobro: ${deadline(term)}`}
                  </Text>
                  {term.status === 'complete' && term.effective_from ? (
                    <Text style={[styles.note, { color: colors.textMuted }]}>Desde ventas del {formatDate(term.effective_from)}</Text>
                  ) : null}
                  {term.status === 'incomplete' ? (
                    <Text style={[styles.note, { color: colors.warning }]}>Faltan datos; no usar como cobro confirmado.</Text>
                  ) : null}
                </View>
              ))}
            </View>
          </Card>
        </>
      ) : null}
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  net: { fontSize: 30, fontWeight: '800' },
  note: { fontSize: 13, lineHeight: 19 },
  terms: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  term: { flexGrow: 1, flexBasis: 260, minWidth: 220, borderWidth: 1, borderRadius: 12, padding: spacing.md, gap: spacing.sm },
  termTitle: { fontSize: 15, fontWeight: '700' },
  termRate: { fontSize: 15, fontWeight: '700' },
});
