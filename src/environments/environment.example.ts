// Template Contoh Konfigurasi Environment (Aman untuk di-commit ke Git)
// Salin berkas ini ke:
// - src/environments/environment.development.ts (untuk development)
// - src/environments/environment.prod.ts (untuk production)
// - src/environments/environment.ts (default base)
//
// Lalu ganti nilai placeholder di bawah ini dengan kredensial Firebase project Anda.

export const environment = {
  production: false,
  firebase: {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_FIREBASE_APP_ID"
  },
  // Nomor WhatsApp Admin penerima konsultasi (contoh: 081905453639 atau format internasional 6281905453639)
  adminWhatsApp: "081xxxxxxxxxx",
  appName: "WebCare & Custom"
};
