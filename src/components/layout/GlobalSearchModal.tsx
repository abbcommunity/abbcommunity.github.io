import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Calendar, BookOpen, Image, Bike, FileText, ArrowRight } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { performGlobalSearch } from '../../lib/search';
import { SearchResult } from '../../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (query.trim()) {
      setResults(performGlobalSearch(query));
    } else {
      setResults([]);
    }
  }, [query]);

  const handleSelect = (url: string) => {
    onClose();
    setQuery('');
    navigate(url);
  };

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'member': return <User className="w-4 h-4 text-blue-400" />;
      case 'event': return <Calendar className="w-4 h-4 text-cyan-400" />;
      case 'story': return <BookOpen className="w-4 h-4 text-emerald-400" />;
      case 'gallery': return <Image className="w-4 h-4 text-amber-400" />;
      case 'garage': return <Bike className="w-4 h-4 text-purple-400" />;
      case 'document': return <FileText className="w-4 h-4 text-red-400" />;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="xl">
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari anggota, event, artikel, galeri, motor, dokumen..."
            className="w-full bg-[#0B0F17] text-white pl-12 pr-4 py-3.5 rounded-xl border border-gray-700/80 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm placeholder-gray-500"
            autoFocus
          />
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
          {query.trim() && results.length === 0 && (
            <div className="text-center py-10 text-gray-500 text-sm">
              Tidak ada hasil yang cocok dengan <span className="text-white">"{query}"</span>
            </div>
          )}

          {!query.trim() && (
            <div className="text-center py-8 text-gray-500 text-xs">
              Ketik nama anggota, lokasi touring, judul artikel, atau kata kunci untuk mencari di seluruh platform.
            </div>
          )}

          {results.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelect(item.url)}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-900/50 hover:bg-blue-900/30 border border-gray-800/80 hover:border-blue-500/40 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#0B0F17] border border-gray-800 flex items-center justify-center shrink-0">
                  {getIcon(item.type)}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-gray-400">{item.subtitle}</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all" />
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
};
