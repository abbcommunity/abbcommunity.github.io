import React from 'react';
import { Modal } from '../ui/Modal';
import { GalleryItem } from '../../types';
import { Calendar, Tag } from 'lucide-react';

interface GalleryLightboxProps {
  item: GalleryItem | null;
  onClose: () => void;
}

export const GalleryLightbox: React.FC<GalleryLightboxProps> = ({ item, onClose }) => {
  if (!item) return null;

  return (
    <Modal isOpen={!!item} onClose={onClose} maxWidth="4xl">
      <div className="space-y-4">
        <div className="relative rounded-xl overflow-hidden bg-black max-h-[70vh] flex items-center justify-center">
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-contain max-h-[65vh]"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-gray-800">
          <div>
            <h3 className="text-lg font-bold text-white font-display">{item.title}</h3>
            {item.description && <p className="text-sm text-gray-400 mt-1">{item.description}</p>}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="inline-flex items-center gap-1 text-xs text-blue-400 bg-blue-900/40 border border-blue-500/30 px-3 py-1 rounded-full">
              <Calendar className="w-3.5 h-3.5" /> {item.year}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-cyan-400 bg-cyan-900/40 border border-cyan-500/30 px-3 py-1 rounded-full">
              <Tag className="w-3.5 h-3.5" /> {item.category}
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
};
