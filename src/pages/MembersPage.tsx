import React, { useState } from 'react';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { membersData } from '../data/members';
import { Member } from '../types';
import { Search, MapPin, Bike, Calendar, Instagram, Mail } from 'lucide-react';
import { getAvatarUrl } from '../utils/imageUtils';

export const MembersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedChapter, setSelectedChapter] = useState<string>('all');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const chapters = Array.from(new Set(membersData.map(m => m.chapter)));

  const filteredMembers = membersData.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          m.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          m.motorcycle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || m.role === selectedRole;
    const matchesChapter = selectedChapter === 'all' || m.chapter === selectedChapter;
    return matchesSearch && matchesRole && matchesChapter;
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
          Direktori resmi pengurus, founder, dan anggota ABB Community dari seluruh chapter Indonesia.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#111827]/80 backdrop-blur-xl border border-gray-800 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama, jabatan, motor..."
            className="w-full bg-[#0B0F17] text-white pl-10 pr-4 py-2 rounded-xl border border-gray-700 text-xs focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="bg-[#0B0F17] text-gray-300 text-xs px-3 py-2 rounded-xl border border-gray-700 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Semua Peran</option>
            <option value="board">Pengurus (Board)</option>
            <option value="founder">Founder</option>
            <option value="creative">Creative Squad</option>
            <option value="member">Anggota</option>
          </select>

          <select
            value={selectedChapter}
            onChange={(e) => setSelectedChapter(e.target.value)}
            className="bg-[#0B0F17] text-gray-300 text-xs px-3 py-2 rounded-xl border border-gray-700 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Semua Chapter</option>
            {chapters.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Member Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredMembers.map((m) => (
          <Card
            key={m.id}
            onClick={() => setSelectedMember(m)}
            className="p-6 cursor-pointer flex flex-col items-center text-center group"
          >
            <img
              src={getAvatarUrl(m.photo, m.name)}
              alt={m.name}
              className="w-24 h-24 rounded-full object-cover border-2 border-blue-500/40 group-hover:border-blue-400 transition-colors shadow-lg mb-4 bg-gray-800"
            />
            <h3 className="text-base font-bold text-white font-display group-hover:text-blue-400 transition-colors">
              {m.name}
            </h3>
            <span className="text-xs font-semibold text-blue-400 mt-1">{m.position}</span>

            <div className="w-full pt-4 mt-4 border-t border-gray-800/80 space-y-1.5 text-xs text-gray-400 text-left">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                <span>{m.chapter}</span>
              </div>
              <div className="flex items-center gap-2">
                <Bike className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                <span className="truncate">{m.motorcycle}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                <span>Join {m.joinYear}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedMember && (
        <Modal isOpen={!!selectedMember} onClose={() => setSelectedMember(null)} maxWidth="md">
          <div className="space-y-6 text-center">
            <img
              src={getAvatarUrl(selectedMember.photo, selectedMember.name)}
              alt={selectedMember.name}
              className="w-28 h-28 rounded-full object-cover mx-auto border-4 border-blue-600 shadow-xl bg-gray-800"
            />
            <div>
              <h3 className="text-2xl font-bold text-white font-display">{selectedMember.name}</h3>
              <span className="text-sm font-semibold text-blue-400">{selectedMember.position}</span>
            </div>

            <div className="bg-[#0B0F17] p-4 rounded-xl border border-gray-800 text-left space-y-2 text-xs text-gray-300">
              <div className="flex justify-between">
                <span className="text-gray-500">Chapter:</span>
                <span className="font-semibold text-white">{selectedMember.chapter}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Motorcycle:</span>
                <span className="font-semibold text-white">{selectedMember.motorcycle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Bergabung Sejak:</span>
                <span className="font-semibold text-white">{selectedMember.joinYear}</span>
              </div>
            </div>

            {selectedMember.bio && (
              <p className="text-xs text-gray-300 leading-relaxed italic bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                "{selectedMember.bio}"
              </p>
            )}

            {selectedMember.social && (
              <div className="flex justify-center gap-3 pt-2">
                {selectedMember.social.instagram && (
                  <a href={selectedMember.social.instagram} target="_blank" rel="noreferrer" className="p-2 bg-gray-800 rounded-lg text-gray-300 hover:text-white hover:bg-blue-600">
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
                {selectedMember.social.email && (
                  <a href={`mailto:${selectedMember.social.email}`} className="p-2 bg-gray-800 rounded-lg text-gray-300 hover:text-white hover:bg-blue-600">
                    <Mail className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
