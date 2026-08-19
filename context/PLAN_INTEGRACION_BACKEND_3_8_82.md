# Plan de integración del backend 3.8.82

Fecha de referencia: 2026-08-10.

## Estado verificado

- Buen Gusto ejecuta `3.8.80`, contrato `2026-07-24.2`.
- El release más nuevo disponible es `3.8.82`, contrato `2026-08-07.1`.
- `paquete-webserver-dev` partió de `3.8.80` y contiene mejoras propias del MVP.
- Los ZIP `3.8.80`, `3.8.81` y `3.8.82` fueron validados por versión interna y SHA-256.
- Producción no fue modificada ni reiniciada durante el relevamiento.

## Regla de integración

No copiar el release `3.8.82` completo sobre `paquete-webserver-dev` ni copiar
el backend dev completo sobre la instalación operativa. La integración se hace
por módulos, conservando compatibilidad con `/api/v1` y con el escritorio.

## Capas a conservar

### Desde 3.8.82

- Autenticación web básica y protecciones incorporadas en 3.8.81.
- Mejoras de Unicobros y almacenamiento Clover.
- Servicio heredado de imágenes.
- Carga y lectura del JSON original de productos.
- Variables y pruebas del almacenamiento JSON.
- Herramientas, documentación y procedimiento de releases/rollback.

### Desde paquete-webserver-dev

- Intentos de Mercado Pago y Clover como operaciones independientes.
- Relaciones exactas entre pago, intento y venta.
- Pago combinado sin filas artificiales de efectivo.
- Filtros monetarios y de fecha antes del truncamiento de fuentes.
- Liquidaciones con exploración ampliada y metadatos de exactitud.
- Resúmenes completos de Conciliación.
- Calidad de datos sin aproximaciones y con consultas deduplicadas.
- Benchmark, fixtures y pruebas de regresión sanitizadas.
- Barreras de desarrollo y staging, sin activarlas en producción.

## Autenticación

La autenticación de 3.8.82 no es la solución final del MVP: admite un único
administrador web, usa sesiones en memoria y no modela empresas. El prototipo
de `paquete-webserver-dev` agrega flujo web/native y refresh rotativo, pero sigue
siendo fixture y volátil.

La solución definitiva se diseñará con Misael sobre PostgreSQL e incluirá:

- usuarios, empresas y membresías;
- rol inicial `owner`;
- sesiones persistentes por dispositivo;
- access token corto y refresh token rotativo/revocable;
- `company_id` derivado de la sesión;
- aislamiento de consultas y escrituras impuesto por el backend;
- auditoría de acciones sensibles.

## Fases

### Fase 1 — Base y matriz

1. Inventariar diferencias `3.8.82` vs. dev.
2. Clasificar cada archivo como productivo, MVP, desarrollo o conflicto.
3. Incorporar documentación de 3.8.82 sin copiar secretos ni artefactos.
4. Definir pruebas de contrato para escritorio y MVP.

### Fase 2 — Funciones productivas de 3.8.82

1. Integrar JSON de productos e imágenes con sus pruebas. **Implementado en el
   backend editable y validado con 6 pruebas específicas más la suite completa.**
2. Integrar Unicobros y Clover sin perder el saneamiento de logs del dev.
   **Verificado e integrado:** Unicobros ya coincidía funcionalmente con
   `3.8.82` y conserva protecciones adicionales del dev (debug desactivado por
   defecto y saneamiento de logs). En Clover se incorporaron los campos de
   renovación, vencimiento, región y ambiente al listado de comercios activos,
   con una prueba de regresión específica.
3. Integrar configuración y metadatos de versión. **Completado:** backend dev
   alineado con base `3.8.82`, contrato `2026-08-07.1`, override mediante
   `APP_VERSION`, health verificado y herramientas de release/actualización
   validadas únicamente en modo diagnóstico.
4. Validar que fixtures y staging sigan completamente aislados.

### Fase 3 — Paridad de Reportes

1. Pagos y Ventas.
2. Liquidaciones.
3. Conciliación.
4. Calidad de datos y rendimiento.
5. Casos reales `B-0035-00049027` y `B-0059-00084981` en ambiente autorizado.

### Fase 4 — Autenticación multiempresa

1. Acordar contrato y esquema PostgreSQL con Misael.
2. Implementar persistencia y revocación.
3. Aplicar aislamiento por empresa en todos los repositorios.
4. Adaptar Expo web/native y SecureStore.
5. Probar que una empresa no puede consultar ni modificar otra.

### Fase 5 — Candidato y piloto

1. Ejecutar pruebas, sintaxis, lint, typecheck y export web.
2. Probar el escritorio y el MVP contra el mismo candidato.
3. Medir rangos de 1, 7, 30 y 61 días.
4. Crear release versionado posterior a `3.8.82`.
5. Ensayar backup, health y rollback antes de cualquier promoción.

## Criterios de no regresión

- Ningún cambio incompatible dentro de `/api/v1`.
- Ninguna fila de pago creada por aproximación o síntesis.
- Ninguna credencial o dato real dentro del repositorio o fixtures.
- Ningún fixture, watcher o integración externa activo por error.
- Ningún despliegue sin prueba conjunta del escritorio y el MVP.
- Ninguna consulta o escritura multiempresa basada solamente en parámetros del cliente.
