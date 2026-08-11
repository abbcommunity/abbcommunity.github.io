import React, { useState } from 'react';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { OrgChart } from '../components/members/OrgChart';
import { membersData } from '../data/members';
import { siteConfig } from '../data/siteConfig';
import { Shield, Target, Award, Heart, CheckCircle2, Clock } from 'lucide-react';
import { Member } from '../types';
import { Modal } from '../components/ui/Modal';

export const AboutPage: React.FC = () => {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const timelineData = [
    { year: '2010', title: 'ABB Community Founded', desc: 'Pendirian awal komunitas oleh para penggiat adventure riding di lingkungan Awal Bros / Primaya Hospital Group.' },
    { year: '2015', title: 'Major Community Expansion', desc: 'Pembentukan struktur chapter regional di Jakarta, Bekasi, Tangerang, dan Bogor serta pengesahan AD/ART.' },
    { year: '2020', title: 'Community Social Initiatives', desc: 'Peluncuran program konsisten bakti sosial khitanan massal medis cuma-cuma dan aksi donor darah serentak.' },
    { year: '2025', title: 'Social & Humanitarian Expansion', desc: 'Ekspedisi touring Trans Jawa 850 KM dan perluasan kemitraan rumah sakit medis lapangan.' },
    { year: '2026', title: 'Digital Transformation 2.0', desc: 'Peluncuran platform modern digital home ABB Community 2.0 dengan media platform dan garage showcase.' }
  ];

  return (
    <div className="pt-28 pb-20 space-y-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge variant="blue" size="md">TENTANG ABB COMMUNITY</Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white font-display">
          Sejarah, Visi, & Persaudaraan
        </h1>
        <p className="text-base text-gray-300 leading-relaxed">
          {siteConfig.description}
        </p>
      </div>

      {/* Vision & Mission Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-8 space-y-4 border-blue-500/30">
          <div className="w-12 h-12 rounded-xl bg-blue-900/50 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-white font-display">Visi Komunitas</h3>
          <p className="text-sm text-gray-300 leading-relaxed">
            Menjadi wadah persaudaraan otomotif terdepan di Indonesia yang menjunjung tinggi profesionalisme, standar keselamatan berkendara (safety riding), serta memberikan kontribusi sosial dan kesehatan bagi masyarakat secara berkelanjutan.
          </p>
        </Card>

        <Card className="p-8 space-y-4 border-cyan-500/30">
          <div className="w-12 h-12 rounded-xl bg-cyan-900/50 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-white font-display">Misi Komunitas</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>Mempererat tali silaturahmi antar karyawan & praktisi di jaringan rumah sakit dan rekan sejawat.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>Mengedukasi prinsip defensive riding & keselamatan di jalan raya.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>Menyelenggarakan program pengabdian medis sosial khitanan massal & aksi kemanusiaan rutin.</span>
            </li>
          </ul>
        </Card>
      </div>

      {/* Interactive History Timeline */}
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <Badge variant="amber" size="md">MILESTONE REKAM JEJAK</Badge>
          <h2 className="text-3xl font-extrabold text-white font-display">Timeline Perjalanan ABB</h2>
        </div>

        <div className="relative border-l-2 border-blue-600/40 ml-4 sm:ml-32 space-y-10 pl-6 sm:pl-10">
          {timelineData.map((item, idx) => (
            <div key={idx} className="relative group">
              {/* Dot */}
              <div className="absolute -left-[31px] sm:-left-[47px] top-1.5 w-5 h-5 rounded-full bg-blue-600 border-4 border-[#0B0F17] shadow-glow-blue group-hover:scale-125 transition-transform" />

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 font-display">
                  {item.year}
                </span>
                <h3 className="text-lg font-bold text-white font-display sm:ml-4">{item.title}</h3>
              </div>

              <Card className="p-5 max-w-2xl bg-gray-900/60 border-gray-800">
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">{item.desc}</p>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Organizational Hierarchy Chart */}
      <div className="space-y-8 pt-8 border-t border-gray-800">
        <div className="text-center space-y-2">
          <Badge variant="emerald" size="md">STRUKTUR ORGANISASI</Badge>
          <h2 className="text-3xl font-extrabold text-white font-display">Bagan Pengurus ABB Community</h2>
          <p className="text-xs text-gray-400">Klik pada kartu pengurus untuk melihat detail profil.</p>
        </div>

        <OrgChart members={membersData} onSelectMember={(m) => setSelectedMember(m)} />
      </div>

      {/* Member Profile Modal */}
      {selectedMember && (
        <Modal isOpen={!!selectedMember} onClose={() => setSelectedMember(null)} maxWidth="md">
          <div className="text-center space-y-4">
            <img
              src={selectedMember.photo}
              alt={selectedMember.name}
              className="w-24 h-24 rounded-full object-cover mx-auto border-2 border-blue-500 shadow-xl"
            />
            <div>
              <h3 className="text-xl font-bold text-white font-display">{selectedMember.name}</h3>
              <span className="text-sm font-semibold text-blue-400">{selectedMember.position}</span>
            </div>
            <div className="text-xs text-gray-400 bg-gray-900 p-3 rounded-lg border border-gray-800 space-y-1">
              <p><strong>Chapter:</strong> {selectedMember.chapter}</p>
              <p><strong>Motorcycle:</strong> {selectedMember.motorcycle}</p>
              <p><strong>Tahun Bergabung:</strong> {selectedMember.joinYear}</p>
            </div>
            {selectedMember.bio && (
              <p className="text-xs text-gray-300 leading-relaxed italic">"{selectedMember.bio}"</p>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
