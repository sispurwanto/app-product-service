import { Injectable, inject, signal, computed } from '@angular/core';
import {
  getAuth,
  Auth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { FirebaseService } from './firebase.service';
import { environment } from '../../environments/environment';

export interface AdminUserData {
  email: string;
  uid?: string;
  isFirebaseUser: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private firebaseService = inject(FirebaseService);
  private auth: Auth | null = null;

  public currentUser = signal<AdminUserData | null>(null);
  public isLoggedIn = computed(() => this.currentUser() !== null);
  public isLoading = signal<boolean>(false);
  public authError = signal<string>('');

  private readonly STORAGE_DEMO_AUTH = 'webcare_demo_admin_auth';

  constructor() {
    this.initAuth();
  }

  public initAuth(): void {
    const app = this.firebaseService.getApp();
    if (app && this.firebaseService.isConnected()) {
      try {
        this.auth = getAuth(app);
        onAuthStateChanged(this.auth, (user: User | null) => {
          if (user && user.email) {
            this.currentUser.set({
              email: user.email,
              uid: user.uid,
              isFirebaseUser: true
            });
          } else {
            // Check if demo auth exists
            this.checkDemoAuth();
          }
        });
      } catch (err) {
        console.warn('Firebase Auth initialization warning:', err);
        this.checkDemoAuth();
      }
    } else {
      this.checkDemoAuth();
    }
  }

  private checkDemoAuth(): void {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const demoEmail = sessionStorage.getItem(this.STORAGE_DEMO_AUTH);
      if (demoEmail) {
        this.currentUser.set({
          email: demoEmail,
          isFirebaseUser: false
        });
        return;
      }
    }
    this.currentUser.set(null);
  }

  /**
   * Login with Email and Password
   */
  public async login(email: string, pass: string): Promise<{ success: boolean; error?: string }> {
    this.isLoading.set(true);
    this.authError.set('');

    const cleanEmail = email.trim();
    const cleanPass = pass.trim();

    if (!cleanEmail || !cleanPass) {
      const err = 'Email dan password admin wajib diisi.';
      this.authError.set(err);
      this.isLoading.set(false);
      return { success: false, error: err };
    }

    // Ensure auth instance is initialized
    if (!this.auth && this.firebaseService.getApp()) {
      try {
        this.auth = getAuth(this.firebaseService.getApp()!);
      } catch (e) { }
    }

    // Path 1: Live Firebase Authentication
    if (this.auth && this.firebaseService.isConnected()) {
      try {
        const userCredential = await signInWithEmailAndPassword(this.auth, cleanEmail, cleanPass);
        const user = userCredential.user;
        this.currentUser.set({
          email: user.email || cleanEmail,
          uid: user.uid,
          isFirebaseUser: true
        });
        this.isLoading.set(false);
        return { success: true };
      } catch (err: any) {
        console.error('Firebase Auth Login Error:', err);
        const translatedError = this.translateFirebaseError(err.code || err.message);
        this.authError.set(translatedError);
        this.isLoading.set(false);
        return { success: false, error: translatedError };
      }
    }

    // Path 2: Demo / Offline Fallback (if Firebase Auth is not yet configured or offline)
    const targetPin = environment.adminPin || 'webcare2026';
    if (cleanPass === targetPin || cleanPass === 'admin123' || cleanPass === 'webcare2026') {
      const demoUser: AdminUserData = {
        email: cleanEmail,
        isFirebaseUser: false
      };
      this.currentUser.set(demoUser);
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.setItem(this.STORAGE_DEMO_AUTH, cleanEmail);
      }
      this.isLoading.set(false);
      return { success: true };
    } else {
      const err = 'Password admin salah. (Jika mode demo, gunakan password: ' + targetPin + ')';
      this.authError.set(err);
      this.isLoading.set(false);
      return { success: false, error: err };
    }
  }

  /**
   * Logout Admin session
   */
  public async logout(): Promise<void> {
    if (this.auth && this.currentUser()?.isFirebaseUser) {
      try {
        await signOut(this.auth);
      } catch (e) {
        console.warn('Sign out warning:', e);
      }
    }

    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.removeItem(this.STORAGE_DEMO_AUTH);
    }

    this.currentUser.set(null);
    this.authError.set('');
  }

  private translateFirebaseError(code: string): string {
    switch (code) {
      case 'auth/user-not-found':
        return 'Akun admin dengan email tersebut tidak ditemukan.';
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Email atau password yang Anda masukkan salah.';
      case 'auth/invalid-email':
        return 'Format alamat email tidak valid.';
      case 'auth/user-disabled':
        return 'Akun admin ini telah dinonaktifkan.';
      case 'auth/too-many-requests':
        return 'Terlalu banyak percobaan masuk yang gagal. Silakan tunggu beberapa saat.';
      case 'auth/network-request-failed':
        return 'Gagal terhubung ke server. Periksa koneksi internet Anda.';
      case 'auth/operation-not-allowed':
        return 'Metode Email/Password belum diaktifkan (Authentication → Sign-in method).';
      default:
        return 'Gagal login: ' + code;
    }
  }
}
