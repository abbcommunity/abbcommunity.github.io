import React, { useState } from 'react';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { RideMap } from '../components/rides/RideMap';
import { ridesData } from '../data/rides';
import { Navigation, MapPin, Calendar, Clock, Users, ArrowRight } from 'lucide-react';

export const RidesPage: React.FC = () => {
  const [selectedRideId, setSelectedRideId] = useState<string>(ridesData[0].id);

  const activeRide = ridesData.find(r => r.id === selectedRideId) || ridesData[0];

  return (
    <div className="pt-28 pb-20 space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge variant="blue" size="md">INTERACTIVE RIDE MAP</Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white font-display">
          Peta Perjalanan & Ekspedisi
        </h1>
        <p className="text-base text-gray-300">
          Visualisasi rute touring, jarak kilometer, waypoint, dan highlight ekspedisi lintas provinsi ABB Community.
        </p>
      </div>

      {/* Map Section */}
      <div className="space-y-4">
        <RideMap
          rides={ridesData}
          selectedRideId={selectedRideId}
          onSelectRide={(id) => setSelectedRideId(id)}
        />
        <p className="text-center text-xs text-gray-400">
          * Klik pada rute di peta atau daftar di bawah untuk melihat rincian lintasan touring.
        </p>
      </div>

      {/* Selected Ride Details & Route List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Active Ride Detail Card */}
        <Card className="lg:col-span-7 p-6 sm:p-8 space-y-6 border-blue-500/40 bg-gradient-to-br from-[#111827] to-[#0B0F17]">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <div>
              <Badge variant="cyan" size="sm">{activeRide.date}</Badge>
              <h2 className="text-2xl font-bold text-white font-display mt-1">{activeRide.title}</h2>
            </div>
            <div className="text-right">
              <span className="text-2xl font-extrabold text-blue-400 font-display block">{activeRide.distanceKm} KM</span>
              <span className="text-[10px] text-gray-400 uppercase">Jarak Total</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            {activeRide.story}
          </p>

          <div className="grid grid-cols-2 gap-4 p-4 bg-[#0B0F17] rounded-xl border border-gray-800 text-xs">
            <div>
              <span className="text-gray-500 block">Titik Keberangkatan:</span>
              <span className="font-semibold text-white">{activeRide.startPoint}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Destinasi Akhir:</span>
              <span className="font-semibold text-white">{activeRide.endPoint}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Estimasi Durasi:</span>
              <span className="font-semibold text-white">{activeRide.durationHours} Jam</span>
            </div>
            <div>
              <span className="text-gray-500 block">Jumlah Peserta:</span>
              <span className="font-semibold text-white">{activeRide.participants} Riders</span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-display">Highlight Destinasi:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {activeRide.highlights.map((h, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2.5 bg-gray-900/60 rounded-lg text-xs border border-gray-800">
                  <Navigation className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="text-gray-300">{h}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Right: Route Select List */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-lg font-bold text-white font-display">Daftar Rute Ekspedisi</h3>
          <div className="space-y-3">
            {ridesData.map((ride) => {
              const isSelected = ride.id === selectedRideId;
              return (
                <button
                  key={ride.id}
                  onClick={() => setSelectedRideId(ride.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group ${
                    isSelected
                      ? 'bg-blue-900/30 border-blue-500/50 shadow-glow-blue/20'
                      : 'bg-gray-900/60 border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-400 block">{ride.date}</span>
                    <h4 className={`text-sm font-bold font-display ${isSelected ? 'text-blue-400' : 'text-white group-hover:text-blue-300'}`}>
                      {ride.title}
                    </h4>
                    <span className="text-xs text-gray-400 block">{ride.startPoint} ➔ {ride.endPoint}</span>
                  </div>
                  <span className="text-sm font-bold font-mono text-cyan-400 shrink-0 ml-3">
                    {ride.distanceKm} km
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
