export const brand = {
  accent: '#00B85C',
  primary: '#00B85C',
  primaryPressed: '#009E4F',
  primaryStrong: '#007A3D',
  primarySoft: '#E5F4EC',
  primarySoftDark: '#123D2A',
} as const;

export const lightColors = {
  ...brand,
  background: '#F4F7F5',
  surface: '#FFFFFF',
  surfaceMuted: '#EEF3F0',
  surfaceElevated: '#FFFFFF',
  text: '#14211A',
  textMuted: '#607068',
  textSubtle: '#7D8C84',
  border: '#D9E3DD',
  borderStrong: '#BBC9C1',
  success: '#087A42',
  successSoft: '#DDF3E7',
  warning: '#9A5A00',
  warningSoft: '#FFF1D6',
  danger: '#B42318',
  dangerSoft: '#FDE7E5',
  info: '#1769AA',
  infoSoft: '#E3F1FC',
  onPrimary: '#FFFFFF',
  overlay: 'rgba(12, 28, 19, 0.48)',
} as const;

export const darkColors: AppColors = {
  ...brand,
  primarySoft: '#143E2A',
  background: '#0D1511',
  surface: '#15201A',
  surfaceMuted: '#1D2B23',
  surfaceElevated: '#1A2820',
  text: '#F2F7F4',
  textMuted: '#B0BFB7',
  textSubtle: '#829289',
  border: '#2B3C32',
  borderStrong: '#41564A',
  success: '#53D28D',
  successSoft: '#173D29',
  warning: '#F3B85B',
  warningSoft: '#3D2D13',
  danger: '#FF8A80',
  dangerSoft: '#44201E',
  info: '#79BDF2',
  infoSoft: '#17334A',
  onPrimary: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.68)',
};

export type AppColors = {
  [Key in keyof typeof lightColors]: string;
};

// Alias temporal para módulos de fundación que todavía consumen la paleta clara.
export const colors = lightColors;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  pill: 999,
} as const;

export const typography = {
  display: 36,
  title: 28,
  heading: 21,
  body: 15,
  small: 13,
  caption: 11,
} as const;

export const breakpoints = {
  tablet: 720,
  desktop: 1080,
} as const;
