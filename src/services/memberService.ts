import {
  db,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
} from '../firebase/firestore';
import { MemberProfile } from '../types/backend';
import { membersData } from '../data/members';
import { auditLogService } from './auditLogService';

const COLLECTION_NAME = 'members';

/**
 * Sanitizes object by removing any properties that have undefined values.
 * Firestore throws an error if undefined values are passed in writeBatch.set() or setDoc().
 */
const sanitizeForFirestore = <T extends Record<string, any>>(obj: T): T => {
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = value;
    }
  }
  return cleaned as T;
};

export const memberService = {
  async getAllMembers(includeMembersOnly = false): Promise<MemberProfile[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy('name', 'asc')
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const docs = snapshot.docs.map((d) => d.data() as MemberProfile);
        if (includeMembersOnly) return docs;
        return docs.filter((m) => m.visibility === 'public');
      }
    } catch (err) {
      console.warn('⚠️ Firestore offline/empty for members, fallback to local data.', err);
    }

    // Fallback to static mock data
    return membersData.map((m) => ({
      id: m.id,
      name: m.name,
      position: m.position,
      chapter: m.chapter,
      joinYear: m.joinYear,
      status: 'active',
      visibility: 'public',
      motorcycle: {
        model: m.motorcycle,
      },
      photoURL: m.photo,
      bio: m.bio,
      social: {
        instagram: m.social?.instagram,
        facebook: m.social?.facebook,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  },

  async getMemberById(id: string): Promise<MemberProfile | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as MemberProfile;
      }
    } catch (err) {
      console.warn(`⚠️ Failed to fetch member ${id} from Firestore:`, err);
    }

    // Fallback search
    const local = membersData.find((m) => m.id === id);
    if (!local) return null;
    return {
      id: local.id,
      name: local.name,
      position: local.position,
      chapter: local.chapter,
      joinYear: local.joinYear,
      status: 'active',
      visibility: 'public',
      motorcycle: { model: local.motorcycle },
      photoURL: local.photo,
      bio: local.bio,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  async createMember(member: Omit<MemberProfile, 'id' | 'createdAt' | 'updatedAt'>, actorId: string): Promise<string> {
    const newRef = doc(collection(db, COLLECTION_NAME));
    const now = new Date().toISOString();
    const data: MemberProfile = {
      ...member,
      id: newRef.id,
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(newRef, sanitizeForFirestore(data));
    await auditLogService.logAction(actorId, 'MEMBER_CREATED', 'members', newRef.id, { name: member.name });
    return newRef.id;
  },

  async bulkImportMembers(
    items: Omit<MemberProfile, 'id' | 'createdAt' | 'updatedAt'>[],
    actorId: string,
    onProgress?: (imported: number, total: number) => void
  ): Promise<number> {
    const now = new Date().toISOString();
    let totalImported = 0;
    const chunkSize = 400;

    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      const batch = writeBatch(db);

      for (const item of chunk) {
        const newRef = doc(collection(db, COLLECTION_NAME));
        const rawData: Record<string, any> = {
          name: item.name || 'Anggota ABB',
          email: item.email || '',
          phone: item.phone || '',
          address: item.address || '',
          nik: item.nik || '',
          position: item.position || 'Anggota',
          chapter: item.chapter || 'Bekasi Chapter',
          joinYear: item.joinYear || 2026,
          status: item.status || 'active',
          visibility: item.visibility || 'public',
          id: newRef.id,
          createdAt: now,
          updatedAt: now,
        };

        if (item.photoURL) {
          rawData.photoURL = item.photoURL;
        }

        batch.set(newRef, sanitizeForFirestore(rawData));
        totalImported++;
      }

      try {
        await batch.commit();
      } catch (err: any) {
        console.error('⚠️ Error committing Firestore batch write:', err);
        const errorMsg = err?.code === 'permission-denied'
          ? 'Izin Firestore ditolak: Silakan login ulang dengan Google SSO terverifikasi.'
          : (err?.message || 'Gagal menyimpan batch ke Firestore');
        throw new Error(errorMsg);
      }

      if (onProgress) {
        onProgress(totalImported, items.length);
      }
    }

    try {
      await auditLogService.logAction(actorId, 'BULK_MEMBERS_IMPORTED', 'members', 'batch', { count: totalImported });
    } catch (e) {}

    return totalImported;
  },

  async bulkDeleteMembers(
    ids: string[],
    actorId: string,
    onProgress?: (deleted: number, total: number) => void
  ): Promise<number> {
    if (!ids || ids.length === 0) return 0;
    
    const chunkSize = 400;
    let totalDeleted = 0;

    for (let i = 0; i < ids.length; i += chunkSize) {
      const chunk = ids.slice(i, i + chunkSize);
      const batch = writeBatch(db);

      for (const id of chunk) {
        const ref = doc(db, COLLECTION_NAME, id);
        batch.delete(ref);
      }

      try {
        await batch.commit();
      } catch (err: any) {
        console.error('⚠️ Error committing Firestore bulk delete:', err);
        const errorMsg = err?.code === 'permission-denied'
          ? 'Izin Firestore ditolak: Silakan login ulang dengan Google SSO terverifikasi.'
          : (err?.message || 'Gagal menghapus batch di Firestore');
        throw new Error(errorMsg);
      }

      totalDeleted += chunk.length;
      if (onProgress) {
        onProgress(totalDeleted, ids.length);
      }
    }

    try {
      await auditLogService.logAction(actorId, 'BULK_MEMBERS_DELETED', 'members', 'batch', { count: totalDeleted, deletedIds: ids });
    } catch (err) {
      console.warn('Audit log notice during bulk delete:', err);
    }

    return totalDeleted;
  },

  async updateMember(id: string, updates: Partial<MemberProfile>, actorId: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    const now = new Date().toISOString();
    await updateDoc(docRef, sanitizeForFirestore({
      ...updates,
      updatedAt: now,
    }));
    await auditLogService.logAction(actorId, 'MEMBER_UPDATED', 'members', id, updates);
  },

  async deleteMember(id: string, actorId: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
    await auditLogService.logAction(actorId, 'MEMBER_DELETED', 'members', id);
  },
};
