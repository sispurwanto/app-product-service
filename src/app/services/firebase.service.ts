import { Injectable, signal } from '@angular/core';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  Firestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  orderBy, 
  where,
  limit,
  startAfter,
  getCountFromServer,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { environment } from '../../environments/environment';
import { ServiceItem } from '../models/service.model';
import { ConsultationRequest } from '../models/consultation.model';
import { DEFAULT_SERVICES } from '../data/default-services.data';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private app: FirebaseApp | null = null;
  private db: Firestore | null = null;

  // Signals for reactive UI state
  public isConnected = signal<boolean>(false);
  public isUsingLocalFallback = signal<boolean>(true);
  public currentConfig = signal<FirebaseConfig>(this.loadStoredConfig());
  public statusMessage = signal<string>('Memeriksa konfigurasi Firebase...');

  public getApp(): FirebaseApp | null {
    return this.app;
  }

  private readonly STORAGE_KEY_SERVICES = 'webcare_services_store';
  private readonly STORAGE_KEY_REQUESTS = 'webcare_consultations_store';
  private readonly STORAGE_KEY_CONFIG = 'webcare_firebase_config';

  constructor() {
    this.initFirebase();
  }

  private loadStoredConfig(): FirebaseConfig {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem(this.STORAGE_KEY_CONFIG);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.apiKey && parsed.apiKey.trim() !== '' && parsed.projectId === environment.firebase.projectId) {
            return parsed;
          }
        } catch (e) {
          console.warn('Failed parsing stored Firebase config:', e);
        }
      }
    }
    return { ...environment.firebase };
  }

  public initFirebase(customConfig?: FirebaseConfig): boolean {
    const config = customConfig || this.currentConfig();
    this.currentConfig.set(config);

    // Check if configuration has required keys
    const isValid = Boolean(
      config && 
      config.apiKey && 
      config.apiKey.trim() !== '' && 
      config.projectId && 
      config.projectId.trim() !== ''
    );

    if (!isValid) {
      this.isConnected.set(false);
      this.isUsingLocalFallback.set(true);
      this.statusMessage.set('Mode Lokal / Demo Aktif (Belum terhubung ke Firebase)');
      return false;
    }

    try {
      if (getApps().length > 0) {
        // reuse or recreate app
        this.app = getApps()[0];
      } else {
        this.app = initializeApp(config);
      }
      this.db = getFirestore(this.app);
      this.isConnected.set(true);
      this.isUsingLocalFallback.set(false);
      this.statusMessage.set(`Terhubung ke Firebase Firestore (${config.projectId})`);

      // Save valid config to localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(this.STORAGE_KEY_CONFIG, JSON.stringify(config));
      }
      return true;
    } catch (err: any) {
      console.error('Firebase initialization error:', err);
      this.isConnected.set(false);
      this.isUsingLocalFallback.set(true);
      this.statusMessage.set(`Gagal konek Firebase: ${err.message || 'Error koneksi'}`);
      return false;
    }
  }

  public saveConfig(config: FirebaseConfig): boolean {
    const success = this.initFirebase(config);
    return success;
  }

  // ==========================================
  // SERVICES DATABASE (Produk Jasa di Firebase)
  // ==========================================

  public async getServices(): Promise<ServiceItem[]> {
    if (this.isConnected() && this.db) {
      try {
        const servicesCol = collection(this.db, 'services');
        const q = query(servicesCol, orderBy('order', 'asc'));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const items: ServiceItem[] = [];
          snapshot.forEach((docSnap) => {
            items.push({ id: docSnap.id, ...(docSnap.data() as any) });
          });
          // Cache to local for speed/offline
          this.saveServicesToLocal(items);
          return items;
        } else {
          // If Firestore collection is empty, use default services without write
          return this.getServicesFromLocal();
        }
      } catch (err) {
        console.warn('Firestore fetch failed, falling back to local data:', err);
      }
    }

    // Fallback: LocalStorage or Default Seed
    return this.getServicesFromLocal();
  }

  public async seedServicesToFirestore(services: ServiceItem[]): Promise<void> {
    if (!this.isConnected() || !this.db) {
      throw new Error('Firebase belum terhubung. Konfigurasikan Firebase terlebih dahulu.');
    }

    for (const srv of services) {
      const docRef = doc(this.db, 'services', srv.id);
      await setDoc(docRef, {
        ...srv,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }
  }

  public async updateService(service: ServiceItem): Promise<void> {
    if (this.isConnected() && this.db) {
      try {
        const docRef = doc(this.db, 'services', service.id);
        await setDoc(docRef, { ...service, updatedAt: new Date().toISOString() }, { merge: true });
      } catch (e) {
        console.error('Failed updating service in Firestore:', e);
      }
    }
    // Also update local cache
    const current = this.getServicesFromLocal();
    const idx = current.findIndex(s => s.id === service.id);
    if (idx >= 0) {
      current[idx] = service;
    } else {
      current.push(service);
    }
    this.saveServicesToLocal(current);
  }

  private getServicesFromLocal(): ServiceItem[] {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem(this.STORAGE_KEY_SERVICES);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {}
      }
    }
    this.saveServicesToLocal(DEFAULT_SERVICES);
    return DEFAULT_SERVICES;
  }

  private saveServicesToLocal(items: ServiceItem[]): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.STORAGE_KEY_SERVICES, JSON.stringify(items));
    }
  }

  // ==========================================
  // CONSULTATION REQUESTS (Database Permintaan Konsultasi)
  // ==========================================

  public async saveConsultationRequest(request: ConsultationRequest): Promise<ConsultationRequest> {
    const finalRequest: ConsultationRequest = {
      ...request,
      createdAt: request.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Sanitize data: remove any undefined values so Firestore does not reject it
    const sanitizedData: Record<string, any> = {};
    for (const key of Object.keys(finalRequest)) {
      const val = (finalRequest as any)[key];
      if (val !== undefined) {
        sanitizedData[key] = val;
      }
    }

    if (this.isConnected() && this.db) {
      try {
        console.log('⏳ Menyimpan ke Cloud Firestore...', sanitizedData);
        const reqDoc = doc(this.db, 'consultation_requests', finalRequest.ticketNumber);
        await setDoc(reqDoc, sanitizedData);
        console.log('✅ Berhasil tersimpan di Cloud Firestore!', finalRequest.ticketNumber);
        finalRequest.id = finalRequest.ticketNumber;
      } catch (err: any) {
        console.error('❌ Gagal menyimpan ke Firestore:', err.code, err.message, err);
        // Throw so we know the exact Firebase error
        throw new Error(err.message || 'Gagal menyimpan ke Firebase Firestore: ' + err.code);
      }
    } else {
      console.warn('⚠️ Firebase belum terhubung, menyimpan ke local storage');
    }

    // Always maintain local backup
    this.saveConsultationToLocal(finalRequest);
    return finalRequest;
  }

  public async getAllConsultations(): Promise<ConsultationRequest[]> {
    if (this.isConnected() && this.db) {
      try {
        const colRef = collection(this.db, 'consultation_requests');
        const q = query(colRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);

        const list: ConsultationRequest[] = [];
        snapshot.forEach(docSnap => {
          list.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });

        // Merge with local to ensure nothing is missed
        const localList = this.getConsultationsFromLocal();
        const mergedMap = new Map<string, ConsultationRequest>();
        list.forEach(item => mergedMap.set(item.ticketNumber, item));
        localList.forEach(item => {
          if (!mergedMap.has(item.ticketNumber)) {
            mergedMap.set(item.ticketNumber, item);
          }
        });

        const merged = Array.from(mergedMap.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.saveAllConsultationsToLocal(merged);
        return merged;
      } catch (err) {
        console.warn('Error fetching consultations from Firestore, using local backup:', err);
      }
    }

    return this.getConsultationsFromLocal();
  }

  /**
   * Get server-side aggregate counts using Firestore getCountFromServer (highly cost-effective)
   */
  public async getConsultationCounts(): Promise<{
    total: number;
    pending: number;
    replied: number;
    analysis: number;
    completed: number;
  }> {
    if (this.isConnected() && this.db) {
      try {
        const colRef = collection(this.db, 'consultation_requests');
        const [totalSnap, pendingSnap, repliedSnap, analysisSnap, completedSnap] = await Promise.all([
          getCountFromServer(colRef),
          getCountFromServer(query(colRef, where('status', '==', 'menunggu_balasan'))),
          getCountFromServer(query(colRef, where('status', '==', 'dibalas_wa'))),
          getCountFromServer(query(colRef, where('status', '==', 'dalam_analisis'))),
          getCountFromServer(query(colRef, where('status', '==', 'selesai')))
        ]);

        return {
          total: totalSnap.data().count,
          pending: pendingSnap.data().count,
          replied: repliedSnap.data().count,
          analysis: analysisSnap.data().count,
          completed: completedSnap.data().count
        };
      } catch (err) {
        console.warn('getCountFromServer failed, falling back to local counts:', err);
      }
    }

    // Local fallback
    const local = this.getConsultationsFromLocal();
    return {
      total: local.length,
      pending: local.filter(r => r.status === 'menunggu_balasan').length,
      replied: local.filter(r => r.status === 'dibalas_wa').length,
      analysis: local.filter(r => r.status === 'dalam_analisis').length,
      completed: local.filter(r => r.status === 'selesai').length
    };
  }

  /**
   * Scalable Cursor-based pagination (fetches only pageSize items at a time)
   */
  public async getConsultationsPaged(options: {
    pageSize: number;
    statusFilter?: string;
    startAfterDoc?: any;
  }): Promise<{ data: ConsultationRequest[]; lastDoc: any; hasMore: boolean }> {
    const { pageSize = 15, statusFilter = 'all', startAfterDoc = null } = options;

    if (this.isConnected() && this.db) {
      try {
        const colRef = collection(this.db, 'consultation_requests');
        const constraints: any[] = [];

        if (statusFilter && statusFilter !== 'all') {
          constraints.push(where('status', '==', statusFilter));
        }

        constraints.push(orderBy('createdAt', 'desc'));

        if (startAfterDoc) {
          constraints.push(startAfter(startAfterDoc));
        }

        // Fetch pageSize + 1 to check if next page exists without an extra read
        constraints.push(limit(pageSize + 1));

        const q = query(colRef, ...constraints);
        const snapshot = await getDocs(q);

        const list: ConsultationRequest[] = [];
        const docSnaps: any[] = [];
        snapshot.forEach(docSnap => {
          docSnaps.push(docSnap);
          list.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });

        const hasMore = list.length > pageSize;
        if (hasMore) {
          list.pop();
          docSnaps.pop();
        }

        const lastDoc = docSnaps.length > 0 ? docSnaps[docSnaps.length - 1] : null;
        return { data: list, lastDoc, hasMore };
      } catch (err: any) {
        console.warn('getConsultationsPaged query failed or requires index, falling back gracefully:', err);
      }
    }

    // Local fallback
    let localList = this.getConsultationsFromLocal();
    if (statusFilter && statusFilter !== 'all') {
      localList = localList.filter(item => item.status === statusFilter);
    }
    const data = localList.slice(0, pageSize);
    return { data, lastDoc: null, hasMore: localList.length > pageSize };
  }

  /**
   * Direct O(1) single-document lookup by ticket number (1 read only)
   */
  public async getConsultationByTicket(ticketNumber: string): Promise<ConsultationRequest | null> {
    const cleanTicket = ticketNumber.replace(/^#/, '').trim();
    if (this.isConnected() && this.db) {
      try {
        const docRef = doc(this.db, 'consultation_requests', cleanTicket);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          return { id: snap.id, ...(snap.data() as any) };
        }
      } catch (err) {
        console.warn('Error fetching ticket by ID:', err);
      }
    }

    // Local fallback
    const local = this.getConsultationsFromLocal();
    return local.find(r => r.ticketNumber === cleanTicket || r.ticketNumber === ticketNumber) || null;
  }

  public async getConsultationsByWhatsApp(normalizedPhone: string): Promise<ConsultationRequest[]> {
    if (this.isConnected() && this.db) {
      try {
        const colRef = collection(this.db, 'consultation_requests');
        const q = query(colRef, where('whatsappNumber', '==', normalizedPhone));
        const snapshot = await getDocs(q);

        const list: ConsultationRequest[] = [];
        snapshot.forEach(docSnap => {
          list.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });
        if (list.length > 0) return list;
      } catch (err) {
        console.warn('Error querying by WhatsApp:', err);
      }
    }

    // Query from local
    const all = this.getConsultationsFromLocal();
    return all.filter(item => item.whatsappNumber === normalizedPhone);
  }

  public async updateConsultationStatus(
    ticketNumber: string, 
    status: ConsultationRequest['status'], 
    adminNotes?: string
  ): Promise<boolean> {
    const updatedAt = new Date().toISOString();

    if (this.isConnected() && this.db) {
      try {
        const docRef = doc(this.db, 'consultation_requests', ticketNumber);
        await updateDoc(docRef, {
          status,
          ...(adminNotes ? { adminNotes } : {}),
          updatedAt
        });
      } catch (err) {
        console.error('Failed to update status in Firestore:', err);
      }
    }

    // Update in local
    const local = this.getConsultationsFromLocal();
    const target = local.find(item => item.ticketNumber === ticketNumber);
    if (target) {
      target.status = status;
      if (adminNotes) target.adminNotes = adminNotes;
      target.updatedAt = updatedAt;
      this.saveAllConsultationsToLocal(local);
    }
    return true;
  }

  private getConsultationsFromLocal(): ConsultationRequest[] {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem(this.STORAGE_KEY_REQUESTS);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {}
      }
    }
    return [];
  }

  private saveConsultationToLocal(req: ConsultationRequest): void {
    const all = this.getConsultationsFromLocal();
    const idx = all.findIndex(item => item.ticketNumber === req.ticketNumber);
    if (idx >= 0) {
      all[idx] = req;
    } else {
      all.unshift(req);
    }
    this.saveAllConsultationsToLocal(all);
  }

  private saveAllConsultationsToLocal(list: ConsultationRequest[]): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.STORAGE_KEY_REQUESTS, JSON.stringify(list));
    }
  }
}
