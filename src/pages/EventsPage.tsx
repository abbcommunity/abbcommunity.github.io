import React, { useState } from 'react';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { eventsData } from '../data/events';
import { Event } from '../types';
import { Calendar, MapPin, Users, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';

export const EventsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const categories = ['all', 'Touring', 'Social', 'Charity', 'Safety Riding', 'Anniversary'];

  const filteredEvents = eventsData.filter(e => {
    return selectedCategory === 'all' || e.category === selectedCategory;
  });

  return (
    <div className="pt-28 pb-20 space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge variant="amber" size="md">EVENT & KEGIATAN</Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white font-display">
          Agenda & Ekspedisi ABB
        </h1>
        <p className="text-base text-gray-300">
          Jadwal kegiatan touring, bakti sosial kemanusiaan, dan pelatihan safety riding ABB Community.
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 text-xs font-semibold rounded-full transition-all uppercase tracking-wider ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                : 'bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {cat === 'all' ? 'Semua Category' : cat}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredEvents.map((event) => (
          <Card key={event.id} className="flex flex-col h-full group">
            <div className="relative h-52 overflow-hidden">
              <img
                src={event.coverImage}
                alt={event.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 flex gap-2">
                <Badge variant="blue" size="sm">{event.category}</Badge>
                <Badge variant={event.status === 'upcoming' ? 'emerald' : 'gray'} size="sm">
                  {event.status}
                </Badge>
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-white font-display group-hover:text-blue-400 transition-colors line-clamp-2">
                  {event.title}
                </h3>

                <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">
                  {event.description}
                </p>

                <div className="space-y-1.5 text-xs text-gray-300 pt-3 border-t border-gray-800">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{event.participantsCount} Peserta</span>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-center"
                onClick={() => setSelectedEvent(event)}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Lihat Detail Event
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <Modal isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)} maxWidth="2xl">
          <div className="space-y-6">
            <div className="relative h-60 rounded-xl overflow-hidden">
              <img
                src={selectedEvent.coverImage}
                alt={selectedEvent.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge variant="blue">{selectedEvent.category}</Badge>
                <Badge variant="emerald">{selectedEvent.status}</Badge>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-white font-display">{selectedEvent.title}</h3>
              <p className="text-sm text-gray-300 leading-relaxed mt-2">{selectedEvent.description}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-[#0B0F17] rounded-xl border border-gray-800 text-xs">
              <div>
                <span className="text-gray-500 block">Waktu:</span>
                <span className="font-semibold text-white">{selectedEvent.date} ({selectedEvent.time})</span>
              </div>
              <div>
                <span className="text-gray-500 block">Lokasi:</span>
                <span className="font-semibold text-white">{selectedEvent.location}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Penyelenggara:</span>
                <span className="font-semibold text-white">{selectedEvent.organizer}</span>
              </div>
            </div>

            {/* Timeline */}
            {selectedEvent.timeline && selectedEvent.timeline.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider font-display">Rangkaian Acara (Timeline)</h4>
                <div className="space-y-2">
                  {selectedEvent.timeline.map((t, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2.5 bg-gray-900/60 rounded-lg text-xs border border-gray-800">
                      <span className="font-mono text-blue-400 font-bold shrink-0">{t.time}</span>
                      <span className="text-gray-300">{t.activity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
