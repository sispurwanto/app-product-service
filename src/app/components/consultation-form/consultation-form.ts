import { Component, inject, signal, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConsultationService } from '../../services/consultation.service';
import { WhatsAppUtil } from '../../utils/whatsapp.util';
import { ConsultationRequest } from '../../models/consultation.model';

@Component({
  selector: 'app-consultation-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section id="konsultasi" class="consult-section">
      <div class="container">
        <!-- Section Header -->
        <div class="section-header">
          <div class="badge badge-rose section-tag">Layanan Konsultasi</div>
          <h2>Ceritakan Keluhan &amp; Kebutuhan Website Anda</h2>
          <p>
            Gunakan nomor WhatsApp aktif sebagai identitas tiket permohonan. 
            Setiap permintaan akan ditinjau dan dibalas langsung melalui WhatsApp.
          </p>
        </div>

        <div class="consult-wrapper">
          <!-- Left: Information & Guidelines -->
          <div class="consult-info-panel glass-panel">
            <h3 class="panel-title">Mengapa Menggunakan WhatsApp?</h3>
            <p class="panel-desc">
              Kami memprioritaskan komunikasi dua arah yang cepat, fleksibel, dan transparan 
              tanpa birokrasi tiket email yang kaku.
            </p>

            <div class="info-steps">
              <div class="info-step-item">
                <div class="step-num-icon">1</div>
                <div>
                  <strong>Input Validasi No. WA</strong>
                  <p>Nomor WhatsApp Anda menjadi kunci unik pelacakan status dan konfirmasi tiket.</p>
                </div>
              </div>

              <div class="info-step-item">
                <div class="step-num-icon">2</div>
                <div>
                  <strong>Tersimpan Aman di Database</strong>
                  <p>Data tersimpan langsung untuk evaluasi teknis tim.</p>
                </div>
              </div>

              <div class="info-step-item">
                <div class="step-num-icon">3</div>
                <div>
                  <strong>Balasan Langsung ke WhatsApp Anda</strong>
                  <p>Tim teknis akan membalas ke nomor WA Anda dengan hasil evaluasi dan estimasi ruang lingkup.</p>
                </div>
              </div>
            </div>

            <!-- Privacy Guarantee Badge -->
            <div class="privacy-note">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <span>Privasi data &amp; akses teknis Anda dijamin aman dan hanya digunakan untuk keperluan analisis proyek.</span>
            </div>
          </div>

          <!-- Right: Submission Form or Success View -->
          <div class="consult-form-panel glass-panel">
            <!-- STATE 1: Success Confirmation View -->
            <div *ngIf="submittedTicket() as ticket" class="success-ticket-box">
              <div class="success-icon-badge">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>

              <h3 class="success-title">Permohonan Konsultasi Berhasil Terkirim!</h3>
              <p class="success-subtitle">
                Data telah tersimpan. Tim kami akan segera meninjau dan membalas ke nomor WhatsApp Anda.
              </p>

              <!-- Ticket Card Details -->
              <div class="ticket-card-receipt">
                <div class="receipt-row">
                  <span class="receipt-label">No. Tiket Pelacakan</span>
                  <div class="receipt-ticket-val">
                    <strong>#{{ ticket.ticketNumber }}</strong>
                    <button (click)="copyTicket(ticket.ticketNumber)" class="btn-copy" title="Salin No Tiket">
                      {{ copySuccess() ? 'Disalin! ✓' : 'Salin' }}
                    </button>
                  </div>
                </div>

                <div class="receipt-row">
                  <span class="receipt-label">Nama Pemohon</span>
                  <span>{{ ticket.clientName }}</span>
                </div>

                <div class="receipt-row">
                  <span class="receipt-label">Nomor WhatsApp Key</span>
                  <span class="receipt-wa">{{ formatDisplayPhone(ticket.whatsappNumber) }}</span>
                </div>

                <div class="receipt-row">
                  <span class="receipt-label">Layanan</span>
                  <span>{{ ticket.serviceCategory }}</span>
                </div>

                <div class="receipt-row">
                  <span class="receipt-label">Status Awal</span>
                  <span class="badge badge-cyan">Menunggu Balasan</span>
                </div>
              </div>

              <!-- Immediate WhatsApp Action -->
              <div class="wa-action-box">
                <p class="wa-box-prompt">
                  Ingin respon lebih cepat? Klik tombol di bawah untuk langsung membuka chat WhatsApp dengan template pesan tiket Anda:
                </p>
                <a [href]="getDirectWaUrl(ticket)" target="_blank" rel="noopener noreferrer" class="btn btn-wa btn-lg-wa">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z"/>
                  </svg>
                  <span>Lanjutkan Chat via WhatsApp Sekarang</span>
                </a>
              </div>

              <div class="success-buttons">
                <button (click)="resetForm()" class="btn btn-outline btn-sm">
                  Kirim Permohonan Lain
                </button>
              </div>
            </div>

            <!-- STATE 2: Form Input View -->
            <form *ngIf="!submittedTicket()" (ngSubmit)="onSubmit()" class="form-container">
              <!-- Validation / Error Notification Alert -->
              <div *ngIf="validationErrors().length > 0" class="alert-error-list">
                <div class="alert-head">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <strong>Periksa kembali data Anda:</strong>
                </div>
                <ul class="error-items">
                  <li *ngFor="let err of validationErrors()">{{ err }}</li>
                </ul>
              </div>

              <div *ngIf="errorMessage()" class="alert-error">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span>{{ errorMessage() }}</span>
              </div>

              <!-- Nama Lengkap / Perusahaan -->
              <div class="form-group">
                <label for="clientName" class="form-label">
                  Nama Lengkap / Perusahaan <span class="required">*</span>
                </label>
                <input 
                  type="text" 
                  id="clientName" 
                  name="clientName" 
                  [(ngModel)]="formData.clientName" 
                  placeholder="Contoh: Budi Santoso / PT Maju Digital"
                  class="form-control"
                  [class.is-invalid]="formData.clientName && !isNameValid()">
                <div class="field-hint-row">
                  <span class="field-rule-hint" [class.hint-ok]="isNameValid()" [class.hint-err]="formData.clientName && !isNameValid()">
                    {{ isNameValid() ? '✓ Minimal 2 karakter terpenuhi' : 'Minimal 2 karakter' }}
                  </span>
                  <span class="char-count" *ngIf="formData.clientName">{{ formData.clientName.trim().length }}/100</span>
                </div>
              </div>

              <!-- Nomor WhatsApp (Primary Key) -->
              <div class="form-group">
                <label for="whatsappNumber" class="form-label">
                  Nomor WhatsApp Aktif <span class="required">*</span>
                  <span class="label-helper">(Kunci utama untuk balasan &amp; pelacakan)</span>
                </label>
                <div class="input-with-icon">
                  <span class="input-addon">🇮🇩 +62</span>
                  <input 
                    type="tel" 
                    id="whatsappNumber" 
                    name="whatsappNumber" 
                    [(ngModel)]="formData.whatsappNumber" 
                    (input)="onPhoneChange()"
                    placeholder="81234567890 atau 081234567890"
                    class="form-control input-padded"
                    [class.is-invalid]="formData.whatsappNumber && !isPhoneValid()">
                </div>
                <div class="field-hint-row">
                  <span class="field-rule-hint" [class.hint-ok]="isPhoneValid()" [class.hint-err]="formData.whatsappNumber && !isPhoneValid()">
                    <span *ngIf="!formData.whatsappNumber">Wajib nomor aktif (10–16 digit)</span>
                    <span *ngIf="formData.whatsappNumber && isPhoneValid()">✓ Nomor valid: <code>+{{ normalizedPhone() }}</code></span>
                    <span *ngIf="formData.whatsappNumber && !isPhoneValid()">✕ Minimal 10 digit angka (baru {{ (normalizedPhone() || '').length }} digit)</span>
                  </span>
                </div>
              </div>

              <!-- Pilihan Layanan -->
              <div class="form-group">
                <label for="serviceCategory" class="form-label">
                  Layanan yang Dibutuhkan <span class="required">*</span>
                </label>
                <select 
                  id="serviceCategory" 
                  name="serviceCategory" 
                  [(ngModel)]="formData.serviceCategory" 
                  class="form-control select-control">
                  <option value="Website Repair">Website Repair — Perbaikan Website (Bug, Error, Tampilan)</option>
                  <option value="Website Care">Website Care — Perawatan Website (Audit Rutin &amp; Pembaruan)</option>
                  <option value="Customize On-Call">Customize On-Call — Pengembangan Fitur Baru / Modul</option>
                  <option value="Lainnya">Lainnya / Konsultasi Arsitektur Web</option>
                </select>
              </div>

              <!-- URL Website -->
              <div class="form-group">
                <label for="websiteUrl" class="form-label">
                  URL / Domain Website Saat Ini <span class="optional">(Opsional)</span>
                </label>
                <input 
                  type="text" 
                  id="websiteUrl" 
                  name="websiteUrl" 
                  [(ngModel)]="formData.websiteUrl" 
                  placeholder="https://website-anda.com (atau tulis '-')"
                  class="form-control">
              </div>

              <!-- Ringkasan Keluhan / Kebutuhan -->
              <div class="form-group">
                <label for="issueSummary" class="form-label">
                  Ringkasan Kebutuhan / Judul Keluhan <span class="required">*</span>
                </label>
                <input 
                  type="text" 
                  id="issueSummary" 
                  name="issueSummary" 
                  [(ngModel)]="formData.issueSummary" 
                  placeholder="Contoh: Error 500 saat checkout / Butuh modul ekspor Excel"
                  class="form-control"
                  [class.is-invalid]="formData.issueSummary && !isSummaryValid()">
                <div class="field-hint-row">
                  <span class="field-rule-hint" [class.hint-ok]="isSummaryValid()" [class.hint-err]="formData.issueSummary && !isSummaryValid()">
                    {{ isSummaryValid() ? '✓ Minimal 5 karakter terpenuhi' : 'Minimal 5 karakter' }}
                  </span>
                  <span class="char-count" *ngIf="formData.issueSummary">{{ formData.issueSummary.trim().length }}/250</span>
                </div>
              </div>

              <!-- Detail Lengkap Keluhan / Ruang Lingkup -->
              <div class="form-group">
                <label for="issueDetail" class="form-label">
                  Penjelasan Detail Masalah atau Fitur <span class="required">*</span>
                </label>
                <textarea 
                  id="issueDetail" 
                  name="issueDetail" 
                  rows="4" 
                  [(ngModel)]="formData.issueDetail" 
                  placeholder="Jelaskan secara rinci kronologi masalah, pesan error yang muncul, atau deskripsi alur fitur baru yang diharapkan..."
                  class="form-control textarea-control"
                  [class.is-invalid]="formData.issueDetail && !isDetailValid()"></textarea>
                <div class="field-hint-row">
                  <span class="field-rule-hint" [class.hint-ok]="isDetailValid()" [class.hint-err]="formData.issueDetail && !isDetailValid()">
                    {{ isDetailValid() ? '✓ Minimal 10 karakter terpenuhi' : 'Minimal 10 karakter' }}
                  </span>
                  <span class="char-count" *ngIf="formData.issueDetail">{{ formData.issueDetail.trim().length }}/3000</span>
                </div>
              </div>

              <!-- Teknologi Website Saat Ini -->
              <div class="form-group">
                <label class="form-label">
                  Teknologi Website Anda <span class="optional">(Pilih atau tulis)</span>
                </label>
                <div class="tech-chip-group">
                  <button 
                    *ngFor="let tech of commonTechs" 
                    type="button" 
                    (click)="toggleTech(tech)"
                    class="tech-chip"
                    [class.selected]="selectedTechs.includes(tech)">
                    {{ tech }}
                  </button>
                </div>
                <input 
                  type="text" 
                  name="techStack" 
                  [(ngModel)]="formData.techStack" 
                  placeholder="Atau tuliskan stack lain (misal: Angular, Node.js, PostgreSQL...)"
                  class="form-control form-control-sm"
                  style="margin-top: 0.5rem;">
              </div>

              <!-- Urgensi -->
              <div class="form-group">
                <label class="form-label">Ekspektasi Jadwal Pengerjaan</label>
                <div class="urgency-selector">
                  <label class="urgency-option" [class.active]="formData.urgency === 'normal'">
                    <input type="radio" name="urgency" value="normal" [(ngModel)]="formData.urgency">
                    <div>
                      <strong>Normal</strong>
                      <span>Sesuai antrean &amp; jadwal akhir pekan</span>
                    </div>
                  </label>
                  <label class="urgency-option" [class.active]="formData.urgency === 'tinggi'">
                    <input type="radio" name="urgency" value="tinggi" [(ngModel)]="formData.urgency">
                    <div>
                      <strong>Penting / Kritis</strong>
                      <span>Fungsi utama website terhenti</span>
                    </div>
                  </label>
                  <label class="urgency-option" [class.active]="formData.urgency === 'jadwal_santai'">
                    <input type="radio" name="urgency" value="jadwal_santai" [(ngModel)]="formData.urgency">
                    <div>
                      <strong>Rencana Masa Depan</strong>
                      <span>Pengembangan bertahap</span>
                    </div>
                  </label>
                </div>
              </div>

              <!-- Submit Button -->
              <div class="form-submit-row">
                <button 
                  type="submit" 
                  class="btn btn-primary btn-submit-full" 
                  [disabled]="isSubmitting()">
                  <svg *ngIf="isSubmitting()" class="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" stroke-width="4" stroke="currentColor" stroke-dasharray="32" stroke-linecap="round"/>
                  </svg>
                  <svg *ngIf="!isSubmitting()" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                  <span>{{ isSubmitting() ? 'Menyimpan ke Cloud Firestore...' : 'Kirim Permohonan Konsultasi' }}</span>
                </button>
              </div>

              <!-- <p class="form-footer-disclaimer">
                * Data Anda akan tersimpan di Cloud Firestore database WebCare &amp; Custom dan tim kami akan menghubungi Anda melalui WhatsApp.
              </p> -->
            </form>
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrls: ['./consultation-form.css']
})
export class ConsultationFormComponent {
  private consultService = inject(ConsultationService);

  preselectedCategory = input<string>('');

  formData = {
    clientName: '',
    whatsappNumber: '',
    websiteUrl: '',
    serviceCategory: 'Website Repair',
    urgency: 'normal' as 'normal' | 'tinggi' | 'jadwal_santai',
    issueSummary: '',
    issueDetail: '',
    techStack: ''
  };

  selectedTechs: string[] = [];
  commonTechs = ['Angular', 'Node.js', 'PostgreSQL', 'MySQL', 'Firebase', 'PHP'];

  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string>('');
  validationErrors = signal<string[]>([]);
  submittedTicket = signal<ConsultationRequest | null>(null);
  copySuccess = signal<boolean>(false);

  normalizedPhone = signal<string>('');

  // Live validation methods matching Firestore rules
  isNameValid(): boolean {
    const val = (this.formData.clientName || '').trim();
    return val.length >= 2 && val.length <= 100;
  }

  isPhoneValid(): boolean {
    const norm = WhatsAppUtil.normalizePhoneNumber(this.formData.whatsappNumber);
    return norm.length >= 10 && norm.length <= 16;
  }

  isSummaryValid(): boolean {
    const val = (this.formData.issueSummary || '').trim();
    return val.length >= 5 && val.length <= 250;
  }

  isDetailValid(): boolean {
    const val = (this.formData.issueDetail || '').trim();
    return val.length >= 10 && val.length <= 3000;
  }

  constructor() {
    if (this.preselectedCategory()) {
      this.formData.serviceCategory = this.preselectedCategory();
    }
  }

  setCategory(categoryName: string): void {
    this.formData.serviceCategory = categoryName;
  }

  onPhoneChange(): void {
    const norm = WhatsAppUtil.normalizePhoneNumber(this.formData.whatsappNumber);
    this.normalizedPhone.set(norm);
  }

  toggleTech(tech: string): void {
    const idx = this.selectedTechs.indexOf(tech);
    if (idx >= 0) {
      this.selectedTechs.splice(idx, 1);
    } else {
      this.selectedTechs.push(tech);
    }
    this.formData.techStack = this.selectedTechs.join(', ');
  }

  async onSubmit(): Promise<void> {
    this.errorMessage.set('');
    this.validationErrors.set([]);

    // Check frontend validation matching Firestore rules
    const errors: string[] = [];
    if (!this.isNameValid()) {
      const len = (this.formData.clientName || '').trim().length;
      errors.push(`Nama Pemohon minimal 2 karakter (saat ini ${len} karakter).`);
    }
    if (!this.isPhoneValid()) {
      const len = WhatsAppUtil.normalizePhoneNumber(this.formData.whatsappNumber).length;
      errors.push(`Nomor WhatsApp aktif minimal 10 digit angka (saat ini ${len} digit).`);
    }
    if (!this.isSummaryValid()) {
      const len = (this.formData.issueSummary || '').trim().length;
      errors.push(`Ringkasan Kebutuhan minimal 5 karakter (saat ini ${len} karakter).`);
    }
    if (!this.isDetailValid()) {
      const len = (this.formData.issueDetail || '').trim().length;
      errors.push(`Penjelasan Detail Keluhan minimal 10 karakter (saat ini ${len} karakter).`);
    }

    if (errors.length > 0) {
      this.validationErrors.set(errors);
      return;
    }

    this.isSubmitting.set(true);

    try {
      const res = await this.consultService.submitRequest(this.formData);
      if (res.success && res.data) {
        this.submittedTicket.set(res.data);
      } else {
        this.errorMessage.set(res.error || 'Terjadi kesalahan saat menyimpan formulir.');
      }
    } catch (err: any) {
      if (err.message && err.message.includes('permission-denied')) {
        this.errorMessage.set('Ditolak oleh aturan database (Permission Denied). Pastikan Nama minimal 2 karakter, Nomor WA minimal 10 digit, Ringkasan minimal 5 karakter, dan Detail minimal 10 karakter.');
      } else {
        this.errorMessage.set(err.message || 'Gagal menyimpan ke database.');
      }
    } finally {
      this.isSubmitting.set(false);
    }
  }

  getDirectWaUrl(ticket: ConsultationRequest): string {
    return this.consultService.getUserDirectWaLink(ticket);
  }

  formatDisplayPhone(phone: string): string {
    if (!phone) return '';
    return `+${phone.slice(0, 2)} ${phone.slice(2, 5)}-${phone.slice(5, 9)}-${phone.slice(9)}`;
  }

  copyTicket(ticketNumber: string): void {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(ticketNumber);
      this.copySuccess.set(true);
      setTimeout(() => this.copySuccess.set(false), 2500);
    }
  }

  resetForm(): void {
    this.submittedTicket.set(null);
    this.formData = {
      clientName: '',
      whatsappNumber: '',
      websiteUrl: '',
      serviceCategory: 'Website Repair',
      urgency: 'normal',
      issueSummary: '',
      issueDetail: '',
      techStack: ''
    };
    this.selectedTechs = [];
    this.normalizedPhone.set('');
    this.validationErrors.set([]);
    this.errorMessage.set('');
  }
}
