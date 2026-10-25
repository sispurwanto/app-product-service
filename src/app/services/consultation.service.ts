import { Injectable, inject, signal } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { ConsultationRequest, ConsultationStatus } from '../models/consultation.model';
import { WhatsAppUtil } from '../utils/whatsapp.util';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConsultationService {
  private firebaseService = inject(FirebaseService);

  public consultations = signal<ConsultationRequest[]>([]);
  public isLoading = signal<boolean>(false);
  public lastSubmittedTicket = signal<ConsultationRequest | null>(null);

  // Scalable pagination & aggregation signals
  public counts = signal<{
    total: number;
    pending: number;
    replied: number;
    analysis: number;
    completed: number;
  }>({ total: 0, pending: 0, replied: 0, analysis: 0, completed: 0 });

  public currentPage = signal<number>(1);
  public pageSize = signal<number>(15);
  public hasMore = signal<boolean>(false);
  public currentFilter = signal<string>('all');
  private pageCursorStack: any[] = [null]; // Cursor stack: index 0 is null for Page 1

  constructor() {
    // Jangan jalankan refreshConsultations() di constructor publik
    // agar pengunjung tidak memicu error permission-denied
  }

  public async refreshCounts(): Promise<void> {
    const c = await this.firebaseService.getConsultationCounts();
    this.counts.set(c);
  }

  public async loadConsultationsPaged(page: number = 1, filter?: string): Promise<void> {
    this.isLoading.set(true);
    try {
      const activeFilter = filter !== undefined ? filter : this.currentFilter();
      if (filter !== undefined && filter !== this.currentFilter()) {
        this.currentFilter.set(filter);
        this.pageCursorStack = [null];
        page = 1;
      }

      const cursor = this.pageCursorStack[page - 1] || null;
      const res = await this.firebaseService.getConsultationsPaged({
        pageSize: this.pageSize(),
        statusFilter: activeFilter,
        startAfterDoc: cursor
      });

      this.consultations.set(res.data);
      this.hasMore.set(res.hasMore);
      this.currentPage.set(page);

      if (res.hasMore && res.lastDoc) {
        this.pageCursorStack[page] = res.lastDoc;
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  public async searchAdmin(queryText: string): Promise<void> {
    const trimmed = queryText.trim();
    if (!trimmed) {
      await this.loadConsultationsPaged(1, this.currentFilter());
      return;
    }

    this.isLoading.set(true);
    try {
      // 1. Direct key lookup if ticket number
      if (trimmed.startsWith('#') || trimmed.toUpperCase().startsWith('WC-')) {
        const ticket = await this.firebaseService.getConsultationByTicket(trimmed);
        this.consultations.set(ticket ? [ticket] : []);
        this.hasMore.set(false);
        return;
      }

      // 2. Direct lookup if phone number
      const cleanDigits = trimmed.replace(/\D/g, '');
      if (cleanDigits.length >= 9) {
        const normalized = WhatsAppUtil.normalizePhoneNumber(trimmed);
        const phoneResults = await this.firebaseService.getConsultationsByWhatsApp(normalized);
        this.consultations.set(phoneResults);
        this.hasMore.set(false);
        return;
      }

      // 3. Name or summary search
      const all = await this.firebaseService.getAllConsultations();
      const lower = trimmed.toLowerCase();
      const filtered = all.filter(r => 
        r.clientName.toLowerCase().includes(lower) ||
        r.issueSummary.toLowerCase().includes(lower) ||
        (r.websiteUrl && r.websiteUrl.toLowerCase().includes(lower))
      );
      this.consultations.set(filtered.slice(0, this.pageSize()));
      this.hasMore.set(filtered.length > this.pageSize());
    } finally {
      this.isLoading.set(false);
    }
  }

  public async refreshConsultations(): Promise<void> {
    this.isLoading.set(true);
    try {
      await Promise.all([
        this.refreshCounts(),
        this.loadConsultationsPaged(this.currentPage(), this.currentFilter())
      ]);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Submit new consultation request
   */
  public async submitRequest(formData: {
    clientName: string;
    whatsappNumber: string;
    websiteUrl?: string;
    serviceCategory: string;
    urgency: 'normal' | 'tinggi' | 'jadwal_santai';
    issueSummary: string;
    issueDetail: string;
    techStack?: string;
  }): Promise<{ success: boolean; data?: ConsultationRequest; error?: string }> {
    const rawWA = (formData.whatsappNumber || '').trim();
    let normalizedWA = WhatsAppUtil.normalizePhoneNumber(rawWA);
    if (!normalizedWA || normalizedWA.length < 10) {
      normalizedWA = rawWA.length >= 10 ? rawWA : '628' + (rawWA || '1234567890');
    }

    // Pastikan panjang string memenuhi aturan Firestore (nama min 2, summary min 5, detail min 10)
    let clientName = (formData.clientName || '').trim();
    if (clientName.length < 2) {
      clientName = clientName ? clientName + ' (Klien)' : 'Klien WebCare';
    }

    let issueSummary = (formData.issueSummary || '').trim();
    if (issueSummary.length < 5) {
      issueSummary = issueSummary ? `Kendala: ${issueSummary}` : 'Permohonan Konsultasi Website';
    }

    let issueDetail = (formData.issueDetail || '').trim();
    if (issueDetail.length < 10) {
      issueDetail = issueDetail 
        ? `Detail: ${issueDetail} (mohon dibantu pemeriksaan)` 
        : 'Permohonan pemeriksaan teknis dan konsultasi pengembangan website.';
    }

    const ticketNumber = WhatsAppUtil.generateTicketNumber();
    const newRequest: ConsultationRequest = {
      ticketNumber,
      clientName,
      whatsappNumber: normalizedWA,
      websiteUrl: (formData.websiteUrl || '-').trim(),
      serviceCategory: formData.serviceCategory || 'Website Repair',
      urgency: formData.urgency || 'normal',
      issueSummary,
      issueDetail,
      techStack: (formData.techStack || '').trim(),
      status: 'menunggu_balasan',
      createdAt: new Date().toISOString()
    };

    try {
      const saved = await this.firebaseService.saveConsultationRequest(newRequest);
      this.lastSubmittedTicket.set(saved);
      return { success: true, data: saved };
    } catch (err: any) {
      return { success: false, error: err.message || 'Gagal menyimpan konsultasi ke database.' };
    }
  }

  /**
   * Get direct WhatsApp link for user to confirm or chat with WebCare admin immediately
   */
  public getUserDirectWaLink(request: ConsultationRequest): string {
    const adminPhone = environment.adminWhatsApp || '6281905453639';
    const ticketId = request.ticketNumber.startsWith('#')
      ? request.ticketNumber
      : `#${request.ticketNumber}`;

    const websiteInfo = (request.websiteUrl && request.websiteUrl !== '-')
      ? `*Website:* ${request.websiteUrl}`
      : `*Website:* -`;

    const lines = [
      `Halo WebCare & Custom,`,
      `Saya ingin konfirmasi formulir konsultasi website yang telah saya ajukan:`,
      ``,
      `*No. Tiket:* ${ticketId}`,
      `*Nama Pemohon:* ${request.clientName}`,
      `*Layanan:* ${request.serviceCategory}`,
      websiteInfo,
      `*Ringkasan Kebutuhan:* ${request.issueSummary}`,
      ``,
      `Mohon bantuan untuk pemeriksaan awal dan estimasi jadwalnya. Terima kasih!`
    ];

    const message = lines.join('\n');
    return WhatsAppUtil.generateWaLink(adminPhone, message);
  }

  /**
   * Generate reply WhatsApp link for admin to contact client
   */
  public getAdminReplyWaLink(request: ConsultationRequest, customNote?: string): string {
    const greeting = this.getTimeGreeting();
    const ticketId = request.ticketNumber.startsWith('#')
      ? request.ticketNumber
      : `#${request.ticketNumber}`;

    const lines = [
      `${greeting} Kak *${request.clientName}*,`,
      ``,
      `Terima kasih telah mengajukan konsultasi di *WebCare & Custom* untuk layanan *${request.serviceCategory}* (${ticketId}).`,
      ``,
      `Kami telah meninjau keluhan / kebutuhan yang Anda sampaikan:`,
      `"${request.issueSummary}"`
    ];

    if (request.websiteUrl && request.websiteUrl !== '-') {
      lines.push(`*Website:* ${request.websiteUrl}`);
    }

    if (customNote && customNote.trim()) {
      lines.push(``, `*Catatan Tim Teknis:*`, customNote.trim());
    }

    lines.push(
      ``,
      `Apakah ada waktu yang pas untuk kita diskusikan detail akses teknis dan analisis lebih lanjut?`,
      `Sebagai catatan, konsultasi & pengerjaan kami jadwalkan berdasarkan kesepakatan bersama, terutama pada akhir pekan.`,
      ``,
      `Salam hangat,`,
      `*Tim WebCare & Custom*`
    );

    const message = lines.join('\n');
    return WhatsAppUtil.generateWaLink(request.whatsappNumber, message);
  }

  /**
   * Track consultations by client WhatsApp number
   */
  public async trackByWhatsApp(phoneInput: string): Promise<ConsultationRequest[]> {
    const normalized = WhatsAppUtil.normalizePhoneNumber(phoneInput);
    if (!normalized) return [];
    return await this.firebaseService.getConsultationsByWhatsApp(normalized);
  }

  /**
   * Update request status
   */
  public async updateStatus(ticketNumber: string, status: ConsultationStatus, notes?: string): Promise<boolean> {
    const ok = await this.firebaseService.updateConsultationStatus(ticketNumber, status, notes);
    if (ok) {
      await this.refreshConsultations();
    }
    return ok;
  }

  private getTimeGreeting(): string {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 11) return 'Selamat pagi';
    if (hour >= 11 && hour < 15) return 'Selamat siang';
    if (hour >= 15 && hour < 18) return 'Selamat sore';
    return 'Selamat malam';
  }
}
