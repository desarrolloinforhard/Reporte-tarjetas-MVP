# Rendimiento de endpoints

Última actualización: 2026-08-07.

## Alcance y seguridad

La medición activa se realiza únicamente contra `paquete-webserver-dev` con
fixtures o contra un futuro staging autorizado. No se ejecutan benchmarks ni
pruebas de carga contra el backend productivo. Los tiempos operativos citados
provienen del registro de solo lectura entregado por el usuario.

## Línea base local con fixtures

El benchmark HTTP recorre 19 endpoints utilizados por Inicio, Pagos,
Liquidaciones, Conciliación, Calidad y Configuración. Se ejecutaron ocho rondas
por endpoint para el rango 08/07/2026-07/08/2026.

- Promedios observados: 0,99-2,08 ms con conexión HTTP reutilizada.
- Mayor respuesta: `payments` y `settlements`, aproximadamente 5,7-6,0 KB.
- Conclusión: fixtures y transporte local no explican la demora percibida; el
  costo está en las lecturas y relaciones del backend con datos operativos.

### Validación manual del 07/08/2026

El usuario repitió el benchmark desde PowerShell con ocho rondas y el rango
08/07/2026-07/08/2026:

- Los 19 endpoints respondieron correctamente.
- Promedios observados: 0,73-1,94 ms.
- Máximo observado: 3,71 ms en `health`.
- `data-quality/orphan-payments`: promedio 0,76 ms y máximo 0,91 ms con fixtures.
- No hubo timeouts ni categorías no disponibles.

La validación visual web confirmó que Calidad actualiza revisados, válidos,
advertencias y las cuatro categorías al cambiar el rango. También se abrieron
el hallazgo y el detalle del pago. Conciliación conservó cantidades/totales y
abrió resumen, productos, pagos asociados y datos técnicos.

La evidencia visual detectó que el fixture agrupaba como duplicados un pago
Clover y otro Mercado Pago por una regla antigua de fecha/hora/importe. Se
corrigió el fixture: la detección automática ahora exige proveedor e ID externo
exactos, igual que el servicio operativo. El dataset actual no contiene un par
que cumpla esa condición y, por lo tanto, debe mostrar 0 duplicados. El usuario
reinició el backend y confirmó manualmente que la categoría muestra 0.

La paginación visual de Conciliación no pudo ejercitarse porque el dataset
fixture produjo como máximo 15 resultados, menos que el tamaño de página 20.
No se agregan pagos sintéticos sólo para forzar esa prueba; la paginación queda
cubierta por los contratos automatizados y deberá repetirse visualmente en
staging con un rango que supere 20 resultados.

El backend aislado incorpora `npm run benchmark:api`. Requiere
`BENCHMARK_USERNAME` y `BENCHMARK_PASSWORD`; admite `BENCHMARK_API_URL`,
`BENCHMARK_FROM`, `BENCHMARK_TO`, `BENCHMARK_ROUNDS` y `BENCHMARK_OUTPUT`.

## Evidencia operativa previa, solo lectura

El registro del 06/08/2026 muestra:

| Endpoint | Tiempo observado |
|---|---:|
| `data-quality/payments` | 1.680 ms |
| `data-quality/duplicates` | 1.753 ms |
| `data-quality/amount-outliers` | 1.776 ms |
| `data-quality/missing-references` | 3.243 ms |
| `data-quality/orphan-payments` | timeout superior a 60 s |
| `payments` | 1.409-6.972 ms |
| `payments/summary` | 1.721-4.941 ms |

Calidad iniciaba cinco análisis concurrentes sobre el mismo rango. Cada ruta
volvía a leer hasta 500 pagos. Además, `orphan-payments` buscaba cada venta de
forma secuencial y generaba hasta 500 cargas individuales completas.

Conciliación ejecutaba dos veces el mismo análisis para listado y resumen:
lectura de pagos, agrupación exacta por referencia y consultas masivas de ventas
y medios de caja.

## Optimizaciones implementadas en el backend aislado

- Calidad comparte por cinco segundos la misma promesa de lectura de pagos entre
  resumen, duplicados, referencias faltantes, pagos sin venta e importes.
- Conciliación comparte por cinco segundos el análisis completo entre listado y
  resumen. Las claves incluyen todos los filtros funcionales y excluyen sólo la
  paginación/presentación.
- Las promesas fallidas se eliminan inmediatamente; la caché está limitada a 20
  entradas y no relaciona datos por hora, importe o terminal.
- `orphan-payments` reemplaza el patrón N+1 por búsquedas masivas de cabeceras con
  la referencia exacta `serie-sucursal-comprobante`. Para 500 pagos pasa de hasta
  500 cargas de venta a un máximo aproximado de 13 consultas por bloques de 40.
- Las pruebas automatizadas verifican una sola lectura concurrente en Calidad y
  Conciliación y una sola operación masiva para detectar pagos sin venta.

## Validación pendiente

- Repetir el benchmark en staging/réplica autorizada con rangos de 1, 7, 30 y 61
  días, tanto en frío como en caliente.
- Registrar promedio, p95, máximo, tamaño de respuesta, filas exploradas y
  timeout por endpoint.
- Confirmar que Calidad conserva exactamente los mismos hallazgos y que
  Conciliación conserva totales, relaciones y estados.
- Ajustar TTL o bloques sólo con evidencia de staging. No habilitar esta fase en
  producción sin revisión y plan de rollback.
