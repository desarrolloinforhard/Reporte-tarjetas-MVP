# Paridad de Pagos y detalle

Fecha de auditoría: 2026-08-05.

## Fuente legacy consultada

La aplicación original permanece en modo de solo lectura. Su flujo identifica:

- la venta por `external_reference` exacta y consulta `/sales/:external_reference`;
- el intento seleccionado por el ID real del pago (`payment_id`, `id` o
  `external_id`), conservando `source_table` cuando el ID del listado necesita
  desambiguación;
- los pagos asociados desde `sale.payments`, filtrando únicamente los medios
  aplicados;
- los intentos no aplicados desde `sale.payment_attempts`, o como fallback desde
  pagos con estado rechazado, pendiente, cancelado o fallido;
- un pago combinado por `payment_summary.applied_payments_count > 1`, con
  `sale_tenders` como fuente preferida de medios aplicados en caja.

El listado legacy no reemplaza ni elimina un intento porque otra fila comparta
la referencia. Cada intento de proveedor sigue siendo una operación propia.

## Respuesta del backend aislado

El runtime inspeccionado usa el puerto de desarrollo, `DISABLE_DATABASE=true` y
`FIXTURE_MODE=true`. Las dos referencias operativas suministradas no existen en
ese dataset y ambas consultas devolvieron cero filas con `meta.fixture=true`.
No se habilitó ODBC ni se consultó producción.

La validación de esos casos se realiza con contratos sanitizados que preservan
la relación funcional sin guardar identificadores reales en el repositorio.

## Diferencias encontradas

1. El MVP ocultaba intentos rechazados si encontraba un aprobado con la misma
   referencia y corregía manualmente el total/paginación. Esto contradecía el
   listado real y eliminaba la fila roja.
2. Para completar filas, el MVP consultaba `/sales` desde cada rechazado. Esto
   mezclaba listado y detalle, agregaba latencia y podía producir operaciones
   que el endpoint paginado no había entregado.
3. El backend de desarrollo fusionaba un pago electrónico con un medio de caja
   por igualdad de estado e importe. Esa aproximación podía asociar operaciones
   incorrectas.
4. El rol del pago seleccionado no siempre cambiaba el veredicto agregado de la
   venta: un rechazo podía mostrarse como conciliado porque la venta completa sí
   estaba conciliada.
5. Una búsqueda por referencia omitía los demás filtros en el servicio de
   Pagos. Conciliación aplicaba mínimo/máximo al importe fuente antes de calcular
   el importe presentado.

## Regla implementada

- El listado replica las filas y metadatos del endpoint; no crea efectivo,
  reintentos ni vuelto.
- La venta se carga únicamente al abrir el detalle.
- El pago seleccionado se compara por ID exacto; nunca por hora, importe o
  terminal.
- Pagos electrónicos, intentos no aplicados y medios de caja permanecen en
  colecciones separadas.
- Los medios de caja no positivos o identificados como vuelto no se presentan.
- El rechazado conserva su estado operativo aunque la venta asociada esté
  conciliada; el aprobado conserva el veredicto conciliado.
