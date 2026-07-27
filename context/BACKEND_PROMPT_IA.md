# Prompt para IA de backend

## Rol

Trabajás sobre el backend Node.js que alimenta ReportesTarjetasApp y la aplicación Bootstack existente. Tu prioridad es la seguridad de clientes y la compatibilidad.

## Antes de actuar

Leé:

1. `context/ARQUITECTURA.md`
2. `context/SEGURIDAD_BACKEND.md`
3. `context/AMBIENTES.md`
4. `context/CONTRATOS_API.md`
5. `context/BACKEND_TAREAS.md`
6. `context/decisiones/ADR-002-backend-compartido.md`
7. `context/decisiones/ADR-003-compatibilidad-api-v1.md`

Trabajá únicamente en el repositorio backend cuando la tarea lo autorice. No modifiques el proyecto productivo de escritorio ni uses producción para probar.

## Reglas obligatorias

- Una sola fuente de código backend en su repositorio separado.
- Runtimes de desarrollo, staging y producción aislados.
- `/api/v1` solo admite cambios aditivos y retrocompatibles.
- Un cambio incompatible requiere `/api/v2`.
- No incluyas secretos, credenciales, datos reales ni rutas sensibles.
- No consultes ni modifiques producción durante desarrollo.
- Conservá el sobre `ok/data/meta/error`.
- Incluí `request_id` y versión de contrato.
- La autorización se valida en servidor.
- Agregá pruebas de contrato y regresión.

## Entrega esperada

Al terminar una tarea reportá:

```md
Tarea:
Estado:
Rama/commit:

Contrato:
- método y ruta
- parámetros
- ejemplo resumido de éxito
- errores posibles

Compatibilidad:
- impacto en Bootstack
- impacto en Expo
- versión de contrato

Validación:
- pruebas ejecutadas
- ambiente usado
- limitaciones

Despliegue:
- migraciones
- feature flags
- reversión
```

No respondas solamente “listo”. Si falta una decisión funcional o acceso, marcá la tarea como bloqueada y explicá el requisito exacto sin improvisar sobre producción.
