# ADR-004: identidad visual de Inforhard

## Estado

Aceptada.

## Decisión

La aplicación universal conserva la identidad del producto de escritorio:

- Nombre institucional: **Inforhard S.R.L**
- Color principal: **#008A46**
- Verde suave para fondos de éxito: **#DDEFE6**
- Advertencia suave: **#FFF4D6**
- Error suave: **#FBE1E3**

Los componentes deben consumir tokens semánticos desde `src/theme/tokens.ts`.
No deben repetir colores de marca como literales dentro de las pantallas.

## Consecuencias

- Web, Android e iOS comparten la misma identidad.
- Los cambios futuros de marca se realizan en un único lugar.
- `success` puede coincidir con el verde institucional, pero se mantiene como
  token semántico separado para permitir que ambos evolucionen.
