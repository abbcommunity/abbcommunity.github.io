import { BikeProfile } from '../types';

export const garageData: BikeProfile[] = [
  {
    id: 'b1',
    ownerId: 'm1',
    ownerName: 'Adipta Yanuardie',
    chapter: 'Bekasi Chapter',
    model: 'Versys 650 Special Edition',
    brand: 'Kawasaki',
    year: 2021,
    engineCapacity: '649 cc Parallel-Twin',
    modifications: [
      'GIVI Trekker Outback Aluminum Top & Side Cases',
      'SW-Motech Engine Guard & Crash Bars',
      'PIAA LED Auxiliary Lights',
      'Barkbusters VP Handguards',
      'Akrapovic Full System Exhaust'
    ],
    image: './images/event/event-2019-001.jpg',
    story: 'Motor utama yang menemani ekspedisi keliling Sumatra dan Jawa. Tangguh di segala medan dengan kenyamanan ergonomi jelajah jauh.'
  },
  {
    id: 'b2',
    ownerId: 'm2',
    ownerName: 'Fatwa',
    chapter: 'Jakarta Chapter',
    model: 'CB500X Adventure',
    brand: 'Honda',
    year: 2022,
    engineCapacity: '471 cc Parallel-Twin',
    modifications: [
      'Shad Terra Aluminum Panniers',
      'Hepco & Becker Engine Protection',
      'Denali D4 Auxiliary Driving Lights',
      'Tall Touring Windshield'
    ],
    image: './images/event/event-2019-007.jpg',
    story: 'Pilihan hemat bahan bakar namun siap melibas jalur makadam maupun aspal mulus Trans Jawa.'
  },
  {
    id: 'b3',
    ownerId: 'm3',
    ownerName: 'Doyok',
    chapter: 'Tangerang Chapter',
    model: 'F850GS Adventure',
    brand: 'BMW',
    year: 2023,
    engineCapacity: '853 cc Parallel-Twin',
    modifications: [
      'Touratech Rallye Seat',
      'BMW Motorrad Aluminum Cases',
      'Garmin Zumo XT Navigation',
      'Akrapovic Titanium Exhaust'
    ],
    image: './images/event/event-2019-010.jpg',
    story: 'Kombinasi performa tinggi dan fitur elektronik canggih untuk memandu formasi touring nasional ABB.'
  },
  {
    id: 'b4',
    ownerId: 'm4',
    ownerName: 'Bonty',
    chapter: 'Bogor Chapter',
    model: 'Tracer 900 GT',
    brand: 'Yamaha',
    year: 2020,
    engineCapacity: '847 cc CP3 Inline-3',
    modifications: [
      'Quickshifter System',
      'Ohlins Rear Suspension Upgrade',
      'Puig Touring Screen',
      'Heated Grips'
    ],
    image: './images/event/event-2019-013.jpg',
    story: 'Karakter mesin CP3 yang melimpah torsi memberikan kelincahan saat melewati pegunungan berkelok.'
  }
];
