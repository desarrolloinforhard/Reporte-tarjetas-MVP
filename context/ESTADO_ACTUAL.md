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
- Backend de desarrollo aislado con `DISABLE_DATABASE=true` y `FIXTURE_MODE=true`.
- Fixtures sintéticos para resumen, evolución diaria, proveedores y sincronización.
- Dashboard Inicio conectado al backend aislado mediante TanStack Query y contratos Zod.
- Estados de carga, error, reintento y actualización implementados en Inicio.
- Login sintético con cookie HttpOnly en web y tokens SecureStore en native.
- Renovación rotativa, cierre de sesión y rutas protegidas implementados.
- URL de API separada por plataforma para conservar cookies seguras en web.
- Estrategia de staging, piloto controlado, producción y rollback documentada.

## Validación realizada

- `npm run lint`: aprobado.
- `npm run typecheck`: aprobado.
- `npm run test`: 7 pruebas aprobadas.
- `npm run web:export`: aprobado.
- Configuración pública de Expo: aprobada.
- `npx expo-doctor`: 20/20 controles aprobados.
- Node portátil `v22.23.1 x64` validado para el frontend.
- Validación visual web: escritorio 1440 px, tablet 820 px y móvil 390 px.
- Navegación móvil y cambio de tema verificados sin errores de consola.
- Dashboard conectado validado en escritorio y móvil con datos sintéticos.
- Endpoints fixture verificados por HTTP y sin acceso a ODBC.
- Autenticación web verificada: login, persistencia tras recarga y logout.
- Contrato HTTP verificado para login web/native, refresh rotativo y revocación.

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

1. Validar login y persistencia de sesión en Android con development build.
2. Migrar Pagos usando contratos y fixtures sintéticos.
3. Definir autorización por cliente y sucursal.
4. Preparar persistencia de sesiones y un ambiente de staging sin producción.

## Hallazgo de autenticación

- `GET /api/v1/sessions/current` distingue sesión válida de anónima.
- `GET /api/v1/users/me` requiere autenticación y deriva la identidad de la sesión.
- El login del panel administrativo no es apto para la aplicación web/móvil.
- La autenticación implementada sigue limitada al modo fixture de desarrollo.

## Fuente del backend

- Repositorio privado verificado:
  `desarrolloinforhard/paquete-webserver`.
- Copia Git independiente:
  `J:\Proyectos\paquete-webserver-dev`.
- `main` permanece en backend `3.8.79`; `develop` contiene la recuperación
  controlada de `3.8.80`.
- La carpeta operativa `J:\Proyectos\paquete-webserver` declara `3.8.80` y no es
  un repositorio Git válido porque su directorio `.git` está vacío.
- Los cambios `3.8.80` de Clover y Unicobros fueron recuperados en `develop` sin
  copiar secretos, datos ni artefactos.
- Reconciliación cerrada:
  `desarrolloinforhard/paquete-webserver#1`.
- Backend `develop`: `9aace85`.
- El diagnóstico Unicobros queda desactivado por defecto y sus logs redactan
  secretos y datos sensibles.
- El runtime de desarrollo soporta `DISABLE_DATABASE=true` y CORS con orígenes
  explícitos.
- `FIXTURE_MODE=true` expone datos sintéticos identificados con
  `meta.fixture=true` para Inicio, sin consultar ODBC.
- Smoke test aprobado en puerto temporal: API online, ODBC desconectado, sesión
  local disponible y origen no autorizado rechazado con HTTP 403.
- GitHub Actions del backend ejecuta pruebas y controles de sintaxis en `main` y
  `develop`.

## Límites activos

- No modificar `J:\Proyectos\ReportesTarjetas`.
- No conectar el frontend nuevo a producción.
- No incluir secretos en variables `EXPO_PUBLIC_*`.
- No introducir cambios incompatibles en `/api/v1`.
