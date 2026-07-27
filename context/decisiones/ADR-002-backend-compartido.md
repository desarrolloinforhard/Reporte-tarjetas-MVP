# ADR-002: Backend compartido con despliegues aislados

- Estado: aceptado
- Fecha: 2026-07-27

## Contexto

La aplicación Bootstack y el nuevo frontend universal necesitan las mismas reglas de pagos, conciliación, liquidaciones e integraciones. Copiar el backend al repositorio nuevo produciría divergencias, dobles correcciones y riesgo para clientes.

## Decisión

Mantener una sola fuente oficial de código backend en un repositorio separado. Bootstack y Expo consumirán esa API mediante contratos versionados.

El código es compartido, pero sus runtimes no:

- desarrollo,
- staging,
- producción.

Cada runtime tendrá configuración, credenciales, datos y observabilidad independientes.

## Consecuencias

Positivas:

- Una sola implementación de reglas de negocio.
- Correcciones consistentes para todos los clientes.
- Menor duplicación y costo operativo.
- Contratos verificables entre equipos.

Costos:

- Se requieren pruebas de regresión para ambos frontends.
- Los cambios necesitan coordinación y promoción por ambientes.
- La autenticación debe migrarse sin interrumpir clientes legacy.

## Alternativas descartadas

- Copiar el backend dentro del frontend: divergencia y superficie de seguridad mayor.
- Consumir producción durante desarrollo: riesgo inaceptable para datos y disponibilidad.
- Reescribir el backend desde cero para la V1: demora, duplicación y pérdida de reglas probadas.
