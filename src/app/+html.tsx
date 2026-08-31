import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

export default function RootHtml({ children }: PropsWithChildren) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#008A46" />
        <meta name="application-name" content="Reportes de Tarjetas" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Reportes" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
              try {
                const shareKey = '_vercel_share';
                const token = new URLSearchParams(window.location.search).get(shareKey);
                if (token) window.sessionStorage.setItem(shareKey, token);

                const sharedToken = window.sessionStorage.getItem(shareKey);
                if (!sharedToken) return;

                const sharedRoot = () => '/?' + shareKey + '=' + encodeURIComponent(sharedToken);
                for (const method of ['pushState', 'replaceState']) {
                  const original = window.history[method];
                  window.history[method] = function(state, title, url) {
                    if (url && new URL(String(url), window.location.origin).origin === window.location.origin) {
                      return original.call(window.history, state, title, sharedRoot());
                    }
                    return original.call(window.history, state, title, url);
                  };
                }
              } catch (_) {}
            })();`
          }}
        />
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
