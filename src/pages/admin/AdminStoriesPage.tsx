import React from 'react';
import { BookOpen, CheckCircle, Clock, Archive, Trash2 } from 'lucide-react';
import { useStories } from '../../hooks/useStories';
import { storyService } from '../../services/storyService';
import { useAuth } from '../../hooks/useAuth';
import { StoryStatus } from '../../types/backend';

export const AdminStoriesPage: React.FC = () => {
  const { stories, loading, refetch } = useStories(true);
  const { user } = useAuth();

  const handleStatusChange = async (id: string, newStatus: StoryStatus) => {
    if (!user) return;
    try {
      await storyService.changeStoryStatus(id, newStatus, user.uid);
      refetch();
    } catch (err) {
      alert('Gagal mengubah status artikel.');
    }
  };

  const getStatusBadge = (status: StoryStatus) => {
    switch (status) {
      case 'published':
        return 'bg-emerald-950 text-emerald-400 border-emerald-800/40';
      case 'review':
        return 'bg-yellow-950 text-yellow-400 border-yellow-800/40';
      case 'draft':
        return 'bg-gray-800 text-gray-400 border-gray-700';
      case 'archived':
        return 'bg-red-950 text-red-400 border-red-800/40';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-[#121824] border border-gray-800 rounded-2xl p-6">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-red-500" /> Manajemen Editorial Artikel & Cerita
          </h2>
          <p className="text-gray-400 text-xs mt-1">
            Alur kerja editorial artikel berita: Draft → Review Editor → Published → Archive.
          </p>
        </div>
      </div>

      <div className="bg-[#101622] border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400 font-semibold uppercase text-[10px] tracking-wider bg-[#0C111A]">
              <th className="py-3 px-4">Judul Artikel</th>
              <th className="py-3 px-4">Penulis</th>
              <th className="py-3 px-4">Status Workflow</th>
              <th className="py-3 px-4">Tanggal Rilis</th>
              <th className="py-3 px-4 text-right">Ubah Status Editorial</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60 text-gray-300">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">Memuat artikel...</td>
              </tr>
            ) : stories.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">Belum ada artikel.</td>
              </tr>
            ) : (
              stories.map((s) => (
                <tr key={s.id} className="hover:bg-gray-800/30 transition">
                  <td className="py-3 px-4 font-semibold text-white max-w-xs truncate">{s.title}</td>
                  <td className="py-3 px-4 text-gray-400 font-medium">{s.authorName || 'Redaksi ABB'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${getStatusBadge(s.status)}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-gray-400">{s.publishedAt || '-'}</td>
                  <td className="py-3 px-4 text-right flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleStatusChange(s.id, 'published')}
                      className="px-2 py-1 text-[10px] font-bold bg-emerald-950 hover:bg-emerald-900 text-emerald-400 rounded-lg border border-emerald-800/40"
                    >
                      Publish
                    </button>
                    <button
                      onClick={() => handleStatusChange(s.id, 'archived')}
                      className="px-2 py-1 text-[10px] font-bold bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg"
                    >
                      Arsipkan
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
