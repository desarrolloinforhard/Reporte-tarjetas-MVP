# Gestión del proyecto en ClickUp

## Ubicación

- Workspace: `Workspace` (`90171275710`).
- Space: `IH DESARROLLO` (`90175860172`).
- Carpeta: `Reporte Tarjetas MVP` (`901710161276`).
- Lista: `Plan inicial` (`901715599892`).

La lista contiene ocho fases como tareas maestras y 72 subtareas ejecutables.

## Fuente de verdad

- ClickUp gestiona alcance, responsables, prioridad y estado.
- GitHub conserva código, issues técnicos, pull requests y evidencia de revisión.
- `context/MATRIZ_PARIDAD.md` conserva la evidencia de paridad funcional.

Ninguna de estas fuentes sustituye a las demás.

## Convención de trazabilidad

1. Cada commit relevante en `develop` debe referenciar el ID de la subtarea de ClickUp.
2. Una fase pasa a revisión cuando existe un pull request verificable de `develop` a `main`.
3. Una subtarea solo pasa a completada después de revisión, controles automáticos y actualización
   de la matriz o documentación aplicable.
4. No se crea una tarea por commit.
5. La automatización debe ser idempotente: el mismo issue o pull request no puede
   generar tareas duplicadas.

## Responsables

- Nicolás: frontend, responsive, Expo e integración fullstack acordada.
- Misael: backend, contratos, seguridad, persistencia y despliegues.
- Compartido: autenticación, contratos, fixtures, staging, paridad y aprobación.

Las asignaciones se completarán cuando ambos usuarios sean miembros del Workspace.

## Automatización pendiente

La integración continua GitHub–ClickUp se configurará después de proteger `main`.
Los tokens o credenciales se almacenarán como secretos del proveedor, nunca en
este repositorio ni en variables `EXPO_PUBLIC_*`.
