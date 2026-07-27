# Prompt operativo del frontend universal

## Objetivo

Construir ReportesTarjetasApp con Expo, React Native, React Native Web y TypeScript, alcanzando paridad funcional completa con la aplicación Bootstack, sin modificarla ni depender de ella en runtime.

## Fuentes de verdad

1. `context/MATRIZ_PARIDAD.md`: alcance y aceptación.
2. `context/LEGACY_MAPPING.md`: reglas y trazabilidad.
3. Contrato del backend de desarrollo/staging.
4. Legacy en `J:\Proyectos\ReportesTarjetas`: consulta de solo lectura.

## Restricciones obligatorias

- Nunca usar producción para desarrollo o pruebas automatizadas.
- No copiar `.env`, credenciales, tokens, datos de clientes, builds ni bases.
- No cambiar contratos `/api/v1` desde este repositorio.
- Toda llamada HTTP pasa por un cliente tipado y validación del límite externo.
- Variables `EXPO_PUBLIC_*` son públicas: solo contienen configuración no secreta.
- Implementar web, Android e iOS durante cada módulo, no en fases separadas.
- Separar archivos `.web.tsx`/`.native.tsx` solo cuando la interacción o API de plataforma lo requiera.
- TanStack Query administra estado remoto; estado local/global solo para sesión, UI y preferencias justificadas.
- No calcular métricas globales desde resultados paginados.
- No bloquear UI durante red, archivos, PDF, polling o cálculos largos.

## Arquitectura esperada

```text
src/app/                 rutas Expo Router
src/api/                 cliente y contrato transversal
src/components/          UI reutilizable y accesible
src/features/dashboard/
src/features/payments/
src/features/settlements/
src/features/reconciliation/
src/features/data-quality/
src/features/settings/
src/features/catalogs/
src/storage/             adaptadores web/native
src/theme/
src/utils/
tests/
context/
```

Cada feature contiene `api`, `components`, `hooks`, `schemas`, `types` y pruebas según necesidad. Evitar carpetas vacías y abstracciones prematuras.

## Contrato HTTP

Modelar la envoltura:

```ts
type ApiEnvelope<T, M = Record<string, unknown>> = {
  ok: boolean;
  data: T | null;
  meta: M;
  error: null | { code: string; message: string; details?: unknown };
};
```

Conservar `request_id` para soporte. Traducir errores a mensajes de usuario sin perder código ni contexto técnico seguro. Cancelar requests al desmontar/cambiar filtros y evitar respuestas fuera de orden.

## UX mínima por módulo

- Inicio: salud, sync, períodos, cards, comparación y evolución.
- Pagos: todos los filtros, resumen global, paginación, vistas, detalle y exportación.
- Detalle: pago, venta, productos, medios aplicados, intentos, datos técnicos y cierre pendiente.
- Liquidaciones: lista/resumen, detalle, generación, tarea y descarga.
- Conciliación: resumen, categorías, pagos, detalle, CSV/PDF y Clover.
- Calidad: resumen, cuatro diagnósticos y esquema.
- Configuración: tema, navegación, defaults, columnas, página, conexión y versión.

Todas las vistas incluyen loading, vacío, error recuperable, reintento y accesibilidad.

## Definición de terminado

- Fila correspondiente actualizada en la matriz para Web/Android/iOS/Tests.
- TypeScript, lint y tests pasan.
- Probado con anchos móvil/tablet/escritorio y al menos un dispositivo Android; iOS mediante build/fixture hasta disponer de dispositivo.
- Contrato y estados límite cubiertos.
- Sin secretos, datos personales ni dependencia de producción.
- PR revisado por el otro programador.
