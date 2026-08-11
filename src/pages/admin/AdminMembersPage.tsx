import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Trash2,
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  XCircle,
  Loader2,
  Download,
  Pencil,
  ExternalLink,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useMembers } from '../../hooks/useMembers';
import { memberService } from '../../services/memberService';
import { useAuth } from '../../hooks/useAuth';
import { MemberProfile } from '../../types/backend';
import { convertGoogleDriveUrl, getAvatarUrl, handleAvatarError } from '../../utils/imageUtils';

interface OperationState {
  status: 'idle' | 'loading' | 'success' | 'error';
  message: string;
  importedCount?: number;
  totalCount?: number;
  progressPercent?: number;
}

/**
 * Strips leading/trailing single quotes ('), double quotes ("), or Excel leading apostrophes.
 */
const cleanString = (val?: string | null): string => {
  if (!val) return '';
  return val.trim().replace(/^['"]+/, '').replace(/['"]+$/, '').replace(/^'/, '');
};

/**
 * RFC-4180 compliant CSV line parser with escaped quote ("") support.
 */
const parseCSVLineWithQuotes = (line: string, delimiter: string): string[] => {
  if (delimiter === '\t') {
    return line.split('\t').map((s) => cleanString(s).replace(/""/g, '"'));
  }

  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // Skip second escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(cleanString(current).replace(/""/g, '"'));
      current = '';
    } else {
      current += char;
    }
  }
  result.push(cleanString(current).replace(/""/g, '"'));
  return result;
};

export const AdminMembersPage: React.FC = () => {
  const { members, loading, refetch } = useMembers(true);
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);

  // Status state for Bulk Import
  const [importOpState, setImportOpState] = useState<OperationState>({
    status: 'idle',
    message: '',
  });

  // Status state for Multiple Delete
  const [deleteOpState, setDeleteOpState] = useState<OperationState>({
    status: 'idle',
    message: '',
  });

  // Form member state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    nik: '',
    position: 'Anggota',
    chapter: 'Bekasi Chapter',
    status: 'active' as 'active' | 'inactive',
    joinYear: 2026,
    motorcycleModel: 'Honda CB500X',
    bio: '',
    photoURL: '',
  });

  // Bulk import state
  const [pastedData, setPastedData] = useState('');
  const [parsedPreview, setParsedPreview] = useState<Partial<MemberProfile>[]>([]);

  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.nik?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.chapter?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.position?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isAllSelected =
    filteredMembers.length > 0 && filteredMembers.every((m) => selectedIds.includes(m.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredMembers.map((m) => m.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkDelete = async () => {
    if (!user || selectedIds.length === 0) return;
    if (!confirm(`Apakah Anda yakin ingin menghapus ${selectedIds.length} anggota yang dipilih secara permanen?`)) {
      return;
    }

    setIsDeletingBulk(true);
    const total = selectedIds.length;

    setDeleteOpState({
      status: 'loading',
      message: `⏳ Menunggu proses: Sedang menghapus 0 / ${total} anggota dari Cloud Firestore...`,
      importedCount: 0,
      totalCount: total,
      progressPercent: 0,
    });

    try {
      const count = await memberService.bulkDeleteMembers(
        selectedIds,
        user.uid,
        (deleted, totalCount) => {
          const percent = Math.round((deleted / totalCount) * 100);
          setDeleteOpState({
            status: 'loading',
            message: `⏳ Menunggu proses: Sedang menghapus ${deleted} / ${totalCount} anggota dari Cloud Firestore...`,
            importedCount: deleted,
            totalCount: totalCount,
            progressPercent: percent,
          });
        }
      );

      setDeleteOpState({
        status: 'success',
        message: `✅ BERHASIL: Menghapus ${count} / ${total} data anggota secara permanen!`,
        importedCount: count,
        totalCount: total,
        progressPercent: 100,
      });

      setSelectedIds([]);
      await refetch();
      setTimeout(() => {
        setDeleteOpState({ status: 'idle', message: '' });
      }, 2500);
    } catch (err: any) {
      setDeleteOpState({
        status: 'error',
        message: `❌ GAGAL: Terjadi kesalahan saat menghapus data massal: ${err.message || err}`,
      });
    } finally {
      setIsDeletingBulk(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingMemberId(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      nik: '',
      position: 'Anggota',
      chapter: 'Bekasi Chapter',
      status: 'active',
      joinYear: 2026,
      motorcycleModel: 'Honda CB500X',
      bio: '',
      photoURL: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (member: MemberProfile) => {
    setEditingMemberId(member.id);
    setFormData({
      name: cleanString(member.name),
      email: cleanString(member.email),
      phone: cleanString(member.phone),
      address: cleanString(member.address),
      nik: cleanString(member.nik),
      position: member.position || 'Anggota',
      chapter: member.chapter || 'Bekasi Chapter',
      status: (member.status === 'inactive' ? 'inactive' : 'active'),
      joinYear: member.joinYear || 2026,
      motorcycleModel: member.motorcycle?.model || 'Honda CB500X',
      bio: member.bio || '',
      photoURL: member.photoURL || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const payload = {
        name: cleanString(formData.name),
        email: cleanString(formData.email),
        phone: cleanString(formData.phone),
        address: cleanString(formData.address),
        nik: cleanString(formData.nik),
        position: formData.position || 'Anggota',
        chapter: formData.chapter || 'Bekasi Chapter',
        joinYear: formData.joinYear || 2026,
        status: formData.status || 'active',
        visibility: 'public' as const,
        motorcycle: { model: formData.motorcycleModel },
        bio: formData.bio || '',
        photoURL: convertGoogleDriveUrl(formData.photoURL) || '',
      };

      if (editingMemberId) {
        await memberService.updateMember(editingMemberId, payload, user.uid);
      } else {
        await memberService.createMember(payload, user.uid);
      }

      setIsModalOpen(false);
      setEditingMemberId(null);
      refetch();
    } catch (err: any) {
      alert('Gagal menyimpan data anggota: ' + (err.message || err));
    }
  };

  /**
   * Reads Native Excel 2D Array directly
   */
  const parseExcelSheetRows = (rows: any[][]) => {
    if (!rows || rows.length === 0) return;

    const firstRow = (rows[0] || []).map((c) => cleanString(String(c ?? '')).toLowerCase());
    const isHeaderLine =
      firstRow.some((h) => h.includes('nama')) ||
      firstRow.some((h) => h.includes('email')) ||
      firstRow.some((h) => h.includes('kontak')) ||
      firstRow.some((h) => h.includes('nik'));

    const startIndex = isHeaderLine ? 1 : 0;
    const parsed: Partial<MemberProfile>[] = [];

    for (let i = startIndex; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;

      let name = '';
      let email = '';
      let phone = '';
      let address = '';
      let position = 'Anggota';
      let chapter = 'Bekasi Chapter';
      let nik = '';
      let rawPhotoURL = '';

      if (isHeaderLine) {
        firstRow.forEach((h, colIdx) => {
          const val = cleanString(String(row[colIdx] ?? ''));
          if (!val) return;

          if (h === 'nik' || h.startsWith('nik')) {
            nik = val;
          } else if ((h.includes('email address') || h === 'email') && val.includes('@')) {
            email = val;
          } else if (h.includes('kontak') || h.includes('telp') || h.includes('hp')) {
            if (val.includes('@')) email = val;
            else phone = val;
          } else if (h.includes('nama')) {
            name = val;
          } else if (h.includes('alamat')) {
            address = val;
          } else if (h.includes('jabatan') || h.includes('chapte')) {
            if (val.includes('-')) {
              const parts = val.split('-');
              position = parts[0].trim();
              chapter = parts[1].trim();
            } else {
              position = val;
            }
          } else if (h.includes('foto') || h.includes('profil') || h.includes('drive')) {
            rawPhotoURL = val;
          }
        });
      } else {
        name = cleanString(String(row[0] ?? ''));
        const kontak = cleanString(String(row[1] ?? ''));
        if (kontak.includes('@')) email = kontak;
        else phone = kontak;

        address = cleanString(String(row[2] ?? ''));
        const jabChap = cleanString(String(row[3] ?? ''));
        if (jabChap.includes('-')) {
          const parts = jabChap.split('-');
          position = parts[0].trim();
          chapter = parts[1].trim();
        } else if (jabChap) {
          position = jabChap;
        }

        nik = cleanString(String(row[6] ?? ''));
        if (row[8]) email = cleanString(String(row[8] ?? ''));
        rawPhotoURL = cleanString(String(row[9] ?? row[4] ?? ''));
      }

      phone = cleanString(phone);
      email = cleanString(email);
      nik = cleanString(nik);
      name = cleanString(name);
      address = cleanString(address);

      // --- SMART DEEP NIK SEARCH & SANITIZATION ---
      const isInvalidNik = !nik || nik.match(/kab|bekasi|jabar|kec|kel|rt\.|rw\.|jln|jalan|gg|active|valid|status/i) || nik.includes('.');
      if (isInvalidNik) {
        nik = '';
        for (const cellVal of row) {
          const strVal = cleanString(String(cellVal ?? ''));
          if (strVal.match(/^ABB\d{3,}$/i)) {
            nik = strVal.toUpperCase();
            break;
          }
        }
      }

      const photoURL = convertGoogleDriveUrl(rawPhotoURL);

      if (name || email || nik) {
        parsed.push({
          name: name || 'Anggota ABB',
          email: email || '',
          phone: phone || '',
          address: address || '',
          nik: nik || '',
          position: position || 'Anggota',
          chapter: chapter || 'Bekasi Chapter',
          joinYear: 2026,
          photoURL: photoURL || '',
          status: 'active',
          visibility: 'public',
        });
      }
    }

    setParsedPreview(parsed);
    setImportOpState({ status: 'idle', message: '' });
  };

  const parsePastedExcelCSV = (text: string) => {
    setPastedData(text);
    if (!text.trim()) {
      setParsedPreview([]);
      setImportOpState({ status: 'idle', message: '' });
      return;
    }

    const lines = text.trim().split(/\r?\n/);
    if (lines.length === 0) return;

    const headerLine = lines[0];
    const headerCols = parseCSVLineWithQuotes(headerLine, headerLine.includes('\t') ? '\t' : ',').map((h) => cleanString(h).toLowerCase());
    
    const isHeaderLine =
      headerCols.some(h => h.includes('nama')) ||
      headerCols.some(h => h.includes('email')) ||
      headerCols.some(h => h.includes('kontak')) ||
      headerCols.some(h => h.includes('nik')) ||
      headerCols.some(h => h.includes('foto'));

    const startIndex = isHeaderLine ? 1 : 0;
    const parsed: Partial<MemberProfile>[] = [];

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      const delimiter = line.includes('\t') ? '\t' : ',';
      const cols = parseCSVLineWithQuotes(line, delimiter);

      let name = '';
      let email = '';
      let phone = '';
      let address = '';
      let position = 'Anggota';
      let chapter = 'Bekasi Chapter';
      let nik = '';
      let rawPhotoURL = '';

      if (isHeaderLine) {
        headerCols.forEach((h, colIdx) => {
          const val = cleanString(cols[colIdx] || '');
          if (!val) return;

          if (h === 'nik' || h.startsWith('nik')) {
            nik = val;
          } else if ((h.includes('email address') || h === 'email') && val.includes('@')) {
            email = val;
          } else if (h.includes('kontak') || h.includes('telp') || h.includes('hp')) {
            if (val.includes('@')) email = val;
            else phone = val;
          } else if (h.includes('nama')) {
            name = val;
          } else if (h.includes('alamat')) {
            address = val;
          } else if (h.includes('jabatan') || h.includes('chapte')) {
            if (val.includes('-')) {
              const parts = val.split('-');
              position = parts[0].trim();
              chapter = parts[1].trim();
            } else {
              position = val;
            }
          } else if (h.includes('foto') || h.includes('profil') || h.includes('drive')) {
            rawPhotoURL = val;
          }
        });
      } else {
        name = cleanString(cols[0] || '');
        const kontakCol = cleanString(cols[1] || '');
        if (kontakCol.includes('@')) email = kontakCol;
        else phone = kontakCol;

        address = cleanString(cols[2] || '');
        const jabChap = cleanString(cols[3] || '');
        if (jabChap.includes('-')) {
          const parts = jabChap.split('-');
          position = parts[0].trim();
          chapter = parts[1].trim();
        } else if (jabChap) {
          position = jabChap;
        }

        nik = cleanString(cols[6] || '');
        if (cols[8]) email = cleanString(cols[8]);
        rawPhotoURL = cleanString(cols[9] || cols[4] || '');
      }

      phone = cleanString(phone);
      email = cleanString(email);
      nik = cleanString(nik);
      name = cleanString(name);
      address = cleanString(address);

      // --- SMART DEEP NIK SEARCH & RE-DISAMBIGUATION ---
      const isInvalidNik = !nik || nik.match(/kab|bekasi|jabar|kec|kel|rt\.|rw\.|jln|jalan|gg|active|valid|status/i) || nik.includes('.');
      if (isInvalidNik) {
        if (nik && (nik.match(/kab|bekasi|jabar|kec|kel|rt\.|rw\.|jln|jalan|gg/i) || nik.includes('.'))) {
          address = address ? `${address}, ${cleanString(nik)}` : cleanString(nik);
        }
        nik = '';

        for (const colVal of cols) {
          const cleanedVal = cleanString(colVal);
          if (cleanedVal.match(/^ABB\d{3,}$/i)) {
            nik = cleanedVal.toUpperCase();
            break;
          }
        }
      }

      if (email && !email.includes('@')) {
        if (!nik || nik.match(/active|valid|status/i)) {
          nik = email;
        }
        email = '';
      }

      if (position.match(/RT\.|RW\.|NO\.|Blok|Kel\.|Kec\.|Jl\.|Jalan|Jln|Gg/i) || chapter.match(/RT\.|RW\.|NO\.|Blok|Kel\.|Kec\.|Jl\.|Jalan|Jln|Gg/i)) {
        const addrFragment = `${position} ${chapter}`.trim();
        address = address ? `${address}, ${addrFragment}` : addrFragment;
        position = 'Anggota';
        chapter = 'Bekasi Chapter';
      }

      if (phone && phone.includes('@') && !email) {
        email = phone;
        phone = '';
      }

      if (!rawPhotoURL && address.includes('http')) {
        rawPhotoURL = address;
        address = '';
      }

      const photoURL = convertGoogleDriveUrl(rawPhotoURL);

      if (name || email || nik) {
        parsed.push({
          name: name || 'Anggota ABB',
          email: email || '',
          phone: phone || '',
          address: address || '',
          nik: nik || '',
          position: position || 'Anggota',
          chapter: chapter || 'Bekasi Chapter',
          joinYear: 2026,
          photoURL: photoURL || '',
          status: 'active',
          visibility: 'public',
        });
      }
    }

    setParsedPreview(parsed);
    setImportOpState({ status: 'idle', message: '' });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const data = new Uint8Array(evt.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const sheetRows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
          parseExcelSheetRows(sheetRows);
        } catch (err: any) {
          setImportOpState({
            status: 'error',
            message: 'Gagal membaca file Excel (.xlsx): ' + (err.message || err),
          });
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const content = evt.target?.result as string;
        if (content) {
          parsePastedExcelCSV(content);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleExecuteBulkImport = async () => {
    if (!user || parsedPreview.length === 0) return;

    const total = parsedPreview.length;
    setImportOpState({
      status: 'loading',
      message: `⏳ Menunggu proses: Sedang menyimpan 0 / ${total} data anggota ke Cloud Firestore...`,
      importedCount: 0,
      totalCount: total,
      progressPercent: 0,
    });

    try {
      const itemsToImport = parsedPreview.map((item) => ({
        name: cleanString(item.name) || 'Anggota ABB',
        email: cleanString(item.email),
        phone: cleanString(item.phone),
        address: cleanString(item.address),
        nik: cleanString(item.nik),
        position: item.position || 'Anggota',
        chapter: item.chapter || 'Bekasi Chapter',
        joinYear: item.joinYear || 2026,
        photoURL: item.photoURL || '',
        status: 'active' as const,
        visibility: 'public' as const,
      }));

      const count = await memberService.bulkImportMembers(
        itemsToImport,
        user.uid,
        (imported, totalCount) => {
          const percent = Math.round((imported / totalCount) * 100);
          setImportOpState({
            status: 'loading',
            message: `⏳ Menunggu proses: Sedang menyimpan ${imported} / ${totalCount} data anggota ke Cloud Firestore...`,
            importedCount: imported,
            totalCount: totalCount,
            progressPercent: percent,
          });
        }
      );

      // Instantly transition to SUCCESS state
      setImportOpState({
        status: 'success',
        message: `✅ BERHASIL: Menyimpan ${count} / ${total} data anggota ke database Cloud Firestore!`,
        importedCount: count,
        totalCount: total,
        progressPercent: 100,
      });

      refetch();
    } catch (err: any) {
      setImportOpState({
        status: 'error',
        message: `❌ GAGAL: Terjadi kesalahan saat menyimpan data: ${err.message || err}`,
      });
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!user || !confirm('Apakah Anda yakin ingin menghapus data anggota ini?')) return;
    try {
      await memberService.deleteMember(id, user.uid);
      refetch();
    } catch (err) {
      alert('Gagal menghapus data.');
    }
  };

  const handleDownloadTemplateXlsx = () => {
    const sampleData = [
      {
        'Nama Anggota': 'Arrio Yusman',
        'Kontak (Email / Telp)': '08118122233',
        'Alamat': 'Taman Kayuringin Timur No 9, Bekasi',
        'Jabatan & Chapte': 'Anggota - Bekasi Chapter',
        'Status': 'active',
        'Aksi': 'valid',
        'NIK': 'ABB001',
        'Timestamp': '2026-08-11 10:00:00',
        'Email Address': 'arrioyusman@icloud.com',
        'Foto Profil Bebas': 'https://drive.google.com/open?id=1aBSRn5GMsR8YsXJTgCyqLCS5cMO3ZPPI',
      },
      {
        'Nama Anggota': 'Stefanus Agung Joko Winarno',
        'Kontak (Email / Telp)': '08129876543',
        'Alamat': 'Bekasi Barat, Kota Bekasi',
        'Jabatan & Chapte': 'Anggota - Bekasi Chapter',
        'Status': 'active',
        'Aksi': 'valid',
        'NIK': 'ABB002',
        'Timestamp': '2026-08-11 10:05:00',
        'Email Address': 'stefanus@abbcommunity.id',
        'Foto Profil Bebas': 'https://drive.google.com/open?id=1aBSRn5GMsR8YsXJTgCyqLCS5cMO3ZPPI',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Anggota ABB');

    worksheet['!cols'] = [
      { wch: 28 }, // Nama Anggota
      { wch: 22 }, // Kontak (Email / Telp)
      { wch: 35 }, // Alamat
      { wch: 28 }, // Jabatan & Chapte
      { wch: 12 }, // Status
      { wch: 10 }, // Aksi
      { wch: 15 }, // NIK
      { wch: 20 }, // Timestamp
      { wch: 28 }, // Email Address
      { wch: 60 }, // Foto Profil Bebas
    ];

    XLSX.writeFile(workbook, 'template_import_anggota_abb.xlsx');
  };

  const handleDownloadTemplateCsv = () => {
    const csvContent =
      'Nama Anggota,Kontak (Email / Telp),Alamat,Jabatan & Chapte,Status,Aksi,NIK,Timestamp,Email Address,Foto Profil Bebas\n' +
      'Arrio Yusman,08118122233,"Taman Kayuringin Timur No 9, Bekasi",Anggota - Bekasi Chapter,active,valid,ABB001,2026-08-11 10:00:00,arrioyusman@icloud.com,https://drive.google.com/open?id=1aBSRn5GMsR8YsXJTgCyqLCS5cMO3ZPPI\n' +
      'Stefanus Agung Joko Winarno,08129876543,"Bekasi Barat, Kota Bekasi",Anggota - Bekasi Chapter,active,valid,ABB002,2026-08-11 10:05:00,stefanus@abbcommunity.id,https://drive.google.com/open?id=1aBSRn5GMsR8YsXJTgCyqLCS5cMO3ZPPI';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_import_anggota_abb.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCloseImportModal = () => {
    setIsImportModalOpen(false);
    setPastedData('');
    setParsedPreview([]);
    setImportOpState({ status: 'idle', message: '' });
    refetch();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121824] border border-gray-800 rounded-2xl p-6">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-red-500" /> Manajemen Anggota ABB
          </h2>
          <p className="text-gray-400 text-xs mt-1">
            Pengelolaan direktori anggota, NIK, kepengurusan, edit data, multiple delete, dan import Excel (.xlsx/.xls/.csv) 10 Kolom.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition flex items-center gap-2 shadow-lg shadow-emerald-600/20"
          >
            <FileSpreadsheet className="w-4 h-4" /> Import Excel (.xlsx) / CSV
          </button>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-xl transition flex items-center gap-2 shadow-lg shadow-red-600/20"
          >
            <Plus className="w-4 h-4" /> Tambah Anggota
          </button>
        </div>
      </div>

      {/* Multiple Delete / Main Operation Status Indicator Banner */}
      {deleteOpState.status !== 'idle' && (
        <div
          className={`p-4 border rounded-2xl space-y-3 text-xs font-semibold transition-all shadow-xl ${
            deleteOpState.status === 'loading'
              ? 'bg-blue-950/80 border-blue-800 text-blue-200 shadow-blue-900/30'
              : deleteOpState.status === 'success'
              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-200 shadow-emerald-900/30'
              : 'bg-red-950/80 border-red-800 text-red-200 shadow-red-900/30'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {deleteOpState.status === 'loading' && (
              <Loader2 className="w-5 h-5 text-blue-400 animate-spin shrink-0" />
            )}
            {deleteOpState.status === 'success' && (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            {deleteOpState.status === 'error' && (
              <XCircle className="w-5 h-5 text-red-400 shrink-0" />
            )}

            <div className="flex-1">
              <p className="font-bold text-sm">
                {deleteOpState.status === 'loading' && '⏳ MENUNGGU PROSES PENGHAPUSAN MASSAL (Processing...)'}
                {deleteOpState.status === 'success' && '✅ PROSES PENGHAPUSAN BERHASIL (Success)'}
                {deleteOpState.status === 'error' && '❌ PROSES PENGHAPUSAN GAGAL (Error)'}
              </p>
              <p className="mt-0.5 font-normal text-xs">{deleteOpState.message}</p>
            </div>
          </div>

          {deleteOpState.status === 'loading' && deleteOpState.progressPercent !== undefined && (
            <div className="space-y-1 mt-2">
              <div className="flex justify-between items-center text-[11px] font-mono font-bold text-blue-300">
                <span>Progress Hapus: <strong className="text-white text-xs">{deleteOpState.importedCount || 0} / {deleteOpState.totalCount || 0}</strong> Anggota</span>
                <span className="text-emerald-400 font-extrabold text-xs">{deleteOpState.progressPercent}%</span>
              </div>
              <div className="w-full bg-gray-900 border border-gray-800 rounded-full h-2.5 overflow-hidden p-0.5">
                <div
                  className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 h-1.5 rounded-full transition-all duration-300 shadow-md shadow-emerald-500/30"
                  style={{ width: `${deleteOpState.progressPercent}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter, Search & Bulk Delete Toolbar */}
      <div className="bg-[#101622] border border-gray-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96 flex items-center gap-3">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari anggota berdasarkan nama, NIK, email, jabatan, atau chapter..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none"
          />
        </div>

        {/* Bulk Action Controls */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end bg-red-950/40 border border-red-900/60 px-3.5 py-1.5 rounded-xl">
            <span className="text-xs font-semibold text-red-300">
              Terpilih: <strong>{selectedIds.length}</strong> anggota
            </span>
            <button
              onClick={handleBulkDelete}
              disabled={isDeletingBulk || deleteOpState.status === 'loading'}
              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition flex items-center gap-2 shadow-md shadow-red-600/30"
            >
              {isDeletingBulk ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Menghapus...
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" /> Hapus ({selectedIds.length}) Terpilih
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Members Main Directory Table (Matches 10 Columns of Excel Template) */}
      <div className="bg-[#101622] border border-gray-800 rounded-2xl overflow-x-auto">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400 font-bold uppercase text-[10px] tracking-wider bg-[#0C111A]">
              <th className="py-3 px-3 w-8">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-700 bg-gray-900 text-red-600 focus:ring-red-500 cursor-pointer"
                />
              </th>
              <th className="py-3 px-3">Nama Anggota</th>
              <th className="py-3 px-3">Kontak (Email / Telp)</th>
              <th className="py-3 px-3">Alamat</th>
              <th className="py-3 px-3">Jabatan & Chapter</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3">NIK</th>
              <th className="py-3 px-3">Timestamp</th>
              <th className="py-3 px-3">Email Address</th>
              <th className="py-3 px-3">Foto Profil</th>
              <th className="py-3 px-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60 text-gray-300">
            {loading ? (
              <tr>
                <td colSpan={11} className="py-8 text-center text-gray-500">Memuat data anggota...</td>
              </tr>
            ) : filteredMembers.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-8 text-center text-gray-500">Tidak ada anggota yang cocok.</td>
              </tr>
            ) : (
              filteredMembers.map((m) => {
                const isSelected = selectedIds.includes(m.id);
                return (
                  <tr key={m.id} className={`hover:bg-gray-800/30 transition ${isSelected ? 'bg-red-950/20' : ''}`}>
                    <td className="py-3 px-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(m.id)}
                        className="rounded border-gray-700 bg-gray-900 text-red-600 focus:ring-red-500 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-3 font-semibold text-white flex items-center gap-2">
                      <img
                        src={getAvatarUrl(m.photoURL, m.name)}
                        alt={m.name}
                        onError={(e) => handleAvatarError(e, m.photoURL, m.name)}
                        className="w-8 h-8 rounded-full object-cover border border-gray-700 bg-gray-800 shrink-0"
                      />
                      <div>
                        <p className="text-white font-bold">{cleanString(m.name)}</p>
                        <p className="text-[10px] text-gray-500">Joined {m.joinYear || 2026}</p>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-gray-300 text-[11px]">{cleanString(m.phone) || '-'}</td>
                    <td className="py-3 px-3 text-gray-400 max-w-xs truncate">{cleanString(m.address) || '-'}</td>
                    <td className="py-3 px-3 text-gray-300">
                      <p className="font-medium text-white">{m.position || 'Anggota'}</p>
                      <p className="text-[10px] text-gray-500">{m.chapter || 'Bekasi Chapter'}</p>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                        {m.status || 'active'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-emerald-400 text-[11px] font-semibold">{cleanString(m.nik) || '-'}</td>
                    <td className="py-3 px-3 text-[10px] text-gray-500 font-mono">{m.createdAt ? m.createdAt.slice(0, 10) : '-'}</td>
                    <td className="py-3 px-3 font-mono text-blue-300 text-[11px]">{cleanString(m.email) || '-'}</td>
                    <td className="py-3 px-3 text-[11px] font-mono text-gray-400 max-w-[140px] truncate">
                      {m.photoURL ? (
                        <a
                          href={m.photoURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-400 hover:underline flex items-center gap-1 font-sans text-[11px]"
                          title={m.photoURL}
                        >
                          <ExternalLink className="w-3 h-3 shrink-0" />
                          <span className="truncate">{m.photoURL.replace(/^https?:\/\//, '')}</span>
                        </a>
                      ) : (
                        <span className="text-gray-500 font-sans text-[11px]">Tanpa Foto</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(m)}
                          className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-950/40 rounded-lg transition"
                          title="Edit Data Anggota"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteMember(m.id)}
                          className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition"
                          title="Hapus Anggota"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121824] border border-gray-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-white text-center">
              {editingMemberId ? '✏️ Edit Data Anggota Komunitas' : '➕ Tambah Anggota Komunitas Baru'}
            </h3>

            {/* Large Centered Avatar Photo Preview */}
            <div className="flex flex-col items-center justify-center pt-1 pb-2">
              <div className="relative group">
                <img
                  src={getAvatarUrl(formData.photoURL, formData.name)}
                  alt={formData.name || 'Avatar'}
                  onError={(e) => handleAvatarError(e, formData.photoURL, formData.name)}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-emerald-500/80 shadow-2xl shadow-emerald-500/30 bg-gray-800 transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-gray-900 shadow-md">
                  Live Foto
                </div>
              </div>
              <p className="text-white font-extrabold text-sm mt-2 text-center">{formData.name || 'Nama Anggota'}</p>
              <p className="text-gray-400 text-[11px] font-mono text-center">{formData.nik || 'NIK: -'}</p>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#0C111A] border border-gray-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">NIK (Nomor Induk Kependudukan)</label>
                  <input
                    type="text"
                    value={formData.nik}
                    onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                    className="w-full bg-[#0C111A] border border-gray-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#0C111A] border border-gray-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">No. Telepon / WhatsApp</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#0C111A] border border-gray-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Alamat Tempat Tinggal</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-[#0C111A] border border-gray-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Foto Profil Bebas (Google Drive URL)</label>
                <input
                  type="text"
                  placeholder="https://drive.google.com/open?id=1aBSRn..."
                  value={formData.photoURL}
                  onChange={(e) => setFormData({ ...formData, photoURL: e.target.value })}
                  className="w-full bg-[#0C111A] border border-gray-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                />
                <p className="text-[10px] text-emerald-400 mt-1">✓ Link Google Drive dikonversi otomatis menjadi foto langsung di atas.</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Jabatan</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full bg-[#0C111A] border border-gray-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Chapter</label>
                  <input
                    type="text"
                    value={formData.chapter}
                    onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                    className="w-full bg-[#0C111A] border border-gray-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1 font-semibold text-emerald-400">Status Keanggotaan</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                    className="w-full bg-[#0C111A] border border-emerald-500/50 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-400 font-bold"
                  >
                    <option value="active" className="bg-[#121824] text-emerald-400 font-bold">🟢 Active</option>
                    <option value="inactive" className="bg-[#121824] text-red-400 font-bold">🔴 Non Active</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700"
                >
                  {editingMemberId ? 'Simpan Perubahan' : 'Simpan Anggota'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Excel / CSV Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121824] border border-gray-800 rounded-2xl max-w-4xl w-full p-6 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" /> Import Massal Data Anggota Excel (.xlsx/.xls/.csv)
              </h3>
              <button
                type="button"
                onClick={handleCloseImportModal}
                className="text-gray-400 hover:text-white text-xs font-bold px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition"
              >
                Tutup ✕
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto pr-1 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-emerald-950/40 border border-emerald-800/40 p-3 rounded-xl gap-2">
                <div>
                  <p className="font-bold text-emerald-300">Struktur 10 Kolom Template Resmi ABB:</p>
                  <p className="font-mono text-[10px] text-gray-300 mt-0.5">
                    Nama Anggota | Kontak | Alamat | Jabatan & Chapte | Status | Aksi | NIK | Timestamp | Email Address | Foto Profil Bebas
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleDownloadTemplateXlsx}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                  >
                    <Download className="w-3.5 h-3.5" /> Unduh Template Excel (.xlsx)
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadTemplateCsv}
                    className="px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold rounded-lg text-[11px] flex items-center gap-1 border border-gray-700"
                  >
                    <Download className="w-3 h-3" /> CSV
                  </button>
                </div>
              </div>

              {/* Upload input */}
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Opsi 1: Unggah File Excel (.xlsx / .xls / .csv)</label>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv,.txt"
                  disabled={importOpState.status === 'loading'}
                  onChange={handleFileUpload}
                  className="w-full bg-[#0C111A] border border-gray-800 rounded-xl p-2 text-gray-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-950 file:text-emerald-400 hover:file:bg-emerald-900 disabled:opacity-50"
                />
                <p className="text-[10px] text-gray-400 mt-1">✓ Mendukung file Excel (.xlsx / .xls) dan CSV secara langsung tanpa perlu convert.</p>
              </div>

              {/* Copy Paste Textarea */}
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Opsi 2: Salin-Tempel Baris dari Excel (Copy-Paste)</label>
                <textarea
                  rows={4}
                  disabled={importOpState.status === 'loading'}
                  placeholder="Tempelkan baris dari Excel di sini..."
                  value={pastedData}
                  onChange={(e) => parsePastedExcelCSV(e.target.value)}
                  className="w-full bg-[#0C111A] border border-gray-800 rounded-xl p-3 text-white font-mono text-[11px] focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                ></textarea>
              </div>

              {/* Parsed Preview Table (Matches 10 Columns of Excel Template) */}
              {parsedPreview.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">Preview Data Terdeteksi ({parsedPreview.length} Anggota):</span>
                  </div>
                  <div className="bg-[#0C111A] border border-gray-800 rounded-xl max-h-48 overflow-x-auto">
                    <table className="w-full text-left text-[11px] whitespace-nowrap">
                      <thead className="bg-gray-800/80 text-gray-400 font-bold uppercase text-[9px] tracking-wider sticky top-0">
                        <tr>
                          <th className="p-2">#</th>
                          <th className="p-2">1. Nama Anggota</th>
                          <th className="p-2">2. Kontak</th>
                          <th className="p-2">3. Alamat</th>
                          <th className="p-2">4. Jabatan & Chapter</th>
                          <th className="p-2">5. Status</th>
                          <th className="p-2">6. NIK</th>
                          <th className="p-2">7. Email Address</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/50 text-gray-300 font-mono">
                        {parsedPreview.map((row, idx) => (
                          <tr key={idx}>
                            <td className="p-2 text-gray-500">{idx + 1}</td>
                            <td className="p-2 font-bold text-white flex items-center gap-1.5">
                              <img
                                src={getAvatarUrl(row.photoURL, row.name)}
                                alt={row.name}
                                onError={(e) => handleAvatarError(e, row.photoURL, row.name)}
                                className="w-5 h-5 rounded-full object-cover border border-gray-700 bg-gray-800 shrink-0"
                              />
                              <span>{cleanString(row.name)}</span>
                            </td>
                            <td className="p-2 text-gray-300">{cleanString(row.phone) || '-'}</td>
                            <td className="p-2 text-gray-400 max-w-[150px] truncate">{cleanString(row.address) || '-'}</td>
                            <td className="p-2 text-gray-300">{row.position} - {row.chapter}</td>
                            <td className="p-2">
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                                {row.status || 'active'}
                              </span>
                            </td>
                            <td className="p-2 text-emerald-400 font-semibold">{cleanString(row.nik) || '-'}</td>
                            <td className="p-2 text-blue-300">{cleanString(row.email) || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Explicit Operation Status Indicator with Animated Counter & Progress Bar */}
              {importOpState.status !== 'idle' && (
                <div
                  className={`p-4 border rounded-2xl space-y-3 text-xs font-semibold transition-all shadow-xl ${
                    importOpState.status === 'loading'
                      ? 'bg-blue-950/80 border-blue-800 text-blue-200 shadow-blue-900/30'
                      : importOpState.status === 'success'
                      ? 'bg-emerald-950/80 border-emerald-800 text-emerald-200 shadow-emerald-900/30'
                      : 'bg-red-950/80 border-red-800 text-red-200 shadow-red-900/30'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {importOpState.status === 'loading' && (
                      <Loader2 className="w-5 h-5 text-blue-400 animate-spin shrink-0" />
                    )}
                    {importOpState.status === 'success' && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    )}
                    {importOpState.status === 'error' && (
                      <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                    )}

                    <div className="flex-1">
                      <p className="font-bold text-sm">
                        {importOpState.status === 'loading' && '⏳ MENUNGGU PROSES IMPOR MASSAL (Processing...)'}
                        {importOpState.status === 'success' && '✅ PROSES IMPOR BERHASIL (Success)'}
                        {importOpState.status === 'error' && '❌ PROSES IMPOR GAGAL (Error)'}
                      </p>
                      <p className="mt-0.5 font-normal text-xs">{importOpState.message}</p>
                    </div>
                  </div>

                  {/* Animated Counter and Progress Bar */}
                  {importOpState.status === 'loading' && importOpState.progressPercent !== undefined && (
                    <div className="space-y-1 mt-2">
                      <div className="flex justify-between items-center text-[11px] font-mono font-bold text-blue-300">
                        <span>Progress Menyimpan: <strong className="text-white text-xs font-extrabold">{importOpState.importedCount || 0} / {importOpState.totalCount || 0}</strong> Anggota</span>
                        <span className="text-emerald-400 font-extrabold text-xs">{importOpState.progressPercent}%</span>
                      </div>
                      <div className="w-full bg-gray-900 border border-gray-800 rounded-full h-2.5 overflow-hidden p-0.5">
                        <div
                          className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 h-1.5 rounded-full transition-all duration-300 shadow-md shadow-emerald-500/30"
                          style={{ width: `${importOpState.progressPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-800">
              <button
                type="button"
                onClick={handleCloseImportModal}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold rounded-xl text-xs transition"
              >
                {importOpState.status === 'success' ? 'Selesai & Tutup' : 'Batal / Tutup'}
              </button>
              <button
                type="button"
                disabled={parsedPreview.length === 0 || importOpState.status === 'loading'}
                onClick={handleExecuteBulkImport}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/20 flex items-center gap-2"
              >
                {importOpState.status === 'loading' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Memproses...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" /> Impor {parsedPreview.length} Anggota ke Database
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
