import { Component, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConsultationService } from '../../services/consultation.service';
import { ConsultationRequest } from '../../models/consultation.model';
import { WhatsAppUtil } from '../../utils/whatsapp.util';

@Component({
  selector: 'app-request-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-backdrop" (click)="close.emit()">
      <div class="modal-container glass-panel" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="modal-header">
          <div class="modal-title-wrap">
            <div class="modal-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <div>
              <h3 class="modal-title">Cek Status Tiket Konsultasi</h3>
              <p class="modal-sub">Masukkan nomor WhatsApp yang Anda gunakan saat mengajukan permohonan</p>
            </div>
          </div>
          <button (click)="close.emit()" class="btn-close">&times;</button>
        </div>

        <!-- Search Input -->
        <div class="search-box">
          <div class="input-with-icon">
            <span class="input-addon">🇮🇩 +62</span>
            <input 
              type="tel" 
              [(ngModel)]="searchPhone" 
              (keyup.enter)="onSearch()"
              placeholder="Contoh: 81234567890 atau 081234567890" 
              class="form-control input-padded">
          </div>
          <button (click)="onSearch()" class="btn btn-primary btn-search" [disabled]="isSearching()">
            <svg *ngIf="!isSearching()" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <svg *ngIf="isSearching()" class="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" stroke-width="4" stroke="currentColor" stroke-dasharray="32" stroke-linecap="round"/>
            </svg>
            <span>{{ isSearching() ? 'Mencari...' : 'Lacak Tiket' }}</span>
          </button>
        </div>

        <!-- Results List -->
        <div class="results-container">
          <div *ngIf="hasSearched() && results().length === 0" class="empty-state">
            <p>Tidak ditemukan permohonan konsultasi dengan nomor WhatsApp <strong>{{ normalizedSearchPhone() }}</strong>.</p>
            <span class="empty-hint">Pastikan nomor sesuai dengan yang Anda daftarkan di form konsultasi.</span>
          </div>

          <div *ngIf="results().length > 0" class="tickets-list">
            <div *ngFor="let ticket of results()" class="ticket-card">
              <div class="ticket-top">
                <div class="ticket-meta">
                  <span class="ticket-badge-num">#{{ ticket.ticketNumber }}</span>
                  <span class="ticket-date">{{ formatDate(ticket.createdAt) }}</span>
                </div>
                <span class="badge" [ngClass]="getStatusBadgeClass(ticket.status)">
                  {{ getStatusLabel(ticket.status) }}
                </span>
              </div>

              <h4 class="ticket-service">{{ ticket.serviceCategory }}</h4>
              <p class="ticket-summary">"{{ ticket.issueSummary }}"</p>
              
              <div *ngIf="ticket.websiteUrl" class="ticket-url">
                <span>🌐 Website:</span>
                <code>{{ ticket.websiteUrl }}</code>
              </div>

              <div *ngIf="ticket.adminNotes" class="admin-reply-box">
                <strong>Catatan Tim Teknis:</strong>
                <p>{{ ticket.adminNotes }}</p>
              </div>

              <!-- Action button: Open WA to continue discussion -->
              <div class="ticket-actions">
                <a [href]="getWaLink(ticket)" target="_blank" rel="noopener noreferrer" class="btn btn-wa btn-sm">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z"/>
                  </svg>
                  <span>Lanjutkan Chat di WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./request-tracker.css']
})
export class RequestTrackerComponent {
  private consultService = inject(ConsultationService);

  close = output<void>();

  searchPhone = '';
  isSearching = signal<boolean>(false);
  hasSearched = signal<boolean>(false);
  normalizedSearchPhone = signal<string>('');
  results = signal<ConsultationRequest[]>([]);

  async onSearch(): Promise<void> {
    if (!this.searchPhone.trim()) return;

    this.isSearching.set(true);
    this.hasSearched.set(true);
    const norm = WhatsAppUtil.normalizePhoneNumber(this.searchPhone);
    this.normalizedSearchPhone.set(norm);

    try {
      const items = await this.consultService.trackByWhatsApp(norm);
      this.results.set(items);
    } finally {
      this.isSearching.set(false);
    }
  }

  getWaLink(ticket: ConsultationRequest): string {
    return this.consultService.getUserDirectWaLink(ticket);
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
      case 'menunggu_balasan': return 'Menunggu Balasan WA';
      case 'dibalas_wa': return 'Sudah Dibalas di WA';
      case 'dalam_analisis': return 'Sedang Dianalisis Teknis';
      case 'kesepakatan': return 'Tahap Kesepakatan & Jadwal';
      case 'selesai': return 'Selesai';
      default: return status;
    }
  }

  getStatusBadgeClass(status: ConsultationRequest['status']): string {
    switch (status) {
      case 'menunggu_balasan': return 'badge-amber';
      case 'dibalas_wa': return 'badge-cyan';
      case 'dalam_analisis': return 'badge-indigo';
      case 'kesepakatan': return 'badge-emerald';
      case 'selesai': return 'badge-emerald';
      default: return 'badge-cyan';
    }
  }
}
