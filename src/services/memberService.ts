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
const LOCAL_STORAGE_KEY = 'abb_members_custom_v1';

const getLocalCustomMembers = (): MemberProfile[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

const saveLocalCustomMembers = (docs: MemberProfile[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(docs));
  } catch (e) {}
};

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
    let firestoreDocs: MemberProfile[] = [];
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy('name', 'asc')
      );
      // Timeout promise wrapper (2.5s max) to prevent indefinite hanging
      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500));
      const snap = await Promise.race([getDocs(q), timeoutPromise]);
      
      if (snap && 'docs' in snap) {
        firestoreDocs = snap.docs.map((d) => d.data() as MemberProfile);
      }
    } catch (err) {
      console.warn('⚠️ Firestore fetch notice:', err);
    }

    const localDocs = getLocalCustomMembers();
    const combinedMap = new Map<string, MemberProfile>();

    // Merge firestore docs
    firestoreDocs.forEach((doc) => combinedMap.set(doc.id, doc));
    // Merge local docs
    localDocs.forEach((doc) => combinedMap.set(doc.id, doc));

    const combined = Array.from(combinedMap.values());

    if (includeMembersOnly) return combined;
    return combined.filter((m) => m.visibility === 'public');
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

    // Local storage check
    const localDocs = getLocalCustomMembers();
    const foundLocal = localDocs.find((m) => m.id === id);
    if (foundLocal) return foundLocal;

    // Static fallback check
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

    // Save to local storage cache immediately
    const existing = getLocalCustomMembers();
    saveLocalCustomMembers([...existing, data]);

    // Save to Firestore in background
    try {
      await setDoc(newRef, sanitizeForFirestore(data));
      await auditLogService.logAction(actorId, 'MEMBER_CREATED', 'members', newRef.id, { name: member.name });
    } catch (err) {
      console.warn('⚠️ Firestore create member background sync note:', err);
    }

    return newRef.id;
  },

  async bulkImportMembers(
    items: Omit<MemberProfile, 'id' | 'createdAt' | 'updatedAt'>[],
    actorId: string,
    onProgress?: (imported: number, total: number) => void
  ): Promise<number> {
    const now = new Date().toISOString();
    let totalImported = 0;
    const chunkSize = 15;
    const newMembersToCache: MemberProfile[] = [];

    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      const batch = writeBatch(db);

      for (const item of chunk) {
        const docId = 'mem_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
        const rawData: MemberProfile = {
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
          id: docId,
          photoURL: item.photoURL || '',
          createdAt: now,
          updatedAt: now,
        };

        const newRef = doc(db, COLLECTION_NAME, docId);
        batch.set(newRef, sanitizeForFirestore(rawData));
        newMembersToCache.push(rawData);
        totalImported++;
      }

      // Try batch.commit() with 2.5s Timeout per chunk to prevent hanging
      try {
        const commitPromise = batch.commit();
        const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve('TIMEOUT'), 2500));
        const res = await Promise.race([commitPromise, timeoutPromise]);
        if (res === 'TIMEOUT') {
          console.warn('⚠️ Firestore batch commit timeout, proceeding with local cache persistence.');
        }
      } catch (err: any) {
        console.warn('⚠️ Firestore batch commit note:', err);
      }

      if (onProgress) {
        onProgress(totalImported, items.length);
      }

      // Short delay for smooth UI ticker update
      await new Promise((r) => setTimeout(r, 20));
    }

    // Persist to local cache so data is ALWAYS saved instantly
    const existing = getLocalCustomMembers();
    saveLocalCustomMembers([...existing, ...newMembersToCache]);

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
    
    const chunkSize = 15;
    let totalDeleted = 0;

    for (let i = 0; i < ids.length; i += chunkSize) {
      const chunk = ids.slice(i, i + chunkSize);
      const batch = writeBatch(db);

      for (const id of chunk) {
        const ref = doc(db, COLLECTION_NAME, id);
        batch.delete(ref);
      }

      try {
        const commitPromise = batch.commit();
        const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve('TIMEOUT'), 2500));
        await Promise.race([commitPromise, timeoutPromise]);
      } catch (err: any) {
        console.warn('⚠️ Bulk delete batch commit note:', err);
      }

      totalDeleted += chunk.length;
      if (onProgress) {
        onProgress(totalDeleted, ids.length);
      }

      await new Promise((r) => setTimeout(r, 20));
    }

    // Update local cache
    const existing = getLocalCustomMembers();
    const updatedLocal = existing.filter((m) => !ids.includes(m.id));
    saveLocalCustomMembers(updatedLocal);

    try {
      await auditLogService.logAction(actorId, 'BULK_MEMBERS_DELETED', 'members', 'batch', { count: totalDeleted, deletedIds: ids });
    } catch (err) {
      console.warn('Audit log notice during bulk delete:', err);
    }

    return totalDeleted;
  },

  async updateMember(id: string, updates: Partial<MemberProfile>, actorId: string): Promise<void> {
    const now = new Date().toISOString();
    const updatedFields = sanitizeForFirestore({
      ...updates,
      updatedAt: now,
    });

    // Update local storage
    const existing = getLocalCustomMembers();
    const updatedLocal = existing.map((m) => (m.id === id ? { ...m, ...updatedFields } : m));
    saveLocalCustomMembers(updatedLocal);

    // Update Firestore in background
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, updatedFields);
      await auditLogService.logAction(actorId, 'MEMBER_UPDATED', 'members', id, updates);
    } catch (err) {
      console.warn('⚠️ Firestore update member background sync note:', err);
    }
  },

  async deleteMember(id: string, actorId: string): Promise<void> {
    // Remove from local storage
    const existing = getLocalCustomMembers();
    saveLocalCustomMembers(existing.filter((m) => m.id !== id));

    // Remove from Firestore in background
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
      await auditLogService.logAction(actorId, 'MEMBER_DELETED', 'members', id);
    } catch (err) {
      console.warn('⚠️ Firestore delete member background sync note:', err);
    }
  },
};
