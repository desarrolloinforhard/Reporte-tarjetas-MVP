import { useLocalSearchParams } from 'expo-router';

import { PlaceholderScreen } from '@/features/shared/placeholder-screen';

export default function ReconciliationRoute() {
  const { from, to } = useLocalSearchParams<{ from?: string; to?: string }>();
  const period = from && to ? ` Período aplicado: ${from} al ${to}.` : '';

  return (
    <PlaceholderScreen
      description={`Resumen, incidencias, diferencias y auditoría de proveedores.${period}`}
      next="Se migrarán los estados de conciliación y la auditoría Clover sin ejecutar diagnósticos profundos automáticamente."
      title="Conciliación"
    />
  );
}
