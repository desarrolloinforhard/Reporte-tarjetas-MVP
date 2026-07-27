import { PlaceholderScreen } from '@/features/shared/placeholder-screen';

export default function DataQualityRoute() {
  return (
    <PlaceholderScreen
      description="Diagnóstico de duplicados, referencias faltantes, huérfanos e importes atípicos."
      next="La interfaz cubrirá datasets vacíos, parciales y grandes antes de conectarse al backend de desarrollo."
      title="Calidad de datos"
    />
  );
}
