export type ConsultationStatus = 
  | 'menunggu_balasan'
  | 'dibalas_wa'
  | 'dalam_analisis'
  | 'kesepakatan'
  | 'selesai';

export interface ConsultationRequest {
  id?: string;
  ticketNumber: string;
  clientName: string;
  whatsappNumber: string; // Key utama (format normalized: 628xxxxxxxx)
  websiteUrl?: string;
  serviceCategory: string; // 'Website Repair' | 'Website Care' | 'Customize On-Call' | 'Lainnya'
  urgency: 'normal' | 'tinggi' | 'jadwal_santai';
  issueSummary: string;
  issueDetail: string;
  techStack?: string;
  status: ConsultationStatus;
  adminNotes?: string;
  createdAt: string;
  updatedAt?: string;
  source?: 'web_form' | 'admin_manual';
}

export interface ConsultationFilter {
  searchQuery?: string;
  status?: ConsultationStatus | 'all';
  serviceCategory?: string;
}
