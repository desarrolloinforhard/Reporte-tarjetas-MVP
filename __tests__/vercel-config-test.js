const fs = require('node:fs');
const path = require('node:path');

describe('Vercel reporting gateway', () => {
  it('mantiene /api/v1 en el mismo origen y no cachea respuestas', () => {
    const config = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'vercel.json'), 'utf8')
    );

    expect(config.rewrites).toContainEqual({
      source: '/api/v1/:path*',
      destination: 'https://stable-heartily-squirrel.ngrok-free.app/reporting/api/v1/:path*'
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
});
