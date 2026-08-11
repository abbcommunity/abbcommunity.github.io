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
  orderBy,
} from '../firebase/firestore';
import { MotorcycleDoc } from '../types/backend';
import { garageData } from '../data/garage';
import { auditLogService } from './auditLogService';

const COLLECTION_NAME = 'garage';

export const garageService = {
  async getAllMotorcycles(): Promise<MotorcycleDoc[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as MotorcycleDoc);
      }
    } catch (err) {
      console.warn('⚠️ Firestore garage query fallback:', err);
    }

    return garageData.map((b) => ({
      id: b.id,
      ownerId: b.ownerId,
      ownerName: b.ownerName,
      brand: b.brand,
      model: b.model,
      year: b.year,
      engineCapacity: b.engineCapacity,
      modifications: b.modifications,
      story: b.story,
      coverImageURL: b.image,
      visibility: 'public',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  },

  async addMotorcycle(bike: Omit<MotorcycleDoc, 'id' | 'createdAt' | 'updatedAt'>, actorId: string): Promise<string> {
    const newRef = doc(collection(db, COLLECTION_NAME));
    const now = new Date().toISOString();
    const data: MotorcycleDoc = {
      ...bike,
      id: newRef.id,
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(newRef, data);
    await auditLogService.logAction(actorId, 'MOTORCYCLE_ADDED', 'garage', newRef.id, { model: bike.model });
    return newRef.id;
  },

  async updateMotorcycle(id: string, updates: Partial<MotorcycleDoc>, actorId: string): Promise<void> {
    const ref = doc(db, COLLECTION_NAME, id);
    const now = new Date().toISOString();
    await updateDoc(ref, { ...updates, updatedAt: now });
    await auditLogService.logAction(actorId, 'MOTORCYCLE_UPDATED', 'garage', id, updates);
  },

  async deleteMotorcycle(id: string, actorId: string): Promise<void> {
    const ref = doc(db, COLLECTION_NAME, id);
    await deleteDoc(ref);
    await auditLogService.logAction(actorId, 'MOTORCYCLE_DELETED', 'garage', id);
  },
};
