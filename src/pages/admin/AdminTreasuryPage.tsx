import React, { useState, useEffect, useCallback } from 'react';
import {
  Wallet,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Download,
  Zap,
  MessageCircle,
  Upload,
  Eye,
  Pencil,
  Loader2,
  FileSpreadsheet,
  Calendar,
  X,
  Check,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { treasuryService, DEFAULT_KAS_AMOUNT } from '../../services/treasuryService';
import { KasBillingRecord, KasPaymentMethod, KasPaymentStatus } from '../../types/backend';
import { useAuth } from '../../hooks/useAuth';
import { Modal } from '../../components/ui/Modal';

export const AdminTreasuryPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const [records, setRecords] = useState<KasBillingRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Modal States
  const [selectedRecord, setSelectedRecord] = useState<KasBillingRecord | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [isProofViewerOpen, setIsProofViewerOpen] = useState<boolean>(false);
  const [activeProofUrl, setActiveProofUrl] = useState<string>('');

  // Payment Form States
  const [formStatus, setFormStatus] = useState<KasPaymentStatus>('paid');
  const [formMethod, setFormMethod] = useState<KasPaymentMethod>('transfer');
  const [formProofUrl, setFormProofUrl] = useState<string>('');
  const [formNotes, setFormNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      let data = await treasuryService.getMonthlyInvoices(selectedMonth);
      if (data.length === 0) {
        // Auto generate if empty for initial view
        await treasuryService.generateMonthlyInvoices(selectedMonth, user?.uid || 'admin');
        data = await treasuryService.getMonthlyInvoices(selectedMonth);
      }
      setRecords(data);
    } catch (err) {
      console.error('Failed to load kas records:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, user?.uid]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleGenerateInvoices = async () => {
    setIsGenerating(true);
    try {
      const res = await treasuryService.generateMonthlyInvoices(selectedMonth, user?.uid || 'admin');
      alert(`⚡ Berhasil membuat ${res.createdCount} tagihan Kas baru (Rp 20.000/bulan) untuk periode ${selectedMonth}!`);
      loadData();
    } catch (err) {
      console.error('Generate error:', err);
      alert('Gagal membuat tagihan kas bulanan.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenPaymentModal = (record: KasBillingRecord) => {
    setSelectedRecord(record);
    setFormStatus(record.status || 'paid');
    setFormMethod(record.paymentMethod || 'transfer');
    setFormProofUrl(record.proofUrl || '');
    setFormNotes(record.notes || '');
    setIsPaymentModalOpen(true);
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;

    setIsSaving(true);
    try {
      const now = new Date().toISOString().split('T')[0];
      await treasuryService.updatePaymentRecord(
        selectedRecord.id,
        {
          memberId: selectedRecord.memberId,
          memberName: selectedRecord.memberName,
          memberNik: selectedRecord.memberNik,
          periodMonth: selectedRecord.periodMonth,
          amount: selectedRecord.amount || DEFAULT_KAS_AMOUNT,
          status: formStatus,
          paymentMethod: formMethod,
          paymentDate: formStatus === 'paid' ? selectedRecord.paymentDate || now : undefined,
          proofUrl: formProofUrl,
          notes: formNotes,
          verifiedBy: (user as any)?.displayName || user?.email || 'Admin',
        },
        user?.uid || 'admin'
      );

      setIsPaymentModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Failed to save payment:', err);
      alert('Gagal menyimpan status pembayaran.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewProof = (proofUrl: string) => {
    setActiveProofUrl(proofUrl);
    setIsProofViewerOpen(true);
  };

  const handleExportExcel = () => {
    treasuryService.exportTreasuryToExcel(filteredRecords, selectedMonth);
  };

  const metrics = treasuryService.calculateMetrics(records);

  const filteredRecords = records.filter((r) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesTerm =
      !term ||
      r.memberName.toLowerCase().includes(term) ||
      (r.memberNik && r.memberNik.toLowerCase().includes(term)) ||
      (r.memberPhone && r.memberPhone.includes(term));

    const matchesStatus =
      selectedStatus === 'all' || r.status === selectedStatus;

    return matchesTerm && matchesStatus;
  });

  const formatRupiah = (val: number) => 'Rp ' + val.toLocaleString('id-ID');

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121824] border border-gray-800 rounded-2xl p-6 shadow-xl">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2 font-display">
            <Wallet className="w-6 h-6 text-emerald-400" /> Manajemen Uang Kas Komunitas (Backend Engine)
          </h2>
          <p className="text-gray-400 text-xs mt-1">
            Pengelolaan iuran kas bulanan Rp 20.000/bulan, pencatatan bukti transfer, pengingat WhatsApp, dan laporan keuangan.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Month Selector */}
          <div className="flex items-center gap-2 bg-[#0C111A] border border-gray-700 px-3 py-1.5 rounded-xl text-xs text-white">
            <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer text-xs font-mono font-bold"
            />
          </div>

          <button
            onClick={handleGenerateInvoices}
            disabled={isGenerating}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition flex items-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            Generate Kas ({selectedMonth})
          </button>

          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition flex items-center gap-2 shadow-lg shadow-blue-600/20"
          >
            <Download className="w-4 h-4" /> Export Excel (.xlsx)
          </button>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Terkumpul */}
        <div className="bg-[#121824] border border-emerald-900/60 p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Kas Terkumpul</p>
            <h3 className="text-xl font-extrabold text-emerald-400 font-mono mt-1">
              {formatRupiah(metrics.totalCollected)}
            </h3>
            <p className="text-[10px] text-gray-400 mt-1">
              Target Periode: <strong className="text-gray-300 font-mono">{formatRupiah(metrics.totalTarget)}</strong>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-800 flex items-center justify-center text-emerald-400 shadow-lg">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Total Tunggakan */}
        <div className="bg-[#121824] border border-red-900/60 p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Tunggakan Kas</p>
            <h3 className="text-xl font-extrabold text-red-400 font-mono mt-1">
              {formatRupiah(metrics.totalOutstanding)}
            </h3>
            <p className="text-[10px] text-gray-400 mt-1">
              {metrics.pendingMembersCount + metrics.overdueMembersCount} Anggota Belum Bayar
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-950/80 border border-red-800 flex items-center justify-center text-red-400 shadow-lg">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Kelancaran Kas */}
        <div className="bg-[#121824] border border-blue-900/60 p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Kelancaran Kas</p>
            <h3 className="text-xl font-extrabold text-blue-400 font-mono mt-1">
              {metrics.collectionRate}%
            </h3>
            <p className="text-[10px] text-gray-400 mt-1">
              {metrics.paidMembersCount} dari {metrics.totalMembersCount} Anggota Lunas
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-950/80 border border-blue-800 flex items-center justify-center text-blue-400 shadow-lg">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Status Lunas */}
        <div className="bg-[#121824] border border-gray-800 p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Anggota Lunas</p>
            <h3 className="text-xl font-extrabold text-white font-mono mt-1">
              {metrics.paidMembersCount} / {metrics.totalMembersCount}
            </h3>
            <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3 h-3" /> Rp 20.000 / Anggota
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gray-900 border border-gray-700 flex items-center justify-center text-emerald-400 shadow-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#101622] border border-gray-800 rounded-2xl p-4 flex flex-col lg:flex-row items-center justify-between gap-3 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto flex-1">
          {/* Search Box */}
          <div className="relative w-full sm:w-80 flex items-center gap-2 bg-[#0C111A] border border-gray-800 rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Cari nama anggota, NIK, No. WA..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none font-sans"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="text-gray-500 hover:text-white text-xs">
                ✕
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="relative w-full sm:w-52 flex items-center gap-2 bg-[#0C111A] border border-gray-800 rounded-xl px-3 py-2">
            <Filter className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-transparent text-xs text-white focus:outline-none cursor-pointer font-sans"
            >
              <option value="all" className="bg-[#121824] text-gray-300">Semua Status ({records.length})</option>
              <option value="paid" className="bg-[#121824] text-emerald-400 font-bold">🟢 Lunas ({metrics.paidMembersCount})</option>
              <option value="pending" className="bg-[#121824] text-amber-400 font-bold">🟡 Pending ({metrics.pendingMembersCount})</option>
              <option value="overdue" className="bg-[#121824] text-red-400 font-bold">🔴 Tunggakan ({metrics.overdueMembersCount})</option>
            </select>
          </div>
        </div>

        <p className="text-xs text-gray-400">
          Menampilkan <strong className="text-white font-mono">{filteredRecords.length}</strong> dari {records.length} Tagihan
        </p>
      </div>

      {/* Main Treasury Table */}
      <div className="bg-[#121824] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[#0C111A] text-[11px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-800">
                <th className="py-3.5 px-4 w-12 text-center">#</th>
                <th className="py-3.5 px-4">Nama Anggota</th>
                <th className="py-3.5 px-4">NIK</th>
                <th className="py-3.5 px-4">Nominal</th>
                <th className="py-3.5 px-4">Status Pembayaran</th>
                <th className="py-3.5 px-4">Tanggal & Metode</th>
                <th className="py-3.5 px-4">Bukti Transfer</th>
                <th className="py-3.5 px-4 text-center">Aksi / Kontrol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    <Loader2 className="w-6 h-6 text-emerald-400 animate-spin mx-auto mb-2" />
                    Memuat data kas komunitas...
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    Belum ada data tagihan kas untuk periode {selectedMonth}.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r, idx) => (
                  <tr key={r.id} className="hover:bg-[#182030]/80 transition-colors group">
                    <td className="py-3.5 px-4 text-center text-gray-500 font-mono text-[11px]">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {r.memberName}
                      </p>
                      {r.memberPhone && (
                        <p className="text-[10px] text-gray-400 font-mono">{r.memberPhone}</p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-extrabold text-emerald-400 text-xs">
                      {r.memberNik || '-'}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {formatRupiah(r.amount || DEFAULT_KAS_AMOUNT)}
                    </td>
                    <td className="py-3.5 px-4">
                      {r.status === 'paid' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-950 text-emerald-400 border border-emerald-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          LUNAS
                        </span>
                      ) : r.status === 'overdue' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-red-950 text-red-400 border border-red-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                          TUNGGAKAN
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-950 text-amber-400 border border-amber-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                          PENDING
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {r.paymentDate ? (
                        <div>
                          <p className="text-gray-300 font-mono text-[11px]">{r.paymentDate}</p>
                          <p className="text-[10px] text-emerald-400 font-bold uppercase">
                            {r.paymentMethod || 'TRANSFER'}
                          </p>
                        </div>
                      ) : (
                        <span className="text-gray-500 italic text-[11px]">Belum Dibayar</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {r.proofUrl ? (
                        <button
                          onClick={() => handleViewProof(r.proofUrl!)}
                          className="px-2.5 py-1 bg-blue-950 hover:bg-blue-900 border border-blue-800 text-blue-400 text-[11px] font-semibold rounded-lg transition flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" /> Pratinjau
                        </button>
                      ) : (
                        <span className="text-gray-500 text-[11px] italic">Tidak Ada</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* 1. Verifikasi / Edit Bayar */}
                        <button
                          onClick={() => handleOpenPaymentModal(r)}
                          className="p-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-lg transition"
                          title="Input Pembayaran & Upload Bukti Transfer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        {/* 2. Pengingat WhatsApp */}
                        {r.status !== 'paid' && r.memberPhone && (
                          <a
                            href={treasuryService.getWhatsAppReminderUrl(
                              r.memberPhone,
                              r.memberName,
                              r.periodMonth,
                              r.amount || DEFAULT_KAS_AMOUNT
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 rounded-lg transition"
                            title="Kirim Pesan Pengingat Pembayaran Kas via WA"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Input & Verifikasi Pembayaran */}
      {isPaymentModalOpen && selectedRecord && (
        <Modal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          title="Input Pembayaran Kas Anggota"
          maxWidth="md"
        >
          <form onSubmit={handleSavePayment} className="space-y-5">
            <div className="bg-[#0C111A] border border-gray-800 p-3.5 rounded-xl space-y-1 text-xs">
              <p className="text-gray-400">Nama Anggota: <strong className="text-white font-bold">{selectedRecord.memberName}</strong></p>
              <p className="text-gray-400">Nomor NIK: <strong className="text-emerald-400 font-mono font-bold">{selectedRecord.memberNik || '-'}</strong></p>
              <p className="text-gray-400">Periode Tagihan: <strong className="text-blue-400 font-mono font-bold">{selectedRecord.periodMonth}</strong></p>
              <p className="text-gray-400">Nominal: <strong className="text-emerald-400 font-mono font-bold">{formatRupiah(selectedRecord.amount || DEFAULT_KAS_AMOUNT)}</strong></p>
            </div>

            {/* Status Pembayaran */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300">Status Pembayaran *</label>
              <div className="relative">
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as KasPaymentStatus)}
                  className="w-full bg-[#0C111A] border border-gray-700 text-white text-xs rounded-xl p-3 pr-10 appearance-none focus:outline-none focus:border-emerald-500 font-sans cursor-pointer"
                >
                  <option value="paid">🟢 LUNAS (Paid)</option>
                  <option value="pending">🟡 PENDING (Belum Bayar)</option>
                  <option value="overdue">🔴 TUNGGAKAN (Overdue)</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Metode Pembayaran */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300">Metode Pembayaran *</label>
              <div className="relative">
                <select
                  value={formMethod}
                  onChange={(e) => setFormMethod(e.target.value as KasPaymentMethod)}
                  className="w-full bg-[#0C111A] border border-gray-700 text-white text-xs rounded-xl p-3 pr-10 appearance-none focus:outline-none focus:border-emerald-500 font-sans cursor-pointer"
                >
                  <option value="transfer">🏦 Transfer Bank</option>
                  <option value="qris">📱 QRIS / E-Wallet</option>
                  <option value="cash">💵 Tunai / Cash (Ke Bendahara)</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Link Bukti Transfer */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300">URL Foto Bukti Transfer / Resi</label>
              <input
                type="text"
                placeholder="Tempelkan link gambar/Google Drive bukti transfer..."
                value={formProofUrl}
                onChange={(e) => setFormProofUrl(e.target.value)}
                className="w-full bg-[#0C111A] border border-gray-700 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-emerald-500 font-sans"
              />
            </div>

            {/* Catatan */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300">Catatan Verifikator</label>
              <textarea
                rows={2.5}
                placeholder="Catatan tambahan (misal: Ditransfer via BCA, dll)..."
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                className="w-full bg-[#0C111A] border border-gray-700 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-emerald-500 font-sans"
              ></textarea>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-xl transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition flex items-center gap-2 shadow-lg shadow-emerald-600/20"
              >
                {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Simpan Pembayaran Kas
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Pratinjau Bukti Bayar */}
      {isProofViewerOpen && (
        <Modal
          isOpen={isProofViewerOpen}
          onClose={() => setIsProofViewerOpen(false)}
          title="Pratinjau Bukti Transfer Pembayaran Kas"
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="bg-black/90 p-2 rounded-xl border border-gray-800 flex items-center justify-center min-h-[300px] max-h-[500px] overflow-auto">
              <img
                src={activeProofUrl}
                alt="Bukti Transfer Kas"
                className="max-w-full max-h-[460px] object-contain rounded"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                  alert('Gagal memuat gambar bukti transfer. Pastikan URL valid.');
                }}
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
