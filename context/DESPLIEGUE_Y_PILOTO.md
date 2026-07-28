# Despliegue, staging y piloto

Última actualización: 2026-07-28.

## Principio de seguridad

El proyecto nuevo no se conecta directamente a la instalación productiva de
Buen Gusto para realizar las primeras pruebas. El recorrido obligatorio es:

```text
Desarrollo local → Staging aislado → Piloto controlado → Producción
```

Los commits y pushes a `develop` no actualizan instalaciones de clientes. El
repositorio almacena código; no existe despliegue automático hacia Buen Gusto.

## Ambientes

### Desarrollo local

- Frontend: `J:\Proyectos\ReportesTarjetasApp`, rama `develop`.
- Backend: `J:\Proyectos\paquete-webserver-dev`, rama `develop`.
- Base de datos desactivada.
- Usuarios y datos sintéticos.
- Proveedores externos y producción deshabilitados.

### Staging aislado

Antes de probar con información real debe existir un ambiente separado:

- Servidor o máquina virtual independiente.
- Base exclusiva de pruebas o copia anonimizada.
- Credenciales diferentes a producción.
- Dominio propio de staging y HTTPS obligatorio.
- Backend desplegado desde una versión identificable.
- Web, APK preview y logs separados de producción.
- Pruebas de login, permisos, pagos, reportes, liquidaciones, conciliación y
  compatibilidad con el frontend Bootstack.

### Piloto controlado

Después de aprobar staging:

- Seleccionar pocos usuarios autorizados.
- Comenzar con funciones de consulta.
- Mantener escrituras y administración desactivadas inicialmente.
- Habilitar funciones gradualmente mediante configuración.
- Monitorear errores, accesos y tiempos de respuesta.
- Mantener respaldo y rollback probado.

Durante el piloto pueden convivir ambos clientes:

```text
Frontend Bootstack ─┐
                    ├── API compatible y versionada ── Base del cliente
App Expo nueva ─────┘
```

## Salida a producción

1. Aprobar pruebas locales y de staging.
2. Revisar compatibilidad Bootstack/Expo.
3. Crear PR de `develop` hacia `main`.
4. Realizar revisión cruzada de Nicolás y Misael.
5. Crear versión y tag, por ejemplo `v3.9.0`.
6. Generar un paquete de distribución reproducible.
7. Respaldar y verificar la instalación actual del cliente.
8. Acordar una ventana de mantenimiento.
9. Instalar la versión aprobada sin usar `git pull` en el cliente.
10. Configurar secretos productivos fuera de Git.
11. Ejecutar smoke tests de salud, autenticación, reportes y Bootstack.
12. Habilitar usuarios y funciones gradualmente.
13. Monitorear y aplicar rollback ante degradación.

No se actualiza Buen Gusto por cada commit. Los commits se acumulan en
`develop`; solamente se distribuyen versiones estables, numeradas y aprobadas.

## Requisitos pendientes antes de staging

- Reemplazar el usuario sintético y la contraseña local.
- Persistir sesiones en un almacenamiento revocable compartido.
- Definir usuarios, roles, permisos, clientes y sucursales reales.
- Aislar datos entre clientes desde el backend.
- Implementar auditoría de accesos, exportaciones y acciones sensibles.
- Aplicar límites de frecuencia persistentes.
- Configurar HTTPS y cookies `Secure`.
- Definir gestión y rotación externa de secretos.
- Preparar observabilidad, alertas y política de retención de logs.
- Validar Android, iOS, web y Bootstack.
- Documentar instalación, actualización y rollback del backend.

## Temas para revisar con Misael

1. Infraestructura disponible para staging.
2. Origen de usuarios y credenciales reales.
3. Modelo de autorización por empresa, cliente, sucursal y rol.
4. Persistencia y revocación de sesiones.
5. Compatibilidad y transición del frontend Bootstack.
6. Versionado de API y del paquete instalable.
7. Proceso actual de actualización en Buen Gusto.
8. Backups, ventana de mantenimiento y rollback.
9. Logs, auditoría y monitoreo.
10. Responsable de aprobar el piloto y la salida a producción.

## Estado de la autenticación actual

La autenticación vigente es exclusivamente de desarrollo:

- Credenciales sintéticas guardadas en `.env` ignorado.
- Sesiones en memoria que desaparecen al reiniciar.
- Cookie web sin `Secure` porque se utiliza HTTP local.
- Tokens nativos opacos con SecureStore.
- Sin usuarios, clientes ni sucursales reales.

No está autorizada para staging ni producción.
