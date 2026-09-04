export type WebInstallPlatform = 'android' | 'ios' | 'desktop';

export function detectWebInstallPlatform({
  userAgent,
  platform,
  maxTouchPoints,
}: {
  userAgent: string;
  platform?: string;
  maxTouchPoints?: number;
}): WebInstallPlatform {
  if (/android/i.test(userAgent)) return 'android';
  const iPadDesktopMode = platform === 'MacIntel' && (maxTouchPoints ?? 0) > 1;
  if (/iPhone|iPad|iPod/i.test(userAgent) || iPadDesktopMode) return 'ios';
  return 'desktop';
}

export function isStandaloneWebApp({
  displayModeStandalone,
  navigatorStandalone,
}: {
  displayModeStandalone: boolean;
  navigatorStandalone?: boolean;
}) {
  return displayModeStandalone || navigatorStandalone === true;
}
