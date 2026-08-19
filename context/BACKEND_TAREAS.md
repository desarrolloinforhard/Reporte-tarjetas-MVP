# Tareas de backend

Este archivo coordina necesidades del frontend universal. La implementación ocurre en el repositorio del backend, nunca directamente desde este repositorio.

## Estados

`pendiente`, `en_progreso`, `disponible_desarrollo`, `validado_staging`, `aprobado_produccion`, `bloqueado`, `postergado`.

## Registro

| ID | Tarea | Estado | Responsable | Compatibilidad |
|---|---|---|---|---|
| BE-001 | Inventariar endpoints y contratos usados por la app Bootstack | en_progreso | Nicolás/Misael | Solo lectura |
| BE-002 | Preparar runtime y datos seguros de desarrollo | disponible_desarrollo | Nicolás/Misael | Sin producción |
| BE-003 | Preparar staging aislado | disponible_desarrollo | Misael | Ensayo local seguro listo; infraestructura real pendiente |
| BE-004 | Diseñar autenticación web/móvil y transición del cliente legacy | disponible_desarrollo | Nicolás/Misael | No activar globalmente |
| BE-005 | Definir autorización por cliente, sucursal, rol y operación | pendiente | Misael | Aditiva |
| BE-006 | Configurar CORS por ambiente | pendiente | Misael | Aditiva |
| BE-007 | Generar especificación verificable de `/api/v1` | pendiente | Nicolás/Misael | Sin cambio |
| BE-008 | Agregar pruebas automatizadas de contratos críticos | pendiente | Misael | Protege v1 |
| BE-009 | Revisar exportaciones y descargas en web y móvil | pendiente | Nicolás/Misael | Aditiva |
| BE-010 | Definir observabilidad, auditoría y alertas | pendiente | Misael | Aditiva |
| BE-011 | Validar mínimo/máximo antes de paginar todas las fuentes de Pagos | disponible_desarrollo | Nicolás/Misael | Protege listado, resumen y exportación |
| BE-012 | Resolver referencia exacta y luego aplicar fecha y demás filtros | disponible_desarrollo | Nicolás/Misael | No cambia `/api/v1` |
| BE-013 | Filtrar Conciliación por el importe presentado después de agrupar | disponible_desarrollo | Nicolás/Misael | Aditiva y compatible |
| BE-014 | Separar pagos electrónicos, intentos y medios de caja sin aproximaciones | disponible_desarrollo | Nicolás/Misael | Requiere regresión Bootstack |
| BE-015 | Detectar duplicados automáticos solo por proveedor e ID externo exacto | disponible_desarrollo | Nicolás/Misael | Evita falsos positivos |
| BE-016 | Validar filtros, paginación y relaciones en staging/réplica autorizada | pendiente | Nicolás/Misael | Sin producción |
| BE-017 | Medir y optimizar endpoints de Calidad y Conciliación | disponible_desarrollo | Nicolás/Misael | Caché acotada y referencias exactas |

La autorizacion objetivo del MVP es una cuenta propietaria con consulta integral
de todas las sucursales. `BE-005` no requiere una matriz compleja de roles en la
primera version; debe conservar permisos aditivos para futuras ampliaciones.

## Plantilla de tarea

```md
## BE-XXX - Título

Estado:
Responsable:
Prioridad:

### Objetivo

### Contrato actual

### Contrato esperado

### Compatibilidad Bootstack

### Seguridad

### Criterios de aceptación

### Evidencia de validación
```

## Regla de cierre

Una tarea no está terminada hasta documentar contrato, pruebas, ambiente validado, impacto en ambos frontends y estrategia de despliegue. “Funciona localmente” no autoriza producción.

## Estado vigente de BE-002

La versión operativa `3.8.80` fue recuperada en la rama `develop` del remoto
privado `desarrolloinforhard/paquete-webserver`. La reconciliación se documentó
y cerró en:

`desarrolloinforhard/paquete-webserver#1`.

La copia Git para desarrollo se encuentra en
`J:\Proyectos\paquete-webserver-dev`. No se debe inicializar ni reparar Git dentro
de `J:\Proyectos\paquete-webserver`.

El runtime aislado puede iniciarse con `DISABLE_DATABASE=true`,
`FIXTURE_MODE=true`, proveedores y ngrok deshabilitados y CORS limitado a
orígenes explícitos.

El dataset sintético habilita:

- `GET /api/v1/reports/summary`
- `GET /api/v1/metrics/daily-payments`
- `GET /api/v1/metrics/provider-comparison`
- `GET /api/v1/sync/status`
- `GET /api/v1/payments`
- `GET /api/v1/payments/summary`
- `GET /api/v1/payments/catalogs`
- `GET /api/v1/payments/:provider/:id`

Todas las respuestas fixture declaran `meta.fixture=true`. Inicio fue validado
en web de escritorio y móvil contra el backend aislado, sin acceso a ODBC ni
información de clientes.

## Bloqueos de compatibilidad detectados el 2026-08-06

- `BE-011` a `BE-015` tienen implementación y pruebas sanitizadas en la rama
  `develop` del backend aislado.
- No se consideran validados con datos reales hasta completar `BE-016`.
- Pagos, Liquidaciones y Calidad pueden heredar omisiones si aplican importes
  sobre una ventana ya paginada.
- Conciliación debe comparar mínimo/máximo contra el total mostrado, no contra
  un intento individual previo a la agrupación.
- El detalle de venta no puede relacionar medios por coincidencia de importe,
  fecha, hora o terminal.

Pagos fue validado con filtros contractuales, resumen, paginación y detalle.
Las operaciones son sintéticas y las rutas requieren autenticación.

## Estado vigente de BE-004

El backend aislado publica login, renovación rotativa, consulta y cierre de
sesión. Web utiliza una cookie opaca HttpOnly y native utiliza access/refresh
tokens opacos. Expo protege las rutas y almacena el refresh nativo con
SecureStore. Falta validar la development build Android y reemplazar el
almacenamiento volátil antes de staging.

El 2026-08-11 se alineó la identidad fixture con el contrato propietario:
`role=owner`, empresa y membresía activas dentro de usuario y sesión. Esto
permite validar el caso de una sola empresa sin inventar persistencia. Selección
entre varias empresas, recuperación de contraseña y revocación durable siguen
dependiendo del repositorio PostgreSQL definido por IHAPI-F4-019.

## Orden vigente de cierre (2026-08-07)

1. Liquidaciones ampliadas: implementadas y validadas con fixtures; pendiente
   `BE-016` con réplica autorizada.
2. Rendimiento: medir endpoints y optimizar Calidad/Conciliación sin alterar
   contratos ni relaciones exactas. La implementación aislada y el benchmark
   local están completos; falta la comparación antes/después en staging.
3. Paridad real: validar las referencias `B-0035-00049027` y
   `B-0059-00084981` solamente en staging o lectura autorizada.
4. Autenticación propietaria: completar persistencia del backend y validación
   Android; PIN/biometría queda como opción local.
5. Staging: preparar ambiente separado antes del piloto.

- [x] Liquidaciones (backend aislado): reemplazar el limite silencioso de 2000
  por exploracion interna configurable y exponer
  `total_exact`/`source_truncated`/`source_scan_limit` en listado y resumen.
- [x] Liquidaciones (backend aislado): filtrar por la fecha de liquidacion
  visible, incluyendo Desde/Hasta, sin perder pagos del dia previo usados para
  estimar la acreditacion.
- [ ] Liquidaciones: validar la exploracion ampliada con staging o replica de
  solo lectura antes de incorporarla al backend operativo.
