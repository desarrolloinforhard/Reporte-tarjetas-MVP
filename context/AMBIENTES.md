# Ambientes

## Modelo

| Ambiente | Propósito | Datos | Acceso |
|---|---|---|---|
| Desarrollo | Trabajo diario y pruebas automatizadas | Sintéticos, anonimizados o base de prueba | Equipo técnico |
| Staging | Integración y aceptación previa a release | Dataset controlado representativo | Equipo y usuarios autorizados |
| Producción | Servicio a clientes | Reales | Operación autorizada |

Cada ambiente usa un runtime, configuración, credenciales, base y logs independientes. Compartir el código no significa compartir procesos ni datos.

## Configuración del frontend

El frontend recibe únicamente valores públicos necesarios, por ejemplo la URL base. Los nombres concretos se documentan en `.env.example`, sin valores sensibles.

```text
desarrollo -> API de desarrollo
staging    -> API de staging
producción -> API de producción
```

Una build debe identificar su ambiente de forma inequívoca. Las builds internas no deben poder publicarse accidentalmente como producción.

## Configuración del backend

- Secretos fuera del repositorio.
- Credenciales distintas por ambiente.
- Bases distintas por ambiente.
- Proveedores externos en sandbox cuando esté disponible.
- CORS y dominios específicos por ambiente.
- Logs y métricas etiquetados con ambiente y versión.

## Promoción

El artefacto o commit aprobado se promueve en este orden:

```text
desarrollo -> staging -> producción
```

No se corrige directamente en producción. Un hotfix nace en una rama, se prueba en un runtime aislado y conserva un plan de reversión.

## Protecciones

- `main` protegida y pull request obligatorio.
- Producción requiere aprobación manual.
- Acceso mínimo necesario a secretos y despliegues.
- Smoke tests posteriores a cada despliegue.
- Compatibilidad del cliente Bootstack incluida en la aprobación mientras siga activo.

## Datos de prueba

No clonar una base productiva sin anonimización y autorización. Si se necesita reproducir un caso real, crear un fixture mínimo que preserve el comportamiento y elimine identificadores, credenciales y datos personales.

## Prueba local con Development Build Android

- Metro debe iniciarse en modo `--dev-client`, no en modo Expo Go.
- Expo SDK 57 debe ejecutarse con el runtime Node x64 definido por el proyecto;
  el Node ia32 del sistema no sirve para este arranque.
- Teléfono y PC deben compartir la misma subred para usar la dirección LAN.
- Los puertos TCP de Metro y de la API de desarrollo deben permitirse solamente
  en el perfil de red privada.
- Antes de interpretar una pantalla con datos reales, verificar la URL de API
  persistida por la app: SecureStore puede conservar una configuración anterior
  aunque Metro entregue un frontend nuevo.
- Iniciar Metro no despliega ni reinicia el backend configurado por la app.
