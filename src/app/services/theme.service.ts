import { Injectable, signal } from '@angular/core';

export type AppTheme = 'dark' | 'light' | 'green' | 'blue';

export interface ThemeOption {
  id: AppTheme;
  name: string;
  icon: string;
  colorDot: string;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly STORAGE_KEY = 'webcare_theme';

  public readonly themes: ThemeOption[] = [
    { id: 'dark', name: 'Dark', icon: '🌙', colorDot: '#06b6d4' },
    { id: 'light', name: 'Putih', icon: '☀️', colorDot: '#ffffff' },
    { id: 'green', name: 'Hijau', icon: '🌱', colorDot: '#10b981' },
    { id: 'blue', name: 'Biru', icon: '🌊', colorDot: '#3b82f6' }
  ];

  public currentTheme = signal<AppTheme>('dark');

  constructor() {
    this.initTheme();
  }

  private initTheme(): void {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(this.STORAGE_KEY) as AppTheme | null;
      if (saved && ['dark', 'light', 'green', 'blue'].includes(saved)) {
        this.setTheme(saved);
      } else {
        this.setTheme('dark');
      }
    }
  }

  public setTheme(theme: AppTheme): void {
    this.currentTheme.set(theme);
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, theme);
      document.documentElement.setAttribute('data-theme', theme);

      // Update mobile browser address bar color
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        const themeColors: Record<AppTheme, string> = {
          dark: '#070a12',
          light: '#f8fafc',
          green: '#04130d',
          blue: '#050d1a'
        };
        metaThemeColor.setAttribute('content', themeColors[theme] || '#070a12');
      }
    }
  }

  public getActiveThemeOption(): ThemeOption {
    return this.themes.find(t => t.id === this.currentTheme()) || this.themes[0];
  }
}
