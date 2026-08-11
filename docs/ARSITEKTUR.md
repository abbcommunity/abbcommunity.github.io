# Dokumen Arsitektur Platform Digital ABB Community 2.0

Dokumen ini menjelaskan arsitektur teknis, pilihan teknologi, serta keputusan desain untuk **ABB Community — Awal Bros Bikers Community Digital Platform**.

---

## 1. Prinsip Utama Arsitektur

> **"Not just a motorcycle club website. Build a digital home for the community."**

1. **Static-First & Free Hosting**: Platform dapat berjalan 100% di **GitHub Pages** tanpa server backend Node.js, VPS, atau database berbayar.
2. **Content-Presentation Decoupling**: Seluruh data anggota, kegiatan, cerita, garasi motor, peta touring, dan dokumen dipisahkan ke dalam file TypeScript terstruktur (`src/data/`). Konten dapat diperbarui dengan mudah tanpa mengubah kode UI.
3. **Cinematic Dark Automotive Design System**: Estetika modern dark mode (`#0B0F17`), glassmorphism, accent biru elektrik & cyan metallic, animasi smooth scroll, serta typography kontras tinggi.
4. **Performance & PWA Ready**: Cepat, aman, responsive di semua ukuran layar (Mobile, Tablet, Laptop, Desktop, TV), dan mendukung PWA offline caching.

---

## 2. Technology Stack

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS v3 + Custom Design Tokens (Automotive Dark)
- **Animasi & Interaksi**: Framer Motion
- **Peta Interaktif**: Leaflet + OpenStreetMap
- **Pencarian Instant**: Fuse.js (Client-side Fuzzy Search)
- **Ikonografi**: Lucide React
- **Routing**: React Router (`HashRouter` untuk kompatibilitas GitHub Pages)
- **Deployment**: Automated GitHub Actions Workflow (`.github/workflows/deploy.yml`)

---

## 3. Struktur Direktori Project

```text
abbcommunity.github.io/
 ├── .github/
 │    └── workflows/
 │         └── deploy.yml           # Workflow Otomatis GitHub Pages
 ├── docs/
 │    ├── ARSITEKTUR.md             # Dokumen Arsitektur (Bahasa Indonesia)
 │    ├── CATATAN_IMPLEMENTASI.md   # Catatan Implementasi & Fitur
 │    ├── PATCH_LOG.md              # Riwayat Modernisasi / Patch
 │    └── PANDUAN_KONTEN.md         # Panduan Pembaruan Konten Data
 ├── public/                        # Aset Statis (Images, Video, Favicon, Manifest)
 ├── src/
 │    ├── components/
 │    │    ├── common/              # Komponen Navigasi & Footer
 │    │    ├── gallery/             # Lightbox Popup & Grid
 │    │    ├── layout/              # Navbar, Footer, Global Search
 │    │    ├── members/             # Member Cards & Organizational Chart
 │    │    ├── rides/               # Peta Interaktif Leaflet
 │    │    └── ui/                  # Design System (Button, Card, Badge, Modal, Counter)
 │    ├── data/                     # Content Models (Members, Events, Stories, Garage, Rides, dll)
 │    ├── lib/                      # Utilities & Search Engine Helper
 │    ├── pages/                    # Halaman Utama (12 Page Views)
 │    ├── styles/                   # index.css (Tailwind Directives & Glass Theme)
 │    ├── types/                    # TypeScript Interfaces
 │    ├── App.tsx                   # Main Routing Shell
 │    └── main.tsx                  # React Entry Point
 ├── index.html                     # Entry HTML Vite & Google Fonts
 ├── package.json                   # Dependencies & Build Scripts
 ├── tailwind.config.js             # Theme Tokens & Glass Shadows
 ├── tsconfig.json                  # TypeScript Config & Path Aliases
 └── vite.config.ts                 # Vite Static Output & GitHub Pages Base
```

---

## 4. Strategi Deployment GitHub Pages

1. **Routing Strategy**: Menggunakan `HashRouter` untuk menjamin navigasi halaman tidak menghasilkan error 404 saat di-refresh pada hosting statis GitHub Pages.
2. **Base Path**: Ditentukan `./` pada `vite.config.ts` sehingga semua link aset relatif terhadap URL repository.
3. **Automated CI/CD**: Setiap ada `git push origin main`, GitHub Actions secara otomatis menjalankan `npm run build` dan mempublikasikan hasil `dist/` ke cabang GitHub Pages.
