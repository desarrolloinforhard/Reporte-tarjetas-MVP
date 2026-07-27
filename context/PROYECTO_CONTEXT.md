# Contexto del proyecto

## Identidad

- Empresa: **Inforhard S.R.L**
- Producto: **Reportes de Tarjetas**
- Color institucional principal: **#008A46**
- El verde institucional debe ser el color primario en web, Android e iOS.

## Objetivo

Crear desde cero una aplicación universal de Reportes de Tarjetas con paridad funcional respecto del producto existente, disponible como web responsive y aplicación para Android e iOS.

## Tecnología objetivo

- Expo SDK 57.
- React Native.
- React Native Web.
- TypeScript.
- Backend Node.js existente como servicio separado.

## Alcance funcional

La primera versión debe recuperar todas las capacidades necesarias del proyecto original. No se considera completa hasta contar con una matriz de paridad validada para los módulos y plataformas aplicables.

La interfaz puede adaptarse por plataforma. Paridad funcional significa que el usuario puede realizar las mismas operaciones relevantes, no que web y móvil deban tener una composición visual idéntica.

## Fuentes

- `J:\Proyectos\ReportesTarjetas`: referencia funcional de solo lectura. Está en producción y no se modifica.
- Backend Node.js: repositorio y proceso separados; comparte contratos y reglas, no el árbol de código de este frontend.
- Documentación de Expo SDK 57: fuente obligatoria para decisiones de Expo.

## Equipo

- Nicolás: frontend y fullstack; responsable principal de la aplicación universal.
- Misael: backend; responsable principal de API, seguridad, persistencia y compatibilidad.

## Principios

- Aislar desarrollo, staging y producción.
- Mantener retrocompatibilidad para clientes existentes.
- Implementar por módulos completos y verificables.
- Probar web y móvil durante el desarrollo, no al final.
- No almacenar secretos ni datos de clientes en el repositorio.
