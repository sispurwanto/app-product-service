import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="footer-section">
      <div class="container">
        <!-- Final Call to Action Box from User Brief -->
        <div class="final-cta-card glass-panel">
          <div class="cta-content">
            <h2 class="cta-title">Mari Diskusikan Kebutuhan Website Anda</h2>
            <p class="cta-desc">
              Apakah Anda membutuhkan perbaikan website, perawatan rutin, atau penambahan fitur pada aplikasi yang sudah berjalan?
              Ceritakan kebutuhan Anda. Kami akan membantu meninjau kemungkinan solusi dan menentukan langkah berikutnya.
            </p>

            <div class="cta-actions">
              <a href="#konsultasi" class="btn btn-primary btn-cta-primary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <span>Konsultasikan Kebutuhan Anda</span>
              </a>
            </div>

            <!-- Mandatory Disclaimer -->
            <p class="cta-disclaimer">
              * Estimasi biaya dan jadwal diberikan setelah kebutuhan serta ruang lingkup pekerjaan dipahami. 
              Biaya domain, hosting, lisensi, dan layanan pihak ketiga dibicarakan secara terpisah apabila diperlukan.
            </p>
          </div>
        </div>

        <!-- Footer Bottom Bar -->
        <div class="footer-bottom">
          <div class="footer-brand-col">
            <div class="footer-brand-row">
              <div class="footer-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="m9 12 2 2 4-4"/>
                </svg>
              </div>
              <strong class="footer-brand-title">WebCare <span class="highlight">&amp; Custom</span></strong>
            </div>
            <p class="footer-brand-desc">Layanan Perbaikan, Perawatan &amp; Pengembangan Website</p>
          </div>

          <div class="footer-info-col">
            <nav class="footer-links">
              <a href="#layanan" class="footer-link">Layanan</a>
              <span class="sep">&bull;</span>
              <a href="#teknologi" class="footer-link">Keahlian</a>
              <span class="sep">&bull;</span>
              <a href="#proses" class="footer-link">Proses Kerja</a>
              <span class="sep">&bull;</span>
              <a href="#jadwal" class="footer-link">Jadwal</a>
              <span class="sep">&bull;</span>
              <a href="#konsultasi" class="footer-link">Konsultasi</a>
            </nav>
            <div class="footer-copy">
              &copy; 2026 WebCare &amp; Custom.
            </div>
          </div>
        </div>
      </div>
    </footer>
  `,
  styleUrls: ['./footer.css']
})
export class FooterComponent { }
