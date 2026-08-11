import React from 'react';
import { Member } from '../../types';
import { Shield, Star, Award, Camera, MapPin } from 'lucide-react';

interface OrgChartProps {
  members: Member[];
  onSelectMember: (member: Member) => void;
}

export const OrgChart: React.FC<OrgChartProps> = ({ members, onSelectMember }) => {
  const ketum = members.find(m => m.position.includes('Ketua Umum') && !m.position.includes('Wakil'));
  const waketum = members.find(m => m.position.includes('Wakil Ketua Umum'));
  const founders = members.filter(m => m.role === 'founder');
  const coordinators = members.filter(m => m.position.includes('Koordinator') && !m.role.includes('founder'));
  const creative = members.filter(m => m.role === 'creative' || m.position.includes('Creative'));

  const renderCard = (m: Member, badgeIcon?: React.ReactNode) => (
    <div
      key={m.id}
      onClick={() => onSelectMember(m)}
      className="group relative bg-[#111827] border border-gray-800 hover:border-blue-500/50 rounded-xl p-4 flex flex-col items-center text-center cursor-pointer transition-all duration-300 hover:shadow-glow-blue/20 hover:-translate-y-1 w-64"
    >
      <div className="relative mb-3">
        <img
          src={m.photo}
          alt={m.name}
          className="w-20 h-20 rounded-full object-cover border-2 border-blue-500/40 group-hover:border-blue-400 transition-colors shadow-lg"
        />
        {badgeIcon && (
          <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1 rounded-full text-xs shadow-md">
            {badgeIcon}
          </div>
        )}
      </div>

      <h4 className="text-sm font-bold text-white font-display group-hover:text-blue-400 transition-colors">
        {m.name}
      </h4>
      <span className="text-xs font-semibold text-blue-400 mt-0.5">{m.position}</span>
      <span className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
        <MapPin className="w-3 h-3 text-gray-500" />
        {m.chapter}
      </span>
    </div>
  );

  return (
    <div className="space-y-10 py-6 overflow-x-auto">
      {/* Tier 1: Chairman & Vice Chairman */}
      <div className="flex flex-col items-center">
        <div className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-1">
          <Shield className="w-4 h-4" /> DEWAN PIMPINAN NASIONAL
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          {ketum && renderCard(ketum, <Star className="w-3.5 h-3.5" />)}
          {waketum && renderCard(waketum, <Award className="w-3.5 h-3.5" />)}
        </div>
      </div>

      {/* Connecting Line */}
      <div className="w-0.5 h-8 bg-gray-800 mx-auto" />

      {/* Tier 2: Founders & Region Coordinators */}
      <div className="flex flex-col items-center">
        <div className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-4 flex items-center gap-1">
          <Star className="w-4 h-4" /> FOUNDERS & KOORDINATOR LAPANGAN
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          {founders.map(f => renderCard(f, <Award className="w-3.5 h-3.5" />))}
        </div>
      </div>

      {/* Connecting Line */}
      <div className="w-0.5 h-8 bg-gray-800 mx-auto" />

      {/* Tier 3: Creative & Special Squad */}
      <div className="flex flex-col items-center">
        <div className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-4 flex items-center gap-1">
          <Camera className="w-4 h-4" /> DIGITAL & CREATIVE SQUAD
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          {creative.map(c => renderCard(c, <Camera className="w-3.5 h-3.5" />))}
        </div>
      </div>
    </div>
  );
};
