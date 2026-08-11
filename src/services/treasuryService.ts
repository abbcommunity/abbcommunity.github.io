import { collection, doc, getDocs, setDoc } from 'firebase/firestore';
import * as XLSX from 'xlsx';
import { db } from '../firebase/config';
import { KasBillingRecord, KasSummaryMetrics } from '../types/backend';
import { auditLogService } from './auditLogService';
import { memberService } from './memberService';

const COLLECTION_NAME = 'kas_billings';
const LOCAL_STORAGE_KEY = 'abb_kas_billing_v1';
export const DEFAULT_KAS_AMOUNT = 20000; // Rp 20.000 / bulan

const getLocalKasRecords = (): KasBillingRecord[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

const saveLocalKasRecords = (records: KasBillingRecord[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));
  } catch (e) {}
};

export const treasuryService = {
  async getMonthlyInvoices(periodMonth: string): Promise<KasBillingRecord[]> {
    let firestoreDocs: KasBillingRecord[] = [];
    try {
      const colRef = collection(db, COLLECTION_NAME);
      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3500));
      const snap = await Promise.race([getDocs(colRef), timeoutPromise]).catch(() => null);
      if (snap && typeof snap === 'object' && 'docs' in snap && snap.docs) {
        firestoreDocs = snap.docs
          .map((d) => d.data() as KasBillingRecord)
          .filter((d) => d.periodMonth === periodMonth);
      }
    } catch (e) {
      console.warn('⚠️ Firestore treasury fetch notice:', e);
    }

    const localDocs = getLocalKasRecords().filter((d) => d.periodMonth === periodMonth);
    const map = new Map<string, KasBillingRecord>();

    localDocs.concat(firestoreDocs).forEach((rec) => {
      if (rec && rec.id) {
        map.set(rec.id, rec);
      }
    });

    return Array.from(map.values());
  },

  async getAllInvoices(): Promise<KasBillingRecord[]> {
    let firestoreDocs: KasBillingRecord[] = [];
    try {
      const colRef = collection(db, COLLECTION_NAME);
      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000));
      const snap = await Promise.race([getDocs(colRef), timeoutPromise]).catch(() => null);
      if (snap && typeof snap === 'object' && 'docs' in snap && snap.docs) {
        firestoreDocs = snap.docs.map((d) => d.data() as KasBillingRecord);
      }
    } catch (e) {}

    const localDocs = getLocalKasRecords();
    const map = new Map<string, KasBillingRecord>();

    localDocs.concat(firestoreDocs).forEach((rec) => {
      if (rec && rec.id) {
        map.set(rec.id, rec);
      }
    });

    return Array.from(map.values());
  },

  async generateMonthlyInvoices(periodMonth: string, actorId: string): Promise<{ createdCount: number; totalCount: number }> {
    const activeMembers = await memberService.getAllMembers();
    const existing = await this.getAllInvoices();
    const periodYear = parseInt(periodMonth.split('-')[0], 10) || new Date().getFullYear();
    const now = new Date().toISOString();

    let createdCount = 0;
    const newRecords: KasBillingRecord[] = [];
    const localRecords = getLocalKasRecords();

    for (const member of activeMembers) {
      if (member.status === 'inactive') continue;

      const recordId = `kas_${periodMonth}_${member.id}`;
      const exists = existing.some((r) => r.id === recordId || (r.periodMonth === periodMonth && r.memberId === member.id));

      if (!exists) {
        const record: KasBillingRecord = {
          id: recordId,
          memberId: member.id,
          memberName: member.name,
          memberNik: member.nik || '-',
          memberPhone: member.phone || '',
          periodMonth,
          periodYear,
          amount: DEFAULT_KAS_AMOUNT,
          status: 'pending',
          createdAt: now,
          updatedAt: now,
        };

        newRecords.push(record);
        createdCount++;
      }
    }

    if (newRecords.length > 0) {
      const updatedLocal = [...localRecords, ...newRecords];
      saveLocalKasRecords(updatedLocal);

      // Async Firestore commit
      setTimeout(() => {
        newRecords.forEach(async (rec) => {
          try {
            const docRef = doc(db, COLLECTION_NAME, rec.id);
            await setDoc(docRef, rec, { merge: true });
          } catch (e) {}
        });
      }, 100);

      try {
        await auditLogService.logAction(actorId, 'KAS_INVOICES_GENERATED', 'kas_billings', periodMonth, {
          periodMonth,
          createdCount,
          totalAmount: createdCount * DEFAULT_KAS_AMOUNT,
        });
      } catch (e) {}
    }

    return { createdCount, totalCount: activeMembers.length };
  },

  async updatePaymentRecord(id: string, updates: Partial<KasBillingRecord>, actorId: string): Promise<void> {
    const now = new Date().toISOString();
    const rawFields: Record<string, any> = {
      ...updates,
      updatedAt: now,
    };

    // Clean undefined fields to prevent Firestore & LocalStorage serialization errors
    const cleanFields: Record<string, any> = {};
    Object.keys(rawFields).forEach((key) => {
      const val = rawFields[key];
      cleanFields[key] = val === undefined ? '' : val;
    });

    const existing = getLocalKasRecords();
    let found = false;

    const updatedLocal = existing.map((rec) => {
      if (rec.id === id) {
        found = true;
        return { ...rec, ...cleanFields };
      }
      return rec;
    });

    if (!found && updates.memberId && updates.periodMonth) {
      updatedLocal.push({
        id,
        memberId: updates.memberId,
        memberName: updates.memberName || 'Anggota',
        memberNik: updates.memberNik || '-',
        periodMonth: updates.periodMonth,
        periodYear: parseInt(updates.periodMonth.split('-')[0], 10) || new Date().getFullYear(),
        amount: updates.amount || DEFAULT_KAS_AMOUNT,
        status: updates.status || 'pending',
        createdAt: now,
        ...cleanFields,
      } as KasBillingRecord);
    }

    saveLocalKasRecords(updatedLocal);

    // Sync to Firestore
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await setDoc(docRef, cleanFields, { merge: true });
      await auditLogService.logAction(actorId, 'KAS_PAYMENT_UPDATED', 'kas_billings', id, cleanFields);
    } catch (e) {
      console.warn('⚠️ Firestore update kas notice:', e);
    }
  },

  // 1. Pemutihan Single Tagihan Anggota
  async waiveSingleInvoice(id: string, reasonNote: string, actorId: string): Promise<void> {
    await this.updatePaymentRecord(
      id,
      {
        status: 'waived',
        notes: `[PEMUTIHAN KAS] ${reasonNote || 'Hasil Kesepakatan Komunitas'}`,
      },
      actorId
    );
  },

  // 2. Pemutihan Multiple Tagihan Anggota (Bulk Select)
  async waiveMultipleInvoices(ids: string[], reasonNote: string, actorId: string): Promise<number> {
    if (!ids || ids.length === 0) return 0;
    let count = 0;
    for (const id of ids) {
      await this.waiveSingleInvoice(id, reasonNote, actorId);
      count++;
    }

    try {
      await auditLogService.logAction(actorId, 'KAS_BULK_WAIVED', 'kas_billings', 'bulk', {
        waivedIds: ids,
        count,
        reason: reasonNote,
      });
    } catch (e) {}

    return count;
  },

  // 3. Pemutihan Massal Periode Lampau (Fresh Start Month Reset)
  async applyMassiveAmnesty(freshStartMonth: string, agreementTitle: string, actorId: string): Promise<number> {
    const allRecords = await this.getAllInvoices();
    let count = 0;

    for (const rec of allRecords) {
      // Pemutihan untuk semua tagihan yang belum lunas (pending/overdue) SEBELUM freshStartMonth
      if (rec.periodMonth < freshStartMonth && rec.status !== 'paid' && rec.status !== 'waived') {
        await this.waiveSingleInvoice(rec.id, `[MASSIVE FRESH START] Kesepakatan Mulai Ulang Kas per ${freshStartMonth}. ${agreementTitle}`, actorId);
        count++;
      }
    }

    try {
      await auditLogService.logAction(actorId, 'KAS_MASSIVE_AMNESTY', 'kas_billings', freshStartMonth, {
        freshStartMonth,
        agreementTitle,
        totalWaivedCount: count,
      });
    } catch (e) {}

    return count;
  },

  // 4. Adjustment & Balance Management
  async getAllAdjustments(): Promise<import('../types/backend').KasAdjustmentRecord[]> {
    const LOCAL_ADJ_KEY = 'abb_kas_adjustments_v1';
    let firestoreDocs: import('../types/backend').KasAdjustmentRecord[] = [];

    try {
      const colRef = collection(db, 'kas_adjustments');
      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000));
      const snap = await Promise.race([getDocs(colRef), timeoutPromise]).catch(() => null);
      if (snap && typeof snap === 'object' && 'docs' in snap && snap.docs) {
        firestoreDocs = snap.docs.map((d) => d.data() as import('../types/backend').KasAdjustmentRecord);
      }
    } catch (e) {}

    let localDocs: import('../types/backend').KasAdjustmentRecord[] = [];
    try {
      const raw = localStorage.getItem(LOCAL_ADJ_KEY);
      localDocs = raw ? JSON.parse(raw) : [];
    } catch (e) {}

    const map = new Map<string, import('../types/backend').KasAdjustmentRecord>();
    localDocs.concat(firestoreDocs).forEach((a) => {
      if (a && a.id) map.set(a.id, a);
    });

    return Array.from(map.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async createAdjustment(
    adj: Omit<import('../types/backend').KasAdjustmentRecord, 'id' | 'createdAt'>,
    actorId: string
  ): Promise<string> {
    const LOCAL_ADJ_KEY = 'abb_kas_adjustments_v1';
    const id = `adj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const record: import('../types/backend').KasAdjustmentRecord = {
      ...adj,
      id,
      createdAt: now,
    };

    let localDocs: import('../types/backend').KasAdjustmentRecord[] = [];
    try {
      const raw = localStorage.getItem(LOCAL_ADJ_KEY);
      localDocs = raw ? JSON.parse(raw) : [];
    } catch (e) {}

    localDocs.push(record);
    try {
      localStorage.setItem(LOCAL_ADJ_KEY, JSON.stringify(localDocs));
    } catch (e) {}

    // Firestore sync
    try {
      const docRef = doc(db, 'kas_adjustments', id);
      await setDoc(docRef, record, { merge: true });
      await auditLogService.logAction(actorId, 'KAS_ADJUSTMENT_CREATED', 'kas_adjustments', id, adj);
    } catch (e) {}

    return id;
  },

  calculateMetrics(records: KasBillingRecord[], adjustments: import('../types/backend').KasAdjustmentRecord[] = []): KasSummaryMetrics {
    const totalTarget = records.reduce((sum, r) => sum + (r.amount || DEFAULT_KAS_AMOUNT), 0);
    const paidRecords = records.filter((r) => r.status === 'paid');
    const pendingRecords = records.filter((r) => r.status === 'pending');
    const overdueRecords = records.filter((r) => r.status === 'overdue');
    const waivedRecords = records.filter((r) => r.status === 'waived');

    const totalCollected = paidRecords.reduce((sum, r) => sum + (r.amount || DEFAULT_KAS_AMOUNT), 0);
    const totalOutstanding = records
      .filter((r) => r.status === 'pending' || r.status === 'overdue')
      .reduce((sum, r) => sum + (r.amount || DEFAULT_KAS_AMOUNT), 0);

    const collectionRate = totalTarget > 0 ? parseFloat(((totalCollected / totalTarget) * 100).toFixed(1)) : 0;

    // Calculate Real Cash Balance (Ledger Reconciliation)
    let openingBalance = 0;
    let adjustmentIn = 0;
    let adjustmentOut = 0;
    let totalExpenses = 0;

    adjustments.forEach((adj) => {
      if (adj.type === 'opening_balance') openingBalance += adj.amount || 0;
      else if (adj.type === 'adjustment_in') adjustmentIn += adj.amount || 0;
      else if (adj.type === 'adjustment_out') adjustmentOut += adj.amount || 0;
      else if (adj.type === 'expense') totalExpenses += adj.amount || 0;
    });

    const realCashBalance = (totalCollected + openingBalance + adjustmentIn) - (totalExpenses + adjustmentOut);

    return {
      totalTarget,
      totalCollected,
      totalOutstanding,
      totalExpenses,
      realCashBalance,
      collectionRate,
      totalMembersCount: records.length,
      paidMembersCount: paidRecords.length,
      pendingMembersCount: pendingRecords.length,
      overdueMembersCount: overdueRecords.length,
      waivedMembersCount: waivedRecords.length,
    };
  },

  getWhatsAppReminderUrl(memberPhone: string, memberName: string, periodMonth: string, amount: number): string {
    let phone = memberPhone.replace(/[^0-9]/g, '');
    if (phone.startsWith('0')) {
      phone = '62' + phone.slice(1);
    } else if (!phone.startsWith('62')) {
      phone = '62' + phone;
    }

    const formatRupiah = (val: number) => 'Rp ' + val.toLocaleString('id-ID');
    const formattedAmount = formatRupiah(amount || DEFAULT_KAS_AMOUNT);
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const [yStr, mStr] = periodMonth.split('-');
    const monthIdx = parseInt(mStr, 10) - 1;
    const monthLabel = monthNames[monthIdx] ? `${monthNames[monthIdx]} ${yStr}` : periodMonth;

    const message =
      `Halo Bro/Sis *${memberName}* (ABB Community) 🏍️✨\n\n` +
      `Sekadar mengingatkan untuk pembayaran Iuran Kas Komunitas bulan *${monthLabel}* sebesar *${formattedAmount}*.\n\n` +
      `Pembayaran dapat ditransfer via rekening resmi kas komunitas atau pembayaran tunai ke Bendahara.\n\n` +
      `Mohon mengunggah / konfirmasi bukti transfer jika sudah melakukan pembayaran. Terima kasih atas partisipasi dan kepeduliannya untuk kemajuan persaudaraan ABB! 🤝🔴`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  },

  exportTreasuryToExcel(records: KasBillingRecord[], periodMonth: string) {
    const exportData = records.map((r, idx) => ({
      NO: idx + 1,
      'PERIODE BULAN': r.periodMonth,
      'NO NIK / ANGGOTA': r.memberNik || '-',
      'NAMA ANGGOTA': r.memberName,
      TELEPON: r.memberPhone || '-',
      'NOMINAL (RP)': r.amount || DEFAULT_KAS_AMOUNT,
      STATUS: r.status === 'paid' ? 'LUNAS' : r.status === 'waived' ? 'PEMUTIHAN (WAIVED)' : r.status === 'overdue' ? 'TUNGGAKAN' : 'BELUM BAYAR (PENDING)',
      'TANGGAL BAYAR': r.paymentDate || '-',
      'METODE BAYAR': r.paymentMethod ? r.paymentMethod.toUpperCase() : '-',
      CATATAN: r.notes || '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Laporan Kas ${periodMonth}`);
    XLSX.writeFile(workbook, `Laporan_Kas_ABB_${periodMonth}_${new Date().toISOString().split('T')[0]}.xlsx`);
  },
};
