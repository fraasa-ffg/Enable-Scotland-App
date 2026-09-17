export type ThemeKey = 'enable' | 'blue' | 'teal' | 'contrast';

export type AppColors = {
  background: string;
  surface: string;
  foreground: string;
  card: string;
  primaryForeground: string;
  mutedForeground: string;
  text: string;
  textMuted: string;
  border: string;
  divider: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;
  onAccent: string;
  accentLight: string;
  support: string;
  supportLight: string;
  nav: string;
  navText: string;
  danger: string;
  onDanger: string;
  success: string;
  onPrimary: string;
};

const shared = {
  background: '#FFFFFF',
  surface: '#FFFFFF',
  foreground: '#1A1A1A',
  card: '#FFFFFF',
  primaryForeground: '#FFFFFF',
  mutedForeground: '#5C5C66',
  text: '#1A1A1A',
  textMuted: '#5C5C66',
  border: '#8A8A96',
  divider: '#E4E4EA',
  danger: '#B3261E',
  onDanger: '#FFFFFF',
  success: '#1E7A3C',
};

export const themes: Record<ThemeKey, AppColors> = {
  enable: {
    ...shared,
    primary: '#4C16B3',
    primaryLight: '#F1EEFF',
    primaryDark: '#28066A',
    accent: '#CC007A',
    onAccent: '#FFFFFF',
    accentLight: '#FCE7F4',
    support: '#1B6B7B',
    supportLight: '#E7F6F8',
    nav: '#28066A',
    navText: '#FFFFFF',
    onPrimary: '#FFFFFF',
  },
  blue: {
    ...shared,
    primary: '#1565C0',
    primaryLight: '#E3F0FF',
    primaryDark: '#0D47A1',
    accent: '#B45309',
    onAccent: '#FFFFFF',
    accentLight: '#FFF8E1',
    support: '#005F8A',
    supportLight: '#E8F5FB',
    nav: '#1565C0',
    navText: '#FFFFFF',
    onPrimary: '#FFFFFF',
  },
  teal: {
    ...shared,
    primary: '#00695C',
    primaryLight: '#E0F2F0',
    primaryDark: '#004D40',
    accent: '#BF360C',
    onAccent: '#FFFFFF',
    accentLight: '#FBE9E7',
    support: '#1F5F8B',
    supportLight: '#E3EEF6',
    nav: '#00695C',
    navText: '#FFFFFF',
    onPrimary: '#FFFFFF',
  },
  contrast: {
    ...shared,
    text: '#000000',
    textMuted: '#000000',
    border: '#000000',
    primary: '#000000',
    primaryLight: '#F5F5F5',
    primaryDark: '#000000',
    accent: '#000000',
    onAccent: '#FFD600',
    accentLight: '#FFD600',
    support: '#000000',
    supportLight: '#F5F5F5',
    nav: '#000000',
    navText: '#FFD600',
    onPrimary: '#FFD600',
  },
};

export default { light: themes.enable, radius: 8 };