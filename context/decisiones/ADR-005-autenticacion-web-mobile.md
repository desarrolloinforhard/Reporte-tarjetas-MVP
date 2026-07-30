# ADR-005 — Autenticación separada por plataforma

- Estado: aceptada para implementación en desarrollo aislado; pendiente de validación en staging.
- Fecha: 2026-07-28.

## Contexto

El backend publica actualmente:

- `GET /api/v1/sessions/current`, que informa una identidad local y devuelve
  `authenticated: true` sin validar una sesión.
- `GET /api/v1/users/me`, que construye un usuario local desde configuración.
- Un login del panel administrativo en `/login`, protegido por una cookie propia.

El login administrativo no es un contrato de autenticación para Reportes de
Tarjetas. Su cookie contiene una representación reversible de usuario y
contraseña, no tiene `Secure` y no implementa autorización por cliente. No debe
reutilizarse en web, Android ni iOS.

## Decisión propuesta

Mantener `/api/v1` compatible y agregar autenticación de aplicación de forma
aditiva. El backend será la autoridad de identidad y permisos.

### Web

- Sesión mediante cookie opaca `HttpOnly`, `Secure` y con `SameSite` definido
  según el dominio final.
- El JavaScript no recibe ni persiste el refresh token.
- Las solicitudes usan `credentials: include`.
- Protección CSRF para operaciones mutables cuando la arquitectura de dominios
  lo requiera.

### Android e iOS

- Access token de corta duración enviado como `Bearer`.
- Refresh token rotativo, revocable y almacenado con `expo-secure-store`.
- El cierre de sesión revoca la familia de refresh tokens y elimina la copia
  local.
- Los tokens nunca se guardan en `EXPO_PUBLIC_*`, logs, fixtures o repositorio.

### Contrato mínimo por definir en backend

Los nombres definitivos requieren revisión conjunta:

1. Iniciar sesión.
2. Consultar sesión e identidad actual.
3. Renovar sesión nativa.
4. Cerrar sesión y revocar tokens.
5. Responder `UNAUTHENTICATED` y `FORBIDDEN` de forma estable.

El contrato debe incluir expiración, roles, permisos y alcance autorizado por
cliente/sucursal, sin confiar en identificadores enviados solamente por el
frontend.

## Transición

1. Mantener el comportamiento local actual únicamente en desarrollo aislado.
2. Implementar y probar los endpoints nuevos sin exigirlos al cliente Bootstack.
3. Integrar Expo contra desarrollo usando usuarios y datos sintéticos.
4. Validar en staging ambos clientes.
5. Activar autenticación obligatoria por despliegue y con reversión disponible.

## Consecuencias

- No se implementará una pantalla de login funcional hasta disponer de contrato
  y runtime de desarrollo.
- El frontend puede tipar desde ahora los contratos verificados de sesión y
  usuario.
- La navegación protegida se incorporará cuando el backend pueda distinguir de
  manera real una sesión válida de una anónima.

## Implementación de desarrollo

- Se agregaron `POST /sessions/login`, `POST /sessions/refresh` y
  `POST /sessions/logout` sin modificar el login administrativo.
- La web recibe una cookie opaca `HttpOnly` y no puede leer tokens.
- Android/iOS recibe tokens opacos; el refresh se guarda con SecureStore.
- El refresh es rotativo y el logout revoca la familia completa.
- Expo Router protege el grupo `(app)` y deja `sign-in` como ruta pública.
- Los usuarios, permisos y sesiones actuales son exclusivamente sintéticos.
- El almacenamiento en memoria es deliberado para desarrollo y se reemplazará
  por persistencia revocable antes de staging.

## Integración con credenciales administrativas en desarrollo

- El backend agregó de forma aditiva `POST /api/v1/auth/login` y
  `POST /api/v1/auth/logout` para la aplicación web.
- El login valida en servidor las credenciales configuradas mediante
  `ROOT_ADMIN_USER` y `ROOT_ADMIN_PASSWORD`; el frontend no conoce valores
  predeterminados ni persiste las credenciales.
- La sesión web utiliza la cookie opaca `ih_reportes_session`, separada de
  `webserver_admin_auth`, que continúa siendo exclusiva del panel legacy.
- `GET /api/v1/sessions/current` y `GET /api/v1/users/me` validan la misma sesión
  API creada por el nuevo login.
- Todas las solicitudes web conservan `credentials: include`.
- Android e iOS mantienen temporalmente el contrato nativo de
  `/api/v1/sessions/*`; el nuevo endpoint administrativo se integra solamente
  en web hasta disponer de un contrato nativo equivalente validado.
