# Tareas de backend

Este archivo coordina necesidades del frontend universal. La implementación ocurre en el repositorio del backend, nunca directamente desde este repositorio.

## Estados

`pendiente`, `en_progreso`, `disponible_desarrollo`, `validado_staging`, `aprobado_produccion`, `bloqueado`, `postergado`.

## Registro

| ID | Tarea | Estado | Responsable | Compatibilidad |
|---|---|---|---|---|
| BE-001 | Inventariar endpoints y contratos usados por la app Bootstack | en_progreso | Nicolás/Misael | Solo lectura |
| BE-002 | Preparar runtime y datos seguros de desarrollo | disponible_desarrollo | Nicolás/Misael | Sin producción |
| BE-003 | Preparar staging aislado | pendiente | Misael | Sin producción |
| BE-004 | Diseñar autenticación web/móvil y transición del cliente legacy | en_progreso | Nicolás/Misael | No activar globalmente |
| BE-005 | Definir autorización por cliente, sucursal, rol y operación | pendiente | Misael | Aditiva |
| BE-006 | Configurar CORS por ambiente | pendiente | Misael | Aditiva |
| BE-007 | Generar especificación verificable de `/api/v1` | pendiente | Nicolás/Misael | Sin cambio |
| BE-008 | Agregar pruebas automatizadas de contratos críticos | pendiente | Misael | Protege v1 |
| BE-009 | Revisar exportaciones y descargas en web y móvil | pendiente | Nicolás/Misael | Aditiva |
| BE-010 | Definir observabilidad, auditoría y alertas | pendiente | Misael | Aditiva |

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

Todas las respuestas fixture declaran `meta.fixture=true`. Inicio fue validado
en web de escritorio y móvil contra el backend aislado, sin acceso a ODBC ni
información de clientes.
