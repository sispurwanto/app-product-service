import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PROCESS_STEPS } from '../../data/default-services.data';

@Component({
  selector: 'app-workflow',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="proses" class="workflow-section">
      <div class="container">
        <!-- Section Header -->
        <div class="section-header">
          <div class="badge badge-emerald section-tag">Alur Kerja</div>
          <h2>Bagaimana Prosesnya?</h2>
          <p>
            Setiap pengerjaan berjalan dalam alur yang transparan dan terstruktur agar Anda mengetahui 
            progres secara pasti tanpa kekhawatiran.
          </p>
        </div>

        <!-- Workflow Steps Timeline Grid -->
        <div class="steps-grid">
          <div *ngFor="let item of steps; let idx = index" class="step-card glass-panel">
            <div class="step-top">
              <span class="step-badge">{{ item.badge }}</span>
              <span class="step-idx">#0{{ item.step }}</span>
            </div>

            <div class="step-indicator-line">
              <div class="step-dot"></div>
            </div>

            <h3 class="step-title">{{ item.title }}</h3>
            <p class="step-desc">{{ item.desc }}</p>
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrls: ['./workflow.css']
})
export class WorkflowComponent {
  steps = PROCESS_STEPS;
}
