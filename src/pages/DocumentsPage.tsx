import React from 'react';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { documentsData } from '../data/documents';
import { FileText, Download, ShieldCheck, Calendar, HardDrive } from 'lucide-react';

export const DocumentsPage: React.FC = () => {
  return (
    <div className="pt-28 pb-20 space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge variant="blue" size="md">PUSAT DOKUMEN & REGULASI</Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white font-display">
          Dokumen Resmi ABB Community
        </h1>
        <p className="text-base text-gray-300">
          Unduh Anggaran Dasar/Anggaran Rumah Tangga (AD/ART), Standar Operasional Prosedur (SOP) keselamatan berkendara, dan formulir registrasi.
        </p>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {documentsData.map((doc) => (
          <Card key={doc.id} className="p-6 space-y-4 flex flex-col justify-between border-gray-800 hover:border-blue-500/40">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="blue" size="sm">{doc.category}</Badge>
                <span className="text-xs font-mono text-gray-400 flex items-center gap-1">
                  <HardDrive className="w-3.5 h-3.5 text-blue-400" /> {doc.fileSize} ({doc.fileType})
                </span>
              </div>

              <h3 className="text-lg font-bold text-white font-display">{doc.title}</h3>
              <p className="text-xs text-gray-300 leading-relaxed">{doc.description}</p>
            </div>

            <div className="pt-4 border-t border-gray-800 flex items-center justify-between">
              <span className="text-[11px] text-gray-500">Diperbarui: {doc.updatedAt}</span>
              <a href={doc.downloadUrl} onClick={(e) => { e.preventDefault(); alert(`Mengunduh dokumen: ${doc.title}`); }}>
                <Button size="sm" variant="outline" icon={<Download className="w-4 h-4" />}>
                  Unduh File PDF
                </Button>
              </a>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
