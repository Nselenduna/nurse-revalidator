import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants';

export type Theme = 'light' | 'dark';

export interface ThemeColors {
  primary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
}

const THEME_STORAGE_KEY = '@app_theme';

export const themes: Record<Theme, ThemeColors> = {
  light: {
    primary: COLORS.PRIMARY,
    background: COLORS.WHITE,
    surface: COLORS.WHITE,
    text: COLORS.BLACK,
    textSecondary: '#666666',
    border: '#E1E1E1',
    error: COLORS.ERROR,
    success: COLORS.SUCCESS
  },
  dark: {
    primary: COLORS.PRIMARY,
    background: '#121212',
    surface: '#1E1E1E',
    text: COLORS.WHITE,
    textSecondary: '#B3B3B3',
    border: '#2C2C2C',
    error: COLORS.ERROR,
    success: COLORS.SUCCESS
  }
};

class ThemeService {
  private currentTheme: Theme = 'light';
  private listeners: Set<(theme: Theme) => void> = new Set();

  async initialize(): Promise<void> {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        this.currentTheme = savedTheme;
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  }

  getCurrentTheme(): Theme {
    return this.currentTheme;
  }

  getThemeColors(): ThemeColors {
    return themes[this.currentTheme];
  }

  async setTheme(theme: Theme): Promise<void> {
    try {
      this.currentTheme = theme;
      await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to save theme:', error);
      throw error;
    }
  }

  subscribe(listener: (theme: Theme) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.currentTheme));
  }
}

export const themeService = new ThemeService();
