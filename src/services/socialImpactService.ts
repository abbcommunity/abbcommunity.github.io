import { db, collection, getDocs, doc, setDoc, query, orderBy } from '../firebase/firestore';
import { SocialImpactDoc } from '../types/backend';
import { socialImpactData } from '../data/socialImpact';
import { auditLogService } from './auditLogService';

export const socialImpactService = {
  async getAllActivities(): Promise<SocialImpactDoc[]> {
    try {
      const q = query(collection(db, 'socialImpact'), orderBy('date', 'desc'));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as SocialImpactDoc);
      }
    } catch (err) {
      console.warn('⚠️ Firestore socialImpact query fallback:', err);
    }

    return socialImpactData.map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      category: 'charity',
      date: s.date,
      location: s.location,
      beneficiaryCount: s.beneficiariesCount,
      coverImageURL: s.coverImage,
      status: 'published',
      createdBy: 'system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  },

  async createActivity(activity: Omit<SocialImpactDoc, 'id' | 'createdAt' | 'updatedAt'>, actorId: string): Promise<string> {
    const ref = doc(collection(db, 'socialImpact'));
    const now = new Date().toISOString();
    const data: SocialImpactDoc = {
      ...activity,
      id: ref.id,
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(ref, data);
    await auditLogService.logAction(actorId, 'SOCIAL_IMPACT_CREATED', 'socialImpact', ref.id, { title: activity.title });
    return ref.id;
  },
};
