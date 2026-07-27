export type AppRoute = {
  href: '/' | '/pagos' | '/liquidaciones' | '/conciliacion' | '/calidad' | '/configuracion';
  label: string;
  shortLabel: string;
  symbol: string;
  description: string;
};

export const appRoutes: AppRoute[] = [
  {
    href: '/',
    label: 'Inicio',
    shortLabel: 'Inicio',
    symbol: 'IN',
    description: 'Resumen operativo',
  },
  {
    href: '/pagos',
    label: 'Pagos',
    shortLabel: 'Pagos',
    symbol: 'PA',
    description: 'Consulta y detalle',
  },
  {
    href: '/liquidaciones',
    label: 'Liquidaciones',
    shortLabel: 'Liq.',
    symbol: 'LI',
    description: 'Presentaciones y archivos',
  },
  {
    href: '/conciliacion',
    label: 'Conciliación',
    shortLabel: 'Concil.',
    symbol: 'CO',
    description: 'Diferencias e incidencias',
  },
  {
    href: '/calidad',
    label: 'Calidad de datos',
    shortLabel: 'Calidad',
    symbol: 'CD',
    description: 'Alertas y diagnóstico',
  },
  {
    href: '/configuracion',
    label: 'Configuración',
    shortLabel: 'Ajustes',
    symbol: 'CF',
    description: 'Preferencias y conexión',
  },
];

export function isRouteActive(pathname: string, href: AppRoute['href']) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}
