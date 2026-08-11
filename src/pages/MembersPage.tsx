import React, { useState } from 'react';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { useMembers } from '../hooks/useMembers';
import { membersData } from '../data/members';
import { Search, IdCard, UserCheck, ShieldCheck, Loader2 } from 'lucide-react';
import { getAvatarUrl, handleAvatarError } from '../utils/imageUtils';

export const MembersPage: React.FC = () => {
  const { members: firestoreMembers, loading } = useMembers(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<{
    id: string;
    name: string;
    nik?: string;
    position: string;
    photoURL?: string;
  } | null>(null);

  const cleanString = (val?: string | null): string => {
    if (!val) return '';
    return val.trim().replace(/^['"]+/, '').replace(/['"]+$/, '').replace(/^'/, '');
  };

  // Combine Firestore dynamic members and static members fallback
  const rawList = firestoreMembers.length > 0
    ? firestoreMembers
    : membersData.map((m, idx) => ({
        id: m.id,
        name: m.name,
        nik: m.nik || `ABB${String(idx + 1).padStart(3, '0')}`,
        position: m.position,
        chapter: m.chapter,
        joinYear: m.joinYear,
        status: 'active' as const,
        visibility: 'public' as const,
        motorcycle: { model: m.motorcycle },
        photoURL: m.photo,
        bio: m.bio,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

  const extractNikNumber = (nikStr?: string | null): number => {
    if (!nikStr) return 999999;
    const cleaned = nikStr.trim().replace(/^['"]+/, '').replace(/['"]+$/, '');
    const match = cleaned.match(/\d+/);
    return match ? parseInt(match[0], 10) : 999999;
  };

  const displayMembers = rawList
    .map((m) => ({
      id: m.id,
      name: cleanString(m.name) || 'Anggota ABB',
      nik: cleanString(m.nik) || '-',
      position: m.position || 'Anggota',
      photoURL: m.photoURL,
    }))
    .sort((a, b) => {
      const numA = extractNikNumber(a.nik);
      const numB = extractNikNumber(b.nik);
      if (numA !== numB) return numA - numB;
      return a.name.localeCompare(b.name);
    });

  const filteredMembers = displayMembers.filter((m) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    const name = m.name.toLowerCase();
    const nik = (m.nik || '').toLowerCase();
    const position = m.position.toLowerCase();
    return name.includes(term) || nik.includes(term) || position.includes(term);
  });

  return (
    <div className="pt-28 pb-20 space-y-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge variant="blue" size="md">DIREKTORI ANGGOTA</Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white font-display">
          Member Directory ABB
        </h1>
        <p className="text-base text-gray-300">
          Direktori resmi anggota komunitas ABB Community. Pencarian berdasarkan Nama, Nomor Anggota/NIK, dan Jabatan.
        </p>
      </div>

      {/* Search Bar - Exclusive Search by Nama, NIK, Jabatan */}
      <div className="bg-[#111827]/80 backdrop-blur-xl border border-gray-800 p-4 rounded-2xl flex items-center justify-between max-w-2xl mx-auto shadow-xl">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari berdasarkan Nama, Nomor Anggota/NIK, atau Jabatan..."
            className="w-full bg-[#0B0F17] text-white pl-10 pr-4 py-2.5 rounded-xl border border-gray-700 text-xs focus:outline-none focus:border-blue-500 font-sans"
          />
        </div>
      </div>

      {/* Member Cards Grid - EXCLUSIVELY Name, NIK, & Position */}
      {loading && firestoreMembers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-3 text-gray-400">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-xs">Memuat direktori anggota ABB...</p>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="text-center py-16 text-gray-500 text-sm">
          Tidak ada anggota yang cocok dengan pencarian "{searchTerm}".
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredMembers.map((m) => (
            <Card
              key={m.id}
              onClick={() => setSelectedMember(m)}
              className="p-6 cursor-pointer flex flex-col items-center text-center group hover:border-blue-500/50 transition-all duration-300 shadow-lg relative overflow-hidden bg-[#101622]"
            >
              {/* Foto Profil */}
              <div className="relative mb-4">
                <img
                  src={getAvatarUrl(m.photoURL, m.name)}
                  alt={m.name}
                  onError={(e) => handleAvatarError(e, m.photoURL, m.name)}
                  className="w-24 h-24 rounded-full object-cover border-2 border-blue-500/40 group-hover:border-blue-400 transition-colors shadow-xl bg-gray-800"
                />
                <span className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full border-2 border-gray-900 shadow">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </span>
              </div>

              {/* 1. Nama Anggota */}
              <h3 className="text-base font-bold text-white font-display group-hover:text-blue-400 transition-colors line-clamp-1">
                {m.name}
              </h3>

              {/* 2. Jabatan */}
              <p className="text-xs font-semibold text-blue-400 mt-1 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 shrink-0" />
                <span>{m.position}</span>
              </p>

              {/* 3. Nomor Anggota / NIK */}
              <div className="mt-4 pt-3 w-full border-t border-gray-800/80 flex items-center justify-center gap-1.5 text-xs">
                <IdCard className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-gray-400 font-mono text-[11px]">No. Anggota:</span>
                <span className="font-mono font-extrabold text-emerald-400 text-xs bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                  {m.nik || '-'}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Simple Detail Modal showing ONLY Photo, Name, NIK, & Position */}
      {selectedMember && (
        <Modal isOpen={!!selectedMember} onClose={() => setSelectedMember(null)} maxWidth="sm">
          <div className="space-y-6 text-center py-2">
            <div className="relative inline-block mx-auto">
              <img
                src={getAvatarUrl(selectedMember.photoURL, selectedMember.name)}
                alt={selectedMember.name}
                onError={(e) => handleAvatarError(e, selectedMember.photoURL, selectedMember.name)}
                className="w-28 h-28 rounded-full object-cover mx-auto border-4 border-blue-500 shadow-2xl bg-gray-800"
              />
              <span className="absolute bottom-1 right-1 bg-emerald-500 text-white p-1.5 rounded-full border-2 border-gray-900 shadow">
                <ShieldCheck className="w-4 h-4" />
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-white font-display">
                {selectedMember.name}
              </h3>
              <p className="text-sm font-semibold text-blue-400 flex items-center justify-center gap-1.5">
                <UserCheck className="w-4 h-4" />
                <span>{selectedMember.position}</span>
              </p>
            </div>

            <div className="bg-[#0B0F17] p-4 rounded-xl border border-gray-800 text-center space-y-1">
              <p className="text-[11px] text-gray-500 font-mono uppercase tracking-wider">Nomor Anggota / NIK</p>
              <p className="font-mono font-extrabold text-lg text-emerald-400 tracking-wider">
                {selectedMember.nik || '-'}
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
