# Plan de trabajo frontend

Los IDs permiten dividir trabajo entre Nicolás y Misael sin editar los mismos módulos. Cada tarea termina con PR pequeño y actualización de `MATRIZ_PARIDAD.md`.

## F0 — Fundación y seguridad de desarrollo

- [ ] `FE-000` Confirmar URL de API de desarrollo y staging; prohibir producción.
- [ ] `FE-001` Configurar Expo Router, TypeScript estricto, aliases, lint, formato y tests.
- [ ] `FE-002` Crear cliente HTTP, `ApiEnvelope`, `ApiError`, timeout, cancelación y request id.
- [ ] `FE-003` Definir variables por ambiente sin secretos y `.env.example`.
- [ ] `FE-004` Instalar Query Client, boundary de errores y feedback de conectividad.
- [ ] `FE-005` Crear tema/tokens y primitives accesibles.
- [ ] `FE-006` Implementar shell web/native y rutas tipadas.

## F1 — Catálogos e Inicio

- [ ] `FE-100` Tipar salud, sync, proveedores, sucursales, terminales y catálogos.
- [ ] `FE-101` Implementar health/sync con refresco controlado.
- [ ] `FE-102` Implementar períodos Hoy/7 días/mes con fechas argentinas.
- [ ] `FE-103` Implementar `/reports/summary` y cards.
- [ ] `FE-104` Implementar comparación por proveedor y evolución diaria.
- [ ] `FE-105` Navegación contextual conservando filtros.
- [ ] `FE-106` Tests de carga, vacío, parcial, error y respuesta fuera de orden.

## F2 — Pagos, preferencias y vistas

- [ ] `FE-200` Schemas/tipos de listado, resumen y detalle.
- [ ] `FE-201` Filtros completos y serialización de query.
- [ ] `FE-202` Paginación con `total_exact`/`has_more`; resumen global separado.
- [ ] `FE-203` Tabla web con orden, teclado, densidad y columnas.
- [ ] `FE-204` Lista móvil equivalente y filtros en modal/hoja.
- [ ] `FE-205` Preferencias: defaults, tamaño de página, columnas y tema.
- [ ] `FE-206` Listar, crear/aplicar y eliminar vistas guardadas.
- [ ] `FE-207` Tests de filtros, paginación, totales y persistencia.

## F3 — Detalle y venta

- [ ] `FE-300` Pantalla/modal de detalle con estados visuales.
- [ ] `FE-301` Integrar venta, productos y referencias.
- [ ] `FE-302` Separar medios aplicados de intentos no aplicados.
- [ ] `FE-303` Mostrar pago combinado y resumen contractual.
- [ ] `FE-304` Tratar venta no encontrada y cierre de caja pendiente.
- [ ] `FE-305` Datos técnicos copiables sin revelar secretos.
- [ ] `FE-306` Tests de cada variante contractual.

## F4 — Exportaciones

- [ ] `FE-400` Descarga directa web.
- [ ] `FE-401` Guardar/compartir archivo Android/iOS.
- [ ] `FE-402` Crear export job, polling cancelable, reintento y descarga.
- [ ] `FE-403` CSV/XLSX/PDF: nombre, tipo MIME, permisos y errores.
- [ ] `FE-404` Tests de flujo directo y asíncrono sin escribir datos reales.

## F5 — Liquidaciones

- [ ] `FE-500` Lista, filtros, paginación, resumen y detalle.
- [ ] `FE-501` Validación del máximo contractual del rango.
- [ ] `FE-502` Generar Account Money.
- [ ] `FE-503` Seguimiento recuperable de tarea y descarga.
- [ ] `FE-504` Exportar instantánea de resultados.
- [ ] `FE-505` Tests de estados de tarea, timeout y archivo.

## F6 — Conciliación y Clover

- [ ] `FE-600` Resumen e incidencias bajo demanda.
- [ ] `FE-601` Todos/conciliados/venta faltante/diferencia de importe.
- [ ] `FE-602` Detalle de conciliación normal.
- [ ] `FE-603` Exportar CSV/PDF en las tres plataformas.
- [ ] `FE-604` Auditoría Clover paginada con metadatos exactos.
- [ ] `FE-605` Diagnóstico profundo explícito con comercio.
- [ ] `FE-606` Iniciar trabajo Clover y seguir estado cancelablemente.
- [ ] `FE-607` Tests sin llamadas reales a Clover.

## F7 — Calidad de datos

- [ ] `FE-700` Resumen.
- [ ] `FE-701` Duplicados.
- [ ] `FE-702` Referencias faltantes.
- [ ] `FE-703` Pagos huérfanos.
- [ ] `FE-704` Importes atípicos.
- [ ] `FE-705` Esquema y advertencias.
- [ ] `FE-706` Tests de datasets vacíos, parciales y grandes.

## F8 — Configuración, QA y paridad

- [ ] `FE-800` Tema claro/oscuro/sistema y navegación.
- [ ] `FE-801` Defaults funcionales y diagnóstico de conexión.
- [ ] `FE-802` Versión frontend/backend/contrato y request id.
- [ ] `FE-803` Accesibilidad, responsive y rendimiento.
- [ ] `FE-804` Smoke tests Web/Android/iOS contra staging.
- [ ] `FE-805` Recorrer toda la matriz con casos equivalentes al legacy.
- [ ] `FE-806` Builds preview, plan de rollback y aprobación conjunta.

## Reparto sugerido

- Nicolás: shell, UI, responsive, dashboard, tabla/lista, detalle, preferencias e integración fullstack.
- Misael: contratos/backend de desarrollo, autenticación, seguridad, endpoints/tareas/exportaciones y compatibilidad `/api/v1`.
- Compartido: schemas, fixtures, revisiones cruzadas, conciliación, Clover, matriz y pruebas de staging.

Nadie modifica producción como parte de una tarea frontend. Los cambios backend viven en su repositorio y pasan por PR y ambiente de staging.

## Validaciones de compatibilidad pendientes

- [x] `FE-807` Conservar filas independientes y estado visual de cada intento.
- [x] `FE-808` Aplicar debounce sin desmontar resultados ni métricas.
- [x] `FE-809` Separar pagos electrónicos, intentos y medios de caja en el modal.
- [x] `FE-810` Evitar filas sintéticas de efectivo, vuelto o reintentos en Pagos.
- [x] `FE-811` Evitar carga infinita y keys duplicadas en productos.
- [ ] `FE-812` Validar mínimo/máximo de Pagos contra backend de staging con
  operaciones ubicadas fuera de la primera ventana.
- [ ] `FE-813` Validar búsqueda exacta combinada con fecha, proveedor e importe.
- [ ] `FE-814` Validar paginación y exportación sin faltantes ni duplicados.
- [ ] `FE-815` Validar importe mostrado de Conciliación, Liquidaciones y Calidad.
- [ ] `FE-816` Validar intento seleccionado y pago combinado contra una réplica
  autorizada, sin asociaciones por importe, horario o terminal.

Avance de `FE-815`:

- Conciliacion validada manualmente contra el original en Android.
- Liquidaciones y Calidad pendientes de validacion manual; el MVP ya acepta las
  filas resumidas del backend operativo sin inventar campos del pago.
- Calidad tolera el timeout independiente de una categoria sin reutilizar filas
  de un periodo anterior; queda pendiente repetir la prueba Android del rango.
- Los filtros de los cuatro modulos de listado requieren confirmacion explicita
  con `Aplicar filtros`; no consultan por cada cambio de campo.
- [x] Evitar que los totales y el aviso `Aplicando filtros` se recalculen al
  paginar; mostrar rangos exactos solo cuando `meta.total_exact` lo permite.
- [x] Señalar como `2000+` el limite operativo conocido de Liquidaciones, sin
  presentarlo como total exacto del rango.
