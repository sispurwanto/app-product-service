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
