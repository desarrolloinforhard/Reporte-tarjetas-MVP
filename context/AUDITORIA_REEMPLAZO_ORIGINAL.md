# Auditoría para reemplazar el escritorio por el MVP

Última actualización: 2026-08-07.

## Alcance y método

Se realizó una revisión estática y de solo lectura de:

- `J:\Proyectos\ReportesTarjetas`, escritorio original.
- `J:\Proyectos\paquete-webserver`, instalación operativa del backend.
- `J:\Proyectos\ReportesTarjetasApp`, frontend MVP editable.
- `J:\Proyectos\paquete-webserver-dev`, backend aislado editable.

No se ejecutaron servicios, consultas, migraciones ni scripts productivos. No se
leyeron ni copiaron secretos. No se modificaron el escritorio original ni la
instalación operativa.

## Resumen ejecutivo

El MVP puede evolucionar hasta reemplazar el escritorio. La ruta recomendada no
es instalar el backend de desarrollo encima del backend operativo, sino publicar
un proceso de Reportes separado, inicialmente de solo lectura, y ejecutar ambos
clientes en paralelo durante un piloto.

La réplica completa no es la única alternativa. Es técnicamente viable consultar
SQL Anywhere mediante una cuenta limitada a `SELECT`, siempre que el nuevo
proceso no use el inicializador actual con heartbeat, no monte rutas de escritura
y no ejecute watchers ni integraciones externas.

## Lo que ya puede responderse por el código

### 1. ¿El escritorio se conecta directamente a la base?

No. El escritorio es un cliente Python 3.12/Bootstack que consume una API HTTP
externa bajo `/api/v1`. La dirección de la API es configurable. El acceso a SQL
Anywhere se encuentra en el backend Node.js.

Consecuencia: reemplazar el escritorio no exige que la app Expo conozca DSN,
tablas ni credenciales de base. Esa separación debe conservarse.

### 2. ¿Qué funciones utiliza el escritorio?

Los módulos visibles son:

- Inicio y métricas.
- Pagos y detalle.
- Liquidaciones.
- Conciliación.
- Calidad de datos.
- Configuración.

También utiliza catálogos, sucursales, terminales, ventas, exportaciones,
preferencias, vistas guardadas, reporte de errores y auditoría Clover.

### 3. ¿Qué datos consulta el backend?

El administrador de conexiones separa al menos dos roles ODBC:

- `tarjetas`: pagos e integraciones de tarjetas.
- `central`: ventas, productos, caja y medios de pago del ERP.

Las consultas verificadas de Reportes son `SELECT`. Entre las fuentes actuales
aparecen:

- Pagos: `PAGOSCLOVER`, `CLOVER_PAGOS`, `CLOVER_PAGOS_QR`,
  `PAGOSMERCADOPAGO`, `PAGOSMERCADOPAGORECHAZADOS` y tablas históricas de QR y
  Point.
- Ventas y detalle: `FACCLIT`, `FACCLIL`, `FACCLIB`, `FACCLIC`, `FACCLII`,
  `CAJA` y `FPAGO`.

Esto confirma que Pagos y Ventas pertenecen a fuentes diferentes y que la
relación debe continuar resolviéndose por referencia exacta e ID externo.

### 4. ¿El backend actual es de solo lectura?

No. Aunque los repositorios usados para listar y conciliar realizan consultas,
el proceso completo también puede:

- Actualizar el heartbeat `MPQRCODE_CONEXIONSERVIDORAPI` cada 30 segundos.
- Recibir y guardar pagos o intenciones mediante integraciones heredadas.
- Actualizar configuración Clover.
- Procesar webhooks de Unicobros y WhatsApp.
- Generar y configurar reportes externos de Mercado Pago.
- Ejecutar auditorías/sincronizaciones Clover.
- Guardar configuración ODBC y operativa.
- Crear exportaciones, preferencias, vistas guardadas y reportes de error en
  archivos locales.
- Cargar imágenes y JSON de productos cuando los módulos están habilitados.

Consecuencia: una cuenta `SELECT` no debe conectarse sin cambios al monolito
actual, porque el heartbeat intentaría escribir y marcaría la conexión como
degradada. Hace falta un modo de datos realmente de solo lectura o un proceso de
Reportes separado.

### 5. ¿Qué escrituras necesita el reemplazo inicial?

Para consultar el negocio, ninguna escritura sobre el ERP es imprescindible.
Durante el piloto pueden deshabilitarse:

- Sync manual y auditoría activa de proveedores.
- Generación/configuración remota de liquidaciones.
- Configuración de base o módulos.
- Webhooks, cobros, watchers y cargas de archivos.

Preferencias, sesiones, auditoría de accesos, vistas guardadas y tareas de
exportación sí necesitan persistencia, pero deben vivir fuera del ERP. La
arquitectura ya propone PostgreSQL para esos datos de plataforma. Como etapa
intermedia puede utilizarse un almacenamiento separado y respaldado, nunca las
tablas operativas del cliente.

### 6. ¿Se puede publicar directamente el backend actual en Internet?

No es recomendable. La revisión encontró que:

- La autenticación productiva vigente usa una única credencial administrativa.
- Las sesiones web viven en memoria y desaparecen al reiniciar.
- El login productivo soporta solamente cliente web.
- La mayoría de las rutas de pagos, ventas, conciliación, calidad y
  liquidaciones no tienen `requireAuth`; CORS no reemplaza autenticación.
- Existe un eco raíz de diagnóstico que devuelve información de la petición.
- El panel conserva credenciales de emergencia/fallback en código.

Antes de exponer la API debe existir un Gateway HTTPS donde toda ruta sea
privada por defecto, con identidad, permisos, rate limiting y auditoría.

### 7. ¿El backend editable puede reemplazar hoy al operativo?

No. La instalación operativa declara versión `3.8.82` y contrato
`2026-08-07.1`; el backend editable declara `3.8.80` y contrato
`2026-07-24.2`. Además difieren `web_server.js`, Pagos, Ventas, Conciliación y
Liquidaciones.

El próximo release debe partir de una fuente Git verificable que contenga
`3.8.82` y luego integrar selectivamente las correcciones del MVP. Copiar
`paquete-webserver-dev` encima de la instalación podría perder cambios
operativos recientes.

### 8. ¿Cómo se opera y actualiza hoy el backend?

Confirmado por Nicolás: Buen Gusto se actualiza manualmente desde consola usando
un paquete de release. No existe despliegue automático por cada commit o push.

El backend incluye herramientas para dos mecanismos operativos:

- Tarea programada de Windows, con reinicio y logs.
- Herramientas de release y actualización orientadas a PM2.

El actualizador preserva `.env`, datos, logs, backups y `node_modules`; crea
backup, valida sintaxis, reinicia y consulta health. La documentación operativa
también registra deudas: selección del ZIP por fecha, falta de manifiesto/checksum
automático y health que puede aceptar respuestas `4xx`.

Confirmado por Nicolás: el release reinicia la API mediante PM2. Para diseñar el
despliegue del MVP solamente falta confirmar el comando concreto del toolkit,
el nombre del proceso PM2 y cómo se verifican health y rollback.

## Recomendación técnica

### Arquitectura del primer piloto productivo

```text
App Expo web/Android
        |
        | HTTPS + sesión propietaria
        v
Gateway / API pública
        |
        | red interna
        v
reporting-api separado
        |
        | usuario SELECT, consultas parametrizadas
        v
SQL Anywhere actual
```

En paralelo:

```text
Escritorio original ---> API operativa actual ---> SQL Anywhere
```

Reglas del `reporting-api` inicial:

- Proceso y puerto independientes.
- Sin heartbeat de base.
- Sin routers de cobro, webhooks, imágenes o configuración ODBC.
- Sin watchers ni tareas programadas de proveedores.
- Solo endpoints necesarios por el MVP.
- Usuario ODBC limitado a `SELECT` por el motor.
- Timeout, límites de rango y consultas parametrizadas.
- Caché breve e invalidable para consultas costosas.
- Logs separados, sin payloads sensibles.
- Health de proceso y readiness real de las dos conexiones.

Esta opción permite probar volumen real sin modificar tablas y sin duplicar la
base completa. Si las consultas afectan la operación, el siguiente escalón es
una réplica o un modelo de lectura en PostgreSQL.

### Evolución posterior

1. **Piloto sombra:** dueño y Mercedes comparan MVP/escritorio; el original
   sigue siendo referencia.
2. **Herramienta principal:** MVP se usa diariamente; escritorio queda como
   rollback.
3. **Persistencia de plataforma:** usuarios, sesiones, auditoría, vistas y
   exportaciones pasan a PostgreSQL.
4. **Reporting desacoplado:** modelos de lectura evitan consultas pesadas al ERP.
5. **Retiro del escritorio:** solamente después de varias semanas sin
   diferencias y con restauración/rollback ensayados.

## Preguntas que ya no hace falta trasladar a Misael

- El escritorio no accede directamente a la base; consume `/api/v1`.
- El teléfono tampoco debe acceder directamente a la base.
- No hace falta reemplazar SQL Anywhere para lanzar el MVP.
- No conviene migrar frontend, backend y base simultáneamente.
- La primera cuenta puede ser una única cuenta propietaria con consulta total.
- El piloto debe comenzar sin escrituras sobre el ERP.
- Pagos y ventas requieren dos roles/conexiones y referencias exactas.
- `paquete-webserver-dev` no puede desplegarse tal cual sobre la versión actual.

## Preguntas concretas para Misael

### Fuente y versiones

1. ¿Dónde está la fuente Git exacta de `paquete-webserver 3.8.82`?
2. ¿Qué cambios de `3.8.81/3.8.82` deben conservarse al integrar el MVP?
3. ¿La carpeta operativa se genera desde una rama/tag o contiene cambios
   manuales posteriores al release?

### Datos y solo lectura

4. ¿Se puede crear un usuario ODBC exclusivo con `SELECT` para los roles
   `tarjetas` y `central`?
5. ¿Ese usuario puede consultar todas las tablas enumeradas sin ejecutar
   procedimientos ni triggers con efectos laterales?
6. ¿Conviene publicar vistas estables para Reportes en lugar de conceder acceso
   directo a tablas?
7. ¿Hay consultas o tablas adicionales fuera del repositorio que deban incluirse?
8. ¿Qué horarios y límites de consulta evitan afectar cajas y facturación?

### Infraestructura

9. ¿El `reporting-api` puede correr como proceso separado en el servidor actual
   o existe otra máquina/VM disponible?
10. Dentro del procedimiento manual por release y PM2 ya confirmado, ¿qué
   comando se ejecuta, cuál es el nombre del proceso y qué comprobaciones se
   realizan antes de aceptar la nueva versión?
11. ¿Quién administrará dominio, certificado HTTPS, firewall y Gateway?
12. ¿Dónde se alojará PostgreSQL para sesiones/auditoría cuando se habilite?

### Seguridad y operación

13. ¿Quién define y guarda la credencial propietaria inicial?
14. ¿Quién puede revocar sesiones o recuperar la cuenta?
15. ¿Qué retención necesitan los logs de acceso y exportaciones?
16. ¿Qué backup se restaura hoy y cuándo se probó por última vez en otra máquina?
17. ¿Quién aprueba el piloto y quién autoriza el rollback?

### Piloto y reemplazo

18. ¿Cuántas semanas deben convivir MVP y escritorio?
19. ¿Mercedes puede validar diariamente totales y casos especiales?
20. ¿Qué diferencia máxima, tiempo de respuesta y tasa de errores se aceptan para
   declarar al MVP herramienta principal?

## Plan técnico acordable en la reunión

### Fase A — reconciliar código

- Recuperar en Git la fuente `3.8.82`.
- Compararla con `paquete-webserver-dev`.
- Integrar por módulos y conservar pruebas de contratos.
- No desplegar todavía.

### Fase B — construir modo Reportes seguro

- Extraer o aislar `reporting-api`.
- Implementar conexión sin heartbeat y sin escrituras.
- Exigir cuenta ODBC `SELECT`.
- Montar solamente rutas requeridas.
- Protegerlas con autenticación obligatoria.

### Fase C — laboratorio con volumen real

- Medir 1, 7, 30 y 61 días.
- Validar filtros, totales, paginación y exportaciones.
- Comparar `B-0035-00049027` y `B-0059-00084981`.
- Confirmar que no exista ninguna escritura ni worker activo.

### Fase D — piloto productivo paralelo

- Publicar Gateway HTTPS y build preview/piloto.
- Instalar solamente al dueño y validadores acordados.
- Conservar escritorio y backend operativo sin cambios.
- Monitorear, comparar y mantener rollback inmediato.

### Fase E — reemplazo

- Promover el MVP tras cumplir criterios cuantitativos.
- Mantener escritorio como respaldo durante el período acordado.
- Retirarlo solamente con aprobación, backups y rollback probados.

## Criterios mínimos antes del piloto

- Fuente `3.8.82` reconciliada y versionada.
- Cero rutas de datos accesibles sin autenticación.
- Cero escrituras del proceso de Reportes sobre SQL Anywhere.
- Cero watchers/webhooks/cobros en ese proceso.
- Sesiones persistentes y revocables.
- HTTPS y CORS explícito.
- Logs y métricas separados.
- Resultados iguales al original para la matriz acordada.
- Rendimiento validado con volumen real.
- Release identificable, checksum, backup y rollback ensayado.

## Evidencias principales revisadas

- Escritorio: `README.md`, `config/runtime_config.py`, `api/*`, `services/*` y
  vistas principales.
- Backend operativo: `web_server.js`, `crear_conexion_database.js`, repositorios
  de Pagos/Ventas, módulos de Conciliación/Liquidaciones, autenticación,
  configuración y herramientas de release.
- Arquitectura existente del backend: principios, Gateway, macroservicios,
  estrategia híbrida SQL Anywhere/PostgreSQL, PM2, blue/green y migración gradual
  de Pagos.
