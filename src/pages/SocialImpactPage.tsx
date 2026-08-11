import React from 'react';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { socialImpactData } from '../data/socialImpact';
import { Heart, Activity, Users, Award, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SocialImpactPage: React.FC = () => {
  return (
    <div className="pt-28 pb-20 space-y-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge variant="crimson" size="md">SOCIAL IMPACT — RIDE BEYOND THE ROAD</Badge>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white font-display">
          Aksi Kemanusiaan & Bakti Medis
        </h1>
        <p className="text-base text-gray-300 leading-relaxed">
          ABB Community mendedikasikan persaudaraan berkendara untuk membawa manfaat kesehatan gratis, donor darah, dan bantuan sosial bagi masyarakat pra-sejahtera.
        </p>
      </div>

      {/* Impact Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-6 text-center border-red-500/30 bg-gradient-to-b from-red-950/20 to-[#111827]">
          <Heart className="w-8 h-8 text-red-400 mx-auto mb-3" />
          <span className="text-3xl font-extrabold text-white font-display block">150+ Anak</span>
          <span className="text-xs text-gray-400 uppercase mt-1 block">Telah Dikhitan Gratis</span>
        </Card>
        <Card className="p-6 text-center border-blue-500/30 bg-gradient-to-b from-blue-950/20 to-[#111827]">
          <Activity className="w-8 h-8 text-blue-400 mx-auto mb-3" />
          <span className="text-3xl font-extrabold text-white font-display block">180+ Kantong</span>
          <span className="text-xs text-gray-400 uppercase mt-1 block">Darah Terkumpul PMI</span>
        </Card>
        <Card className="p-6 text-center border-emerald-500/30 bg-gradient-to-b from-emerald-950/20 to-[#111827]">
          <Users className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
          <span className="text-3xl font-extrabold text-white font-display block">500+ Penerima</span>
          <span className="text-xs text-gray-400 uppercase mt-1 block">Manfaat Bakti Sosial</span>
        </Card>
      </div>

      {/* Social Impact Programs Grid */}
      <div className="space-y-8">
        <h2 className="text-3xl font-extrabold text-white font-display text-center">Program Unggulan Kemanusiaan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {socialImpactData.map((prog) => (
            <Card key={prog.id} className="flex flex-col h-full overflow-hidden border-red-500/30">
              <div className="relative h-52">
                <img
                  src={prog.coverImage}
                  alt={prog.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3">
                  <Badge variant="crimson">{prog.category}</Badge>
                </div>
                <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold text-emerald-400 border border-emerald-500/30">
                  {prog.impactMetric}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-white font-display leading-snug">{prog.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{prog.description}</p>
                </div>

                <div className="pt-3 border-t border-gray-800 text-xs text-gray-400 space-y-1">
                  <p><strong>Tanggal:</strong> {prog.date}</p>
                  <p><strong>Lokasi:</strong> {prog.location}</p>
                  <p><strong>Mitra:</strong> <span className="text-blue-400">{prog.partner}</span></p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Hospital Partnership Callout */}
      <Card className="p-8 sm:p-12 bg-gradient-to-r from-blue-950/60 via-[#111827] to-cyan-950/60 border-blue-500/30">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <Badge variant="cyan">KEMITRAAN KESEHATAN MEDIS</Badge>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              Dukungan Jaringan Primaya Hospital Group
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              Setiap program bakti sosial medis ABB Community didukung penuh oleh tim dokter spesialis, perawat profesional, dan pengadaan obat medis bersertifikat resmi dari jaringan Primaya Hospital.
            </p>
          </div>
          <div className="lg:col-span-4 text-center lg:text-right">
            <Link to="/contact">
              <Button size="lg" variant="glow">
                Ajukan Kerjasama Bakti Sosial
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
};
