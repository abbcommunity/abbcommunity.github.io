import { db, collection, getDocs, doc, setDoc, deleteDoc, query, orderBy } from '../firebase/firestore';
import { DocumentMetaDoc } from '../types/backend';
import { documentsData } from '../data/documents';
import { auditLogService } from './auditLogService';

const COLLECTION_NAME = 'documents';

export const documentService = {
  async getAllDocuments(includePrivate = false): Promise<DocumentMetaDoc[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('updatedAt', 'desc'));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const docs = snap.docs.map((d) => d.data() as DocumentMetaDoc);
        if (includePrivate) return docs;
        return docs.filter((d) => d.visibility === 'public');
      }
    } catch (err) {
      console.warn('⚠️ Firestore documents fallback:', err);
    }

    return documentsData.map((d) => ({
      id: d.id,
      title: d.title,
      description: d.description,
      category: d.category.toLowerCase().replace(/[^a-z]/g, '_') as any,
      storagePath: `documents/${d.id}/${d.title}.pdf`,
      fileURL: d.downloadUrl,
      fileSize: d.fileSize,
      fileType: d.fileType,
      visibility: 'public',
      uploadedBy: 'system',
      createdAt: d.updatedAt,
      updatedAt: d.updatedAt,
    }));
  },

  async uploadDocumentMetadata(meta: Omit<DocumentMetaDoc, 'id' | 'createdAt' | 'updatedAt'>, actorId: string): Promise<string> {
    const ref = doc(collection(db, COLLECTION_NAME));
    const now = new Date().toISOString();
    const data: DocumentMetaDoc = {
      ...meta,
      id: ref.id,
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(ref, data);
    await auditLogService.logAction(actorId, 'DOCUMENT_UPLOADED', 'documents', ref.id, { title: meta.title });
    return ref.id;
  },

  async deleteDocument(id: string, actorId: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
    await auditLogService.logAction(actorId, 'DOCUMENT_DELETED', 'documents', id);
  },
};
