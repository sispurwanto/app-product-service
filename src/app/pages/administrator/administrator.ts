import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ConsultationService } from '../../services/consultation.service';
import { FirebaseService } from '../../services/firebase.service';
import { AuthService } from '../../services/auth.service';
import { ConsultationRequest, ConsultationStatus } from '../../models/consultation.model';

import { ThemeService, AppTheme } from '../../services/theme.service';

@Component({
  selector: 'app-administrator',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './administrator.html',
  styleUrl: './administrator.css'
})
export class AdministratorComponent implements OnInit {
  public consultService = inject(ConsultationService);
  public firebaseService = inject(FirebaseService);
  public authService = inject(AuthService);
  public themeService = inject(ThemeService);

  loginEmail = '';
  loginPassword = '';
  searchQuery = signal<string>('');
  selectedFilter = signal<string>('all');
  themeMenuOpen = false;

  toggleThemeMenu(): void {
    this.themeMenuOpen = !this.themeMenuOpen;
  }

  selectTheme(theme: AppTheme): void {
    this.themeService.setTheme(theme);
    this.themeMenuOpen = false;
  }

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

  private searchTimeout: any;

  async refresh(): Promise<void> {
    await this.consultService.refreshConsultations();
  }

  async setFilter(filter: string): Promise<void> {
    this.selectedFilter.set(filter);
    this.searchQuery.set('');
    await this.consultService.loadConsultationsPaged(1, filter);
  }

  onSearchChange(val: string): void {
    this.searchQuery.set(val);
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(async () => {
      await this.consultService.searchAdmin(val);
    }, 350);
  }

  async clearSearch(): Promise<void> {
    this.searchQuery.set('');
    await this.consultService.loadConsultationsPaged(1, this.selectedFilter());
  }

  async goToPrevPage(): Promise<void> {
    const cur = this.consultService.currentPage();
    if (cur > 1 && !this.consultService.isLoading()) {
      await this.consultService.loadConsultationsPaged(cur - 1);
    }
  }

  async goToNextPage(): Promise<void> {
    const cur = this.consultService.currentPage();
    if (this.consultService.hasMore() && !this.consultService.isLoading()) {
      await this.consultService.loadConsultationsPaged(cur + 1);
    }
  }

  totalCount(): number {
    return this.consultService.counts().total;
  }

  pendingCount(): number {
    return this.consultService.counts().pending;
  }

  repliedCount(): number {
    return this.consultService.counts().replied;
  }

  analysisCount(): number {
    return this.consultService.counts().analysis;
  }

  completedCount(): number {
    return this.consultService.counts().completed;
  }

  currentFilterTotal(): number {
    switch (this.selectedFilter()) {
      case 'menunggu_balasan': return this.pendingCount();
      case 'dibalas_wa': return this.repliedCount();
      case 'dalam_analisis': return this.analysisCount();
      case 'selesai': return this.completedCount();
      default: return this.totalCount();
    }
  }

  filteredRequests(): ConsultationRequest[] {
    return this.consultService.consultations();
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
