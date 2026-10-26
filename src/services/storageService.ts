import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_BROKER_URL } from '../config/mqtt';
import { normalizeBrokerUrl } from './mqttService';

export type ThemePreference = 'light' | 'dark';

export interface AppPreferences {
  brokerUrl: string;
  theme: ThemePreference;
}

const STORAGE_KEYS = {
  brokerUrl: '@iot-control/broker-url',
  theme: '@iot-control/theme',
} as const;

const DEFAULT_PREFERENCES: AppPreferences = {
  brokerUrl: DEFAULT_BROKER_URL,
  theme: 'light',
};

const isThemePreference = (value: string | null): value is ThemePreference =>
  value === 'light' || value === 'dark';

const getValidStoredBrokerUrl = (value: string | null): string => {
  if (!value) {
    return DEFAULT_BROKER_URL;
  }

  try {
    return normalizeBrokerUrl(value);
  } catch {
    return DEFAULT_BROKER_URL;
  }
};

export const storageService = {
  async loadPreferences(): Promise<AppPreferences> {
    try {
      const [brokerUrl, theme] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.brokerUrl),
        AsyncStorage.getItem(STORAGE_KEYS.theme),
      ]);

      return {
        brokerUrl: getValidStoredBrokerUrl(brokerUrl),
        theme: isThemePreference(theme) ? theme : DEFAULT_PREFERENCES.theme,
      };
    } catch {
      return { ...DEFAULT_PREFERENCES };
    }
  },

  async saveBrokerUrl(brokerUrl: string): Promise<string> {
    const normalizedUrl = normalizeBrokerUrl(brokerUrl);
    await AsyncStorage.setItem(STORAGE_KEYS.brokerUrl, normalizedUrl);
    return normalizedUrl;
  },

  async saveTheme(theme: ThemePreference): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.theme, theme);
  },
};
