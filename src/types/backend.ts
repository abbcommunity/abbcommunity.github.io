export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'chairman'
  | 'vice_chairman'
  | 'secretary'
  | 'treasurer'
  | 'coordinator'
  | 'editor'
  | 'member'
  | 'guest';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  memberId?: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface MemberProfile {
  id: string;
  userId?: string;
  memberNumber?: string;
  nik?: string;
  plateNumber?: string;
  name: string;
  nickname?: string;
  email?: string;
  phone?: string;
  address?: string;
  position?: string;
  chapter?: string;
  timestamp?: string;
  joinDate?: string;
  joinYear?: number;
  photoURL?: string;
  motorcycle?: {
    brand?: string;
    model?: string;
    year?: number;
  };
  social?: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
  };
  bio?: string;
  status: 'active' | 'inactive' | 'alumni' | 'pending';
  visibility: 'public' | 'members_only';
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationPositionDoc {
  id: string;
  title: string;
  description?: string;
  memberId?: string;
  parentId?: string;
  order: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type EventCategory =
  | 'touring'
  | 'social'
  | 'charity'
  | 'community'
  | 'anniversary'
  | 'internal'
  | 'safety';

export type EventStatus = 'upcoming' | 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled';

export interface EventDoc {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: EventCategory;
  coverImageURL?: string;
  startAt: string;
  endAt?: string;
  location?: {
    name?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
  };
  capacity?: number;
  registeredCount: number;
  registrationRequired: boolean;
  registrationOpen: boolean;
  status: EventStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type RegistrationStatus =
  | 'registered'
  | 'confirmed'
  | 'waitlist'
  | 'cancelled'
  | 'attended'
  | 'absent';

export interface EventRegistrationDoc {
  uid: string;
  eventId: string;
  userName: string;
  userEmail: string;
  status: RegistrationStatus;
  registeredAt: string;
  updatedAt: string;
}

export interface EventAttendanceDoc {
  uid: string;
  eventId: string;
  status: 'present' | 'absent';
  checkedInAt?: string;
  checkedInBy?: string;
}

export type StoryCategory =
  | 'community'
  | 'touring'
  | 'social'
  | 'motorcycle'
  | 'announcement';

export type StoryStatus = 'draft' | 'review' | 'published' | 'archived';

export interface StoryDoc {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageURL?: string;
  category: StoryCategory;
  authorId: string;
  authorName?: string;
  authorAvatar?: string;
  status: StoryStatus;
  featured?: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryDoc {
  id: string;
  title: string;
  eventId?: string;
  category: string;
  coverImageURL?: string;
  createdAt: string;
}

export interface GalleryPhotoDoc {
  id: string;
  storagePath: string;
  imageURL: string;
  thumbnailURL?: string;
  caption?: string;
  uploadedBy: string;
  createdAt: string;
}

export interface MotorcycleDoc {
  id: string;
  ownerId: string;
  ownerName: string;
  brand: string;
  model: string;
  year?: number;
  color?: string;
  engineCapacity?: string;
  modifications?: string[];
  story?: string;
  coverImageURL?: string;
  gallery?: string[];
  visibility: 'public' | 'members_only';
  createdAt: string;
  updatedAt: string;
}

export interface RideDoc {
  id: string;
  title: string;
  description?: string;
  destination?: string;
  startAt: string;
  distanceKm?: number;
  durationMinutes?: number;
  route?: {
    latitude: number;
    longitude: number;
  }[];
  eventId?: string;
  coverImageURL?: string;
  createdAt: string;
  updatedAt: string;
}

export type SocialImpactCategory =
  | 'charity'
  | 'donation'
  | 'health'
  | 'education'
  | 'community';

export interface SocialImpactDoc {
  id: string;
  title: string;
  description: string;
  category: SocialImpactCategory;
  date: string;
  location?: string;
  participantCount?: number;
  beneficiaryCount?: number;
  coverImageURL?: string;
  gallery?: string[];
  status: 'draft' | 'published' | 'archived';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type AnnouncementPriority = 'normal' | 'important' | 'urgent';
export type AnnouncementTarget = 'public' | 'members' | 'board' | 'admins';

export interface AnnouncementDoc {
  id: string;
  title: string;
  message: string;
  priority: AnnouncementPriority;
  target: AnnouncementTarget;
  expirationDate?: string;
  createdBy: string;
  createdAt: string;
}

export type DocumentCategory =
  | 'ad_art'
  | 'sop'
  | 'rules'
  | 'registration'
  | 'event'
  | 'organization';

export interface DocumentMetaDoc {
  id: string;
  title: string;
  description?: string;
  category: DocumentCategory;
  storagePath: string;
  fileURL: string;
  fileSize?: string;
  fileType?: string;
  visibility: 'public' | 'members_only' | 'admin_only';
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationDoc {
  id: string;
  title: string;
  message: string;
  type: 'event' | 'announcement' | 'registration' | 'system';
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface AuditLogDoc {
  id: string;
  actorId: string;
  actorEmail?: string;
  action: string;
  resourceType: string;
  resourceId: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
  ipHash?: string;
}

export interface GlobalStatsDoc {
  totalMembers: number;
  activeMembers: number;
  totalEvents: number;
  totalStories: number;
  totalGalleryPhotos: number;
  totalSocialImpactActivities: number;
  updatedAt: string;
}
