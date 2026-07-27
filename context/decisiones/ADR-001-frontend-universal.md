# ADR-001: Frontend universal con Expo

- Estado: Aceptada
- Fecha: 2026-07-27
- Responsables: Nicolás y Misael

## Contexto

ReportesTarjetas es una aplicación de escritorio Python/Bootstack en producción. La nueva V1 necesita toda su capacidad funcional en web, Android e iOS, consumiendo el backend Node.js existente sin poner en riesgo clientes actuales.

## Decisión

Crear un repositorio frontend independiente con:

- Expo y React Native.
- React Native Web.
- Expo Router.
- TypeScript estricto.
- TanStack Query para estado remoto.
- Componentes compartidos por defecto y variantes `.web`/`.native` cuando la experiencia lo exija.

El proyecto legacy permanece inalterado y es referencia funcional de solo lectura. El backend no se copia al frontend: continúa como repositorio y servicio independiente, desplegado por ambientes. La aplicación nueva solo se conecta a desarrollo/staging durante construcción.

## Motivos

- Una base de código para lógica, contratos y gran parte de UI.
- Builds nativos reales y web responsive.
- Desarrollo desde Windows con compilación iOS remota.
- Migración incremental por módulos con trazabilidad.
- Evita mantener React web y React Native como productos separados antes de que exista una necesidad comprobada.

## Consecuencias

Positivas:

- Se comparten tipos, API, reglas, validaciones, tema y componentes.
- Web y móvil evolucionan en el mismo PR.
- La paridad se controla con una matriz única.

Costos:

- Tablas densas, archivos, selectores de fecha y navegación necesitarán variantes por plataforma.
- Las librerías se aceptan solo si funcionan en web, Android e iOS o tienen adaptador definido.
- iOS requiere EAS/macOS remoto y pruebas posteriores en dispositivo real.

## Límites de seguridad y compatibilidad

- No cambiar ni importar archivos del proyecto productivo.
- No copiar secretos o datos de clientes.
- No conectar desarrollo a producción.
- Mantener compatibilidad de `/api/v1`; cambios incompatibles requieren versión o endpoint nuevo.
- Autenticación, CORS, HTTPS y autorización se validan en staging antes de habilitar clientes.
- Operaciones Clover y exportaciones largas se ejecutan en backend; el frontend solo inicia y supervisa trabajos.

## Alternativas descartadas

- Copiar Bootstack: no es portable a navegador ni aplicaciones nativas.
- Dos frontends desde el inicio: duplica navegación, UI y pruebas sin necesidad validada.
- Empaquetar la web en WebView: reduce calidad nativa y no resuelve correctamente capacidades móviles.
- Copiar el backend dentro del repositorio: crea fuentes divergentes y eleva el riesgo operativo.

## Revisión

Reevaluar si una función crítica de escritorio exige DOM avanzado no compatible, o si métricas reales muestran que las variantes de plataforma superan el beneficio de compartir base. Cualquier cambio requiere un ADR nuevo; no modifica retrospectivamente esta decisión.
