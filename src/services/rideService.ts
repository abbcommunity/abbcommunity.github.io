import { db, collection, getDocs, doc, setDoc, query, orderBy } from '../firebase/firestore';
import { RideDoc } from '../types/backend';
import { ridesData } from '../data/rides';
import { auditLogService } from './auditLogService';

export const rideService = {
  async getAllRides(): Promise<RideDoc[]> {
    try {
      const q = query(collection(db, 'rides'), orderBy('startAt', 'desc'));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as RideDoc);
      }
    } catch (err) {
      console.warn('⚠️ Firestore rides query fallback:', err);
    }

    return ridesData.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.story,
      destination: r.endPoint,
      startAt: r.date,
      distanceKm: r.distanceKm,
      durationMinutes: r.durationHours * 60,
      route: r.coordinates.map(([lat, lng]: [number, number]) => ({ latitude: lat, longitude: lng })),
      coverImageURL: r.coverImage,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  },

  async createRide(ride: Omit<RideDoc, 'id' | 'createdAt' | 'updatedAt'>, actorId: string): Promise<string> {
    const ref = doc(collection(db, 'rides'));
    const now = new Date().toISOString();
    const data: RideDoc = {
      ...ride,
      id: ref.id,
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(ref, data);
    await auditLogService.logAction(actorId, 'RIDE_CREATED', 'rides', ref.id, { title: ride.title });
    return ref.id;
  },
};
