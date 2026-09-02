const fs = require('node:fs');
const path = require('node:path');

describe('Vercel reporting gateway', () => {
  it('mantiene /api/v1 en el mismo origen y no cachea respuestas', () => {
    const config = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'vercel.json'), 'utf8')
    );

    expect(config.rewrites).toContainEqual({
      source: '/api/v1/:path*',
      destination: 'https://inforhardapi-buengusto.ngrok.app/reporting/api/v1/:path*'
    });
    expect(config.headers).toContainEqual({
      source: '/api/v1/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'no-store, no-cache, must-revalidate, proxy-revalidate'
        }
      ]
    });
  });

  it('incorpora la API publica y omite el interstitial de ngrok', () => {
    const productionEnv = fs.readFileSync(
      path.join(process.cwd(), '.env.production'),
      'utf8'
    );
    const apiClient = fs.readFileSync(
      path.join(process.cwd(), 'src', 'api', 'client.ts'),
      'utf8'
    );

    expect(productionEnv).toContain(
      'EXPO_PUBLIC_API_URL_WEB=https://reporte-tarjetas-inforhard.vercel.app/api/v1'
    );
    expect(productionEnv).toContain('EXPO_PUBLIC_APP_ENV=production');
    expect(apiClient).toContain(
      "headers.set('ngrok-skip-browser-warning', '1')"
    );
  });
});
