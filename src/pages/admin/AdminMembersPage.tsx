import React, { useState } from 'react';
import { Users, Plus, Search, Shield, Trash2, Edit, CheckCircle } from 'lucide-react';
import { useMembers } from '../../hooks/useMembers';
import { memberService } from '../../services/memberService';
import { useAuth } from '../../hooks/useAuth';
import { MemberProfile } from '../../types/backend';

export const AdminMembersPage: React.FC = () => {
  const { members, loading, refetch } = useMembers(true);
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    position: 'Anggota',
    chapter: 'Bekasi Chapter',
    joinYear: 2026,
    motorcycleModel: 'Honda CB500X',
    bio: '',
  });

  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
          position: formData.position,
          chapter: formData.chapter,
          joinYear: formData.joinYear,
          status: 'active',
          visibility: 'public',
          motorcycle: { model: formData.motorcycleModel },
          bio: formData.bio,
        },
        user.uid
      );
      setIsModalOpen(false);
      setFormData({ name: '', position: 'Anggota', chapter: 'Bekasi Chapter', joinYear: 2026, motorcycleModel: 'Honda CB500X', bio: '' });
      refetch();
    } catch (err) {
      alert('Gagal menambah anggota.');
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
            Pengelolaan direktori anggota, kepengurusan, dan hak akses peranan (RBAC).
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-xl transition flex items-center gap-2 shadow-lg shadow-red-600/20"
        >
          <Plus className="w-4 h-4" /> Tambah Anggota Baru
        </button>
      </div>

      {/* Filter & Search */}
      <div className="bg-[#101622] border border-gray-800 rounded-2xl p-4 flex items-center gap-3">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Cari anggota berdasarkan nama, jabatan, atau chapter..."
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
              <th className="py-3 px-4">Jabatan</th>
              <th className="py-3 px-4">Chapter</th>
              <th className="py-3 px-4">Tahun Bergabung</th>
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
                      className="w-7 h-7 rounded-full object-cover border border-gray-700"
                    />
                    {m.name}
                  </td>
                  <td className="py-3 px-4 text-gray-300">{m.position || 'Anggota'}</td>
                  <td className="py-3 px-4 text-gray-400 font-medium">{m.chapter || 'Bekasi Chapter'}</td>
                  <td className="py-3 px-4 font-mono text-gray-400">{m.joinYear || 2020}</td>
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

      {/* Add Member Modal */}
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Tahun Bergabung</label>
                  <input
                    type="number"
                    value={formData.joinYear}
                    onChange={(e) => setFormData({ ...formData, joinYear: parseInt(e.target.value) || 2026 })}
                    className="w-full bg-[#0C111A] border border-gray-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Model Sepeda Motor</label>
                  <input
                    type="text"
                    value={formData.motorcycleModel}
                    onChange={(e) => setFormData({ ...formData, motorcycleModel: e.target.value })}
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
    </div>
  );
};
