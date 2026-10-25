import { Component, inject, signal, output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConsultationService } from '../../services/consultation.service';
import { FirebaseService } from '../../services/firebase.service';
import { AuthService } from '../../services/auth.service';
import { ConsultationRequest, ConsultationStatus } from '../../models/consultation.model';

@Component({
  selector: 'app-admin-inbox',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-backdrop" (click)="close.emit()">
      <div class="admin-modal glass-panel" (click)="$event.stopPropagation()">
        
        <!-- ======================================================= -->
        <!-- STATE 1: FIREBASE AUTH LOGIN SCREEN                     -->
        <!-- ======================================================= -->
        <div *ngIf="!authService.isLoggedIn()" class="admin-auth-screen">
          <div class="auth-icon-wrap">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <polyline points="16 11 18 13 22 9"></polyline>
            </svg>
          </div>

          <h3 class="auth-title">Login Admin WebCare</h3>
          <p class="auth-desc">
            Dilindungi dengan <strong>Firebase Authentication</strong>. Masuk untuk meninjau data permohonan 
            dan membalas langsung ke nomor WhatsApp klien.
          </p>

          <!-- Error Alert -->
          <div *ngIf="authService.authError()" class="alert-auth-error">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{{ authService.authError() }}</span>
          </div>

          <!-- Login Form -->
          <form (ngSubmit)="handleLogin()" class="auth-form">
            <div class="form-group-auth">
              <label>Email Admin</label>
              <input 
                type="email" 
                [(ngModel)]="loginEmail" 
                name="email" 
                placeholder="admin@webcare.com" 
                class="form-control"
                required
                autofocus>
            </div>

            <div class="form-group-auth">
              <label>Password</label>
              <input 
                type="password" 
                [(ngModel)]="loginPassword" 
                name="password" 
                placeholder="••••••••••••" 
                class="form-control"
                required>
            </div>

            <button 
              type="submit" 
              class="btn btn-primary btn-auth-submit" 
              [disabled]="authService.isLoading()">
              <svg *ngIf="authService.isLoading()" class="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" stroke-width="4" stroke="currentColor" stroke-dasharray="32" stroke-linecap="round"/>
              </svg>
              <span>{{ authService.isLoading() ? 'Memverifikasi...' : 'Masuk sebagai Admin' }}</span>
            </button>
          </form>

          <!-- Firebase Console Guide Callout -->
          <div class="firebase-guide-box">
            <div class="guide-header">
              <span class="guide-bulb">💡</span>
              <strong>Cara Setup Akun Admin di Firebase Console:</strong>
            </div>
            <ol class="guide-steps">
              <li>Buka <code>console.firebase.google.com</code> &rarr; Project: <code>app-product-service</code></li>
              <li>Pilih menu <strong>Authentication</strong> &rarr; Tab <strong>Sign-in method</strong> &rarr; Aktifkan <strong>Email/Password</strong>.</li>
              <li>Pilih tab <strong>Users</strong> &rarr; Klik <strong>Add user</strong> &rarr; Masukkan email &amp; password Anda.</li>
            </ol>
          </div>

          <button (click)="close.emit()" class="btn-cancel-auth">
            Tutup
          </button>
        </div>

        <!-- ======================================================= -->
        <!-- STATE 2: UNLOCKED ADMIN DASHBOARD                       -->
        <!-- ======================================================= -->
        <ng-container *ngIf="authService.isLoggedIn()">
          <!-- Modal Top Bar -->
          <div class="admin-top-bar">
            <div class="admin-title-group">
              <span class="admin-badge-icon">📬</span>
              <div>
                <div class="admin-title-row">
                  <h3 class="admin-title">Admin Inbox Konsultasi</h3>
                  <span class="user-pill">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    {{ authService.currentUser()?.email }}
                  </span>
                </div>
                <p class="admin-sub">
                  Database: <strong>Cloud Firestore</strong> (Project: <code>{{ firebaseService.currentConfig().projectId }}</code>)
                </p>
              </div>
            </div>
            
            <div class="admin-top-actions">
              <button (click)="refresh()" class="btn-refresh" [disabled]="consultService.isLoading()" title="Muat ulang dari database">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" [class.spinning]="consultService.isLoading()">
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <polyline points="1 20 1 14 7 14"></polyline>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                </svg>
                <span>Refresh</span>
              </button>
              <button (click)="handleLogout()" class="btn-logout" title="Keluar dari sesi admin">
                Keluar
              </button>
              <button (click)="close.emit()" class="btn-close">&times;</button>
            </div>
          </div>

          <!-- Filter & Statistics Ribbon -->
          <div class="stats-ribbon">
            <div class="stat-pill" [class.active]="selectedFilter() === 'all'" (click)="setFilter('all')">
              <span class="stat-label">Semua Tiket</span>
              <span class="stat-count">{{ totalCount() }}</span>
            </div>
            <div class="stat-pill pending" [class.active]="selectedFilter() === 'menunggu_balasan'" (click)="setFilter('menunggu_balasan')">
              <span class="stat-label">Perlu Dibalas WA</span>
              <span class="stat-count">{{ pendingCount() }}</span>
            </div>
            <div class="stat-pill replied" [class.active]="selectedFilter() === 'dibalas_wa'" (click)="setFilter('dibalas_wa')">
              <span class="stat-label">Sudah Dibalas WA</span>
              <span class="stat-count">{{ repliedCount() }}</span>
            </div>
            <div class="stat-pill analysis" [class.active]="selectedFilter() === 'dalam_analisis'" (click)="setFilter('dalam_analisis')">
              <span class="stat-label">Dalam Analisis</span>
              <span class="stat-count">{{ analysisCount() }}</span>
            </div>
          </div>

          <!-- Consultation Request Items List -->
          <div class="requests-scroll-area">
            <div *ngIf="filteredRequests().length === 0" class="inbox-empty">
              <p>Tidak ada permohonan konsultasi pada filter ini.</p>
            </div>

            <div *ngFor="let req of filteredRequests()" class="request-row-card">
              <div class="row-top">
                <div class="client-info">
                  <span class="client-name">{{ req.clientName }}</span>
                  <span class="ticket-tag">#{{ req.ticketNumber }}</span>
                  <span class="created-at">{{ formatDate(req.createdAt) }}</span>
                </div>
                <div class="status-and-urgency">
                  <span class="badge" [ngClass]="getUrgencyBadge(req.urgency)">
                    Urgensi: {{ req.urgency }}
                  </span>
                  <span class="badge" [ngClass]="getStatusBadge(req.status)">
                    {{ getStatusLabel(req.status) }}
                  </span>
                </div>
              </div>

              <!-- WhatsApp Number Highlighting (Primary Key) -->
              <div class="phone-key-strip">
                <span class="wa-label">WhatsApp Klien:</span>
                <a [href]="'https://wa.me/' + req.whatsappNumber" target="_blank" class="wa-number-link">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z"/>
                  </svg>
                  +{{ req.whatsappNumber }}
                </a>
                <span class="srv-badge-mini">{{ req.serviceCategory }}</span>
                <span *ngIf="req.websiteUrl" class="site-link">🔗 {{ req.websiteUrl }}</span>
              </div>

              <!-- Summary & Details -->
              <div class="issue-content-box">
                <strong class="issue-summary-title">"{{ req.issueSummary }}"</strong>
                <p class="issue-detail-text">{{ req.issueDetail }}</p>
                <div *ngIf="req.techStack" class="tech-used">
                  <span>Stack:</span>
                  <code>{{ req.techStack }}</code>
                </div>
              </div>

              <!-- Admin Note & Action Bottom Bar -->
              <div class="row-bottom-actions">
                <!-- Status Dropdown Selector -->
                <div class="status-selector-wrap">
                  <label class="action-label">Ubah Status:</label>
                  <select 
                    [ngModel]="req.status" 
                    (ngModelChange)="onUpdateStatus(req, $event)"
                    class="admin-select">
                    <option value="menunggu_balasan">Menunggu Balasan WA</option>
                    <option value="dibalas_wa">Sudah Dibalas di WA</option>
                    <option value="dalam_analisis">Dalam Analisis Teknis</option>
                    <option value="kesepakatan">Kesepakatan &amp; Jadwal</option>
                    <option value="selesai">Selesai</option>
                  </select>
                </div>

                <!-- Quick WhatsApp Reply Button -->
                <a 
                  [href]="getReplyWaUrl(req)" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  (click)="onReplyClicked(req)"
                  class="btn btn-wa btn-sm">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z"/>
                  </svg>
                  <span>Balas Pesan via WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </ng-container>
      </div>
    </div>
  `,
  styleUrls: ['./admin-inbox.css']
})
export class AdminInboxComponent implements OnInit {
  public consultService = inject(ConsultationService);
  public firebaseService = inject(FirebaseService);
  public authService = inject(AuthService);

  close = output<void>();

  loginEmail = '';
  loginPassword = '';
  selectedFilter = signal<string>('all');

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.refresh();
    }
  }

  async handleLogin(): Promise<void> {
    const res = await this.authService.login(this.loginEmail, this.loginPassword);
    if (res.success) {
      this.refresh();
    }
  }

  async handleLogout(): Promise<void> {
    await this.authService.logout();
    this.loginPassword = '';
  }

  async refresh(): Promise<void> {
    await this.consultService.refreshConsultations();
  }

  setFilter(filter: string): void {
    this.selectedFilter.set(filter);
  }

  totalCount(): number {
    return this.consultService.consultations().length;
  }

  pendingCount(): number {
    return this.consultService.consultations().filter(r => r.status === 'menunggu_balasan').length;
  }

  repliedCount(): number {
    return this.consultService.consultations().filter(r => r.status === 'dibalas_wa').length;
  }

  analysisCount(): number {
    return this.consultService.consultations().filter(r => r.status === 'dalam_analisis').length;
  }

  filteredRequests(): ConsultationRequest[] {
    const list = this.consultService.consultations();
    const filter = this.selectedFilter();
    if (filter === 'all') return list;
    return list.filter(r => r.status === filter);
  }

  getReplyWaUrl(req: ConsultationRequest): string {
    return this.consultService.getAdminReplyWaLink(req);
  }

  async onReplyClicked(req: ConsultationRequest): Promise<void> {
    if (req.status === 'menunggu_balasan') {
      await this.consultService.updateStatus(req.ticketNumber, 'dibalas_wa');
    }
  }

  async onUpdateStatus(req: ConsultationRequest, newStatus: ConsultationStatus): Promise<void> {
    await this.consultService.updateStatus(req.ticketNumber, newStatus);
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  }

  getStatusLabel(status: ConsultationRequest['status']): string {
    switch (status) {
      case 'menunggu_balasan': return 'Perlu Dibalas WA';
      case 'dibalas_wa': return 'Sudah Dibalas di WA';
      case 'dalam_analisis': return 'Sedang Dianalisis';
      case 'kesepakatan': return 'Kesepakatan & Jadwal';
      case 'selesai': return 'Selesai';
      default: return status;
    }
  }

  getStatusBadge(status: ConsultationRequest['status']): string {
    switch (status) {
      case 'menunggu_balasan': return 'badge-amber';
      case 'dibalas_wa': return 'badge-cyan';
      case 'dalam_analisis': return 'badge-indigo';
      case 'kesepakatan': return 'badge-emerald';
      case 'selesai': return 'badge-emerald';
      default: return 'badge-cyan';
    }
  }

  getUrgencyBadge(urgency: string): string {
    switch (urgency) {
      case 'tinggi': return 'badge-rose';
      case 'jadwal_santai': return 'badge-cyan';
      default: return 'badge-indigo';
    }
  }
}
