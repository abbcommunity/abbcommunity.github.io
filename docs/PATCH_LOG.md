# Log Patch & Modernisasi Platform ABB Community

Dokumen ini mencatat seluruh patch, refactoring, serta migrasi yang dilakukan dalam proses modernisasi total **ABB Community 2.0**.

---

## Patch v2.0.0 — Modernization & Total Upgrade (11 Agustus 2026)

### 1. Migrasi Arsitektur & Core Stack
- **SEBELUM**: Website statis HTML legacy (Template Polo tahun 2018 dengan jQuery & CSS terpisah).
- **SESUDAH**: Modern Single Page Application (SPA) berbasis **Vite + React 18 + TypeScript + Tailwind CSS v3**.

### 2. Penataan Aset & File Depresiasi
- Pemindahan aset `images/` dan `video/` ke `public/` agar disajikan secara efisien oleh Vite build tool.
- Backup `index.html` lama menjadi `legacy_index.html` untuk memelihara riwayat file awal.
- Pembuatan file konfigurasi `package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.js`, dan `postcss.config.js`.

### 3. Pemisahan Data & Presentation (Decoupling)
- Membuat modul TypeScript terisolasi di `src/data/`:
  - `siteConfig.ts`: Metadata, statistik, dan kontak.
  - `members.ts`: Data pengurus, founder, dan direktori anggota.
  - `events.ts`: Jadwal event touring, bakti sosial, dan anniversary.
  - `stories.ts`: Jurnal ekspedisi dan artikel safety riding.
  - `gallery.ts`: Katalog foto dokumentasi terurut tahun & kategori.
  - `garage.ts`: Profil motor anggota dan spesifikasi modifikasi.
  - `rides.ts`: Koordinat GPS rute touring dan polylines.
  - `socialImpact.ts`: Program medis sosial khitanan massal & donor darah.
  - `documents.ts`: AD/ART, SOP, dan formulir pendaftaran.

### 4. Implementasi Design System Dark Automotive
- Membuat token warna khusus `brand.dark`, `brand.accent`, `brand.cyan`, dan shadow glassmorphism.
- Komponen UI terpakai ulang (`Button`, `Card`, `Badge`, `Modal`, `StatsCounter`, `OrgChart`, `RideMap`, `GalleryLightbox`).

### 5. Fitur Baru Ditambahkan
- **Global Search Modal (`Ctrl+K`)**: Fuzzy search instan menggunakan Fuse.js.
- **Peta Interaktif Leaflet**: Visualisasi garis rute touring dengan penanda lokasi keberangkatan dan tujuan.
- **PWA & Accessibility Support**: Penambahan `manifest.json`, meta tag OpenGraph, keyboard navigation, dan responsif lintas ukuran layar.
- **GitHub Actions Workflow**: Otomatisasi deployment ke GitHub Pages (`.github/workflows/deploy.yml`).

---

## Status Verifikasi Build

- **TypeScript Type Check**: `Pass` (0 type errors)
- **Vite Production Build**: `Pass` (`dist/` tergenerasi dengan sukses)
- **Kompatibilitas Hosting**: `Pass` (Kompatibel 100% dengan GitHub Pages)
