# Estado actual

Última actualización: 2026-08-07.

## Estado del plan de cierre por fases

### 1. Problemas visibles y prueba manual

- Hecho y validado manualmente: filtros con botón `Aplicar filtros`, estados de
  carga, paginación estable, `Página N` centrada y botones sin desplazarse en
  Pagos, Liquidaciones, Conciliación y Calidad.
- Hecho: paginar no vuelve a calcular los resúmenes ni modifica sus totales.
- Hecho y validado en web con fixtures: Liquidaciones filtra por `FECHA LIQ.` y
  no incluye filas posteriores a `Hasta`; el rango 08/07/2026-07/08/2026
  devolvió 7 filas, todas dentro del intervalo.
- Pendiente de cierre: repetir la matriz completa en Android después de integrar
  los cambios actuales y conservar evidencia de los cuatro módulos.

### 2. Backend aislado de Liquidaciones

- Hecho: se eliminó el límite silencioso de 2000 y se reemplazó por exploración
  interna de hasta 50000 filas por proveedor, configurable hasta 100000.
- Hecho: listado y resumen exponen `total_exact`, `source_truncated` y
  `source_scan_limit`; cantidades e importes usan todo el conjunto explorado.
- Hecho y validado con fixtures: 2505 filas, resumen, paginación, truncamiento,
  rangos diferentes y límites inclusivos sobre la fecha de liquidación.
- Pendiente: validar la exploración ampliada con staging o réplica autorizada de
  solo lectura antes de proponer cualquier cambio operativo.

### 3. Rendimiento

- Parcialmente hecho: filtros bajo confirmación, caché de consultas por un
  minuto, eliminación de recargas al recuperar foco, resumen desacoplado de la
  paginación y timeout parcial de Calidad de datos.
- Pendiente: medir tiempos por endpoint con rangos cortos y extensos, identificar
  consultas duplicadas restantes y optimizar primero Calidad y Conciliación con
  evidencia antes/después. No se debe agregar caché a relaciones sensibles sin
  confirmar su clave exacta e invalidación.

### 4. Paridad con datos reales

- Hecho con fixtures: intentos independientes, detalle del intento seleccionado,
  pagos asociados, intentos no aplicados y pago combinado sin fila artificial
  de efectivo.
- Pendiente con datos reales autorizados: validar `B-0035-00049027` y
  `B-0059-00084981` contra el original, comparando IDs exactos, estados,
  productos, importes y relaciones. No se considera cerrado con fixtures.

### 5. Autenticación de la cuenta propietaria

- Implementado en desarrollo: una cuenta con acceso integral, rutas protegidas,
  cookie HttpOnly en web, access/refresh nativo, renovación, revocación, logout y
  refresh token en SecureStore.
- Pendiente: validar persistencia y revocación completas en Android, reemplazar
  el almacenamiento volátil del backend antes de staging y decidir el bloqueo
  local opcional por PIN o biometría. No se requiere matriz compleja de roles.

### 6. Staging y piloto

- Documentada la estrategia de staging, piloto, producción y rollback.
- Pendiente: crear un backend separado, usar datos anonimizados o réplica de
  lectura autorizada y ejecutar la matriz Android completa. Producción sigue
  fuera de alcance y sin modificaciones.

## Paridad Pagos y detalle en curso

- Se auditó el flujo legacy y se documentó en `context/PARIDAD_PAGOS_DETALLE.md`.
- El listado conserva cada intento de Mercado Pago/Clover como fila independiente.
- El detalle separa pagos electrónicos, intentos no aplicados y medios de caja.
- La identidad del seleccionado usa IDs exactos; no se asocia por hora, importe
  ni terminal.
- Pago combinado usa el conteo contractual de medios aplicados y el efectivo
  permanece dentro del detalle.
- Se corrigieron filtros combinados de referencia/fecha/importe y el importe
  visible de Conciliación.
- Una comprobación visual de solo lectura sobre el MVP operativo confirmó que
  dos intentos visibles sin filtro desaparecían al aplicar un rango de importe.
  La causa estaba en la ventana previa al filtrado de fuentes JSON legadas; la
  corrección y su regresión sanitizada quedaron en el backend aislado.
- La API aislada se verificó con base deshabilitada y fixtures; no contiene las
  referencias operativas suministradas y no se consultó producción.
- La verificación directa de relaciones con datos reales sigue pendiente de un
  staging o una réplica de lectura autorizada; desarrollo no apunta a producción.
- Se auditó la compatibilidad del MVP contra el backend operativo 3.8.80. Las
  mejoras puramente visuales, debounce, tolerancia contractual y estados de
  carga funcionan desde el frontend. Los filtros monetarios completos, las
  búsquedas profundas, los totales/páginas exactos, las relaciones de pagos
  combinados y ciertos análisis derivados requieren el backend nuevo.
- El Development Build del MVP no es producción. Puede mostrar información del
  backend operativo configurado, pero un commit o actualización de Metro no
  instala los cambios de `paquete-webserver-dev` en ese backend.

## Validación y publicación de la paridad

- Prueba manual web con fixtures aprobada para rango de fechas, intento
  rechazado, productos, pagos asociados, debounce, importe y paginación básica.
- Prueba Android del Development Build aprobada después de conectar teléfono y
  PC a la misma subred y habilitar los puertos locales de Metro/API en el perfil
  privado del firewall.
- La revisión Android contra la API operativa confirmó que dos intentos visibles
  sin importe desaparecen al aplicar un rango que debería incluirlos. La API
  local con fixtures no fue la fuente de esas filas reales.
- Conciliacion fue validada manualmente en Android contra el proyecto original:
  listado, cantidades y totales entregan los mismos resultados para el periodo
  comprobado. El frontend tolera tanto el resumen operativo anterior como el
  contrato ampliado del backend aislado.
- Las cards de importes en Inicio, Pagos, detalle, Liquidaciones, Conciliacion y
  Calidad mantienen una sola linea y reducen la tipografia cuando el valor no
  entra en el ancho disponible.
- Calidad de datos ya no presenta resultados del filtro anterior mientras carga
  un rango nuevo. Si una categoria operativa vence por timeout, muestra un
  analisis parcial y conserva solamente las categorias del periodo que si
  respondieron. El paginador movil usa texto Unicode valido y una distribucion
  que no se corta en pantallas angostas.
- Pagos, Liquidaciones, Conciliacion y Calidad separan filtros en edicion de
  filtros aplicados. Fechas, importes y selectores consultan una sola vez al
  pulsar `Aplicar filtros`; el aviso de carga aparece solo para esa accion y no
  durante refrescos automaticos.
- Las consultas filtradas no se repiten al recuperar el foco y reutilizan por un
  minuto las respuestas recientes. Calidad busca referencias localmente y
  limita a 12 segundos la categoria operativa de pagos sin venta; si vence,
  presenta un analisis parcial en lugar de bloquear toda la pantalla.
- La paginacion distingue totales exactos de ventanas operativas aproximadas:
  mientras el backend informa que hay mas filas muestra pagina/rango y `hay mas`,
  sin presentar `offset + filas + 1` como cantidad total. Los resúmenes ya no se
  vuelven a consultar al avanzar o retroceder de pagina.
- El backend aislado elimina el antiguo tope silencioso de 2000 para
  Liquidaciones mediante una exploracion interna de hasta 50000 filas por
  proveedor (configurable hasta 100000). Listado y resumen exponen
  `total_exact`, `source_truncated` y `source_scan_limit`; el frontend conserva
  compatibilidad con el backend operativo anterior. Los filtros se aplican a
  la fecha visible de liquidacion, incluidos ambos extremos, aunque la fecha
  estimada se derive del pago del dia anterior. Fixtures validan 2505 filas,
  paginacion, rangos y limites; falta validarlo con una replica autorizada antes
  de cualquier despliegue operativo.
- Frontend validado con lint, typecheck, 15 suites/49 tests y export web.
- Backend aislado validado con tests y controles de sintaxis, incluida la
  regresión sanitizada de ventana previa al filtro monetario.
- Backend publicado en `develop`: `5c4e057`.
- Frontend publicado en `develop`: `6ec7e9c`.
- Ambos repositorios quedaron sincronizados con `origin/develop`, sin force
  push y sin modificar los directorios productivos.
- Las utilidades locales para iniciar el Development Build permanecen sin
  seguimiento hasta decidir si deben generalizarse y documentarse.

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
- Módulo Pagos conectado al backend aislado con resumen, filtros completos,
  paginación y detalle universal.
- Presentación responsive de Pagos: tabla en web/tablet y tarjetas en móvil.
- Contratos Zod y pruebas automatizadas para listado, resumen, catálogos y detalle.
- Liquidaciones estimadas, Conciliación y Calidad de datos funcionan sobre el
  backend aislado, con filtros, búsqueda por referencia, detalle y diseño responsive.
- Login web integrado con `POST /api/v1/auth/login` y cierre de sesión con
  `POST /api/v1/auth/logout`, usando la cookie opaca `ih_reportes_session`.
- El login legacy del panel y su cookie `webserver_admin_auth` permanecen
  separados de la autenticación de ReportesTarjetasApp.

## Validación realizada

- `npm run lint`: aprobado.
- `npm run typecheck`: aprobado.
- `npm run test`: 20 pruebas aprobadas.
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
- Pagos verificado por HTTP y visualmente: 12 operaciones, paginación de 6,
  filtros, métricas y detalle, sin acceso a ODBC.

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

1. Validar login, Pagos y persistencia de sesión en Android con development build.
2. Completar exportación y vistas guardadas del módulo Pagos.
3. Definir autorización por cliente y sucursal.
4. Preparar persistencia de sesiones y un ambiente de staging sin producción.

## Hallazgo de autenticación

- `GET /api/v1/sessions/current` distingue sesión válida de anónima.
- `GET /api/v1/users/me` requiere autenticación y deriva la identidad de la sesión.
- El login del panel administrativo no es apto para la aplicación web/móvil.
- La autenticación implementada sigue limitada al modo fixture de desarrollo.

- El alcance funcional acordado es una unica cuenta de propietario con acceso
  integral de consulta, equivalente a las capacidades visibles para la
  administracion en el escritorio original. No se requiere una matriz compleja
  de roles para el MVP.
- La sesion nativa objetivo es persistente y revocable, con refresh token en
  SecureStore y bloqueo local opcional por PIN o biometria. Las acciones de
  escritura, si se incorporan en otra fase, requieren autorizacion y auditoria
  separadas.

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
- Backend `develop`: `c5fc387`.
- El diagnóstico Unicobros queda desactivado por defecto y sus logs redactan
  secretos y datos sensibles.
- El runtime de desarrollo soporta `DISABLE_DATABASE=true` y CORS con orígenes
  explícitos.
- `FIXTURE_MODE=true` expone datos sintéticos identificados con
  `meta.fixture=true` para Inicio, sin consultar ODBC.
- Los endpoints sintéticos de Pagos cubren listado, resumen, catálogos y detalle,
  requieren sesión y no consultan ODBC.
- Smoke test aprobado en puerto temporal: API online, ODBC desconectado, sesión
  local disponible y origen no autorizado rechazado con HTTP 403.
- GitHub Actions del backend ejecuta pruebas y controles de sintaxis en `main` y
  `develop`.

## Límites activos

- No modificar `J:\Proyectos\ReportesTarjetas`.
- No conectar el frontend nuevo a producción.
- No incluir secretos en variables `EXPO_PUBLIC_*`.
- No introducir cambios incompatibles en `/api/v1`.
