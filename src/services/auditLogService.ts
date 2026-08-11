import { db, collection, doc, setDoc, serverTimestamp, getDocs, query, orderBy, limit } from '../firebase/firestore';
import { AuditLogDoc } from '../types/backend';

export const auditLogService = {
  async logAction(
    actorId: string,
    action: string,
    resourceType: string,
    resourceId: string,
    metadata?: Record<string, unknown>,
    actorEmail?: string
  ): Promise<void> {
    try {
      const logRef = doc(collection(db, 'auditLogs'));
      const logData: Partial<AuditLogDoc> = {
        id: logRef.id,
        actorId,
        actorEmail: actorEmail || 'system',
        action,
        resourceType,
        resourceId,
        metadata: metadata || {},
        timestamp: new Date().toISOString(),
      };
      
      // Non-blocking write with 1s timeout so audit logging NEVER blocks business operations
      const writePromise = setDoc(logRef, {
        ...logData,
        createdAtServer: serverTimestamp(),
      });
      const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 1000));
      await Promise.race([writePromise, timeoutPromise]).catch(() => {});
    } catch (error) {
      console.warn('⚠️ Gagal mencatat audit log:', error);
    }
  },

  async getRecentLogs(limitCount = 50): Promise<AuditLogDoc[]> {
    try {
      const q = query(collection(db, 'auditLogs'), orderBy('createdAtServer', 'desc'), limit(limitCount));
      const snap = await getDocs(q);
      return snap.docs.map((docSnap) => docSnap.data() as AuditLogDoc);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    }
  },
};
