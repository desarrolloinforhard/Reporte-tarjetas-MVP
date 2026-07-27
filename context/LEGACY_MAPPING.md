# Mapeo del sistema legacy al frontend universal

## Regla de migración

Se reutilizan conocimiento, contratos y reglas; no se copia el frontend Bootstack ni se modifica `J:\Proyectos\ReportesTarjetas`. El backend sigue siendo un servicio independiente. Los nombres siguientes describen destinos sugeridos, no una traducción línea por línea.

| Legacy | Responsabilidad observada | Destino React Native/Expo |
|---|---|---|
| `api/base_api_client.py` | HTTP, respuesta estándar, errores y contenido binario | `src/api/client.ts`, `src/api/contracts.ts`, `src/api/api-error.ts` |
| `api/health_api.py` | Salud, sync y métricas | `src/features/dashboard/api/` |
| `api/reports_api.py` | Agregados del dashboard | `src/features/dashboard/api/reports.ts` |
| `api/payments_api.py` | Listado, resumen, detalle y exportaciones | `src/features/payments/api/` |
| `api/sales_api.py` | Venta asociada y cierre de caja pendiente | `src/features/payments/api/sales.ts` |
| `api/settlements_api.py` | Liquidaciones, Account Money y tareas | `src/features/settlements/api/` |
| `api/reconciliation_api.py` | Resumen, incidencias, detalle y Clover | `src/features/reconciliation/api/` |
| `api/data_quality_api.py` | Diagnósticos de calidad | `src/features/data-quality/api/` |
| `api/saved_views_api.py` | CRUD de vistas de Pagos | `src/features/payments/api/saved-views.ts` |
| `api/*catalog*`, `branches`, `terminals`, `providers` | Catálogos para filtros | `src/features/catalogs/` |
| `services/payments_service.py` | Normalización, filtros y métricas | adaptadores puros + hooks de `payments` |
| `services/sales_service.py` | Venta, pagos aplicados/intentos y resumen | schemas/adaptadores de `payments` |
| `services/settlements_service.py` | Normalización y límites de fecha | dominio de `settlements` |
| `services/reconciliation_service.py` | Estados y diferencias | dominio de `reconciliation` |
| `services/data_quality_service.py` | Resúmenes y categorías | dominio de `data-quality` |
| `services/export_service.py`, `local_export_service.py` | CSV/PDF/archivos | adaptadores `.web.ts` y `.native.ts` |
| `services/preferences_service.py` | Preferencias persistentes | `src/storage/preferences.*.ts` |
| `services/saved_views_service.py` | Vistas guardadas | hooks/mutations de `payments` |
| `ui/main_window.py` | Shell y navegación | Expo Router + shell web/native |
| `ui/views/inicio_view.py` | Inicio/dashboard | ruta y feature `dashboard` |
| `ui/views/payments_view.py` | Consulta de pagos | ruta y feature `payments` |
| `ui/dialogs/payment_detail_dialog.py` | Detalle pago/venta | ruta/modal responsive |
| `ui/views/settlements_view.py` | Liquidaciones | ruta y feature `settlements` |
| `ui/views/reconciliation_view.py` | Conciliación | ruta y feature `reconciliation` |
| `ui/dialogs/clover_*` | Auditoría/verificación Clover | subrutas/modales de conciliación |
| `ui/views/data_quality_view.py` | Calidad de datos | ruta y feature `data-quality` |
| `ui/views/settings_view.py` | Preferencias y diagnóstico | ruta y feature `settings` |
| `ui/components/*` | Tabla, cards, filtros, badges y estados | `src/components/` compartidos |
| `tests/test_*` | Contratos y regresión funcional | tests unitarios, componentes e integración |

## Endpoints que deben tiparse primero

```text
GET  /health
GET  /sync/status
GET  /providers
GET  /branches
GET  /terminals
GET  /catalog/statuses
GET  /catalog/payment-methods
GET  /reports/summary
GET  /metrics/provider-comparison
GET  /metrics/daily-payments
GET  /payments
GET  /payments/summary
GET  /payments/:provider/:id
GET  /sales/:external_reference
GET  /settlements
GET  /settlements/summary
POST /settlements/generate
GET  /settlements/task/:id
GET  /settlements/download/:file
GET  /reconciliation/summary
GET  /reconciliation/issues
GET  /reconciliation/payments
GET  /reconciliation/payment/:provider/:id
GET  /clover/audit/payments
POST /clover/sync/payments
GET  /clover/sync/payments/:job_id
GET  /data-quality/payments
GET  /data-quality/duplicates
GET  /data-quality/missing-references
GET  /data-quality/orphan-payments
GET  /data-quality/amount-outliers
GET  /data-quality/schema
GET/POST /saved-views/payments
DELETE /saved-views/:id
```

## Reglas de dominio que no deben perderse

- Los totales de Pagos salen de `/payments/summary`, no de la página visible.
- `total_exact`, `has_more` y los metadatos de paginación deben conservar su semántica.
- `payment_attempts` son historial y no suman al total cobrado; los medios aplicados sí.
- Una venta con varios medios debe identificarse como pago combinado.
- `SALE_PENDING_CASH_REGISTER_CLOSE` no equivale a error ni venta perdida.
- La consulta profunda Clover es explícita; no debe ejecutarse automáticamente en cada detalle.
- Las tareas de exportación, liquidaciones y Clover necesitan polling cancelable, backoff y estado recuperable.
- `include_legacy` es un detalle contractual transitorio: centralizarlo en el adaptador API, no dispersarlo en pantallas.
- Fechas de negocio se envían como `YYYY-MM-DD`; la UI presenta zona/locale de Argentina sin reinterpretar el día.
- Preferencias locales no deben almacenar credenciales ni tokens.

## Diferencias de presentación aceptadas

- Web: navegación lateral, filtros visibles y tabla densa.
- Android/iOS: navegación táctil, filtros en hoja/modal y resultados en lista/tarjetas.
- El detalle puede ser panel/modal web y pantalla móvil.
- Exportar debe producir el mismo contenido aunque compartir/descargar use APIs específicas de plataforma.
