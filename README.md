# Reportes de Tarjetas

Frontend universal nuevo para web, Android e iOS. Se construye con Expo SDK 57,
React Native, React Native Web y TypeScript, manteniendo paridad funcional con la
aplicación Windows de producción.

Producto de **Inforhard S.R.L**. La identidad visual principal usa el verde
institucional `#008A46`, tomado de la aplicación de producción.

## Límites del proyecto

- Este repositorio contiene solamente el frontend universal.
- El backend Node.js continúa en su repositorio y despliegue independientes.
- `J:\Proyectos\ReportesTarjetas` es referencia de solo lectura.
- Desarrollo y staging nunca deben usar datos o procesos productivos.
- Los contratos `/api/v1` deben mantenerse compatibles con el cliente Windows.

Leer primero:

- `AGENTS.md`
- `context/PROYECTO_CONTEXT.md`
- `context/ARQUITECTURA.md`
- `context/AMBIENTES.md`
- `context/MATRIZ_PARIDAD.md`
- `context/GIT_TRABAJO.md`

## Requisitos

- Node.js 22.13 o superior.
- npm.
- Android Studio para ejecutar Android localmente.
- Una development build/EAS para probar iOS desde Windows.

## Configuración

```powershell
Copy-Item .env.example .env.local
npm install
```

Modificar `.env.local` para apuntar exclusivamente al backend de desarrollo:

```env
EXPO_PUBLIC_API_URL=http://servidor-desarrollo:5000/api/v1
EXPO_PUBLIC_APP_ENV=development
```

Nunca guardar tokens, contraseñas o secretos en variables `EXPO_PUBLIC_*`.

## Desarrollo

```powershell
npm start
npm run web
npm run android
```

## Verificación

```powershell
npm run check
npm run web:export
```

## Ramas

- `main`: estable, protegida y potencialmente publicable.
- `develop`: desarrollo cotidiano e integración de todas las fases.

No se crean ramas adicionales sin autorización explícita. Toda integración de
`develop` a `main` requiere pull request, `quality` aprobado y revisión del
alcance. Antes de publicar en `develop`, actualizar la rama y no usar
`force push`.
