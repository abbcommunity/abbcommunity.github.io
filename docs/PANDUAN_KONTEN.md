# Panduan Pembaruan Konten ABB Community

Dokumen ini menjelaskan tata cara menambah, mengedit, atau memperbarui data konten pada platform digital **ABB Community**.

---

## 1. Lokasi Data Konten

Seluruh data konten tersimpan dalam bentuk file TypeScript terstruktur pada folder:

`src/data/`

Admin atau pengurus tidak perlu merubah kode komponen UI. Cukup ubah file data berikut:

| File | Konten yang Diatur |
| :--- | :--- |
| `siteConfig.ts` | Nama komunitas, tagline, kontak, email, sosial media, dan angka statistik. |
| `members.ts` | Daftar anggota, pengurus, foto profil, jabatan, chapter, dan jenis motor. |
| `events.ts` | Agenda event, lokasi, tanggal, waktu, jumlah peserta, dan foto kegiatan. |
| `stories.ts` | Artikel majalah editorial, jurnal ekspedisi touring, dan panduan safety riding. |
| `gallery.ts` | Katalog foto dokumentasi terurut berdasarkan tahun dan kategori. |
| `garage.ts` | Garasi motor anggota, spesifikasi mesin, dan rincian modifikasi. |
| `rides.ts` | Rute peta touring, jarak km, durasi jam, serta koordinat GPS polylines. |
| `socialImpact.ts` | Program kemanusiaan (khitanan massal, donor darah, mitra rumah sakit). |
| `documents.ts` | Daftar file dokumen AD/ART, SOP, dan formulir pendaftaran. |

---

## 2. Contoh Menambah Anggota Baru (`members.ts`)

Buka file `src/data/members.ts` dan tambahkan objek baru ke dalam array `membersData`:

```typescript
{
  id: 'm-baru',
  name: 'Nama Anggota',
  role: 'member', // pilihan: 'founder' | 'board' | 'coordinator' | 'creative' | 'member'
  position: 'Anggota Aktif',
  chapter: 'Bekasi Chapter',
  joinYear: 2026,
  motorcycle: 'Honda CB500X',
  photo: './images/member/foto-anggota.jpg',
  bio: 'Deskripsi singkat profil anggota.',
  social: {
    instagram: 'https://instagram.com/username'
  }
}
```

---

## 3. Contoh Menambah Event Baru (`events.ts`)

Buka file `src/data/events.ts` dan tambahkan objek event:

```typescript
{
  id: 'e-2026-baru',
  title: 'Judul Event Baru',
  date: '2026-08-20',
  time: '08:00 WIB',
  location: 'Lokasi Event',
  category: 'Touring', // 'Touring' | 'Social' | 'Charity' | 'Safety Riding' | 'Anniversary'
  status: 'upcoming',  // 'upcoming' | 'completed' | 'ongoing'
  description: 'Deskripsi rincian kegiatan event.',
  coverImage: './images/event/foto-cover.jpg',
  participantsCount: 50,
  organizer: 'Panitia Event ABB'
}
```

---

## 4. Cara Deploy Perubahan Konten

Setelah selesai mengedit file di folder `src/data/`:

```bash
git add .
git commit -m "Update data konten ABB Community"
git push origin main
```

Sistem **GitHub Actions** akan secara otomatis membangun website dan memperbarui tampilan publik di GitHub Pages dalam waktu 1-2 menit.
