# Auditoría de compatibilidad con Buen Gusto

Fecha: 2026-07-31.

## Alcance y seguridad

La auditoría se ejecutó exclusivamente mediante solicitudes HTTP `GET` contra
la URL configurada por el frontend Bootstack original. No se ejecutaron
sincronizaciones, escrituras, generación de liquidaciones, auditorías Clover ni
cambios de configuración.

No se registran en este documento pagos, referencias, credenciales ni datos del
cliente.

## Instalación observada

- Backend productivo informado por `/health`: disponible mediante `/api/v1`.
- Contrato común `{ ok, data, meta, error }`: disponible.
- Proveedores informados: Clover y Mercado Pago.
- Sesión local: autenticada en modo local con rol administrativo.
- El frontend Bootstack original consume esta API mediante una URL configurable.

## Endpoints compatibles en estructura general

Respondieron HTTP 200 y con el sobre común esperado:

- `GET /health`
- `GET /sessions/current`
- `GET /users/me`
- `GET /providers`
- `GET /payments`
- `GET /payments/summary`
- `GET /reports/summary`
- `GET /metrics/daily-payments`
- `GET /metrics/provider-comparison`
- `GET /settlements`
- `GET /settlements/summary`
- `GET /reconciliation/payments`
- `GET /reconciliation/summary`
- Endpoints de consulta de calidad de datos.

## Diferencias bloqueantes para el MVP

### 1. Contrato de fila de Pagos

La respuesta productiva de `GET /payments` no incluye algunos campos que el
schema actual del MVP considera obligatorios:

- `created_date`
- `card_type`
- `card_last_four`

El backend sí entrega `created_at` y el resto de la información principal. Se
debe normalizar el contrato manteniendo compatibilidad con Bootstack y fixtures.

### 2. Catálogos de Pagos

`GET /payments/catalogs` responde HTTP 404 en la versión instalada. El MVP lo
utiliza para proveedores, sucursales, terminales, cajeros, estados, medios y
marcas. Debe agregarse como endpoint compatible o componerse de forma explícita
desde los catálogos existentes.

### 3. CORS para la aplicación web

Una solicitud desde el origen de desarrollo `http://localhost:8081` no recibe
`Access-Control-Allow-Origin`. Un navegador bloqueará el MVP web aunque la API
responda. El origen de staging y luego el origen productivo deben incorporarse a
la lista permitida; no se debe habilitar `*` cuando se usan credenciales.

### 4. Autenticación web

El frontend web usa actualmente `/auth/login`, ruta disponible únicamente en el
modo fixture. La API común expone `/sessions/login`. Debe unificarse el login en
`/sessions/login` o publicar un alias compatible fuera de fixtures.

### 5. Paginación y calidad de datos

La auditoría encontró respuestas reales y paginadas. Deben validarse los límites
y metadatos con volúmenes grandes antes del piloto para evitar escaneos completos
desde el frontend.

## Plan de compatibilidad sin interrumpir Bootstack

1. Ajustar contratos de Pagos en `develop` para aceptar y normalizar la respuesta
   real sin eliminar campos usados por Bootstack.
2. Implementar `GET /payments/catalogs` en el backend de desarrollo.
3. Unificar el login del MVP con `/sessions/login`.
4. Configurar CORS solamente para los orígenes concretos de desarrollo/staging.
5. Ejecutar pruebas contractuales locales con fixtures y muestras estructurales
   sanitizadas de la respuesta real.
6. Validar una versión candidata del backend con Bootstack y Expo.
7. Instalar esa versión solamente si la API 3.8.80 no puede satisfacer el piloto
   sin cambios.

## Criterio para iniciar el piloto de Pagos

- Bootstack continúa funcionando sin cambios.
- El MVP accede en modo de consulta.
- Los mismos filtros producen los mismos totales y filas en ambos clientes.
- No se realizan escrituras ni llamadas automáticas a proveedores externos.
- Existe respaldo y rollback de la API antes de promover una versión nueva.
