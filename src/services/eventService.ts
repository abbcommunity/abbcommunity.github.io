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
  runTransaction,
} from '../firebase/firestore';
import { EventDoc, EventRegistrationDoc, EventAttendanceDoc } from '../types/backend';
import { eventsData } from '../data/events';
import { auditLogService } from './auditLogService';

const EVENTS_COLLECTION = 'events';

export const eventService = {
  async getAllEvents(): Promise<EventDoc[]> {
    try {
      const q = query(collection(db, EVENTS_COLLECTION), orderBy('startAt', 'desc'));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs.map((d) => d.data() as EventDoc);
      }
    } catch (err) {
      console.warn('⚠️ Firestore events query fallback to local mock data:', err);
    }

    return eventsData.map((e) => ({
      id: e.id,
      title: e.title,
      slug: e.id,
      description: e.description,
      category: e.category.toLowerCase().replace(/\s+/g, '') as any,
      coverImageURL: e.coverImage,
      startAt: e.date,
      location: { name: e.location, latitude: e.coordinates?.[0], longitude: e.coordinates?.[1] },
      capacity: 100,
      registeredCount: e.participantsCount,
      registrationRequired: true,
      registrationOpen: e.status === 'upcoming',
      status: e.status,
      createdBy: 'system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  },

  async getEventById(id: string): Promise<EventDoc | null> {
    try {
      const docRef = doc(db, EVENTS_COLLECTION, id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as EventDoc;
      }
    } catch (err) {
      console.warn(`⚠️ Failed fetching event ${id}:`, err);
    }

    const local = eventsData.find((e) => e.id === id);
    if (!local) return null;
    return {
      id: local.id,
      title: local.title,
      slug: local.id,
      description: local.description,
      category: local.category.toLowerCase() as any,
      coverImageURL: local.coverImage,
      startAt: local.date,
      location: { name: local.location, latitude: local.coordinates?.[0], longitude: local.coordinates?.[1] },
      capacity: 100,
      registeredCount: local.participantsCount,
      registrationRequired: true,
      registrationOpen: local.status === 'upcoming',
      status: local.status,
      createdBy: 'system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  async createEvent(event: Omit<EventDoc, 'id' | 'createdAt' | 'updatedAt' | 'registeredCount'>, actorId: string): Promise<string> {
    const newRef = doc(collection(db, EVENTS_COLLECTION));
    const now = new Date().toISOString();
    const data: EventDoc = {
      ...event,
      id: newRef.id,
      registeredCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(newRef, data);
    await auditLogService.logAction(actorId, 'EVENT_CREATED', 'events', newRef.id, { title: event.title });
    return newRef.id;
  },

  async updateEvent(id: string, updates: Partial<EventDoc>, actorId: string): Promise<void> {
    const docRef = doc(db, EVENTS_COLLECTION, id);
    const now = new Date().toISOString();
    await updateDoc(docRef, { ...updates, updatedAt: now });
    await auditLogService.logAction(actorId, 'EVENT_UPDATED', 'events', id, updates);
  },

  /**
   * Atomic Event Registration using Firestore Transaction (Section 14 & 47)
   */
  async registerUserForEvent(eventId: string, uid: string, userName: string, userEmail: string): Promise<void> {
    const eventRef = doc(db, EVENTS_COLLECTION, eventId);
    const regRef = doc(db, EVENTS_COLLECTION, eventId, 'registrations', uid);

    await runTransaction(db, async (transaction) => {
      const eventSnap = await transaction.get(eventRef);
      if (!eventSnap.exists()) {
        throw new Error('Event tidak ditemukan.');
      }
      const eventData = eventSnap.data() as EventDoc;

      if (!eventData.registrationOpen || eventData.status !== 'published') {
        throw new Error('Pendaftaran untuk event ini sedang ditutup.');
      }

      if (eventData.capacity && eventData.registeredCount >= eventData.capacity) {
        throw new Error('Kapasitas peserta untuk event ini sudah penuh.');
      }

      const regSnap = await transaction.get(regRef);
      if (regSnap.exists()) {
        throw new Error('Anda sudah terdaftar dalam event ini.');
      }

      const now = new Date().toISOString();
      const registrationData: EventRegistrationDoc = {
        uid,
        eventId,
        userName,
        userEmail,
        status: 'registered',
        registeredAt: now,
        updatedAt: now,
      };

      transaction.set(regRef, registrationData);
      transaction.update(eventRef, {
        registeredCount: (eventData.registeredCount || 0) + 1,
        updatedAt: now,
      });
    });

    await auditLogService.logAction(uid, 'REGISTRATION_CREATED', 'events', eventId, { uid, userName });
  },

  /**
   * QR Check-in Attendance verification (Section 15 & 16)
   */
  async recordQRCheckIn(eventId: string, targetUid: string, actorId: string): Promise<void> {
    const regRef = doc(db, EVENTS_COLLECTION, eventId, 'registrations', targetUid);
    const regSnap = await getDoc(regRef);
    if (!regSnap.exists()) {
      throw new Error('Registrasi tidak ditemukan untuk peserta ini.');
    }

    const attendanceRef = doc(db, EVENTS_COLLECTION, eventId, 'attendance', targetUid);
    const now = new Date().toISOString();

    const attendanceData: EventAttendanceDoc = {
      uid: targetUid,
      eventId,
      status: 'present',
      checkedInAt: now,
      checkedInBy: actorId,
    };

    await setDoc(attendanceRef, attendanceData);
    await updateDoc(regRef, { status: 'attended', updatedAt: now });

    await auditLogService.logAction(actorId, 'ATTENDANCE_RECORDED', 'events', eventId, { targetUid });
  },
};
