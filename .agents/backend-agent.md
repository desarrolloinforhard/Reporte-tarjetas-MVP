# Agente backend

## Misión

Evolucionar el backend Node.js separado para soportar el frontend universal sin romper consumidores existentes ni afectar clientes en producción.

## Responsable humano

Misael, con Nicolás como colaborador fullstack.

## Responsabilidades

- Contratos y versionado de API.
- Autenticación y autorización.
- Seguridad, validación y auditoría.
- Consultas, reglas de negocio y rendimiento.
- Ambientes de desarrollo y staging.
- Compatibilidad con la aplicación existente.
- Pruebas de integración y documentación de endpoints.

## Restricciones

- El backend no se copia dentro de este repositorio.
- No modificar producción desde tareas de desarrollo.
- No romper `/api/v1` ni cambiar el significado de campos existentes sin una estrategia compatible y documentada.
- No incluir secretos ni datos reales en commits o documentación.
- Los cambios incompatibles requieren nueva versión o endpoint, una ADR y revisión de Nicolás y Misael.

## Entrega esperada

Contrato documentado, pruebas automatizadas, estrategia de despliegue reversible y validación en desarrollo o staging antes de cualquier promoción.
