import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="hero-section">
      <!-- Glow Gradients -->
      <div class="hero-glow-1"></div>
      <div class="hero-glow-2"></div>

      <div class="container hero-container">
        <!-- Top Pill Badge -->
        <div class="hero-pill-badge">
          <span class="pulse-dot"></span>
          <span class="pill-text">Solusi Teknis Handal &bull; Komunikasi Jelas &bull; Jadwal Terukur</span>
        </div>

        <!-- Main Title & Tagline -->
        <h1 class="hero-title">
          WebCare <span class="gradient-text">&amp; Custom</span>
        </h1>
        <p class="hero-subtitle">
          Perbaikan, Perawatan, dan Pengembangan Website
        </p>

        <!-- Descriptive Paragraph from Brief -->
        <div class="hero-description-box">
          <p class="hero-lead">
            Website bermasalah? Ingin menambahkan fitur baru? Atau membutuhkan bantuan untuk mengembangkan aplikasi bisnis yang sudah berjalan?
          </p>
          <p class="hero-body">
            Kami membantu Anda menemukan solusi teknis yang sesuai dengan kebutuhan bisnis, dengan komunikasi yang jelas, ruang lingkup pekerjaan yang terukur, dan jadwal pengerjaan berdasarkan kesepakatan.
          </p>
        </div>

        <!-- Call To Action Group -->
        <div class="hero-actions">
          <a href="#konsultasi" class="btn btn-primary btn-hero-primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>Konsultasikan Kebutuhan Anda</span>
          </a>

          <a href="#layanan" class="btn btn-outline btn-hero-secondary">
            <span>Lihat Layanan Kami</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </a>
        </div>

        <!-- Trust Badges & Highlights Grid -->
        <div class="hero-highlights">
          <div class="highlight-item">
            <div class="highlight-icon green">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z"/>
              </svg>
            </div>
            <div class="highlight-text">
              <strong>Respon Cepat via WhatsApp</strong>
              <span>Setiap permohonan ditindaklanjuti langsung ke WA aktif Anda</span>
            </div>
          </div>

          <div class="highlight-item">
            <div class="highlight-icon blue">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <div class="highlight-text">
              <strong>Ruang Lingkup Terukur</strong>
              <span>Transparansi estimasi &amp; batasan pekerjaan sebelum mulai</span>
            </div>
          </div>

          <div class="highlight-item">
            <div class="highlight-icon amber">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
            <div class="highlight-text">
              <strong>Jadwal Berdasarkan Kesepakatan</strong>
              <span>Pengerjaan terencana, terutama pada jadwal akhir pekan</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  `,
  styleUrls: ['./hero.css']
})
export class HeroComponent {}
