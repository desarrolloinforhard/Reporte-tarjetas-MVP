# Tareas de backend

Este archivo coordina necesidades del frontend universal. La implementación ocurre en el repositorio del backend, nunca directamente desde este repositorio.

## Estados

`pendiente`, `en_progreso`, `disponible_desarrollo`, `validado_staging`, `aprobado_produccion`, `bloqueado`, `postergado`.

## Registro

| ID | Tarea | Estado | Responsable | Compatibilidad |
|---|---|---|---|---|
| BE-001 | Inventariar endpoints y contratos usados por la app Bootstack | en_progreso | Nicolás/Misael | Solo lectura |
| BE-002 | Preparar runtime y datos seguros de desarrollo | bloqueado | Nicolás/Misael | Sin producción |
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

## Bloqueo vigente de BE-002

El remoto privado `desarrolloinforhard/paquete-webserver` está en la versión
`3.8.79`, mientras la carpeta operativa declara `3.8.80` y contiene cambios de
código todavía ausentes en GitHub. Antes de crear el runtime de desarrollo debe
reconciliarse esa diferencia mediante la tarea:

`desarrolloinforhard/paquete-webserver#1`.

La copia Git para desarrollo se encuentra en
`J:\Proyectos\paquete-webserver-dev`. No se debe inicializar ni reparar Git dentro
de `J:\Proyectos\paquete-webserver`.
