export type ThemeMode = 'light' | 'dark';
export type ThemeName = ThemeMode;

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceMuted: string;
  surfaceStrong: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  border: string;
  primary: string;
  primaryPressed: string;
  primarySoft: string;
  onPrimary: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  info: string;
  infoSoft: string;
  temperature: string;
  temperatureSoft: string;
  humidity: string;
  humiditySoft: string;
  lamp: string;
  lampSoft: string;
  tabBar: string;
  shadow: string;
  input: string;
  placeholder: string;
}

export const lightColors: ThemeColors = {
  background: '#F3F6FB',
  surface: '#FFFFFF',
  surfaceMuted: '#F7F9FC',
  surfaceStrong: '#E9EFF8',
  text: '#172033',
  textMuted: '#5E6B82',
  textSubtle: '#8490A5',
  border: '#DDE5F0',
  primary: '#315BD6',
  primaryPressed: '#2447AE',
  primarySoft: '#E8EEFF',
  onPrimary: '#FFFFFF',
  success: '#15805C',
  successSoft: '#E0F5ED',
  warning: '#B8660D',
  warningSoft: '#FFF0D8',
  danger: '#C63F49',
  dangerSoft: '#FDE7E9',
  info: '#19728A',
  infoSoft: '#DFF3F8',
  temperature: '#E66A2C',
  temperatureSoft: '#FFF0E8',
  humidity: '#2079C8',
  humiditySoft: '#E6F3FF',
  lamp: '#C18206',
  lampSoft: '#FFF4CE',
  tabBar: '#FFFFFF',
  shadow: '#16233A',
  input: '#FBFCFE',
  placeholder: '#97A2B5',
};

export const darkColors: ThemeColors = {
  background: '#0D1422',
  surface: '#151F30',
  surfaceMuted: '#19263A',
  surfaceStrong: '#25344B',
  text: '#F4F7FC',
  textMuted: '#AFBDD0',
  textSubtle: '#8291A8',
  border: '#2B3A51',
  primary: '#7899FF',
  primaryPressed: '#9BB2FF',
  primarySoft: '#26385F',
  onPrimary: '#0B1530',
  success: '#51C69A',
  successSoft: '#173D35',
  warning: '#F1AF54',
  warningSoft: '#46341F',
  danger: '#F08189',
  dangerSoft: '#48282F',
  info: '#6DC5DD',
  infoSoft: '#183B48',
  temperature: '#FF9A68',
  temperatureSoft: '#462D29',
  humidity: '#70B9F5',
  humiditySoft: '#193753',
  lamp: '#F4C451',
  lampSoft: '#453B21',
  tabBar: '#121C2B',
  shadow: '#000000',
  input: '#111B2A',
  placeholder: '#718096',
};

export const themeColors: Record<ThemeMode, ThemeColors> = {
  light: lightColors,
  dark: darkColors,
};

export function getThemeColors(theme: ThemeMode): ThemeColors {
  return themeColors[theme];
}
