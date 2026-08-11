import React from 'react';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { garageData } from '../data/garage';
import { Bike, Wrench, User, Calendar, Cpu } from 'lucide-react';

export const GaragePage: React.FC = () => {
  return (
    <div className="pt-28 pb-20 space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge variant="blue" size="md">ABB GARAGE SHOWCASE</Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white font-display">
          Garasi Motor Anggota
        </h1>
        <p className="text-base text-gray-300">
          Showcase unit sepeda motor adventure, spesifikasi teknis, dan rincian modifikasi milik anggota ABB Community.
        </p>
      </div>

      {/* Bike Showcase Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {garageData.map((bike) => (
          <Card key={bike.id} className="overflow-hidden border-gray-800 flex flex-col group">
            <div className="relative h-64 overflow-hidden">
              <img
                src={bike.image}
                alt={bike.model}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4">
                <Badge variant="cyan">{bike.brand}</Badge>
              </div>
              <div className="absolute bottom-4 right-4 bg-[#0B0F17]/80 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-mono text-cyan-400 border border-gray-700">
                {bike.engineCapacity}
              </div>
            </div>

            <div className="p-6 space-y-6 flex-1 flex flex-col justify-between bg-gradient-to-b from-[#111827] to-[#0B0F17]">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                  <div>
                    <h3 className="text-2xl font-bold text-white font-display">{bike.model}</h3>
                    <span className="text-xs text-gray-400">Tahun Pembuatan: {bike.year}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-blue-400 block">{bike.ownerName}</span>
                    <span className="text-[10px] text-gray-500 block">{bike.chapter}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed italic">
                  "{bike.story}"
                </p>

                {/* Specs & Modifications */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-display">
                    <Wrench className="w-3.5 h-3.5 text-blue-400" /> Rincian Modifikasi & Aksesori:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {bike.modifications.map((mod, idx) => (
                      <span key={idx} className="text-[11px] bg-gray-900 text-gray-300 border border-gray-800 px-2.5 py-1 rounded-md">
                        • {mod}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
