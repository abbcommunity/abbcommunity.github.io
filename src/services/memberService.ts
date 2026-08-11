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
    await setDoc(newRef, data);
    await auditLogService.logAction(actorId, 'MEMBER_CREATED', 'members', newRef.id, { name: member.name });
    return newRef.id;
  },

  async bulkImportMembers(
    items: Omit<MemberProfile, 'id' | 'createdAt' | 'updatedAt'>[],
    actorId: string
  ): Promise<number> {
    const now = new Date().toISOString();
    const batch = writeBatch(db);
    let count = 0;

    for (const item of items) {
      const newRef = doc(collection(db, COLLECTION_NAME));
      const data: MemberProfile = {
        ...item,
        id: newRef.id,
        createdAt: now,
        updatedAt: now,
      };
      batch.set(newRef, data);
      count++;
    }

    await batch.commit();
    await auditLogService.logAction(actorId, 'BULK_MEMBERS_IMPORTED', 'members', 'batch', { count });
    return count;
  },

  async bulkDeleteMembers(ids: string[], actorId: string): Promise<number> {
    const batch = writeBatch(db);
    let count = 0;

    for (const id of ids) {
      const ref = doc(db, COLLECTION_NAME, id);
      batch.delete(ref);
      count++;
    }

    await batch.commit();
    await auditLogService.logAction(actorId, 'BULK_MEMBERS_DELETED', 'members', 'batch', { count, deletedIds: ids });
    return count;
  },

  async updateMember(id: string, updates: Partial<MemberProfile>, actorId: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    const now = new Date().toISOString();
    await updateDoc(docRef, {
      ...updates,
      updatedAt: now,
    });
    await auditLogService.logAction(actorId, 'MEMBER_UPDATED', 'members', id, updates);
  },

  async deleteMember(id: string, actorId: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
    await auditLogService.logAction(actorId, 'MEMBER_DELETED', 'members', id);
  },
};
