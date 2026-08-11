import { db, collection, getDocs, doc, setDoc, updateDoc, query, orderBy, where } from '../firebase/firestore';
import { NotificationDoc } from '../types/backend';

export const notificationService = {
  async getUserNotifications(uid: string): Promise<NotificationDoc[]> {
    try {
      const q = query(
        collection(db, 'users', uid, 'notifications'),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as NotificationDoc);
      }
    } catch (err) {
      console.warn(`⚠️ Firestore notifications query fallback for ${uid}:`, err);
    }
    return [];
  },

  async markNotificationAsRead(uid: string, notificationId: string): Promise<void> {
    const ref = doc(db, 'users', uid, 'notifications', notificationId);
    await updateDoc(ref, { read: true });
  },

  async sendNotificationToUser(uid: string, notification: Omit<NotificationDoc, 'id' | 'read' | 'createdAt'>): Promise<string> {
    const ref = doc(collection(db, 'users', uid, 'notifications'));
    const data: NotificationDoc = {
      ...notification,
      id: ref.id,
      read: false,
      createdAt: new Date().toISOString(),
    };
    await setDoc(ref, data);
    return ref.id;
  },
};
