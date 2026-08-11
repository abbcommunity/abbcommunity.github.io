import {
  db,
  collection,
  doc,
  getDocs,
  setDoc,
  query,
  orderBy,
} from '../firebase/firestore';
import { GalleryDoc, GalleryPhotoDoc } from '../types/backend';
import { galleryData } from '../data/gallery';
import { auditLogService } from './auditLogService';

export const galleryService = {
  async getAllGalleries(): Promise<GalleryDoc[]> {
    try {
      const q = query(collection(db, 'galleries'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as GalleryDoc);
      }
    } catch (err) {
      console.warn('⚠️ Firestore galleries fallback to local data:', err);
    }

    return galleryData.map((g) => ({
      id: g.id,
      title: g.title,
      category: g.category,
      coverImageURL: g.image,
      eventId: g.eventId,
      createdAt: `${g.year}-01-01T00:00:00Z`,
    }));
  },

  async addPhotoToGallery(galleryId: string, photo: Omit<GalleryPhotoDoc, 'id' | 'createdAt'>, actorId: string): Promise<string> {
    const ref = doc(collection(db, 'galleries', galleryId, 'photos'));
    const now = new Date().toISOString();
    const data: GalleryPhotoDoc = {
      ...photo,
      id: ref.id,
      createdAt: now,
    };
    await setDoc(ref, data);
    await auditLogService.logAction(actorId, 'GALLERY_PHOTO_ADDED', 'galleries', galleryId, { photoId: ref.id });
    return ref.id;
  },
};
