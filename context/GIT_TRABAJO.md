# Flujo de trabajo con Git

## Rama principal

`main` debe estar protegida, estable y desplegable. Nadie trabaja directamente sobre ella.

## Rama de desarrollo

`develop` es la única rama de trabajo e integración cotidiana. Nicolás y Misael
publican allí commits pequeños y coherentes. No se crean ramas adicionales salvo
autorización explícita de Nicolás.

Antes de comenzar o publicar:

1. Confirmar que el árbol local no tenga cambios ajenos.
2. Ejecutar `git pull --ff-only origin develop`.
3. Coordinar módulos o archivos para evitar edición simultánea.
4. Hacer commits descriptivos y acotados.
5. Publicar sin `force push`.

## Pull requests a main

1. Confirmar que `develop` esté actualizada y estable.
2. Ejecutar tipos, lint, pruebas y compilación web disponibles.
3. Describir alcance, pruebas realizadas, plataformas verificadas y riesgos.
4. Abrir pull request de `develop` hacia `main`.
5. Resolver comentarios y verificar nuevamente.
6. Integrar solo con controles aprobados.

Mientras Nicolás cubra temporalmente ambos roles, `quality` y la revisión del
alcance son obligatorios, pero GitHub no exige una aprobación externa. Cuando
Misael se incorpore, se activa nuevamente una aprobación cruzada obligatoria.
Los cambios de contratos, autenticación, datos o despliegue requieren especial
revisión antes de integrar.

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
- No crear ramas adicionales ni forzar actualizaciones de `main` o `develop`.

## Publicación de paridad del 2026-08-05/06

- Backend aislado `develop`: `5c4e057` (`fix(payments): preserve attempts and exact sale relations`).
- Frontend MVP `develop`: `6ec7e9c` (`fix(payments): match legacy payment detail behavior`).
- Controles previos: backend tests/sintaxis; frontend lint, typecheck, 39 tests y
  export web.
- Los pushes fueron fast-forward y no actualizaron instalaciones de clientes.
- Permanecen locales y sin seguimiento las utilidades de arranque específicas
  de esta estación; no deben entrar en un commit sin revisar portabilidad.
