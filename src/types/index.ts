export interface Member {
  id: string;
  name: string;
  nik?: string;
  role: 'founder' | 'board' | 'coordinator' | 'creative' | 'member';
  position: string;
  chapter: string;
  joinYear: number;
  motorcycle: string;
  photo: string;
  bio?: string;
  social?: {
    instagram?: string;
    facebook?: string;
    email?: string;
  };
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time?: string;
  location: string;
  category: 'Touring' | 'Social' | 'Charity' | 'Safety Riding' | 'Anniversary' | 'Internal';
  description: string;
  coverImage: string;
  status: 'upcoming' | 'completed' | 'ongoing';
  participantsCount: number;
  organizer?: string;
  timeline?: { time: string; activity: string }[];
  gallery?: string[];
  coordinates?: [number, number];
}

export interface Story {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  publishedAt: string;
  readTime: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  category: 'Community' | 'Touring' | 'Social Impact' | 'Rider Spotlight' | 'Safety';
  tags?: string[];
  featured?: boolean;
}

export interface GalleryItem {
  id: string;
  title: string;
  year: number;
  category: 'Touring' | 'Social' | 'Gathering' | 'Anniversary';
  image: string;
  thumbnail?: string;
  eventId?: string;
  description?: string;
}

export interface BikeProfile {
  id: string;
  ownerId: string;
  ownerName: string;
  chapter: string;
  model: string;
  brand: string;
  year: number;
  engineCapacity: string;
  modifications: string[];
  image: string;
  story: string;
}

export interface RideRoute {
  id: string;
  title: string;
  date: string;
  distanceKm: number;
  durationHours: number;
  startPoint: string;
  endPoint: string;
  coordinates: [number, number][]; // Lat, Lng polyline
  participants: number;
  highlights: string[];
  coverImage: string;
  story: string;
}

export interface SocialImpactProgram {
  id: string;
  title: string;
  category: 'Khitanan Massal' | 'Donor Darah' | 'Bakti Sosial' | 'Tanggap Bencana';
  impactMetric: string; // e.g. "150+ Anak Terkhitan"
  date: string;
  location: string;
  description: string;
  coverImage: string;
  beneficiariesCount: number;
  partner?: string; // e.g. "Primaya Hospital Bekasi Barat"
}

export interface DocumentItem {
  id: string;
  title: string;
  category: 'AD/ART' | 'SOP' | 'Registration' | 'Event SOP' | 'Form';
  fileSize: string;
  fileType: string;
  downloadUrl: string;
  updatedAt: string;
  description: string;
}

export interface SearchResult {
  id: string;
  type: 'member' | 'event' | 'story' | 'gallery' | 'garage' | 'document';
  title: string;
  subtitle: string;
  url: string;
  image?: string;
}
