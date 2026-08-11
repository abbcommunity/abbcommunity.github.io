import React, { useState, useEffect } from 'react';
import { ShieldCheck, RefreshCw, Filter } from 'lucide-react';
import { auditLogService } from '../../services/auditLogService';
import { AuditLogDoc } from '../../types/backend';

export const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogDoc[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await auditLogService.getRecentLogs(100);
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121824] border border-gray-800 rounded-2xl p-6">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-red-500" /> Immutable System Audit Trail (JCI Standard)
          </h2>
          <p className="text-gray-400 text-xs mt-1">
            Seluruh jejak perubahan data, pendaftaran, dan mutasi peran tercatat secara permanen dan tidak dapat dihapus.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold rounded-xl transition flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Muat Ulang Log
        </button>
      </div>

      <div className="bg-[#101622] border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400 font-semibold uppercase text-[10px] tracking-wider bg-[#0C111A]">
              <th className="py-3 px-4">Timestamp (UTC)</th>
              <th className="py-3 px-4">Aktor / Pengguna</th>
              <th className="py-3 px-4">Aksi System</th>
              <th className="py-3 px-4">Modul Target</th>
              <th className="py-3 px-4">Resource ID</th>
              <th className="py-3 px-4">Metadata</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60 text-gray-300">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">Memuat log...</td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">Belum ada aktivitas tercatat.</td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-800/30 transition font-mono">
                  <td className="py-3 px-4 text-gray-400 text-[11px]">
                    {new Date(log.timestamp).toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4 text-white font-medium">{log.actorEmail || log.actorId}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-400 border border-red-800/40">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-300 uppercase text-[10px] font-bold">{log.resourceType}</td>
                  <td className="py-3 px-4 text-gray-400 text-[11px] truncate max-w-[100px]">{log.resourceId}</td>
                  <td className="py-3 px-4 text-gray-500 text-[10px] max-w-[200px] truncate">
                    {JSON.stringify(log.metadata)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
