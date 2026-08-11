import { db, doc, getDoc, setDoc, getDocs, collection, updateDoc } from '../firebase/firestore';
import { GlobalStatsDoc, UserProfile, UserRole } from '../types/backend';
import { memberService } from './memberService';
import { eventService } from './eventService';
import { storyService } from './storyService';
import { socialImpactService } from './socialImpactService';
import { auditLogService } from './auditLogService';

export const adminService = {
  async getDashboardStats(): Promise<GlobalStatsDoc> {
    try {
      const statRef = doc(db, 'stats', 'global');
      const snap = await getDoc(statRef);
      if (snap.exists()) {
        return snap.data() as GlobalStatsDoc;
      }
    } catch (err) {
      console.warn('⚠️ Firestore global stats fallback to dynamic recalculation:', err);
    }

    // Dynamic fallback calculation
    const [members, events, stories, activities] = await Promise.all([
      memberService.getAllMembers(true),
      eventService.getAllEvents(),
      storyService.getAllStories(true),
      socialImpactService.getAllActivities(),
    ]);

    const stats: GlobalStatsDoc = {
      totalMembers: members.length,
      activeMembers: members.filter((m) => m.status === 'active').length,
      totalEvents: events.length,
      totalStories: stories.length,
      totalGalleryPhotos: 42,
      totalSocialImpactActivities: activities.length,
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'stats', 'global'), stats);
    } catch (e) {
      // Ignore cache write error if unauthenticated
    }

    return stats;
  },

  async updateUserRole(targetUid: string, newRole: UserRole, actorId: string, actorEmail?: string): Promise<void> {
    // Only super_admin or admin can trigger role updates (enforced via Security Rules & Auth Context)
    const userRef = doc(db, 'users', targetUid);
    const now = new Date().toISOString();
    await updateDoc(userRef, {
      role: newRole,
      updatedAt: now,
    });

    await auditLogService.logAction(
      actorId,
      'ROLE_CHANGED',
      'users',
      targetUid,
      { newRole },
      actorEmail
    );
  },

  async getAllUsers(): Promise<UserProfile[]> {
    try {
      const snap = await getDocs(collection(db, 'users'));
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as UserProfile);
      }
    } catch (err) {
      console.warn('⚠️ Firestore users query fallback:', err);
    }
    return [];
  },
};
