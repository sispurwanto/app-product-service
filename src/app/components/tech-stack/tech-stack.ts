import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TECH_STACKS } from '../../data/default-services.data';
import { TechStackItem } from '../../models/service.model';

@Component({
  selector: 'app-tech-stack',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="teknologi" class="tech-section">
      <div class="container">
        <!-- Section Header -->
        <div class="section-header">
          <div class="badge badge-indigo section-tag">Keahlian Teknologi</div>
          <h2>Fondasi Teknologi Modern &amp; Teruji</h2>
          <p>
            Kami bekerja dengan teknologi pengembangan web dan database berikut, sesuai kebutuhan serta kondisi proyek.
          </p>
        </div>

        <!-- Tech Grid -->
        <div class="tech-grid">
          <div *ngFor="let item of techList" class="tech-card glass-panel">
            <div class="tech-header">
              <div class="tech-icon-container" [style.borderColor]="item.color + '44'" [style.background]="item.color + '18'">
                <!-- Render specific brand icons -->
                <ng-container [ngSwitch]="item.icon">
                  <!-- Node.js Icon -->
                  <svg *ngSwitchCase="'nodejs'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" [style.color]="item.color">
                    <path d="M12 2l9 5.2v10.4l-9 5.2-9-5.2V7.2L12 2z"/>
                    <path d="M12 12l9-5.2"/>
                    <path d="M12 12v10.8"/>
                    <path d="M12 12L3 6.8"/>
                  </svg>

                  <!-- Angular Icon -->
                  <svg *ngSwitchCase="'angular'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" [style.color]="item.color">
                    <polygon points="12 2 2 5.5 3.5 17 12 22 20.5 17 22 5.5 12 2"/>
                    <polygon points="12 4.5 5 15.5 8 15.5 9.5 12 14.5 12 16 15.5 19 15.5 12 4.5"/>
                  </svg>

                  <!-- PostgreSQL Icon -->
                  <svg *ngSwitchCase="'postgresql'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" [style.color]="item.color">
                    <ellipse cx="12" cy="5" rx="9" ry="3"/>
                    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
                    <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/>
                  </svg>

                  <!-- MySQL Icon -->
                  <svg *ngSwitchCase="'mysql'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" [style.color]="item.color">
                    <ellipse cx="12" cy="7" rx="8" ry="4"/>
                    <path d="M4 7v10c0 2.21 3.58 4 8 4s8-1.79 8-4V7"/>
                    <path d="M4 12c0 2.21 3.58 4 8 4s8-1.79 8-4"/>
                  </svg>

                  <!-- PHP Icon -->
                  <svg *ngSwitchCase="'php'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" [style.color]="item.color">
                    <ellipse cx="12" cy="12" rx="10" ry="7" stroke-width="1.6"/>
                    <path d="M5.5 14.5l.8-4.5h1.5a1.5 1.5 0 0 1 0 3h-1.7"/>
                    <path d="M10.2 14.5l.8-4.5"/>
                    <path d="M10.6 12.2h2"/>
                    <path d="M12.6 14.5l.8-4.5"/>
                    <path d="M15.5 14.5l.8-4.5h1.5a1.5 1.5 0 0 1 0 3h-1.7"/>
                  </svg>

                  <!-- Firebase Icon -->
                  <svg *ngSwitchCase="'firebase'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" [style.color]="item.color">
                    <path d="M4.5 19.5L9.5 3.5 13 11 16 7 19.5 19.5z"/>
                  </svg>

                  <!-- Default Fallback Icon -->
                  <svg *ngSwitchDefault width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" [style.color]="item.color">
                    <polyline points="16 18 22 12 16 6"></polyline>
                    <polyline points="8 6 2 12 8 18"></polyline>
                  </svg>
                </ng-container>
              </div>

              <div class="tech-title-wrap">
                <h3 class="tech-name">{{ item.name }}</h3>
                <span class="tech-role">{{ item.role }}</span>
              </div>
            </div>

            <p class="tech-desc">{{ item.description }}</p>

            <div class="tech-tags">
              <span *ngFor="let t of item.tags" class="tech-tag">{{ t }}</span>
            </div>
          </div>
        </div>

        <!-- Technical Feasibility Notice from Brief -->
        <div class="feasibility-notice glass-panel">
          <div class="notice-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <div class="notice-content">
            <h4>Penyesuaian Sistem Eksisting &amp; Pemeriksaan Akses</h4>
            <p>
              Teknologi yang digunakan akan disesuaikan dengan sistem yang sudah dimiliki pelanggan. 
              Kami akan memeriksa kelayakan dan akses teknis terlebih dahulu sebelum menyepakati pekerjaan.
            </p>
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrls: ['./tech-stack.css']
})
export class TechStackComponent {
  techList: TechStackItem[] = TECH_STACKS;
}
