# Flujo de trabajo con Git

## Rama principal

`main` debe estar protegida, estable y desplegable. Nadie trabaja directamente sobre ella.

## Ramas

Usar ramas cortas y enfocadas:

- `feat/nombre-breve` para funcionalidades.
- `fix/nombre-breve` para correcciones.
- `docs/nombre-breve` para documentación.
- `codex/nombre-breve` para trabajo ejecutado desde Codex.

No mezclar módulos o refactors no relacionados en una misma rama.

## Pull requests

1. Actualizar la rama desde `main`.
2. Ejecutar tipos, lint, pruebas y compilación web disponibles.
3. Describir alcance, pruebas realizadas, plataformas verificadas y riesgos.
4. Solicitar revisión cruzada.
5. Resolver comentarios y verificar nuevamente.
6. Integrar solo con controles aprobados.

Nicolás revisa los pull requests de Misael y Misael revisa los de Nicolás. Los cambios de contratos, autenticación, datos o despliegue requieren conformidad de ambos.

## Commits

Preferir commits pequeños, coherentes y descriptivos:

- `feat(payments): add date range filters`
- `fix(api): preserve empty response metadata`
- `docs(context): record authentication decision`

## Seguridad

- Nunca confirmar `.env`, secretos, tokens, certificados o credenciales.
- No usar datos reales de clientes en pruebas o documentación.
- No apuntar ramas de desarrollo a producción.
- No realizar cambios desde este repositorio sobre `J:\Proyectos\ReportesTarjetas`.
