import React, { useState } from 'react';
import { Calendar, Plus, QrCode, Trash2, Edit, Users } from 'lucide-react';
import { useEvents } from '../../hooks/useEvents';
import { eventService } from '../../services/eventService';
import { useAuth } from '../../hooks/useAuth';

export const AdminEventsPage: React.FC = () => {
  const { events, loading, refetch } = useEvents();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'touring' as const,
    date: '2026-09-01',
    locationName: 'Basecamp ABB Bekasi',
    capacity: 100,
    description: '',
  });

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await eventService.createEvent(
        {
          title: formData.title,
          slug: formData.title.toLowerCase().replace(/\s+/g, '-'),
          description: formData.description,
          category: formData.category,
          startAt: formData.date,
          location: { name: formData.locationName },
          capacity: formData.capacity,
          registrationRequired: true,
          registrationOpen: true,
          status: 'published',
          createdBy: user.uid,
        },
        user.uid
      );
      setIsModalOpen(false);
      refetch();
    } catch (err) {
      alert('Gagal membuat event baru.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121824] border border-gray-800 rounded-2xl p-6">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-red-500" /> Manajemen Event & Presensi QR
          </h2>
          <p className="text-gray-400 text-xs mt-1">
            Pengelolaan event touring, bakti sosial, ketersediaan kapasitas, dan presensi QR Code.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-xl transition flex items-center gap-2 shadow-lg shadow-red-600/20"
        >
          <Plus className="w-4 h-4" /> Buat Event Baru
        </button>
      </div>

      <div className="bg-[#101622] border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400 font-semibold uppercase text-[10px] tracking-wider bg-[#0C111A]">
              <th className="py-3 px-4">Judul Event</th>
              <th className="py-3 px-4">Kategori</th>
              <th className="py-3 px-4">Tanggal</th>
              <th className="py-3 px-4">Peserta / Kapasitas</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60 text-gray-300">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">Memuat event...</td>
              </tr>
            ) : events.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">Belum ada event.</td>
              </tr>
            ) : (
              events.map((e) => (
                <tr key={e.id} className="hover:bg-gray-800/30 transition">
                  <td className="py-3 px-4 font-semibold text-white">{e.title}</td>
                  <td className="py-3 px-4 uppercase text-[10px] font-bold text-gray-400">{e.category}</td>
                  <td className="py-3 px-4 text-gray-400 font-mono">{e.startAt}</td>
                  <td className="py-3 px-4 font-medium text-white">
                    {e.registeredCount} / {e.capacity || '∞'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                      e.status === 'published' ? 'bg-emerald-950 text-emerald-400 border-emerald-800/40' : 'bg-gray-800 text-gray-400 border-gray-700'
                    }`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => alert(`QR Presensi untuk Event ${e.title} aktif.`)}
                      className="p-1.5 text-gray-400 hover:text-yellow-400 hover:bg-yellow-950/40 rounded-lg transition mr-1"
                      title="Generate QR Check-in"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Create Event */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121824] border border-gray-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Buat Event Komunitas Baru</h3>
            <form onSubmit={handleCreateEvent} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">Judul Event</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-[#0C111A] border border-gray-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-[#0C111A] border border-gray-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Kapasitas Maksimal</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 100 })}
                    className="w-full bg-[#0C111A] border border-gray-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Deskripsi Singkat</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[#0C111A] border border-gray-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-red-500"
                ></textarea>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-800 text-gray-300 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700"
                >
                  Publikasikan Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
