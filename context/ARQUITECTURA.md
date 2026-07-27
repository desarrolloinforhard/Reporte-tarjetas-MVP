# Arquitectura de ReportesTarjetasApp

## Objetivo

Crear un frontend universal con Expo, React Native, React Native Web y TypeScript que alcance paridad funcional con la aplicación de escritorio existente, sin modificar ni depender del código Python/Bootstack en tiempo de ejecución.

## Límites de los sistemas

```text
ReportesTarjetasApp (este repositorio)
  Web + Android + iOS
          |
          | HTTPS / JSON
          v
paquete-webserver (repositorio separado)
  API Node.js + reglas de negocio + acceso a datos
          |
          v
Fuentes de datos e integraciones de cada cliente
```

- Este repositorio contiene únicamente el frontend y su documentación.
- El backend conserva una sola fuente oficial de código en su repositorio.
- El proyecto productivo `ReportesTarjetas` es referencia funcional de solo lectura.
- No se copian conexiones, SQL, credenciales ni lógica sensible al cliente.

## Principios

1. Un solo código backend, múltiples despliegues aislados.
2. Desarrollo y pruebas nunca apuntan a producción.
3. `/api/v1` mantiene compatibilidad hacia atrás con el cliente Bootstack.
4. Los cambios compatibles son aditivos; los incompatibles requieren `/api/v2`.
5. El frontend consume únicamente HTTP; no accede a bases ni proveedores directamente.
6. Las diferencias web/native se aíslan solo cuando la interacción lo exige.
7. Toda función migrada se valida contra la matriz de paridad.

## Responsabilidades

### Frontend

- Navegación, presentación responsive y accesibilidad.
- Estado de servidor con TanStack Query.
- Validación de datos recibidos en límites críticos.
- Manejo uniforme de carga, vacío, error y reintento.
- Persistencia segura según plataforma.
- No reinterpretar reglas financieras que pertenecen al backend.

### Backend

- Autenticación y autorización.
- Aislamiento de clientes y sucursales.
- Consultas, agregaciones, conciliación y reglas financieras.
- Normalización de proveedores.
- Paginación y exportaciones.
- Auditoría, trazabilidad y contrato HTTP estable.

## Flujo de cambios

1. Documentar necesidad y contrato esperado.
2. Implementar backend en rama y runtime de desarrollo.
3. Probar compatibilidad con consumidores actuales.
4. Integrar el frontend contra desarrollo.
5. Desplegar a staging y ejecutar pruebas de regresión.
6. Aprobar explícitamente el pase a producción.
7. Desplegar gradualmente con reversión disponible.

## Repositorios productivos

No modificar desde este proyecto:

- `J:\Proyectos\ReportesTarjetas`
- `J:\Proyectos\paquete-webserver`

Una tarea que requiera backend debe abrirse y ejecutarse en el repositorio del backend mediante su propio flujo de revisión.
