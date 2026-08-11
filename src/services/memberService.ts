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

const normalizeNikKey = (nikStr?: string | null): string => {
  if (!nikStr) return '';
  return nikStr.trim().replace(/^['"]+/, '').replace(/['"]+$/, '').toUpperCase();
};

export const memberService = {
  async getAllMembers(includePrivate = false): Promise<MemberProfile[]> {
    let firestoreDocs: MemberProfile[] = [];
    try {
      const colRef = collection(db, COLLECTION_NAME);
      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 4500));
      const snap = await Promise.race([getDocs(colRef), timeoutPromise]).catch(() => null);
      if (snap && typeof snap === 'object' && 'docs' in snap && snap.docs && snap.docs.length > 0) {
        firestoreDocs = snap.docs.map((d) => d.data() as MemberProfile);
      }
    } catch (err) {
      console.warn('⚠️ Firestore fetch notice:', err);
    }

    const localDocs = getLocalCustomMembers();
    const isCleared = typeof window !== 'undefined' && localStorage.getItem('abb_members_cleared') === 'true';

    // If real records exist in LocalStorage or Firestore, render ONLY real database records
    const hasRealDatabaseRecords = localDocs.length > 0 || firestoreDocs.length > 0;
    const finalNikMap = new Map<string, MemberProfile>();

    if (hasRealDatabaseRecords) {
      // Use EXCLUSIVELY real imported / registered members from Local Storage & Firestore
      localDocs.concat(firestoreDocs).forEach((doc) => {
        if (doc && doc.name) {
          const nikKey = normalizeNikKey(doc.nik);
          const nameKey = doc.name.trim().toLowerCase();
          const key = nikKey || nameKey || doc.id;
          if (key) {
            finalNikMap.set(key, doc);
          }
        }
      });
    } else if (!isCleared) {
      // Fall back to initial starter seed membersData ONLY if no database records exist
      membersData.forEach((m, idx) => {
        const nikStr = m.nik || `ABB${String(idx + 1).padStart(3, '0')}`;
        const nikKey = normalizeNikKey(nikStr);
        finalNikMap.set(nikKey, {
          id: m.id || `m_${idx + 1}`,
          name: m.name,
          nik: nikStr,
          position: m.position || 'Anggota',
          chapter: m.chapter || 'Bekasi Chapter',
          joinYear: m.joinYear || 2026,
          status: 'active',
          visibility: 'public',
          motorcycle: { model: m.motorcycle || 'Honda ADV 160 Custom' },
          photoURL: m.photo,
          bio: m.bio || '',
          createdAt: '2026-08-11T00:00:00.000Z',
          updatedAt: '2026-08-11T00:00:00.000Z',
        });
      });
    }

    // Auto-sync local members to Cloud Firestore in background if missing from Firestore
    if (localDocs.length > 0) {
      setTimeout(() => {
        localDocs.forEach(async (ldoc) => {
          if (ldoc && ldoc.id) {
            try {
              const docRef = doc(db, COLLECTION_NAME, ldoc.id);
              await setDoc(docRef, sanitizeForFirestore(ldoc), { merge: true });
            } catch (e) {}
          }
        });
      }, 500);
    }

    const combined: MemberProfile[] = Array.from(finalNikMap.values());

    // Helper to extract numeric value from NIK string (e.g., 'ABB001' -> 1, 'ABB082' -> 82)
    const extractNikNumber = (nikStr?: string | null): number => {
      if (!nikStr) return 999999;
      const cleaned = nikStr.trim().replace(/^['"]+/, '').replace(/['"]+$/, '');
      const match = cleaned.match(/\d+/);
      return match ? parseInt(match[0], 10) : 999999;
    };

    // Sort numerically by NIK starting from ABB001 upwards
    combined.sort((a, b) => {
      const numA = extractNikNumber(a.nik);
      const numB = extractNikNumber(b.nik);
      if (numA !== numB) return numA - numB;
      return (a.name || '').localeCompare(b.name || '');
    });

    return combined;
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

    const localDocs = getLocalCustomMembers();
    const foundLocal = localDocs.find((m) => m.id === id);
    if (foundLocal) return foundLocal;

    const local = membersData.find((m) => m.id === id);
    if (!local) return null;
    return {
      id: local.id,
      name: local.name,
      nik: local.nik || 'ABB001',
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

    const existing = getLocalCustomMembers();
    saveLocalCustomMembers([...existing, data]);

    const firestoreSync = setDoc(newRef, sanitizeForFirestore(data))
      .then(async () => {
        await auditLogService.logAction(actorId, 'MEMBER_CREATED', 'members', newRef.id, { name: member.name }).catch(() => null);
      })
      .catch(() => null);

    const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 3500));
    await Promise.race([firestoreSync, timeoutPromise]);

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

      try {
        const commitPromise = batch.commit();
        const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve('TIMEOUT'), 2500));
        await Promise.race([commitPromise, timeoutPromise]);
      } catch (err: any) {
        console.warn('⚠️ Firestore batch commit note:', err);
      }

      if (onProgress) {
        onProgress(totalImported, items.length);
      }

      await new Promise((r) => setTimeout(r, 20));
    }

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

    // Purge local storage IMMEDIATELY by ID & Normalized NIK
    const existing = getLocalCustomMembers();
    const normalizedTargetKeys = ids.map((i) => normalizeNikKey(i) || i);
    const updatedLocal = existing.filter((m) => {
      const isIdMatch = ids.includes(m.id);
      const isNikMatch = m.nik && normalizedTargetKeys.includes(normalizeNikKey(m.nik));
      return !isIdMatch && !isNikMatch;
    });
    saveLocalCustomMembers(updatedLocal);
    if (updatedLocal.length === 0) {
      try {
        localStorage.setItem('abb_members_cleared', 'true');
      } catch (e) {}
    } else {
      try {
        localStorage.removeItem('abb_members_cleared');
      } catch (e) {}
    }
    
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
        const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve('TIMEOUT'), 1500));
        await Promise.race([commitPromise, timeoutPromise]);
      } catch (err: any) {
        console.warn('⚠️ Bulk delete batch commit note:', err);
      }

      totalDeleted += chunk.length;
      if (onProgress) {
        onProgress(totalDeleted, ids.length);
      }

      await new Promise((r) => setTimeout(r, 10));
    }

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

    const existing = getLocalCustomMembers();
    const targetNikKey = updates.nik ? normalizeNikKey(updates.nik) : normalizeNikKey(id);

    let found = false;
    const updatedLocal = existing.map((m) => {
      const isIdMatch = m.id === id;
      const isNikMatch = targetNikKey && m.nik && normalizeNikKey(m.nik) === targetNikKey;
      if (isIdMatch || isNikMatch) {
        found = true;
        return { ...m, ...updatedFields, id: m.id || id };
      }
      return m;
    });

    if (!found) {
      updatedLocal.push({
        id: id,
        name: updates.name || 'Anggota ABB',
        email: updates.email || '',
        phone: updates.phone || '',
        address: updates.address || '',
        nik: updates.nik || '',
        position: updates.position || 'Anggota',
        chapter: updates.chapter || 'Bekasi Chapter',
        joinYear: updates.joinYear || 2026,
        status: updates.status || 'active',
        visibility: updates.visibility || 'public',
        createdAt: now,
        ...updatedFields,
      });
    }

    // Save to Local Storage INSTANTLY (< 1ms)
    saveLocalCustomMembers(updatedLocal);

    // Sync to Firestore in background with max 1s timeout (non-blocking)
    const docRef = doc(db, COLLECTION_NAME, id);
    const firestoreSync = updateDoc(docRef, updatedFields)
      .catch(async () => {
        await setDoc(docRef, sanitizeForFirestore({ ...updatedFields, id })).catch(() => null);
      })
      .then(async () => {
        await auditLogService.logAction(actorId, 'MEMBER_UPDATED', 'members', id, updates).catch(() => null);
      })
      .catch(() => null);

    const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 3500));
    await Promise.race([firestoreSync, timeoutPromise]);
  },

  async deleteMember(id: string, actorId: string): Promise<void> {
    const existing = getLocalCustomMembers();
    const targetNikKey = normalizeNikKey(id);
    saveLocalCustomMembers(
      existing.filter((m) => m.id !== id && (targetNikKey ? normalizeNikKey(m.nik) !== targetNikKey : true))
    );

    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
      await auditLogService.logAction(actorId, 'MEMBER_DELETED', 'members', id);
    } catch (err) {
      console.warn('⚠️ Firestore delete member background sync note:', err);
    }
  },
};
