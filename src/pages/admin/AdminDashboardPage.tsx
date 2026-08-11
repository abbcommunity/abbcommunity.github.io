import React, { useEffect, useState } from 'react';
import { Users, Calendar, BookOpen, HeartHandshake, ShieldCheck, Plus, RefreshCw } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { auditLogService } from '../../services/auditLogService';
import { GlobalStatsDoc, AuditLogDoc } from '../../types/backend';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<GlobalStatsDoc | null>(null);
  const [logs, setLogs] = useState<AuditLogDoc[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [sData, lData] = await Promise.all([
        adminService.getDashboardStats(),
        auditLogService.getRecentLogs(10),
      ]);
      setStats(sData);
      setLogs(lData);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const statCards = [
    { label: 'Total Anggota', value: stats?.totalMembers || 0, sub: `${stats?.activeMembers || 0} Aktif`, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Event Komunitas', value: stats?.totalEvents || 0, sub: 'Terjadwal & Arsip', icon: Calendar, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'Artikel & Story', value: stats?.totalStories || 0, sub: 'Publikasi Terverifikasi', icon: BookOpen, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { label: 'Aksi Bakti Sosial', value: stats?.totalSocialImpactActivities || 0, sub: 'Program Medis & Care', icon: HeartHandshake, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#121824] border border-gray-800 rounded-2xl p-6">
        <div>
          <h2 className="text-xl font-extrabold text-white">Ringkasan Operasional Komunitas</h2>
          <p className="text-gray-400 text-xs mt-1">
            Data real-time sistem informasi persaudaraan & administrasi ABB Community.
          </p>
        </div>
        <button
          onClick={loadDashboardData}
          disabled={loading}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold rounded-xl transition flex items-center gap-2 self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Sinkronkan Data
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-[#101622] border border-gray-800/80 rounded-2xl p-5 hover:border-gray-700 transition">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-gray-400">{card.label}</span>
                <div className={`p-2 rounded-xl ${card.bg} ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-white">{card.value}</p>
              <p className="text-[11px] text-gray-500 mt-1 font-medium">{card.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Audit Log Table Section */}
      <div className="bg-[#101622] border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-red-500" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent System Audit Logs (JCI Immutable)</h3>
          </div>
          <span className="text-xs text-gray-400">10 Log Terbaru</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4">Aktor</th>
                <th className="py-3 px-4">Aksi</th>
                <th className="py-3 px-4">Modul / Resource</th>
                <th className="py-3 px-4">Resource ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-gray-300">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500 text-xs">
                    Belum ada catatan aktivitas audit log.
                  </td>
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
                    <td className="py-3 px-4 text-gray-400 text-[11px] truncate max-w-[120px]">{log.resourceId}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
