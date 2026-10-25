import { Component, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirebaseService, FirebaseConfig } from '../../services/firebase.service';
import { DEFAULT_SERVICES } from '../../data/default-services.data';

@Component({
  selector: 'app-firebase-config-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-backdrop" (click)="close.emit()">
      <div class="config-modal glass-panel" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="modal-header">
          <div class="header-left">
            <span class="fb-fire-icon">🔥</span>
            <div>
              <h3 class="modal-title">Konfigurasi Database Firebase</h3>
              <p class="modal-sub">Hubungkan project ke Cloud Firestore Firebase untuk sinkronisasi database online</p>
            </div>
          </div>
          <button (click)="close.emit()" class="btn-close">&times;</button>
        </div>

        <!-- Connection Status Pill -->
        <div class="status-banner" [class.connected]="firebaseService.isConnected()">
          <div class="status-indicator-dot"></div>
          <div class="status-details">
            <strong>Status: {{ firebaseService.isConnected() ? 'Terhubung ke Cloud Firestore' : 'Mode Demo / Offline Cache' }}</strong>
            <p>{{ firebaseService.statusMessage() }}</p>
          </div>
        </div>

        <!-- Firebase Config Form -->
        <div class="config-body">
          <p class="form-instruction">
            Anda dapat memasukkan kredensial Firebase Console Anda di bawah ini, atau mengisinya langsung pada file 
            <code>src/environments/environment.ts</code>.
          </p>

          <div class="config-grid">
            <div class="config-field">
              <label>API Key <span class="required">*</span></label>
              <input type="text" [(ngModel)]="config.apiKey" placeholder="AIzaSy..." class="form-control form-control-sm">
            </div>

            <div class="config-field">
              <label>Project ID <span class="required">*</span></label>
              <input type="text" [(ngModel)]="config.projectId" placeholder="webcare-service-12345" class="form-control form-control-sm">
            </div>

            <div class="config-field">
              <label>Auth Domain</label>
              <input type="text" [(ngModel)]="config.authDomain" placeholder="webcare-service-12345.firebaseapp.com" class="form-control form-control-sm">
            </div>

            <div class="config-field">
              <label>Storage Bucket</label>
              <input type="text" [(ngModel)]="config.storageBucket" placeholder="webcare-service-12345.appspot.com" class="form-control form-control-sm">
            </div>

            <div class="config-field">
              <label>Messaging Sender ID</label>
              <input type="text" [(ngModel)]="config.messagingSenderId" placeholder="1029384756..." class="form-control form-control-sm">
            </div>

            <div class="config-field">
              <label>App ID</label>
              <input type="text" [(ngModel)]="config.appId" placeholder="1:1029384756:web:abcd1234..." class="form-control form-control-sm">
            </div>
          </div>

          <!-- Notification Feedback -->
          <div *ngIf="actionMessage()" class="action-feedback" [class.success]="isActionSuccess()">
            {{ actionMessage() }}
          </div>

          <!-- Modal Actions -->
          <div class="config-actions">
            <button (click)="onSaveConfig()" class="btn btn-primary btn-sm">
              <span>Simpan &amp; Hubungkan Firebase</span>
            </button>

            <button 
              *ngIf="firebaseService.isConnected()" 
              (click)="onSeedDefaultServices()" 
              class="btn btn-outline btn-sm" 
              [disabled]="isSeeding()"
              title="Upload data produk layanan WebCare ke koleksi 'services' di Firestore">
              <span>{{ isSeeding() ? 'Mengunggah...' : 'Upload Data Layanan ke Firestore' }}</span>
            </button>

            <button (click)="onResetDemo()" class="btn btn-outline btn-sm">
              <span>Reset ke Mode Demo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./firebase-config-modal.css']
})
export class FirebaseConfigModalComponent {
  public firebaseService = inject(FirebaseService);

  close = output<void>();

  config: FirebaseConfig = { ...this.firebaseService.currentConfig() };

  actionMessage = signal<string>('');
  isActionSuccess = signal<boolean>(false);
  isSeeding = signal<boolean>(false);

  onSaveConfig(): void {
    const success = this.firebaseService.saveConfig(this.config);
    this.isActionSuccess.set(success);
    if (success) {
      this.actionMessage.set('✓ Berhasil terhubung ke Firebase Firestore!');
    } else {
      this.actionMessage.set('✕ Konfigurasi belum lengkap atau gagal terhubung.');
    }
  }

  async onSeedDefaultServices(): Promise<void> {
    this.isSeeding.set(true);
    try {
      await this.firebaseService.seedServicesToFirestore(DEFAULT_SERVICES);
      this.isActionSuccess.set(true);
      this.actionMessage.set('✓ Berhasil mengunggah 3 produk jasa ke Cloud Firestore collection "services"!');
    } catch (err: any) {
      this.isActionSuccess.set(false);
      this.actionMessage.set('✕ Gagal upload data: ' + err.message);
    } finally {
      this.isSeeding.set(false);
    }
  }

  onResetDemo(): void {
    this.config = {
      apiKey: '',
      authDomain: '',
      projectId: '',
      storageBucket: '',
      messagingSenderId: '',
      appId: ''
    };
    this.firebaseService.saveConfig(this.config);
    this.isActionSuccess.set(true);
    this.actionMessage.set('Mode demo / local storage aktif kembali.');
  }
}
