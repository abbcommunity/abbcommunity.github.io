import { RideRoute } from '../types';

export const ridesData: RideRoute[] = [
  {
    id: 'r1',
    title: 'Ekspedisi Trans Jawa & Laut Pasir Bromo',
    date: '2025-11-20',
    distanceKm: 850,
    durationHours: 36,
    startPoint: 'Bekasi HQ (Primaya Hospital)',
    endPoint: 'Gunung Bromo & Malang',
    coordinates: [
      [-6.2349, 106.9924], // Bekasi
      [-6.9667, 110.4167], // Semarang
      [-7.5561, 110.8283], // Solo
      [-7.5360, 112.2384], // Jombang
      [-7.9425, 112.9530]  // Bromo
    ],
    participants: 65,
    highlights: [
      'Jalur Lintas Selatan Jawa',
      'Rest Area Tol & Non-Tol Scenic Route',
      'Laut Pasir Bromo at Sunrise',
      'Bakti Sosial di Kota Transit'
    ],
    coverImage: './images/event/event-2019-007.jpg',
    story: 'Perjalanan 3 hari 2 malam menembus 850 kilometer lintas provinsi dengan disiplin tinggi.'
  },
  {
    id: 'r2',
    title: 'West Java Alpine Loop: Puncak - Ciwidey - Geopark Ciletuh',
    date: '2025-05-14',
    distanceKm: 420,
    durationHours: 14,
    startPoint: 'Bekasi',
    endPoint: 'Geopark Ciletuh Sukabumi',
    coordinates: [
      [-6.2349, 106.9924], // Bekasi
      [-6.7024, 106.9912], // Puncak
      [-7.0982, 107.4912], // Ciwidey
      [-7.1812, 106.4611]  // Ciletuh
    ],
    participants: 40,
    highlights: [
      'Kelok 44 Puncak Pagi Hari',
      'Kebun Teh Rancabali Ciwidey',
      'Pesisir Pantai Geopark UNESCO Ciletuh'
    ],
    coverImage: './images/event/event-2019-001.jpg',
    story: 'Eksplorasi keindahan pesisir dan pegunungan Jawa Barat dalam satu hari petualangan.'
  },
  {
    id: 'r3',
    title: 'Overland Paradise: Banyuwangi - Bali Coastal Ride',
    date: '2024-09-10',
    distanceKm: 650,
    durationHours: 24,
    startPoint: 'Surabaya',
    endPoint: 'Denpasar & Uluwatu',
    coordinates: [
      [-7.2575, 112.7521], // Surabaya
      [-8.2192, 114.3691], // Ketapang Banyuwangi
      [-8.1587, 114.4363], // Gilimanuk
      [-8.3693, 114.6293], // Negara
      [-8.6705, 115.2126]  // Denpasar
    ],
    participants: 50,
    highlights: [
      'Penyeberangan Selat Bali',
      'Pesisir Barat Pulau Dewata',
      'Sunset Ride Uluwatu Temple'
    ],
    coverImage: './images/event/event-2019-013.jpg',
    story: 'Petualangan lintas pulau dengan kombinasi pemandangan laut, tebing, dan budaya lokal.'
  }
];
