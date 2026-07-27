# Estado actual

Última actualización: 2026-07-27.

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

## Validación realizada

- `npm run lint`: aprobado.
- `npm run typecheck`: aprobado.
- `npm run test`: 2 pruebas aprobadas.
- `npm run web:export`: aprobado.
- Configuración pública de Expo: aprobada.
- `npx expo-doctor`: 20/20 controles aprobados.
- Node portátil `v22.23.1 x64` validado para el frontend.

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
- Estado verificado el 2026-07-27: `IN_QUEUE`.
- No contiene variables de ambiente de API configuradas en EAS.

## Seguridad de dependencias

`npm audit` informa vulnerabilidades transitivas dentro del toolchain de Expo,
React Native y Jest. No se ejecuta `npm audit fix --force` porque propone
downgrades incompatibles con Expo SDK 57. Se revisarán con las actualizaciones
oficiales del SDK.

## Siguiente hito

1. Completar e instalar la development build Android.
2. Configurar un backend de desarrollo aislado.
3. Completar autenticación compatible con el cliente Windows.
4. Implementar el shell responsive.
5. Migrar Inicio con datos reales de desarrollo.

## Límites activos

- No modificar `J:\Proyectos\ReportesTarjetas`.
- No conectar el frontend nuevo a producción.
- No incluir secretos en variables `EXPO_PUBLIC_*`.
- No introducir cambios incompatibles en `/api/v1`.
