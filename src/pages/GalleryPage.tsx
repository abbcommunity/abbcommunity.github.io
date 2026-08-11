import React, { useState } from 'react';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { galleryData } from '../data/gallery';
import { GalleryItem } from '../types';
import { GalleryLightbox } from '../components/gallery/GalleryLightbox';
import { Maximize2, Tag, Calendar } from 'lucide-react';

export const GalleryPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [activeLightboxItem, setActiveLightboxItem] = useState<GalleryItem | null>(null);

  const categories = ['all', 'Touring', 'Social', 'Gathering', 'Anniversary'];
  const years = ['all', '2025', '2024', '2020', '2019', '2016'];

  const filteredGallery = galleryData.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesYear = selectedYear === 'all' || item.year.toString() === selectedYear;
    return matchesCategory && matchesYear;
  });

  return (
    <div className="pt-28 pb-20 space-y-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge variant="cyan" size="md">GALERI DOKUMENTASI</Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white font-display">
          Automotive Media Gallery
        </h1>
        <p className="text-base text-gray-300">
          Arsip foto dan momen bersejarah perjalanan ABB Community dari tahun ke tahun.
        </p>
      </div>

      {/* Filter Options */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#111827]/80 backdrop-blur-xl p-4 rounded-2xl border border-gray-800">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-gray-400 uppercase mr-2">Category:</span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-900 text-gray-400 hover:text-white'
              }`}
            >
              {cat === 'all' ? 'Semua' : cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-400 uppercase">Tahun:</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-[#0B0F17] text-gray-300 text-xs px-3 py-1.5 rounded-lg border border-gray-700 focus:outline-none"
          >
            {years.map(y => <option key={y} value={y}>{y === 'all' ? 'Semua Tahun' : y}</option>)}
          </select>
        </div>
      </div>

      {/* Gallery Masonry / Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredGallery.map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveLightboxItem(item)}
            className="relative group rounded-xl overflow-hidden cursor-pointer border border-gray-800 bg-gray-900 h-64"
          >
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{item.category} • {item.year}</span>
                  <h3 className="text-sm font-bold text-white font-display mt-0.5">{item.title}</h3>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg">
                  <Maximize2 className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      <GalleryLightbox
        item={activeLightboxItem}
        onClose={() => setActiveLightboxItem(null)}
      />
    </div>
  );
};
