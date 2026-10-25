import { Component, output, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService, AppTheme } from '../../services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="navbar" [class.scrolled]="isScrolled">
      <div class="container nav-container">
        <!-- Logo Brand -->
        <a href="#" class="brand-logo">
          <div class="brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="m9 12 2 2 4-4"/>
            </svg>
          </div>
          <div class="brand-text">
            <span class="brand-name">WebCare <span class="highlight">&amp; Custom</span></span>
            <span class="brand-sub">Perbaikan &bull; Perawatan &bull; Fitur</span>
          </div>
        </a>

        <!-- Desktop Navigation Links -->
        <div class="nav-links">
          <a href="#layanan" class="nav-link">Layanan</a>
          <a href="#teknologi" class="nav-link">Keahlian Teknis</a>
          <a href="#proses" class="nav-link">Proses Kerja</a>
          <a href="#jadwal" class="nav-link">Jadwal</a>
          <button (click)="openTracker.emit()" class="nav-link-btn" title="Lacak status konsultasi Anda dengan nomor WhatsApp">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            Cek Tiket WA
          </button>
        </div>

        <!-- Right Action Buttons -->
        <div class="nav-actions">
          <!-- Theme Switcher Dropdown -->
          <div class="theme-dropdown-wrap" (click)="$event.stopPropagation()">
            <button 
              type="button"
              (click)="toggleThemeMenu()" 
              class="theme-toggle-btn" 
              [title]="'Pilih Tema: ' + themeService.getActiveThemeOption().name"
              aria-label="Pilih Tema">
              <span class="theme-icon">{{ themeService.getActiveThemeOption().icon }}</span>
              <span class="theme-name">{{ themeService.getActiveThemeOption().name }}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" [class.rotated]="themeMenuOpen">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            <!-- Dropdown Options -->
            <div *ngIf="themeMenuOpen" class="theme-menu glass-panel">
              <button 
                *ngFor="let t of themeService.themes" 
                type="button"
                (click)="selectTheme(t.id)" 
                class="theme-option-item" 
                [class.active]="themeService.currentTheme() === t.id">
                <span class="theme-option-icon">{{ t.icon }}</span>
                <span class="theme-option-name">{{ t.name }}</span>
                <span class="theme-option-dot" [style.background-color]="t.colorDot"></span>
              </button>
            </div>
          </div>

          <!-- Primary CTA -->
          <a href="#konsultasi" class="btn btn-primary btn-sm btn-nav-cta">
            <span>Konsultasi Sekarang</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </a>

          <!-- Mobile Hamburger -->
          <button (click)="toggleMobileMenu()" class="mobile-toggle" aria-label="Toggle Menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line *ngIf="!mobileMenuOpen" x1="3" y1="12" x2="21" y2="12"></line>
              <line *ngIf="!mobileMenuOpen" x1="3" y1="6" x2="21" y2="6"></line>
              <line *ngIf="!mobileMenuOpen" x1="3" y1="18" x2="21" y2="18"></line>
              <line *ngIf="mobileMenuOpen" x1="18" y1="6" x2="6" y2="18"></line>
              <line *ngIf="mobileMenuOpen" x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Dropdown -->
      <div *ngIf="mobileMenuOpen" class="mobile-menu">
        <a href="#layanan" (click)="closeMobile()" class="mobile-link">Layanan Kami</a>
        <a href="#teknologi" (click)="closeMobile()" class="mobile-link">Keahlian Teknologi</a>
        <a href="#proses" (click)="closeMobile()" class="mobile-link">Bagaimana Prosesnya</a>
        <a href="#jadwal" (click)="closeMobile()" class="mobile-link">Layanan Berdasarkan Jadwal</a>
        <div class="mobile-divider"></div>

        <!-- Mobile Theme Selection -->
        <div class="mobile-theme-section">
          <span class="mobile-theme-title">Pilihan Tema:</span>
          <div class="mobile-theme-grid">
            <button 
              *ngFor="let t of themeService.themes" 
              type="button"
              (click)="selectTheme(t.id)" 
              class="mobile-theme-btn" 
              [class.active]="themeService.currentTheme() === t.id">
              <span>{{ t.icon }}</span>
              <span>{{ t.name }}</span>
            </button>
          </div>
        </div>

        <div class="mobile-divider"></div>
        <button (click)="openTracker.emit(); closeMobile()" class="mobile-btn">
          🔍 Cek Tiket WA Saya
        </button>
        <a href="#konsultasi" (click)="closeMobile()" class="btn btn-primary" style="margin-top: 0.5rem; width: 100%;">
          Konsultasikan Kebutuhan Anda
        </a>
      </div>
    </nav>
  `,
  styleUrls: ['./navbar.css']
})
export class NavbarComponent {
  public themeService = inject(ThemeService);

  openTracker = output<void>();

  isScrolled = false;
  mobileMenuOpen = false;
  themeMenuOpen = false;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', () => {
        this.isScrolled = window.scrollY > 20;
      });
    }
  }

  toggleThemeMenu(): void {
    this.themeMenuOpen = !this.themeMenuOpen;
  }

  selectTheme(theme: AppTheme): void {
    this.themeService.setTheme(theme);
    this.themeMenuOpen = false;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.themeMenuOpen = false;
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobile(): void {
    this.mobileMenuOpen = false;
  }
}
