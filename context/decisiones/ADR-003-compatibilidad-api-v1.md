# ADR-003: Compatibilidad aditiva en API v1

- Estado: aceptado
- Fecha: 2026-07-27

## Contexto

La API `/api/v1` ya tiene consumidores instalados. Cambiar campos, semántica, autenticación o paginación de forma incompatible puede afectar clientes productivos.

## Decisión

`/api/v1` mantiene compatibilidad hacia atrás:

- se pueden agregar endpoints;
- se pueden agregar campos opcionales;
- no se eliminan ni renombran campos;
- no se cambian tipos ni significados;
- las mejoras ambiguas usan campos nuevos;
- los valores nuevos de enum se documentan y se tratan como desconocidos de forma segura.

Si el cambio exige un campo nuevo obligatorio, una estructura distinta, otra semántica o rompe el flujo de autenticación existente, se diseña bajo `/api/v2` o se introduce mediante una transición explícita y compatible.

## Verificación

Antes de promover un cambio:

1. Pruebas de contrato de `/api/v1`.
2. Regresión del consumidor Bootstack.
3. Integración del consumidor Expo.
4. Validación en staging.
5. Plan de reversión.

## Consecuencias

- La evolución puede requerir mantener temporalmente campos o rutas legacy.
- El frontend nuevo no debe depender de cambios no desplegados.
- Las deprecaciones requieren métricas de uso, comunicación y fecha acordada.
- La versión de contrato se informa en `meta.api_contract_version`.

## Excepción

Una vulnerabilidad crítica puede exigir una medida urgente, pero debe minimizar interrupciones, contar con aprobación operativa y documentar el procedimiento de migración.
