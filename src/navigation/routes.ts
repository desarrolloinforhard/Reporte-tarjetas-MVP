export type AppRoute = {
  href: '/' | '/pagos' | '/liquidaciones' | '/conciliacion' | '/calidad' | '/configuracion';
  label: string;
  shortLabel: string;
  icon: string;
  description: string;
};

export const appRoutes: AppRoute[] = [
  {
    href: '/',
    label: 'Inicio',
    shortLabel: 'Inicio',
    icon: 'home-outline',
    description: 'Resumen operativo',
  },
  {
    href: '/pagos',
    label: 'Pagos',
    shortLabel: 'Pagos',
    icon: 'card-outline',
    description: 'Consulta y detalle',
  },
  {
    href: '/liquidaciones',
    label: 'Liquidaciones',
    shortLabel: 'Liq.',
    icon: 'receipt-outline',
    description: 'Presentaciones y archivos',
  },
  {
    href: '/conciliacion',
    label: 'Conciliación',
    shortLabel: 'Concil.',
    icon: 'git-compare-outline',
    description: 'Diferencias e incidencias',
  },
  {
    href: '/calidad',
    label: 'Calidad de datos',
    shortLabel: 'Calidad',
    icon: 'shield-checkmark-outline',
    description: 'Alertas y diagnóstico',
  },
  {
    href: '/configuracion',
    label: 'Configuración',
    shortLabel: 'Ajustes',
    icon: 'settings-outline',
    description: 'Preferencias y conexión',
  },
];

export function isRouteActive(pathname: string, href: AppRoute['href']) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}
