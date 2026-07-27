# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# Reglas obligatorias del proyecto

Este repositorio contiene el nuevo frontend universal de Reportes de Tarjetas. Se desarrolla desde cero con Expo, React Native, React Native Web y TypeScript.

## Límites de seguridad

- No modificar, mover, borrar ni formatear archivos de `J:\Proyectos\ReportesTarjetas`. Ese proyecto está en producción y solo puede consultarse en modo lectura como referencia funcional.
- No desarrollar, probar ni ejecutar migraciones contra ambientes, servicios, credenciales o bases de datos de producción.
- El backend Node.js permanece en un repositorio separado. No copiarlo ni incorporarlo a este repositorio.
- No incluir secretos, tokens, contraseñas, certificados, datos personales ni credenciales reales en código, documentación, fixtures, commits o variables `EXPO_PUBLIC_*`.
- Usar únicamente endpoints y datos de desarrollo o staging autorizados.
- Mantener compatibilidad con los contratos vigentes del backend. Todo cambio incompatible requiere una decisión documentada, versionado de API y coordinación con Misael.

## Responsabilidades

- Nicolás: responsable principal de frontend, Expo, React Native Web, diseño responsive e integración; también realizará tareas fullstack acordadas.
- Misael: responsable principal del backend Node.js, contratos, seguridad, persistencia, despliegues y compatibilidad con consumidores existentes.
- Las decisiones que afecten contratos, autenticación, datos o producción requieren revisión de ambos.

## Flujo de trabajo

- `main` debe estar protegida, estable y desplegable. No se trabaja directamente sobre ella.
- `develop` es la única rama de desarrollo e integración cotidiana.
- No crear ramas adicionales salvo autorización explícita de Nicolás.
- Los cambios se confirman y publican en `develop`.
- Cada fase o entrega estable entra a `main` mediante pull request desde `develop`.
- Todo pull request requiere revisión cruzada: Nicolás revisa cambios de Misael y Misael revisa cambios de Nicolás.
- Antes de integrar, ejecutar los controles disponibles de tipos, lint, pruebas y compilación web.
- Antes de trabajar o publicar en `develop`, actualizar la rama y coordinar módulos para minimizar conflictos.
- No usar `force push` en `main` ni `develop`.
- No mezclar refactors no relacionados con una tarea funcional.

## Documentación operativa

- Leer `context/README.md` antes de iniciar una tarea relevante.
- Actualizar `context/ESTADO_ACTUAL.md` cuando cambie el estado verificable del proyecto.
- Registrar decisiones importantes en `context/decisiones/`.
- Usar los perfiles de `.agents/` cuando se deleguen tareas especializadas.
