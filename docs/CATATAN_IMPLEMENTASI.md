# Catatan Implementasi Platform ABB Community 2.0

Dokumen ini berisi rincian fitur, komponen UI, dan implementasi modul yang telah dibangun untuk platform digital resmi **ABB Community — Awal Bros Bikers Community**.

---

## 1. Modul & Halaman yang Diimplementasikan

### 1. Halaman Beranda (Homepage)
- **Hero Cinematic**: Video background loop (`clear-mobile-video-logo.mp4`), overlay gradasi, headline kontras tinggi ("RIDE TOGETHER. SERVE TOGETHER."), serta indikator scroll.
- **Counter Statistik Animasi**: Menampilkan Tahun Berdiri (2010), 150+ Anggota, 120+ Kegiatan, dan 16+ Tahun Persaudaraan.
- **Who We Are Section**: Penjelasan kaitan komunitas dengan lingkungan Primaya Hospital / Awal Bros.
- **Featured Agenda & Latest Stories**: Widget event utama dan artikel jurnal ekspedisi terbaru.
- **Social Impact Callout**: Highlight program kemanusiaan "Ride Beyond The Road".

### 2. Halaman Tentang Kami (About)
- **Visi & Misi**: Kartu desain glassmorphism dengan poin-poin utama visi & misi.
- **Timeline Rekam Jejak (2010 - 2026)**: Timeline interaktif rekam jejak perkembangan komunitas.
- **Bagan Struktur Organisasi (OrgChart)**: Bagan hirarki visual dari Dewan Pimpinan Nasional, Founders, Koordinator Region, hingga Creative Squad.

### 3. Halaman Anggota (Member Directory)
- **Kartu Profil Anggota**: Menampilkan foto, nama, jabatan, chapter, jenis sepeda motor, dan tahun bergabung.
- **Fitur Pencarian & Filter**: Pencarian real-time berdasarkan nama/motor serta filter berdasarkan Peran (Board, Founder, Creative, Member) dan Chapter Regional.
- **Modal Detail Anggota**: Pop-up informasi lengkap beserta bio dan link media sosial.

### 4. Halaman Event & Kegiatan
- **Katalog Event**: Filter kategori (Touring, Social, Charity, Safety Riding, Anniversary).
- **Detail Event Modal**: Rangkaian acara (timeline), jumlah peserta, lokasi peta, dan pengorganisir.

### 5. Media & Stories (Majalah Editorial)
- **Artikel Ekspedisi**: Jurnal ekspedisi touring Bromo, panduan safety riding, dan liputan bakti sosial.
- **Halaman Pembaca**: Tampilan baca yang bersih dengan quote highlight dan profil penulis.

### 6. Galeri Dokumentasi (Automotive Media Gallery)
- **Grid Foto Responsive**: Galeri foto dari event 2016 hingga 2026.
- **Filter Tahun & Kategori**: Memudahkan pencarian foto dokumentasi.
- **Lightbox Popup**: Viewer foto layar penuh dengan informasi deskripsi.

### 7. ABB Garage Showcase
- **Garasi Motor Anggota**: Kartu showcase motor (Kawasaki Versys, Honda CB500X, BMW GS, Yamaha Tracer).
- **Rincian Modifikasi & Mesin**: Rincian kapasitas mesin, aksesori touring, dan cerita pemilik.

### 8. Peta Touring Interaktif (Ride Map)
- **Peta Leaflet + Polylines**: Visualisasi garis rute perjalanan touring di Jawa, Sumatra, dan Bali.
- **Informasi Ekspedisi**: Jarak kilometer, estimasi durasi jam, titik keberangkatan, dan destinasi.

### 9. Social Impact ("Ride Beyond The Road")
- **Bakti Medis Khitanan Massal**: Layanan medis khitan gratis 150+ anak bersama Primaya Hospital.
- **Aksi Donor Darah**: Donor darah serentak bersama PMI.

### 10. Pusat Dokumen (Document Center)
- **File AD/ART & SOP**: Pengunduhan AD/ART, SOP Safety Riding, dan Formulir Registrasi Anggota Baru.

### 11. Halaman Kontak & Form Pendaftaran
- **Formulir Pendaftaran Interactive**: Formulir bergabung anggota baru.
- **Informasi HQ & Maps Embed**: Peta lokasi Primaya Hospital Bekasi Barat.

### 12. Global Search Modal (Pencarian Serentak)
- **Shortcut `Ctrl+K`**: Pencarian cepat seluruh platform menggunakan algoritma Fuse.js fuzzy search.

---

## 2. Aset Media yang Dipelihara

Seluruh aset gambar dan video dari repositori lama telah dipindahkan secara aman ke `public/images/` dan `public/video/`, termasuk:
- Foto Ketua Umum Adipta Yanuardie (`ketua-umum-abb.jpg`)
- Foto Wakil Ketum Fatwa (`wakil-ketua-umum-abb.jpg`)
- Foto Founder Doyok & Bonty (`koordinator-lapangan-1.jpg`, `koordinator-lapangan-2.jpg`)
- Foto Creative Squad Harry Lupus (`abb-creative-squad.JPG`)
- Arsip Foto Event 2016, 2019, 2020 (`event-2016-*.jpg`, `event-2019-*.jpg`, `event-2020-*.jpg`)
- Logo Resmi & Video Loop (`abb-community-image-logo.png`, `clear-mobile-video-logo.mp4`)
