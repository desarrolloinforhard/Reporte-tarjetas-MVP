# Matriz de paridad con ReportesTarjetas

Esta matriz define el alcance obligatorio de la primera versión universal. La aplicación legacy en `J:\Proyectos\ReportesTarjetas` es referencia funcional de solo lectura; no debe modificarse ni convertirse en dependencia.

Estados permitidos: `Pendiente`, `En curso`, `Bloqueado`, `Completo`. Una fila solo queda `Completo` cuando funciona con datos reales o fixtures contractuales, contempla carga/vacío/error y tiene evidencia de pruebas.

| Área | Capacidad legacy obligatoria | Endpoints principales | Web | Android | iOS | Tests |
|---|---|---|---|---|---|---|
| Inicio | Estado de API, base y sincronización | `GET /health`, `GET /sync/status` | Pendiente | Pendiente | Pendiente | Pendiente |
| Inicio | Resúmenes Hoy, 7 días y mes; totales, cantidad y estados | `GET /reports/summary` | Pendiente | Pendiente | Pendiente | Pendiente |
| Inicio | Comparación por proveedor y evolución diaria | `GET /metrics/provider-comparison`, `GET /metrics/daily-payments` | Pendiente | Pendiente | Pendiente | Pendiente |
| Inicio | Navegación contextual desde métricas a Pagos/Conciliación | Rutas locales + filtros | Pendiente | Pendiente | Pendiente | Pendiente |
| Pagos | Filtros de fecha, proveedor, estado, sucursal, terminal, cajero y referencia | `GET /payments`, catálogos | Pendiente | Pendiente | Pendiente | Pendiente |
| Pagos | Resultados paginados, total exacto/aproximado, orden, búsqueda local y estados visuales | `GET /payments` | Pendiente | Pendiente | Pendiente | Pendiente |
| Pagos | Cards globales independientes de la página visible | `GET /payments/summary` | Pendiente | Pendiente | Pendiente | Pendiente |
| Pagos | Tabla completa en escritorio y lista/tarjetas equivalentes en móvil | `GET /payments` | Pendiente | Pendiente | Pendiente | Pendiente |
| Detalle | Datos del pago, información técnica, proveedor, comercio/sucursal/terminal | `GET /payments/:provider/:id` | Pendiente | Pendiente | Pendiente | Pendiente |
| Detalle | Venta, productos, medios aplicados, intentos y pago combinado | `GET /sales/:external_reference` | Pendiente | Pendiente | Pendiente | Pendiente |
| Detalle | Venta no encontrada y cierre de caja pendiente como estados de dominio | `GET /sales/:external_reference` | Pendiente | Pendiente | Pendiente | Pendiente |
| Exportación | Exportación directa de pagos CSV/XLSX/PDF según soporte contractual | `GET /export/payments.:format` | Pendiente | Pendiente | Pendiente | Pendiente |
| Exportación | Crear trabajo, consultar progreso y descargar resultado | `POST /exports`, `GET /exports/:id`, `GET /exports/:id/download` | Pendiente | Pendiente | Pendiente | Pendiente |
| Liquidaciones | Listado, filtros, paginación, resumen y detalle | `GET /settlements`, `GET /settlements/summary` | Pendiente | Pendiente | Pendiente | Pendiente |
| Liquidaciones | Generar Account Money, sondear tarea y descargar/interpretar reporte | `POST /settlements/generate`, `GET /settlements/task/:id`, `GET /settlements/download/:file` | Pendiente | Pendiente | Pendiente | Pendiente |
| Liquidaciones | Validación de rango máximo admitido y exportación de filas | Contrato de liquidaciones + exportación local segura | Pendiente | Pendiente | Pendiente | Pendiente |
| Conciliación | Resumen bajo demanda e incidencias por estado/tipo | `GET /reconciliation/summary`, `GET /reconciliation/issues` | Pendiente | Pendiente | Pendiente | Pendiente |
| Conciliación | Pagos: todos, conciliados, venta faltante y diferencia de importe | `GET /reconciliation/payments` | Pendiente | Pendiente | Pendiente | Pendiente |
| Conciliación | Detalle normal y diagnóstico profundo opcional | `GET /reconciliation/payment/:provider/:id` | Pendiente | Pendiente | Pendiente | Pendiente |
| Conciliación | Exportación CSV/PDF con filtros y metadatos de consulta | Datos de conciliación; generación cliente/servidor definida por ADR futura | Pendiente | Pendiente | Pendiente | Pendiente |
| Auditoría Clover | Auditoría de pagos, diferencias, faltantes y totales exactos | `GET /clover/audit/payments` | Pendiente | Pendiente | Pendiente | Pendiente |
| Auditoría Clover | Iniciar sincronización/auditoría y consultar trabajo | `POST /clover/sync/payments`, `GET /clover/sync/payments/:job_id` | Pendiente | Pendiente | Pendiente | Pendiente |
| Calidad | Resumen de calidad de pagos | `GET /data-quality/payments` | Pendiente | Pendiente | Pendiente | Pendiente |
| Calidad | Duplicados, referencias faltantes, huérfanos e importes atípicos | Endpoints `/data-quality/*` específicos | Pendiente | Pendiente | Pendiente | Pendiente |
| Calidad | Consulta de esquema y presentación de advertencias | `GET /data-quality/schema` | Pendiente | Pendiente | Pendiente | Pendiente |
| Configuración | Tema claro/oscuro/sistema, menú y preferencias de tabla | Persistencia local y/o backend según contrato | Pendiente | Pendiente | Pendiente | Pendiente |
| Configuración | Proveedor y período predeterminados, tamaño de página y columnas | Preferencias | Pendiente | Pendiente | Pendiente | Pendiente |
| Configuración | Estado de conexión, versión y diagnóstico sin exponer secretos | `GET /health`, metadatos de build | Pendiente | Pendiente | Pendiente | Pendiente |
| Vistas guardadas | Listar, crear/aplicar y eliminar vistas de Pagos | `GET/POST /saved-views/payments`, `DELETE /saved-views/:id` | Pendiente | Pendiente | Pendiente | Pendiente |
| Catálogos | Proveedores, sucursales, terminales, estados y medios de pago | `/providers`, `/branches`, `/terminals`, `/catalog/statuses`, `/catalog/payment-methods` | Pendiente | Pendiente | Pendiente | Pendiente |
| Transversal | Contrato `{ok,data,meta,error}`, request id y errores comprensibles | Todos | Pendiente | Pendiente | Pendiente | Pendiente |
| Transversal | Loading, vacío, reintento, cancelación y conectividad | Todos | Pendiente | Pendiente | Pendiente | Pendiente |
| Transversal | Diseño responsive y accesibilidad de teclado/táctil | N/A | Pendiente | Pendiente | Pendiente | Pendiente |

## Criterio de salida de V1

- Todas las filas obligatorias están completas en las tres plataformas.
- Los contratos se validan con TypeScript y Zod en el límite HTTP.
- No se prueba contra producción ni se usan secretos/datos sensibles en fixtures.
- Hay smoke test con backend de desarrollo/staging y regresión documentada contra el comportamiento legacy.
- Cualquier diferencia intencional de UX conserva la misma capacidad y queda registrada en un ADR.

## Estado transitorio con backend operativo anterior

Las capacidades de presentación del MVP pueden verificarse en Android y web,
pero las siguientes filas permanecen `Bloqueado` para paridad completa hasta
validar el backend nuevo en staging o réplica autorizada:

- Pagos: mínimo/máximo, referencia profunda, total/paginación y exportación.
- Detalle: pago combinado, medios de caja e identidad exacta del intento.
- Conciliación: filtro sobre el importe presentado después de agrupar.
- Liquidaciones: filtros y resumen cuando derivan de Pagos.
- Calidad: universo completo y duplicados por ID externo exacto.

Un Development Build conectado a una API operativa sigue siendo un cliente de
desarrollo; no implica que los commits de backend estén instalados en esa API.
