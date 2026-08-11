import React, { useState } from 'react';
import { Users, Plus, Search, Trash2, FileSpreadsheet, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { useMembers } from '../../hooks/useMembers';
import { memberService } from '../../services/memberService';
import { useAuth } from '../../hooks/useAuth';
import { MemberProfile } from '../../types/backend';

export const AdminMembersPage: React.FC = () => {
  const { members, loading, refetch } = useMembers(true);
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Form single member state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    position: 'Anggota',
    chapter: 'Bekasi Chapter',
    joinYear: 2026,
    motorcycleModel: 'Honda CB500X',
    bio: '',
    photoURL: '',
  });

  // Bulk import state
  const [pastedData, setPastedData] = useState('');
  const [parsedPreview, setParsedPreview] = useState<Partial<MemberProfile>[]>([]);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.chapter?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.position?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await memberService.createMember(
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          position: formData.position,
          chapter: formData.chapter,
          joinYear: formData.joinYear,
          status: 'active',
          visibility: 'public',
          motorcycle: { model: formData.motorcycleModel },
          bio: formData.bio,
          photoURL: formData.photoURL || undefined,
        },
        user.uid
      );
      setIsModalOpen(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        position: 'Anggota',
        chapter: 'Bekasi Chapter',
        joinYear: 2026,
        motorcycleModel: 'Honda CB500X',
        bio: '',
        photoURL: '',
      });
      refetch();
    } catch (err) {
      alert('Gagal menambah anggota.');
    }
  };

  const parsePastedExcelCSV = (text: string) => {
    setPastedData(text);
    if (!text.trim()) {
      setParsedPreview([]);
      return;
    }

    const lines = text.trim().split(/\r?\n/);
    if (lines.length === 0) return;

    // Header detection
    const firstLine = lines[0].toLowerCase();
    const hasHeader = firstLine.includes('email') || firstLine.includes('nama') || firstLine.includes('alamat');
    const startIndex = hasHeader ? 1 : 0;

    const parsed: Partial<MemberProfile>[] = [];

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      // Split by tab or comma
      const delimiter = line.includes('\t') ? '\t' : ',';
      const cols = line.split(delimiter).map((c) => c.trim().replace(/^"(.*)"$/, '$1'));

      const email = cols[0] || '';
      const name = cols[1] || '';
      const address = cols[2] || '';
      const phone = cols[3] || '';
      const photoURL = cols[4] || '';

      if (name || email) {
        parsed.push({
          name: name || 'Anggota ABB',
          email,
          address,
          phone,
          photoURL: photoURL.startsWith('http') ? photoURL : undefined,
          position: 'Anggota',
          chapter: 'Bekasi Chapter',
          joinYear: 2026,
          status: 'active',
          visibility: 'public',
        });
      }
    }

    setParsedPreview(parsed);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        parsePastedExcelCSV(content);
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteBulkImport = async () => {
    if (!user || parsedPreview.length === 0) return;
    setImportStatus('Memproses import massal ke Firestore...');
    try {
      const itemsToImport = parsedPreview.map((item) => ({
        name: item.name || 'Anggota ABB',
        email: item.email || '',
        phone: item.phone || '',
        address: item.address || '',
        position: item.position || 'Anggota',
        chapter: item.chapter || 'Bekasi Chapter',
        joinYear: item.joinYear || 2026,
        photoURL: item.photoURL || undefined,
        status: 'active' as const,
        visibility: 'public' as const,
      }));

      const count = await memberService.bulkImportMembers(itemsToImport, user.uid);
      setImportStatus(`Berhasil mengimpor ${count} data anggota!`);
      setTimeout(() => {
        setIsImportModalOpen(false);
        setPastedData('');
        setParsedPreview([]);
        setImportStatus(null);
        refetch();
      }, 1200);
    } catch (err: any) {
      setImportStatus(`Gagal import: ${err.message}`);
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!user || !confirm('Apakah Anda yakin ingin menghapus data anggota ini?')) return;
    try {
      await memberService.deleteMember(id, user.uid);
      refetch();
    } catch (err) {
      alert('Gagal menghapus data.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121824] border border-gray-800 rounded-2xl p-6">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-red-500" /> Manajemen Anggota ABB
          </h2>
          <p className="text-gray-400 text-xs mt-1">
            Pengelolaan direktori anggota, kepengurusan, dan import data massal dari Excel/CSV.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition flex items-center gap-2 shadow-lg shadow-emerald-600/20"
          >
            <FileSpreadsheet className="w-4 h-4" /> Import Excel / CSV
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-xl transition flex items-center gap-2 shadow-lg shadow-red-600/20"
          >
            <Plus className="w-4 h-4" /> Tambah Anggota
          </button>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-[#101622] border border-gray-800 rounded-2xl p-4 flex items-center gap-3">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Cari anggota berdasarkan nama, email, jabatan, atau chapter..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none"
        />
      </div>

      {/* Members Table */}
      <div className="bg-[#101622] border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400 font-semibold uppercase text-[10px] tracking-wider bg-[#0C111A]">
              <th className="py-3 px-4">Nama Anggota</th>
              <th className="py-3 px-4">Kontak (Email / Telp)</th>
              <th className="py-3 px-4">Alamat</th>
              <th className="py-3 px-4">Jabatan & Chapter</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60 text-gray-300">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">Memuat data anggota...</td>
              </tr>
            ) : filteredMembers.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">Tidak ada anggota yang cocok.</td>
              </tr>
            ) : (
              filteredMembers.map((m) => (
                <tr key={m.id} className="hover:bg-gray-800/30 transition">
                  <td className="py-3 px-4 font-semibold text-white flex items-center gap-2">
                    <img
                      src={m.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'}
                      alt={m.name}
                      className="w-8 h-8 rounded-full object-cover border border-gray-700"
                    />
                    <div>
                      <p className="text-white font-bold">{m.name}</p>
                      <p className="text-[10px] text-gray-500">Joined {m.joinYear || 2026}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-300">
                    <p className="font-mono text-gray-300">{m.email || '-'}</p>
                    <p className="text-[10px] text-gray-500">{m.phone || '-'}</p>
                  </td>
                  <td className="py-3 px-4 text-gray-400 max-w-xs truncate">{m.address || '-'}</td>
                  <td className="py-3 px-4 text-gray-300">
                    <p className="font-medium text-white">{m.position || 'Anggota'}</p>
                    <p className="text-[10px] text-gray-500">{m.chapter || 'Bekasi Chapter'}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                      {m.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDeleteMember(m.id)}
                      className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition"
                      title="Hapus Anggota"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Single Add Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121824] border border-gray-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Tambah Anggota Komunitas Baru</h3>
            <form onSubmit={handleCreateMember} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#0C111A] border border-gray-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#0C111A] border border-gray-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">No. Telepon / WhatsApp</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#0C111A] border border-gray-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Alamat Tempat Tinggal</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-[#0C111A] border border-gray-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Jabatan</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full bg-[#0C111A] border border-gray-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Chapter</label>
                  <input
                    type="text"
                    value={formData.chapter}
                    onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                    className="w-full bg-[#0C111A] border border-gray-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700"
                >
                  Simpan Anggota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Excel / CSV Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121824] border border-gray-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" /> Import Massal Data Anggota Excel / CSV
              </h3>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-gray-400 hover:text-white text-xs font-bold"
              >
                Tutup ✕
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto pr-1 text-xs">
              <p className="text-gray-400 text-xs">
                Unggah file <code className="text-emerald-400">.csv</code> atau salin-tempel baris tabel Excel dengan kolom urutan:
                <br />
                <span className="font-mono text-white bg-gray-800 px-1.5 py-0.5 rounded mt-1 inline-block">
                  Email Address | Nama | Alamat | No. Telepon | Foto Profil Bebas
                </span>
              </p>

              {/* Upload input */}
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Opsi 1: Unggah File CSV</label>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="w-full bg-[#0C111A] border border-gray-800 rounded-xl p-2 text-gray-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-950 file:text-emerald-400 hover:file:bg-emerald-900"
                />
              </div>

              {/* Copy Paste Textarea */}
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Opsi 2: Salin-Tempel dari Excel (Copy-Paste)</label>
                <textarea
                  rows={4}
                  placeholder="Tempelkan baris dari Excel di sini (misal: user@gmail.com   Adipta Yanuardie   Jl. Ahmad Yani No 2   08123456789   https://...)"
                  value={pastedData}
                  onChange={(e) => parsePastedExcelCSV(e.target.value)}
                  className="w-full bg-[#0C111A] border border-gray-800 rounded-xl p-3 text-white font-mono text-[11px] focus:outline-none focus:border-emerald-500"
                ></textarea>
              </div>

              {/* Parsed Preview Table */}
              {parsedPreview.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">Preview Data Terdeteksi ({parsedPreview.length} Anggota):</span>
                  </div>
                  <div className="bg-[#0C111A] border border-gray-800 rounded-xl max-h-48 overflow-y-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-gray-800/80 text-gray-400 font-semibold sticky top-0">
                        <tr>
                          <th className="p-2">#</th>
                          <th className="p-2">Nama</th>
                          <th className="p-2">Email</th>
                          <th className="p-2">Alamat</th>
                          <th className="p-2">No. Telp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/50 text-gray-300 font-mono">
                        {parsedPreview.map((row, idx) => (
                          <tr key={idx}>
                            <td className="p-2 text-gray-500">{idx + 1}</td>
                            <td className="p-2 font-bold text-white">{row.name}</td>
                            <td className="p-2">{row.email || '-'}</td>
                            <td className="p-2 text-gray-400 truncate max-w-[120px]">{row.address || '-'}</td>
                            <td className="p-2 text-gray-400">{row.phone || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {importStatus && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  {importStatus}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-xl text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={parsedPreview.length === 0}
                onClick={handleExecuteBulkImport}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/20 flex items-center gap-2"
              >
                <Upload className="w-4 h-4" /> Impor {parsedPreview.length} Anggota ke Database
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
