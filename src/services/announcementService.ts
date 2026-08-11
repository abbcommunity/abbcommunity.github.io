import { db, collection, getDocs, doc, setDoc, deleteDoc, query, orderBy } from '../firebase/firestore';
import { AnnouncementDoc } from '../types/backend';
import { auditLogService } from './auditLogService';

const COLLECTION_NAME = 'announcements';

export const announcementService = {
  async getActiveAnnouncements(targetUserRole = 'public'): Promise<AnnouncementDoc[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const all = snap.docs.map((d) => d.data() as AnnouncementDoc);
        const now = new Date().toISOString();
        return all.filter((a) => {
          if (a.expirationDate && a.expirationDate < now) return false;
          if (a.target === 'public') return true;
          if (targetUserRole !== 'public') return true;
          return false;
        });
      }
    } catch (err) {
      console.warn('⚠️ Firestore announcements fallback:', err);
    }

    return [
      {
        id: 'ann-1',
        title: '📢 Pendaftaran Grand Touring Trans Sumatra 2026 Telah Dibuka!',
        message: 'Segera daftarkan diri Anda melalui portal anggota. Kuota terbatas 80 riders.',
        priority: 'important',
        target: 'public',
        createdBy: 'system',
        createdAt: new Date().toISOString(),
      },
    ];
  },

  async createAnnouncement(announcement: Omit<AnnouncementDoc, 'id' | 'createdAt'>, actorId: string): Promise<string> {
    const ref = doc(collection(db, COLLECTION_NAME));
    const data: AnnouncementDoc = {
      ...announcement,
      id: ref.id,
      createdAt: new Date().toISOString(),
    };
    await setDoc(ref, data);
    await auditLogService.logAction(actorId, 'ANNOUNCEMENT_CREATED', 'announcements', ref.id, { title: announcement.title });
    return ref.id;
  },

  async deleteAnnouncement(id: string, actorId: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
    await auditLogService.logAction(actorId, 'ANNOUNCEMENT_DELETED', 'announcements', id);
  },
};
