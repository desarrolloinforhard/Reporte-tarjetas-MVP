# Conexión del piloto a reporting-api

Última actualización: 2026-08-31.

## Objetivo

Conectar la PWA publicada en Vercel exclusivamente con el proceso
`reporting-api` de solo lectura. No se usa el puerto ni el proceso operativo.

## Requisitos bloqueantes

1. Infra crea cuentas distintas para tarjetas y central con privilegio
   `SELECT` únicamente y conserva evidencia de que `INSERT`, `UPDATE`,
   `DELETE` y DDL son rechazados.
2. En el host autorizado se crea `.env.reporting` a partir de
   `.env.reporting.example`; los secretos nunca se copian a este repositorio.
3. El proceso se inicia con `reporting_server.js`, puerto propio y logs propios.
4. Un Gateway publica ese puerto mediante HTTPS. No se expone HTTP a la PWA.
5. El origen CORS exacto es
   `https://reporte-tarjetas-inforhard.vercel.app`.
6. Para evitar bloqueos de cookies entre sitios, el destino recomendado es usar
   dominios hermanos administrados (PWA y API bajo el mismo dominio registrable)
   o un proxy HTTPS del mismo origen. Hasta entonces se requiere cookie
   `HttpOnly; Secure; SameSite=None` y una prueba en todos los navegadores del
   piloto.

## Smoke test del backend

Antes de configurar Vercel:

1. `GET https://<reporting-api>/api/v1/health` responde `200`,
   `service=reporting-api`, `mode=read_only`, `status=ok` y base conectada.
2. Un origen distinto al autorizado recibe `403 ORIGIN_NOT_ALLOWED`.
3. Un `POST` a `/api/v1/payments` recibe `405 READ_ONLY_METHOD_NOT_ALLOWED`.
4. El login propietario crea una cookie opaca; no devuelve secretos en JSON.
5. Con sesión, `/reports/summary`, `/payments`, `/settlements`,
   `/reconciliation/summary`, `/data-quality/*` y `/sync/status` responden sin
   ejecutar tareas operativas.

## Variables públicas de Vercel

Configurar en Production y Preview, sin tokens ni credenciales:

```text
EXPO_PUBLIC_API_URL_WEB=https://<reporting-api>/api/v1
EXPO_PUBLIC_APP_ENV=production
```

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
- Revertir Vercel al deployment anterior de la PWA.
- Mantener intactos el backend operativo y la aplicación de escritorio.
- Revocar el enlace compartido y las sesiones del piloto.
