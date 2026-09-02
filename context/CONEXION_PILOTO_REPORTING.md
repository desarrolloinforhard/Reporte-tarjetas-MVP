# Conexión del piloto a reporting-api

Última actualización: 2026-09-02.

## Objetivo

Conectar la PWA publicada en Vercel exclusivamente con el proceso
`reporting-api` de solo lectura. No se usa el puerto ni el proceso operativo.

## Requisitos bloqueantes

1. Infra crea cuentas distintas para tarjetas y central con privilegio
   `SELECT` únicamente y conserva evidencia de que `INSERT`, `UPDATE`,
   `DELETE` y DDL son rechazados.
2. En el host autorizado se crea `.env.reporting` a partir de
   `.env.reporting.example`; los secretos nunca se copian a este repositorio.
3. El proceso se inicia con `packages/webserver-reporting-app/src/server.js`,
   escucha solamente en `127.0.0.1:5001` y conserva logs propios.
4. El Gateway transitorio en `5000` publica `/reporting/api/v1/*`. Ngrok
   termina HTTPS y apunta únicamente a `5000`; no se expone `5001` a la PWA.
5. El origen CORS exacto es
   `https://reporte-tarjetas-inforhard.vercel.app`.
6. Para evitar bloqueos de cookies entre sitios, el destino recomendado es usar
   dominios hermanos administrados (PWA y API bajo el mismo dominio registrable)
   o un proxy HTTPS del mismo origen. Hasta entonces se requiere cookie
   `HttpOnly; Secure; SameSite=None` y una prueba en todos los navegadores del
   piloto.

En el `.env` principal del host se requieren estos flags operativos:

```text
ENABLE_REPORTING_APP=true
ENABLE_REPORTING_GATEWAY=true
REPORTING_ENV_FILE=.env.reporting
REPORTING_GATEWAY_TIMEOUT_MS=30000
REPORTING_GATEWAY_HEALTH_TIMEOUT_MS=2000
```

`DEBUG_GATEWAY=true` puede usarse temporalmente en laboratorio. Sus registros
no incluyen cuerpos, cookies, autorizaciones ni credenciales.

## Smoke test del backend

Antes de configurar Vercel:

1. `GET http://127.0.0.1:5001/api/v1/health` responde `200` en el host.
2. `GET http://127.0.0.1:5000/gateway/health` informa Reporting disponible.
3. `GET https://<dominio-ngrok>/reporting/api/v1/health` responde `200`,
   `service=reporting-api`, `mode=read_only`, `status=ok` y base conectada.
4. Un origen distinto al autorizado recibe `403 ORIGIN_NOT_ALLOWED`.
5. Un `POST` a `/api/v1/payments` recibe `405 READ_ONLY_METHOD_NOT_ALLOWED`.
6. El login propietario crea una cookie opaca; no devuelve secretos en JSON.
7. Con sesión, `/reports/summary`, `/payments`, `/settlements`,
   `/reconciliation/summary`, `/data-quality/*` y `/sync/status` responden sin
   ejecutar tareas operativas.

Errores de infraestructura que el frontend debe presentar como indisponibilidad
temporal, sin reintentar automaticamente operaciones de sesion:

```text
502 GATEWAY_UPSTREAM_UNAVAILABLE
503 GATEWAY_UPSTREAM_DISABLED
504 GATEWAY_TIMEOUT
```

## Variables públicas de Vercel

Configurar en Production y Preview, sin tokens ni credenciales:

```text
EXPO_PUBLIC_API_URL_WEB=https://reporte-tarjetas-inforhard.vercel.app/api/v1
EXPO_PUBLIC_APP_ENV=production
```

El deployment de Vercel debe reenviar sin cachear:

```text
/api/v1/*
  -> https://stable-heartily-squirrel.ngrok-free.app/reporting/api/v1/*
```

Estado: el rewrite y `Cache-Control: no-store` ya están versionados en
`vercel.json`. Esto no demuestra que estén desplegados; se debe redeplegar y
validar la sesión completa desde un navegador del piloto.

Validación local del 2026-09-02: `npm run check` aprobó lint, TypeScript y
55/55 pruebas, incluida la protección automatizada del rewrite.

El dominio ngrok no se configura con un punto final. El Gateway usa un destino
interno fijo `http://127.0.0.1:5001` y nunca acepta una URL aportada por el
cliente.

Después hay que redeplegar. Expo incorpora las variables `EXPO_PUBLIC_*` en el
bundle durante la exportación; cambiar la variable sin redeploy no modifica un
deployment existente.

En producción se ignora cualquier URL de API guardada previamente por la
configuración técnica local. La conexión se define sólo durante el despliegue.

## Validación funcional

Con el mismo rango de fechas, comparar PWA y escritorio:

- cantidad e importe total de pagos;
- aprobados, rechazados, pendientes y devoluciones;
- detalle e identidad exacta de intentos;
- liquidaciones y netos;
- conciliación y diferencias;
- hallazgos de calidad de datos.

La prueba se aprueba sólo si no hay diferencias sin explicar. Registrar tiempos
de respuesta para 1, 7, 30 y 61 días.

## Rollback

- Detener únicamente el proceso `reporting-api`.
- Deshabilitar el proxy de Reporting en el Gateway si la falla está en el
  enrutamiento.
- Revertir Vercel al deployment anterior de la PWA.
- Mantener intactos el backend operativo y la aplicación de escritorio.
- Revocar el enlace compartido y las sesiones del piloto.
