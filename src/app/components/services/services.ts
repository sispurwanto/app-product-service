import { Component, OnInit, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../../services/firebase.service';
import { ServiceItem } from '../../models/service.model';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="layanan" class="services-section">
      <div class="container">
        <!-- Section Header -->
        <div class="section-header">
          <div class="badge badge-cyan section-tag">Layanan Kami</div>
          <h2>Solusi Profesional untuk Setiap Kebutuhan Website</h2>
          <p>
            Produk jasa kami dirancang terukur dan transparan, mulai dari penanganan error mendesak, 
            pemeliharaan berkala, hingga kustomisasi modul bisnis Anda.
          </p>
        </div>

        <!-- Database Sync Banner -->
        <!-- <div class="db-sync-info">
          <div class="db-sync-left">
            <span class="db-icon">🔥</span>
            <span>
              Katalog Produk Layanan terintegrasi dengan 
              <strong>{{ firebaseService.isConnected() ? 'Cloud Firestore Live Database' : 'Database Internal (Offline Cache)' }}</strong>
            </span>
          </div>
          <button *ngIf="firebaseService.isConnected()" (click)="syncServicesToFirestore()" class="btn-sync-action" [disabled]="isSyncing()">
            {{ isSyncing() ? 'Menyinkronkan...' : '↺ Refresh dari Firebase' }}
          </button>
        </div> -->

        <!-- Services Cards Grid -->
        <div class="services-grid">
          <div 
            *ngFor="let service of services(); let i = index" 
            class="service-card glass-panel"
            [class.featured]="service.category === 'repair'">
            
            <!-- Card Top Bar -->
            <div class="card-top-bar">
              <span class="service-number">0{{ i + 1 }}</span>
              <span class="badge" [ngClass]="getBadgeClass(service.badgeColor)">
                {{ service.badge }}
              </span>
            </div>

            <!-- Service Title -->
            <h3 class="service-title">{{ service.title }}</h3>
            <p class="service-desc">{{ service.shortDesc }}</p>

            <!-- Key Features / Scope Checklist -->
            <div class="features-wrapper">
              <h4 class="features-heading">Cakupan Penanganan:</h4>
              <ul class="features-list">
                <li *ngFor="let feat of service.keyFeatures">
                  <div class="check-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <span>{{ feat }}</span>
                </li>
              </ul>
            </div>

            <!-- Workflow Note Callout -->
            <div class="workflow-callout">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="callout-icon">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <p>{{ service.workflowNote }}</p>
            </div>

            <!-- Typical Cases Tags -->
            <div class="typical-cases" *ngIf="service.typicalCases.length">
              <span class="cases-label">Contoh Kasus:</span>
              <div class="tags-row">
                <span *ngFor="let tc of service.typicalCases" class="case-tag">
                  {{ tc }}
                </span>
              </div>
            </div>

            <!-- Card Bottom Action -->
            <div class="card-footer">
              <button (click)="onSelectService(service)" class="btn btn-outline btn-select-srv">
                <span>Pilih Layanan Ini</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrls: ['./services.css']
})
export class ServicesComponent implements OnInit {
  public firebaseService = inject(FirebaseService);

  selectService = output<string>();

  services = signal<ServiceItem[]>([]);
  isSyncing = signal<boolean>(false);

  async ngOnInit(): Promise<void> {
    await this.loadServices();
  }

  async loadServices(): Promise<void> {
    try {
      const items = await this.firebaseService.getServices();
      this.services.set(items);
    } catch (err) {
      console.error('Failed loading services:', err);
    }
  }

  async syncServicesToFirestore(): Promise<void> {
    this.isSyncing.set(true);
    try {
      await this.loadServices();
    } finally {
      this.isSyncing.set(false);
    }
  }

  onSelectService(service: ServiceItem): void {
    // Map service category/title to consultation form
    let categoryName = 'Website Repair';
    if (service.category === 'care') categoryName = 'Website Care';
    if (service.category === 'custom') categoryName = 'Customize On-Call';

    this.selectService.emit(categoryName);

    // Smooth scroll to consultation form
    const elem = document.getElementById('konsultasi');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  }

  getBadgeClass(color: string): string {
    switch (color) {
      case 'rose': return 'badge-rose';
      case 'emerald': return 'badge-emerald';
      case 'indigo': return 'badge-indigo';
      case 'amber': return 'badge-amber';
      default: return 'badge-cyan';
    }
  }
}
