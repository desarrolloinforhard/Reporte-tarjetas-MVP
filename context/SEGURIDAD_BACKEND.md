# Seguridad del backend

## Regla principal

La API existente no debe exponerse públicamente ni cambiar su autenticación en producción como parte del desarrollo del frontend. Todo endurecimiento se implementa primero en desarrollo, se valida en staging y se habilita de forma controlada.

## Requisitos antes de una publicación externa

- HTTPS obligatorio.
- Autenticación real para web y móvil.
- Autorización por usuario, rol, cliente, sucursal y operación.
- Aislamiento de datos entre clientes.
- CORS con orígenes explícitos para web; nunca comodín con credenciales.
- Límites de frecuencia en login y operaciones costosas.
- Validación y normalización de entradas.
- Logs con `request_id`, sin secretos ni datos personales innecesarios.
- Auditoría de exportaciones y acciones sensibles.
- Cabeceras de seguridad y tamaño máximo de solicitudes.
- Gestión externa y rotación de secretos.

## Sesión por plataforma

- Web: preferir cookie `HttpOnly`, `Secure` y `SameSite` adecuada al despliegue.
- Android/iOS: token de corta duración y refresh token rotativo almacenado con mecanismos seguros del sistema.
- Los tokens deben poder revocarse.
- Nunca guardar secretos o credenciales del backend en `EXPO_PUBLIC_*`, código fuente o repositorio.

## Autorización

La interfaz puede ocultar funciones, pero el backend siempre vuelve a comprobar permisos. Toda consulta debe derivar el alcance autorizado desde la identidad autenticada; no debe confiar solamente en un `client_id`, `branch_id` o rol enviado por el frontend.

## Datos y diagnósticos

- No devolver cadenas de conexión, SQL, rutas internas, stack traces ni tokens.
- Minimizar datos de tarjeta y nunca exponer información sensible completa.
- Enmascarar datos de fixtures, capturas y reportes de prueba.
- Separar logs de aplicación y auditoría.
- Definir retención y acceso de logs por ambiente.

## Despliegue seguro

1. Ejecutar pruebas automáticas y revisión de dependencias.
2. Confirmar configuración del ambiente sin imprimir secretos.
3. Probar migraciones compatibles y reversibles.
4. Crear respaldo verificado cuando corresponda.
5. Desplegar en staging.
6. Ejecutar smoke tests y regresión Bootstack/Expo.
7. Aprobar producción.
8. Monitorear errores, latencia y accesos.
9. Revertir ante degradación.

## Prohibiciones

- Usar datos o credenciales reales en tests versionados.
- Apuntar una build de desarrollo a producción.
- Abrir puertos o túneles públicos como solución productiva.
- cambiar `/api/v1` de forma incompatible.
- activar autenticación obligatoria global sin plan de transición para clientes existentes.
- ejecutar escrituras o tareas administrativas desde endpoints de consulta.

## Incidentes

Ante exposición de credenciales: detener el despliegue, revocar y rotar credenciales, revisar accesos, documentar alcance y recién después reanudar. No alcanza con borrar el secreto del último commit.
