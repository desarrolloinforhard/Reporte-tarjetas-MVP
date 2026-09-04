import { appRoutes, isRouteActive } from '@/navigation/routes';

describe('appRoutes', () => {
  it('declara rutas únicas para todos los módulos obligatorios', () => {
    const hrefs = appRoutes.map((route) => route.href);

    expect(new Set(hrefs).size).toBe(hrefs.length);
    expect(hrefs).toEqual([
      '/',
      '/pagos',
      '/liquidaciones',
      '/conciliacion',
      '/calidad',
      '/ayuda',
      '/configuracion',
    ]);
  });

  it('solo activa Inicio en la ruta raíz y conserva subrutas de módulos', () => {
    expect(isRouteActive('/', '/')).toBe(true);
    expect(isRouteActive('/pagos', '/')).toBe(false);
    expect(isRouteActive('/pagos/proveedor/123', '/pagos')).toBe(true);
    expect(isRouteActive('/conciliacion', '/pagos')).toBe(false);
  });
});
