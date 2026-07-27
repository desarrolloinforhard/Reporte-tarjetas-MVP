# Decisiones de arquitectura

Esta carpeta contiene registros de decisiones arquitectónicas (ADR) que afectan al proyecto.

## Cuándo crear una ADR

- Cambio de stack o dependencia central.
- Cambio de contrato o versión de API.
- Estrategia de autenticación, autorización o almacenamiento de sesión.
- Separación de implementaciones web y nativa.
- Estrategia de ambientes, despliegue o migración.
- Decisión con impacto en el producto existente o clientes.

## Formato recomendado

```text
# ADR-NNN: Título

Estado: propuesta | aceptada | reemplazada
Fecha: AAAA-MM-DD
Responsables: Nicolás, Misael

## Contexto
## Decisión
## Consecuencias
## Alternativas consideradas
## Plan de validación y reversión
```

No incluir secretos, URLs privadas, credenciales ni datos de clientes.
