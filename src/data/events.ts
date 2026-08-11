import { Event } from '../types';

export const eventsData: Event[] = [
  {
    id: 'e-2026-01',
    title: 'Bakti Sosial & Khitanan Massal Primaya 2026',
    date: '2026-06-15',
    time: '08:00 - 15:00 WIB',
    location: 'Primaya Hospital Bekasi Barat',
    category: 'Charity',
    status: 'upcoming',
    description: 'Program bakti sosial tahunan ABB Community bekerja sama dengan Primaya Hospital, melayani 150 anak dari keluarga kurang mampu dengan fasilitas kesehatan gratis dan santunan.',
    coverImage: './images/event/event-2019-012.jpg',
    participantsCount: 150,
    organizer: 'ABB Community Bekasi & Panitia Medis Primaya',
    coordinates: [-6.2349, 106.9924],
    timeline: [
      { time: '08:00', activity: 'Registrasi Peserta & Pemeriksaan Awal' },
      { time: '09:00', activity: 'Pembukaan oleh Ketum ABB & Direksi Rumah Sakit' },
      { time: '09:30', activity: 'Pelaksanaan Khitanan Massal Medis' },
      { time: '12:00', activity: 'Istirahat & Pembagian Bingkisan / Santunan' },
      { time: '14:00', activity: 'Edukasi Perawatan Pasca Operasi & Penutupan' }
    ],
    gallery: [
      './images/event/event-2019-012.jpg',
      './images/event/event-2019-007.jpg',
      './images/event/event-2019-001.jpg'
    ]
  },
  {
    id: 'e-2025-02',
    title: 'Grand Annual Ride 2025: Jelajah Trans Jawa & Bromo',
    date: '2025-11-20',
    time: '3 Hari 2 Malam',
    location: 'Bekasi - Semarang - Bromo - Malang',
    category: 'Touring',
    status: 'completed',
    description: 'Petualangan touring jarak jauh menembus 850 km jalur ikonik Trans Jawa menuju kawasan Gunung Bromo dengan pengawalan safety riding lengkap.',
    coverImage: './images/event/event-2019-007.jpg',
    participantsCount: 65,
    organizer: 'Divisi Touring ABB Community',
    coordinates: [-7.9425, 112.9530],
    gallery: [
      './images/event/event-2019-007.jpg',
      './images/event/event-2019-010.jpg',
      './images/event/event-2019-013.jpg',
      './images/event/event-2016-001.jpg'
    ]
  },
  {
    id: 'e-2025-01',
    title: 'Safety Riding & Defensive Driving Workshop',
    date: '2025-03-10',
    time: '09:00 - 16:00 WIB',
    location: 'Safety Riding Center Jatake, Tangerang',
    category: 'Safety Riding',
    status: 'completed',
    description: 'Pelatihan teknik pengereman darurat, manajemen tikungan, dan simulasi pertolongan pertama kecelakaan jalan raya oleh instruktur bersertifikat.',
    coverImage: './images/event/event-2019-001.jpg',
    participantsCount: 45,
    organizer: 'ABB Community & Instruktur Safety Indonesia',
    gallery: [
      './images/event/event-2019-001.jpg',
      './images/event/event-2016-003.jpg'
    ]
  },
  {
    id: 'e-2024-03',
    title: '15th Anniversary ABB Community: Ride Beyond Borders',
    date: '2024-10-14',
    time: '18:00 - 22:00 WIB',
    location: 'Grand Ballroom Hotel Horison Bekasi',
    category: 'Anniversary',
    status: 'completed',
    description: 'Perayaan 15 tahun persaudaraan ABB Community dihadiri oleh perwakilan chapter seluruh Indonesia, founder, dan mitra rumah sakit.',
    coverImage: './images/event/event-2019-013.jpg',
    participantsCount: 200,
    organizer: 'Panitia HUT ABB 15',
    gallery: [
      './images/event/event-2019-013.jpg',
      './images/event/event-2019-010.jpg'
    ]
  },
  {
    id: 'e-2024-01',
    title: 'Donor Darah Serentak 3 City Chapter',
    date: '2024-04-18',
    time: '08:30 - 13:00 WIB',
    location: 'Primaya Hospital Tangerang & Bekasi',
    category: 'Charity',
    status: 'completed',
    description: 'Aksi kemanusiaan donor darah serentak yang mengumpulkan 180 kantong darah untuk persediaan PMI dan RS.',
    coverImage: './images/event/event-2016-005.jpg',
    participantsCount: 120,
    organizer: 'ABB Care & PMI',
    gallery: [
      './images/event/event-2016-005.jpg',
      './images/event/event-2016-006.jpg'
    ]
  }
];
