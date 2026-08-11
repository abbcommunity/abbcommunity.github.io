import React, { useState, useEffect } from 'react';
import { FileText, Plus, Download, Trash2 } from 'lucide-react';
import { documentService } from '../../services/documentService';
import { DocumentMetaDoc } from '../../types/backend';
import { useAuth } from '../../hooks/useAuth';

export const AdminDocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentMetaDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const data = await documentService.getAllDocuments(true);
      setDocuments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleDelete = async (id: string) => {
    if (!user || !confirm('Hapus dokumen ini dari registri?')) return;
    try {
      await documentService.deleteDocument(id, user.uid);
      loadDocuments();
    } catch (err) {
      alert('Gagal menghapus dokumen.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-[#121824] border border-gray-800 rounded-2xl p-6">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-red-500" /> Dokumen Organisasi & SOP
          </h2>
          <p className="text-gray-400 text-xs mt-1">
            Manajemen dokumen AD/ART, SOP Safety Riding, dan Formulir Keanggotaan.
          </p>
        </div>
      </div>

      <div className="bg-[#101622] border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400 font-semibold uppercase text-[10px] tracking-wider bg-[#0C111A]">
              <th className="py-3 px-4">Judul Dokumen</th>
              <th className="py-3 px-4">Kategori</th>
              <th className="py-3 px-4">Ukuran & Tipe</th>
              <th className="py-3 px-4">Hak Akses</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60 text-gray-300">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">Memuat dokumen...</td>
              </tr>
            ) : documents.map((docItem) => (
              <tr key={docItem.id} className="hover:bg-gray-800/30 transition">
                <td className="py-3 px-4 font-semibold text-white">{docItem.title}</td>
                <td className="py-3 px-4 uppercase text-[10px] font-bold text-gray-400">{docItem.category}</td>
                <td className="py-3 px-4 text-gray-400 font-mono">{docItem.fileSize || 'PDF'}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-400 border border-blue-800/40 uppercase">
                    {docItem.visibility}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => handleDelete(docItem.id)}
                    className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition"
                    title="Hapus Metadata"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
