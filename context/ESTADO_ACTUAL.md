# Estado actual

Última actualización: 2026-07-28.

## Implementado

- Repositorio local creado en `J:\Proyectos\ReportesTarjetasApp`.
- Remoto configurado como `desarrolloinforhard/Reporte-tarjetas-MVP`.
- Expo SDK 57, React Native 0.86 y React Native Web 0.21.
- TypeScript estricto y aliases `@/*`.
- Expo Router y base de navegación.
- TanStack Query, Zod y React Hook Form.
- `expo-dev-client` y `expo-secure-store`.
- Cliente HTTP con validación del contrato `ok/data/meta/error`.
- Endpoint inicial de salud tipado.
- Perfiles EAS para development, preview y production.
- Contexto, agentes, ADR y matriz de paridad.
- GitHub Actions para lint, tipos, pruebas y export web.
- Identidad institucional de **Inforhard S.R.L**.
- Verde institucional `#008A46` y paleta semántica heredada.
- Logos productivos reutilizados en `assets/branding`.
- Proyecto EAS vinculado a `@nicolasets-team/reporte-tarjetas-mvp`.
- `expo-updates` configurado con canales `development`, `preview` y `production`.
- Keystore Android de este proyecto generada y administrada remotamente por EAS.
- Plan inicial creado en ClickUp dentro de `IH DESARROLLO / Reporte Tarjetas MVP`.
- Ocho fases y 72 subtareas cargadas en ClickUp.
- Estrategia Git de dos ramas: `main` estable/protegida y `develop` para trabajo cotidiano.
- PR #1 de fundación integrado a `main` mediante rebase.
- Sistema visual claro/oscuro/sistema basado en la identidad de Inforhard S.R.L.
- Componentes base: botón, campo, tarjeta, badge y estado informativo.
- Shell responsive con sidebar de escritorio, rail de tablet y navegación inferior móvil.
- Rutas universales para Inicio, Pagos, Liquidaciones, Conciliación, Calidad y Configuración.
- Dashboard visual con fixtures explícitamente identificados como datos simulados.
- Pantalla de configuración con selector de apariencia y diagnóstico público.
- Contratos tipados para la sesión y el usuario actuales del backend.
- Cliente de sesión preparado para cookies web mediante `credentials: include`.
- Propuesta de autenticación web/móvil documentada en ADR-005.

## Validación realizada

- `npm run lint`: aprobado.
- `npm run typecheck`: aprobado.
- `npm run test`: 4 pruebas aprobadas.
- `npm run web:export`: aprobado.
- Configuración pública de Expo: aprobada.
- `npx expo-doctor`: 20/20 controles aprobados.
- Node portátil `v22.23.1 x64` validado para el frontend.
- Validación visual web: escritorio 1440 px, tablet 820 px y móvil 390 px.
- Navegación móvil y cambio de tema verificados sin errores de consola.

## Runtime local

La máquina conserva Node `v22.11.0 ia32` para no alterar el backend existente.
El frontend usa de forma aislada Node portátil `v22.23.1 x64` desde
`C:\Tools\node-v22.23.1-win-x64`. Expo SDK 57 requiere Node 22.13 o superior.
El mínimo reproducible está declarado en `.nvmrc`, `package.json` y `eas.json`.

## Build móvil

La primera development build Android:

- ID: `3f13c383-5641-4aac-993a-0f57139992dd`.
- Perfil: `development`.
- Canal: `development`.
- Distribución: interna.
- Estado verificado el 2026-07-27: `FINISHED`.
- APK de distribución interna generado correctamente por EAS.
- APK instalada en un dispositivo Android físico.
- Conexión con Metro mediante development client: validada.
- Splash, rutas, navegación inferior, menú y cambio de tema: validados en Android.
- No contiene variables de ambiente de API configuradas en EAS.

## Seguridad de dependencias

`npm audit` informa vulnerabilidades transitivas dentro del toolchain de Expo,
React Native y Jest. No se ejecuta `npm audit fix --force` porque propone
downgrades incompatibles con Expo SDK 57. Se revisarán con las actualizaciones
oficiales del SDK.

## Siguiente hito

1. Configurar un backend de desarrollo aislado.
2. Acordar e implementar el contrato real de login, renovación y cierre de sesión.
3. Incorporar persistencia segura y navegación protegida en el frontend.
4. Migrar Inicio con datos reales del ambiente de desarrollo.

## Hallazgo de autenticación

- `GET /api/v1/sessions/current` todavía devuelve una identidad local siempre autenticada.
- `GET /api/v1/users/me` todavía construye el usuario desde configuración local.
- El login del panel administrativo no es apto para la aplicación web/móvil.
- No se activarán rutas protegidas ni login ficticio hasta disponer de un backend
  de desarrollo y un contrato revisado por Nicolás y Misael.

## Fuente del backend

- Repositorio privado verificado:
  `desarrolloinforhard/paquete-webserver`.
- Copia Git independiente:
  `J:\Proyectos\paquete-webserver-dev`.
- El remoto está en backend `3.8.79`.
- La carpeta operativa `J:\Proyectos\paquete-webserver` declara `3.8.80` y no es
  un repositorio Git válido porque su directorio `.git` está vacío.
- Se detectaron cambios locales no publicados de Clover y Unicobros.
- La reconciliación se registró en
  `desarrolloinforhard/paquete-webserver#1`.
- No se configurará el runtime de desarrollo hasta recuperar y revisar la fuente
  `3.8.80` sin copiar secretos, datos ni artefactos.

## Límites activos

- No modificar `J:\Proyectos\ReportesTarjetas`.
- No conectar el frontend nuevo a producción.
- No incluir secretos en variables `EXPO_PUBLIC_*`.
- No introducir cambios incompatibles en `/api/v1`.
