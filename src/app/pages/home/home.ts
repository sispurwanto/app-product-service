import { Component, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar';
import { HeroComponent } from '../../components/hero/hero';
import { ServicesComponent } from '../../components/services/services';
import { TechStackComponent } from '../../components/tech-stack/tech-stack';
import { WorkflowComponent } from '../../components/workflow/workflow';
import { ScheduleNoticeComponent } from '../../components/schedule-notice/schedule-notice';
import { ConsultationFormComponent } from '../../components/consultation-form/consultation-form';
import { FooterComponent } from '../../components/footer/footer';
import { RequestTrackerComponent } from '../../components/request-tracker/request-tracker';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    HeroComponent,
    ServicesComponent,
    TechStackComponent,
    WorkflowComponent,
    ScheduleNoticeComponent,
    ConsultationFormComponent,
    FooterComponent,
    RequestTrackerComponent
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent {
  @ViewChild(ConsultationFormComponent) consultationForm?: ConsultationFormComponent;

  showTrackerModal = signal<boolean>(false);
  selectedCategoryForForm = signal<string>('Website Repair');
  showMobileStickyCta = signal<boolean>(false);

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', () => {
        this.updateStickyCtaVisibility();
      }, { passive: true });
    }
  }

  private updateStickyCtaVisibility(): void {
    if (typeof window === 'undefined') return;
    const scrollY = window.scrollY || window.pageYOffset;
    
    // Check if user is inside or near the consultation form
    const consultSection = document.getElementById('konsultasi');
    let isInsideForm = false;
    if (consultSection) {
      const rect = consultSection.getBoundingClientRect();
      // Hide if the form is taking up the center/main viewport area
      isInsideForm = rect.top <= (window.innerHeight * 0.7) && rect.bottom >= 150;
    }

    // Show after scrolling past hero (~180px) and hide when inside the form
    this.showMobileStickyCta.set(scrollY > 180 && !isInsideForm);
  }

  onServiceSelected(category: string): void {
    this.selectedCategoryForForm.set(category);
    if (this.consultationForm) {
      this.consultationForm.setCategory(category);
    }
  }

  openTracker(): void {
    this.showTrackerModal.set(true);
  }

  closeTracker(): void {
    this.showTrackerModal.set(false);
  }
}
