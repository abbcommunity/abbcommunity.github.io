import { Story } from '../types';

export const storiesData: Story[] = [
  {
    id: 's1',
    title: 'Menembus Kabut Bromo: Catatan Ekspedisi Touring Trans Jawa 850 KM',
    slug: 'menembus-kabut-bromo-trans-jawa',
    excerpt: 'Kisah 65 riders ABB Community menaklukkan tantangan cuaca, elevasi ekstrem, dan menjaga keselamatan kelompok selama 3 hari perjalanan.',
    content: `
Touring jarak jauh selalu menyimpan cerita unik. Pada ekspedisi kali ini, rombongan ABB Community memulai perjalanan dari markas Bekasi menuju kawasan Bromo melalui rute Jalur Selatan Jawa.

### Persiapan & Manajemen Formasi
Setiap peserta wajib melewati inspeksi kelaikan jalan (*pre-ride inspection*) yang mencakup pengereman, tekanan ban, sistem kelistrikan, serta kelengkapan proteksi diri.

Formasi berkendara menerapkan sistem *Staggered Formation* dengan jarak aman antar kendaraan 2 detik. Kapten jalanan di depan bertindak sebagai petunjuk jalan (*Road Captain*), sementara sweeper di belakang memastikan tidak ada peserta yang terpisah.

### Menuju Savana Bromo
Tantangan terbesar terjadi saat memasuki kawasan laut pasir Bromo menjelang subuh. Suhu dingin mencapai 8 derajat Celsius dan medan berpasir menuntut fokus ekstra serta handling yang mulus.

> "Bukan seberapa cepat kita sampai di puncak, tapi bagaimana seluruh anggota tim kembali ke rumah dengan selamat dan membawa senyuman persaudaraan." — Adipta Yanuardie (Ketum ABB)
    `,
    coverImage: './images/event/event-2019-007.jpg',
    publishedAt: '2025-11-25',
    readTime: '5 min read',
    author: {
      name: 'Adipta Yanuardie',
      role: 'Ketua Umum ABB Community',
      avatar: './images/member/ketua-umum-abb.jpg'
    },
    category: 'Touring',
    tags: ['Touring', 'Bromo', 'TransJawa', 'SafetyRiding'],
    featured: true
  },
  {
    id: 's2',
    title: 'Ride Beyond The Road: Mengubah Hobi Berkendara Menjadi Senyuman Anak-Anak',
    slug: 'ride-beyond-the-road-khitanan-massal',
    excerpt: 'Bagaimana ABB Community berkolaborasi dengan tenaga medis Primaya Hospital menggelar bakti sosial medis bagi masyarakat pra-sejahtera.',
    content: `
Bagi ABB Community, sepeda motor bukan sekadar alat transportasi atau pelampiasan hobi di akhir pekan. Sepeda motor adalah sarana pengabdian kepada masyarakat.

Melalui program *Ride Beyond The Road*, komunitas ini secara konsisten mengalokasikan kas dan menggalang donasi anggota untuk membiayai program kesehatan cuma-cuma.

### Sinergi Kesehatan Medis
Bekerja sama dengan tim spesialis bedah dan perawat dari Primaya Hospital, kegiatan bakti sosial khitanan massal telah menjadi agenda rutin tahunan yang menyentuh ratusan keluarga.
    `,
    coverImage: './images/event/event-2019-012.jpg',
    publishedAt: '2025-06-20',
    readTime: '4 min read',
    author: {
      name: 'Dr. Ahmad Farhan',
      role: 'Tim Kesehatan ABB',
      avatar: './images/member/wakil-ketua-umum-abb.jpg'
    },
    category: 'Social Impact',
    tags: ['BaktiSosial', 'PrimayaHospital', 'Humanitarian'],
    featured: true
  },
  {
    id: 's3',
    title: 'Panduan Cornering & Braking Aman untuk Adventure Touring',
    slug: 'panduan-cornering-braking-safety-riding',
    excerpt: 'Teknik dasar mengendalikan motor berbobot berat saat menikung di jalan basah dan pengereman darurat menurut instruktur ABB.',
    content: `
Mengendarai motor adventure touring berkapasitas mesin medium hingga besar membutuhkan pemahaman fisika berkendara yang benar.

1. **Vision Control**: Arahkan pandangan jauh ke titik keluar tikungan, bukan ke roda depan.
2. **Trail Braking**: Kurangi kecepatan sebelum masuk tikungan, lepas rem secara bertahap saat motor mulai miring.
3. **Body Positioning**: Pertahankan posisi badan netral atau *counterweight* sesuai kondisi permukaan jalan.
    `,
    coverImage: './images/event/event-2019-001.jpg',
    publishedAt: '2025-04-12',
    readTime: '6 min read',
    author: {
      name: 'Bonty',
      role: 'Founder & Instruktur Safety',
      avatar: './images/member/koordinator-lapangan-2.jpg'
    },
    category: 'Safety',
    tags: ['SafetyRiding', 'Tutorial', 'Tips']
  }
];
