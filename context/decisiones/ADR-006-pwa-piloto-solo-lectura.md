# ADR-006: PWA como canal del piloto de solo lectura

**Fecha:** 2026-08-31
**Estado:** Aceptada

## Contexto

Buen Gusto necesita una presentación funcional de Reportes de Tarjetas antes de
que la plataforma de usuarios, empresas, auditoría y sesiones persistentes esté
disponible en PostgreSQL. La aplicación Expo ya puede exportarse para web y
también se mantiene el desarrollo Android/iOS.

La PWA debe mostrar datos reales de Buen Gusto. Los fixtures solo se conservan
para desarrollo y no forman parte de la presentación ni del piloto.

## Decisión

La versión web instalable (PWA) será el canal principal del piloto de Buen
Gusto. Se desplegará como sitio estático bajo HTTPS y en un dominio propio.

La PWA consumirá únicamente una `reporting-api` separada, autenticada y de solo
lectura. Esa API deberá tener un proceso, puerto, logs y health propios; no
debe ejecutar heartbeat, cobros, webhooks, watchers, configuraciones operativas
ni rutas de escritura. Su acceso a las fuentes actuales de Buen Gusto requerirá
una cuenta ODBC exclusiva limitada a `SELECT`.

El frontend cachea solo la interfaz estática para habilitar instalación y carga
inicial. No se cachean respuestas de la API ni datos financieros para uso sin
conexión.

## Consecuencias

- Android e iOS nativos continúan como canales de desarrollo y evolución del
  producto universal; no se duplican pantallas ni lógica de negocio.
- El proceso operativo existente de Buen Gusto y el escritorio permanecen sin
  cambios y sirven como rollback durante el piloto.
- CORS de la API autorizará únicamente el dominio HTTPS del piloto, nunca
  orígenes abiertos.
- PostgreSQL sigue siendo el destino para identidad, sesiones persistentes,
  auditoría y aislamiento multiempresa; no se usa para reemplazar de inmediato
  las consultas de reportes reales.
- Antes de exponer datos reales se requiere infraestructura autorizada, dominio,
  HTTPS, credenciales ODBC de lectura y validación conjunta de backend.
