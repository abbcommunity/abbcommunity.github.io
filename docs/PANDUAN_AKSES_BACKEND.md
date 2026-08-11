# Panduan Akses Backend & Administrasi Firebase

Dokumen ini berisi panduan operasional bagi pengurus, administrator, dan pengembang (developer) dalam mengelola backend **Firebase** dan mengakses **Portal Administrasi (Admin Engine)** platform **ABB Community — Awal Bros Bikers Community**.

---

## 1. Ringkasan Arsitektur Backend

Platform ABB Community menggunakan arsitektur **Hybrid Serverless**:
* **Frontend Hosting**: GitHub Pages (React 18 + Vite + TypeScript)
* **Backend Platform**: Firebase Infrastructure
  * **Firebase Authentication**: Pengelolaan login pengguna & SSO Google Sign-In.
  * **Cloud Firestore**: Database NoSQL utama untuk 14 koleksi data.
  * **Firebase Storage**: Penyimpanan foto anggota, kendaraan, event, dan dokumen SOP.
  * **Firebase App Check**: Proteksi resource dari abuse dan request tidak sah.

---

## 2. Cara Mengakses Portal Administrasi (Admin Portal)

Portal Administrasi dapat diakses langsung melalui browser tanpa memerlukan installasi software tambahan.

### URL Akses:
* **Lingkungan Produksi**: `https://abbcommunity.github.io/#/admin`
* **Lingkungan Pengembangan Lokal**: `http://localhost:5173/#/admin`

### Langkah Login Administrator:
1. Buka URL `/admin`.
2. Klik tombol **"Masuk dengan Google"**.
3. Gunakan akun Google yang terdaftar dengan hak akses administrator (misal: `abbcommunityrider@gmail.com`).
4. Setelah berhasil autentikasi, sistem secara otomatis mengevaluasi peranan pengguna (RBAC) dan mengarahkan ke Dashboard Operasional (`/admin/dashboard`).

---

## 3. Hierarki Role-Based Access Control (RBAC)

Akses ke fitur backend dibatasi secara ketat di tingkat client maupun di tingkat database Firestore (`firestore.rules`).

| Role | Deskripsi Hak Akses |
| :--- | :--- |
| **`super_admin`** | Akses penuh seluruh sistem, manajemen peranan pengguna, audit logs, dan pengaturan sistem. |
| **`admin`** | Pengelolaan data anggota, event, dokumen, artikel berita, dan peninjauan log audit. |
| **`chairman` / `board`** | Pengelolaan agenda event, pengumuman komunitas, dan pengawasan presensi. |
| **`coordinator`** | Pengelolaan event khusus chapter, pendaftaran peserta, dan presensi QR Code. |
| **`editor`** | Membuat dan mengedit draft artikel berita (*editorial workflow*). |
| **`member`** | Pendaftaran event, pengelolaan garasi motor pribadi, dan notifikasi anggota. |
| **`guest`** | Akses baca konten publik (tanpa hak akses portal administrasi). |

---

## 4. Konfigurasi Environment Variables (`.env`)

Untuk menghubungkan aplikasi frontend dengan Firebase project yang aktif, siapkan file `.env` di direktori utama proyek berdasarkan `.env.example`:

```env
# Firebase Web App Config
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=abb-community-prod.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=abb-community-prod
VITE_FIREBASE_STORAGE_BUCKET=abb-community-prod.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123def456

# Emulator Lokal (Set 'true' untuk pengujian offline)
VITE_USE_FIREBASE_EMULATOR=false
```

> **Catatan Keamanan**: Kunci Web API Firebase dapat dipublikasikan di client, namun seluruh proteksi data dijamin oleh **Firestore Security Rules** dan **Storage Security Rules**.

---

## 5. Pengujian Lokal Menggunakan Firebase Emulator Suite

Pengembang dapat menguji seluruh fungsi backend (Auth, Database, Storage) secara offline tanpa mengubah data produksi.

### Cara Menjalankan Emulator:
1. Pastikan Firebase CLI terinstall:
   ```bash
   npm install -g firebase-tools
   ```
2. Jalankan Firebase Emulator:
   ```bash
   firebase emulators:start
   ```
3. Port Emulator yang Digunakan:
   * **Authentication**: `http://localhost:9099`
   * **Firestore Database**: `http://localhost:8080`
   * **Storage**: `http://localhost:9199`
   * **Emulator Suite UI**: `http://localhost:4000`
4. Set `VITE_USE_FIREBASE_EMULATOR=true` pada file `.env` lokal Anda.

---

## 6. Deploy & Pemeliharaan Rule Keamanan

Jika terdapat perbaikan pada aturan keamanan `firestore.rules` atau `storage.rules`, jalankan perintah berikut menggunakan Firebase CLI:

```bash
# Deploy Security Rules Firestore
firebase deploy --only firestore:rules

# Deploy Security Rules Storage
firebase deploy --only storage:rules

# Deploy Indeks Majemuk Firestore
firebase deploy --only firestore:indexes
```

---

## 7. Audit Trail Logs (Penelusuran Jejak Digital)

Sistem dilengkapi **Immutable Audit Log** yang mencatat seluruh mutasi data sensitif:
* Penambahan / Penghapusan Anggota
* Perubahan Peran Pengguna (Role Escalation)
* Pembuatan & Publikasi Event
* Presensi Registrasi Pasien / Peserta
* Pengunggahan Dokumen SOP & AD/ART

Daftar log dapat ditinjau langsung pada menu **Audit Trail Logs** di URL `/admin/audit-logs`.
