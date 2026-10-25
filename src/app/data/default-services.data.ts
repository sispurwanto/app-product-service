import { ServiceItem, TechStackItem } from '../models/service.model';

export const DEFAULT_SERVICES: ServiceItem[] = [
  {
    id: 'srv-website-repair',
    slug: 'website-repair',
    order: 1,
    title: 'Website Repair — Perbaikan Website',
    subtitle: 'Solusi tepat sasaran untuk error, kendala fungsi, dan gangguan performa sistem Anda.',
    category: 'repair',
    badge: 'Penanganan Masalah & Bug',
    badgeColor: 'rose',
    shortDesc: 'Website yang sebelumnya berjalan dengan baik bisa mengalami error, fungsi yang tidak bekerja, atau masalah setelah perubahan sistem.',
    fullDesc: 'Website yang sebelumnya berjalan dengan baik bisa mengalami error, fungsi yang tidak bekerja, atau masalah setelah perubahan sistem. Kami membantu memeriksa dan menangani masalah pada kode, antarmuka, hingga komunikasi data dengan cermat dan transparan.',
    keyFeatures: [
      'Bug pada fungsi website atau aplikasi bisnis',
      'Formulir, tombol, alur checkout, atau proses yang tidak berjalan sebagaimana mestinya',
      'Masalah tampilan (UI/UX) pada perangkat desktop maupun mobile / responsivitas layar',
      'Error pada API, proses backend, atau koneksi database (REST, GraphQL, SQL/NoSQL)',
      'Bantuan diagnosis teknis ketika website mengalami gangguan mendadak'
    ],
    workflowNote: 'Setiap perbaikan diawali dengan pemeriksaan untuk memahami masalah, kemungkinan penyebab, dan ruang lingkup pekerjaan.',
    iconName: 'wrench',
    typicalCases: [
      'Error 500 / Blank screen setelah update',
      'Tombol submit formulir tidak merespon',
      'Tampilan berantakan di smartphone / Safari iOS',
      'Koneksi database terputus atau timeout'
    ],
    estimatedTurnaround: 'Berdasarkan tingkat kesulitan & temuan investigasi awal',
    active: true,
    createdAt: '2026-10-18T00:00:00.000Z'
  },
  {
    id: 'srv-website-care',
    slug: 'website-care',
    order: 2,
    title: 'Website Care — Perawatan Website',
    subtitle: 'Pemeliharaan terencana agar website Anda tetap stabil, aman, dan siap mendukung bisnis.',
    category: 'care',
    badge: 'Pemeliharaan Rutin & Berkala',
    badgeColor: 'emerald',
    shortDesc: 'Website membutuhkan perhatian agar tetap sesuai dengan kebutuhan bisnis yang terus berkembang.',
    fullDesc: 'Website membutuhkan perhatian agar tetap sesuai dengan kebutuhan bisnis yang terus berkembang. Kami memberikan layanan perawatan berkala terstruktur untuk memastikan kestabilan dan kesiapan komponen digital Anda.',
    keyFeatures: [
      'Pemeriksaan fungsi utama website secara menyeluruh',
      'Perbaikan kecil (minor fixes & tuning) sesuai ruang lingkup yang disepakati',
      'Pembaruan konten, teks, banner, atau komponen visual website',
      'Pemeriksaan dasar integritas integrasi API dan kesehatan koneksi database',
      'Rekomendasi tindak lanjut teknis berdasarkan temuan pemeriksaan berkala'
    ],
    workflowNote: 'Cakupan perawatan ditentukan berdasarkan kondisi website dan kebutuhan masing-masing pelanggan.',
    iconName: 'shield-check',
    typicalCases: [
      'Audit bulanan fungsi formulir & link',
      'Update aset promosi & katalog informasi',
      'Cek masa aktif sertifikat SSL & response time',
      'Pembersihan cache dan optimasi database'
    ],
    estimatedTurnaround: 'Jadwal berkala mingguan / bulanan / on-demand',
    active: true,
    createdAt: '2026-10-18T00:00:00.000Z'
  },
  {
    id: 'srv-customize-on-call',
    slug: 'customize-on-call',
    order: 3,
    title: 'Customize On-Call — Pengembangan Fitur Sesuai Kebutuhan',
    subtitle: 'Ekspansi kapabilitas aplikasi Anda tanpa harus membangun ulang dari nol.',
    category: 'custom',
    badge: 'Kustomisasi Fleksibel',
    badgeColor: 'indigo',
    shortDesc: 'Tidak semua kebutuhan bisnis memerlukan pembuatan aplikasi baru dari awal. Terkadang, website yang sudah digunakan hanya perlu disesuaikan atau ditambahkan fungsi tertentu.',
    fullDesc: 'Tidak semua kebutuhan bisnis memerlukan pembuatan aplikasi baru dari awal. Terkadang, website yang sudah digunakan hanya perlu disesuaikan atau ditambahkan fungsi tertentu. Kami membantu rancang bangun modul baru sesuai alur kerja bisnis nyata Anda.',
    keyFeatures: [
      'Penambahan atau perubahan fitur baru sesuai alur operasional',
      'Formulir dan alur kerja (workflow) khusus sesuai proses bisnis',
      'Fitur pencarian lanjut, multi-filter, dan ekspor data (Excel, CSV, PDF)',
      'Dashboard statistik dan laporan operasional ringkas',
      'Perubahan proses backend dan integrasi API pihak ketiga (payment gateway, kurir, CRM)',
      'Penyesuaian struktur data atau integrasi koneksi database baru'
    ],
    workflowNote: 'Pekerjaan dilakukan berdasarkan konsultasi, analisis kebutuhan, estimasi, dan persetujuan sebelum pengerjaan dimulai.',
    iconName: 'code-xml',
    typicalCases: [
      'Integrasi notifikasi otomatis ke WhatsApp / Email',
      'Pembuatan modul cetak invoice / rekapitulasi data',
      'Penambahan filter tanggal dan laporan omzet',
      'Penyesuaian logic perhitungan diskon / komisi'
    ],
    estimatedTurnaround: 'Estimasi modul ditentukan setelah analisis spesifikasi',
    active: true,
    createdAt: '2026-10-18T00:00:00.000Z'
  }
];

export const TECH_STACKS: TechStackItem[] = [
  {
    name: 'Node.js & JavaScript',
    role: 'Backend & Logic Engine',
    icon: 'nodejs',
    color: '#68a063',
    description: 'Pengembangan backend, API, dan logika aplikasi yang cepat, scalable, dan modern.',
    tags: ['Express.js', 'REST API', 'Microservices', 'Async IO']
  },
  {
    name: 'Angular',
    role: 'Frontend & Web App Framework',
    icon: 'angular',
    color: '#dd0031',
    description: 'Pengembangan antarmuka web, SPA berkinerja tinggi, dan aplikasi berbasis dashboard interaktif.',
    tags: ['Standalone Components', 'Signals', 'TypeScript', 'Responsive UI']
  },
  {
    name: 'PHP',
    role: 'Backend & Web Ecosystem',
    icon: 'php',
    color: '#777bb4',
    description: 'Pemeliharaan, perbaikan bug, dan penambahan fitur pada aplikasi web berbasis PHP (Laravel, CodeIgniter, WordPress, hingga Native).',
    tags: ['Laravel', 'CodeIgniter', 'Native PHP', 'WordPress', 'REST API']
  },
  {
    name: 'PostgreSQL',
    role: 'Relational Database Enterprise',
    icon: 'postgresql',
    color: '#336791',
    description: 'Pengolahan data relasional berintegritas tinggi dan kebutuhan database transaksional aplikasi bisnis.',
    tags: ['Complex Queries', 'ACID Compliance', 'JSONB Support', 'Optimized Indexing']
  },
  {
    name: 'MySQL',
    role: 'High-Speed Relational DB',
    icon: 'mysql',
    color: '#00758f',
    description: 'Pengelolaan database relasional populer yang stabil untuk website, e-commerce, dan CMS bisnis.',
    tags: ['High Availability', 'Relational Schema', 'Standard SQL', 'Fast Reads']
  },
  {
    name: 'Firebase Database',
    role: 'Cloud NoSQL & Realtime DB',
    icon: 'firebase',
    color: '#ffca28',
    description: 'Pengembangan aplikasi menggunakan layanan database Cloud Firestore / Realtime DB Firebase yang responsif dan scalable.',
    tags: ['Firestore', 'Realtime Sync', 'Serverless', 'Security Rules']
  }
];

export const PROCESS_STEPS = [
  {
    step: 1,
    title: '1. Ceritakan kebutuhan Anda',
    desc: 'Jelaskan masalah website, bug yang dialami, atau fitur yang ingin ditambahkan secara gamblang melalui form konsultasi.',
    badge: 'Input Konsultasi'
  },
  {
    step: 2,
    title: '2. Pemeriksaan dan analisis',
    desc: 'Kami meninjau informasi yang tersedia, mereproduksi kendala, untuk memahami kondisi sistem dan kebutuhan pekerjaan.',
    badge: 'Audit Awal'
  },
  {
    step: 3,
    title: '3. Estimasi dan kesepakatan',
    desc: 'Ruang lingkup, estimasi biaya, jadwal, dan batas pekerjaan dikomunikasikan secara transparan sebelum pengerjaan dimulai.',
    badge: 'Transparansi'
  },
  {
    step: 4,
    title: '4. Pengerjaan dan pengujian',
    desc: 'Pekerjaan dilakukan sesuai kesepakatan, kemudian diuji secara menyeluruh berdasarkan fungsi yang menjadi ruang lingkup proyek.',
    badge: 'Development & QA'
  },
  {
    step: 5,
    title: '5. Penyelesaian dan dokumentasi',
    desc: 'Hasil pekerjaan disampaikan beserta catatan perubahan (changelog) atau panduan informasi teknis yang relevan untuk Anda.',
    badge: 'Handover Rapi'
  }
];
