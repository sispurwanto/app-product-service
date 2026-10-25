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
            this.currentUser.set(null);
          }
        });
      } catch (err) {
        console.warn('Firebase Auth initialization warning:', err);
        this.currentUser.set(null);
      }
    } else {
      this.currentUser.set(null);
    }
  }

  /**
   * Login with Firebase Authentication Email and Password
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

    if (!this.auth || !this.firebaseService.isConnected()) {
      const err = 'Layanan Firebase Authentication belum terhubung. Periksa konfigurasi Firebase dan koneksi internet.';
      this.authError.set(err);
      this.isLoading.set(false);
      return { success: false, error: err };
    }

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

  /**
   * Logout Admin session
   */
  public async logout(): Promise<void> {
    if (this.auth) {
      try {
        await signOut(this.auth);
      } catch (e) {
        console.warn('Sign out warning:', e);
      }
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
        return 'Metode Email/Password belum diaktifkan di Firebase Console (Authentication → Sign-in method).';
      default:
        return 'Gagal login: ' + code;
    }
  }
}
