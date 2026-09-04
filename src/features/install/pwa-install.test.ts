import { detectWebInstallPlatform, isStandaloneWebApp } from '@/features/install/pwa-install';

describe('PWA install helpers', () => {
  it('detects Android, iPhone and iPad desktop mode', () => {
    expect(detectWebInstallPlatform({ userAgent: 'Mozilla/5.0 (Linux; Android 16)' })).toBe('android');
    expect(detectWebInstallPlatform({ userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_0)' })).toBe('ios');
    expect(detectWebInstallPlatform({ userAgent: 'Mozilla/5.0', platform: 'MacIntel', maxTouchPoints: 5 })).toBe('ios');
  });

  it('falls back to desktop and recognizes installed display modes', () => {
    expect(detectWebInstallPlatform({ userAgent: 'Mozilla/5.0 (Windows NT 10.0)' })).toBe('desktop');
    expect(isStandaloneWebApp({ displayModeStandalone: true })).toBe(true);
    expect(isStandaloneWebApp({ displayModeStandalone: false, navigatorStandalone: true })).toBe(true);
    expect(isStandaloneWebApp({ displayModeStandalone: false })).toBe(false);
  });
});
