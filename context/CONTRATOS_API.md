# Contratos de API

## Alcance

Este documento define las reglas que el frontend universal espera del backend. El catálogo detallado de endpoints se completará desde la matriz de paridad y la especificación real del backend.

## Sobre estándar

Éxito:

```json
{
  "ok": true,
  "data": {},
  "meta": {
    "api_contract_version": "version",
    "request_id": "id"
  },
  "error": null
}
```

Error:

```json
{
  "ok": false,
  "data": null,
  "meta": {
    "api_contract_version": "version",
    "request_id": "id"
  },
  "error": {
    "code": "ERROR_CODE",
    "message": "Mensaje utilizable",
    "details": {}
  }
}
```

## Reglas de compatibilidad

- No renombrar, eliminar ni cambiar el tipo o significado de un campo de `/api/v1`.
- Agregar campos opcionales es compatible.
- Agregar un endpoint es compatible.
- Un valor nuevo de enum debe documentarse y el frontend debe tolerar desconocidos.
- Un campo requerido nuevo, cambio semántico o estructura diferente requiere `/api/v2`.
- Las correcciones ambiguas se introducen mediante un campo nuevo antes de retirar el anterior.
- Toda deprecación debe tener aviso, medición de uso y fecha acordada.

## Fechas, importes y paginación

- Fechas civiles: `YYYY-MM-DD`.
- Instantes: ISO 8601 con zona horaria.
- Definir explícitamente la zona usada para cierres y rangos.
- Importes y moneda deben tener semántica documentada; no inferir total cobrado desde una página.
- Listados paginados deben incluir al menos `limit`, `offset`, `count`, `total` cuando sea viable, `has_more` y `next_offset`.
- Si un total es estimado, informar `total_exact: false`.
- En `provider=all`, la paginación se aplica al resultado combinado global.

## Errores

Usar códigos estables y accionables, por ejemplo:

- `VALIDATION_ERROR`
- `UNAUTHENTICATED`
- `FORBIDDEN`
- `NOT_FOUND`
- `RATE_LIMITED`
- `PROVIDER_UNAVAILABLE`
- `INTERNAL_ERROR`

El mensaje puede cambiar; el frontend decide comportamiento por `code` y estado HTTP.

## Áreas funcionales esperadas

- Salud y diagnóstico limitado.
- Sesión y usuario.
- Proveedores, sucursales y terminales.
- Resúmenes y métricas.
- Pagos, detalle y venta asociada.
- Liquidaciones y tareas.
- Conciliación.
- Calidad de datos.
- Exportaciones.
- Preferencias y vistas guardadas.

## Proceso para modificar contratos

Toda propuesta debe indicar:

1. Endpoint y método.
2. Motivo y consumidores afectados.
3. Parámetros con obligatoriedad.
4. Ejemplo de éxito y error sin datos sensibles.
5. Estados HTTP y códigos de error.
6. Paginación, rendimiento y límites.
7. Compatibilidad con `/api/v1`.
8. Pruebas de contrato.
9. Estrategia de despliegue y reversión.
