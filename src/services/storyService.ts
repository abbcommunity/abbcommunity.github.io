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
} from '../firebase/firestore';
import { StoryDoc, StoryStatus } from '../types/backend';
import { storiesData } from '../data/stories';
import { auditLogService } from './auditLogService';

const STORIES_COLLECTION = 'stories';

export const storyService = {
  async getAllStories(includeDrafts = false): Promise<StoryDoc[]> {
    try {
      const q = includeDrafts
        ? query(collection(db, STORIES_COLLECTION), orderBy('createdAt', 'desc'))
        : query(
            collection(db, STORIES_COLLECTION),
            where('status', '==', 'published'),
            orderBy('publishedAt', 'desc')
          );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs.map((d) => d.data() as StoryDoc);
      }
    } catch (err) {
      console.warn('⚠️ Firestore stories query fallback to local data:', err);
    }

    return storiesData.map((s) => ({
      id: s.id,
      title: s.title,
      slug: s.slug,
      excerpt: s.excerpt,
      content: s.content,
      coverImageURL: s.coverImage,
      category: s.category.toLowerCase().replace(/\s+/g, '') as any,
      authorId: 'system',
      authorName: s.author.name,
      authorAvatar: s.author.avatar,
      status: 'published',
      featured: s.featured,
      publishedAt: s.publishedAt,
      createdAt: s.publishedAt,
      updatedAt: s.publishedAt,
    }));
  },

  async getStoryBySlug(slug: string): Promise<StoryDoc | null> {
    try {
      const q = query(collection(db, STORIES_COLLECTION), where('slug', '==', slug));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs[0].data() as StoryDoc;
      }
    } catch (err) {
      console.warn(`⚠️ Failed fetching story slug ${slug}:`, err);
    }

    const local = storiesData.find((s) => s.slug === slug);
    if (!local) return null;
    return {
      id: local.id,
      title: local.title,
      slug: local.slug,
      excerpt: local.excerpt,
      content: local.content,
      coverImageURL: local.coverImage,
      category: local.category.toLowerCase() as any,
      authorId: 'system',
      authorName: local.author.name,
      authorAvatar: local.author.avatar,
      status: 'published',
      featured: local.featured,
      publishedAt: local.publishedAt,
      createdAt: local.publishedAt,
      updatedAt: local.publishedAt,
    };
  },

  async createStory(story: Omit<StoryDoc, 'id' | 'createdAt' | 'updatedAt'>, actorId: string): Promise<string> {
    const newRef = doc(collection(db, STORIES_COLLECTION));
    const now = new Date().toISOString();
    const data: StoryDoc = {
      ...story,
      id: newRef.id,
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(newRef, data);
    await auditLogService.logAction(actorId, 'STORY_CREATED', 'stories', newRef.id, { title: story.title });
    return newRef.id;
  },

  async updateStory(id: string, updates: Partial<StoryDoc>, actorId: string): Promise<void> {
    const docRef = doc(db, STORIES_COLLECTION, id);
    const now = new Date().toISOString();
    await updateDoc(docRef, { ...updates, updatedAt: now });
    await auditLogService.logAction(actorId, 'STORY_UPDATED', 'stories', id, updates);
  },

  async changeStoryStatus(id: string, status: StoryStatus, actorId: string): Promise<void> {
    const docRef = doc(db, STORIES_COLLECTION, id);
    const now = new Date().toISOString();
    const updateData: Partial<StoryDoc> = { status, updatedAt: now };
    if (status === 'published') {
      updateData.publishedAt = now;
    }
    await updateDoc(docRef, updateData);
    await auditLogService.logAction(actorId, `STORY_STATUS_${status.toUpperCase()}`, 'stories', id, { status });
  },

  async deleteStory(id: string, actorId: string): Promise<void> {
    const docRef = doc(db, STORIES_COLLECTION, id);
    await deleteDoc(docRef);
    await auditLogService.logAction(actorId, 'STORY_DELETED', 'stories', id);
  },
};
