import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-schedule-notice',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="jadwal" class="schedule-section">
      <div class="container">
        <div class="schedule-card glass-panel">
          <div class="schedule-left">
            <div class="schedule-badge">
              <span class="calendar-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </span>
              <span>Komitmen &amp; Ketersediaan Waktu</span>
            </div>

            <h2 class="schedule-title">Layanan Berdasarkan Jadwal</h2>

            <p class="schedule-primary-text">
              Kami melayani konsultasi dan pengerjaan berdasarkan jadwal yang disepakati, 
              <strong>terutama pada akhir pekan (Weekend On-Call &amp; Scheduled Sprints)</strong>.
            </p>

            <p class="schedule-secondary-text">
              Setiap permintaan akan ditinjau terlebih dahulu berdasarkan kebutuhan, tingkat kesulitan, 
              ketersediaan waktu, dan akses teknis. Layanan ini dirancang untuk pengerjaan terencana dan terukur, 
              <strong>bukan merupakan dukungan darurat 24 jam</strong>.
            </p>

            <div class="schedule-perks">
              <div class="perk-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="perk-icon">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Fokus mendalam pada setiap sesi pengerjaan tanpa terburu-buru</span>
              </div>
              <div class="perk-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="perk-icon">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Komunikasi update jelas berkala langsung via WhatsApp</span>
              </div>
              <div class="perk-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="perk-icon">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Pengujian fungsi menyeluruh sebelum proses serah terima</span>
              </div>
            </div>
          </div>

          <div class="schedule-right">
            <div class="schedule-card-mini">
              <span class="mini-tag">Jam Konsultasi &amp; Respon</span>
              <div class="time-block">
                <span class="days">Senin — Jumat</span>
                <span class="hours">Tinjauan Tiket &amp; Respon WA (Malam)</span>
              </div>
              <div class="time-block weekend">
                <span class="days">Sabtu — Minggu</span>
                <span class="hours">Eksekusi Pengerjaan, Testing &amp; Sprint Fitur</span>
              </div>
              <div class="notice-callout">
                <span class="alert-icon">ℹ️</span>
                <span>Jadwal spesifik dapat disesuaikan pada tahap estimasi &amp; kesepakatan awal.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrls: ['./schedule-notice.css']
})
export class ScheduleNoticeComponent {}
