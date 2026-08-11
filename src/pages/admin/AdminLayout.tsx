import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  BookOpen,
  ShieldCheck,
  FileText,
  Bell,
  LogOut,
  ChevronRight,
  ShieldAlert,
  ArrowLeft,
  AlertCircle,
  KeyRound,
  Zap,
  Wallet,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useAdminPermissions } from '../../hooks/useAdminPermissions';

export const AdminLayout: React.FC = () => {
  const { user, profile, logout, loginWithGoogle, loginAsDemoAdmin, isConfigured } = useAuth();
  const { isAdmin, role } = useAdminPermissions();
  const location = useLocation();
  const navigate = useNavigate();
  const [authError, setAuthError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setAuthError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      let msg = err.message || 'Gagal autentikasi Google.';
      if (err.code === 'auth/invalid-api-key' || err.code === 'auth/api-key-not-valid') {
        msg = 'Kunci VITE_FIREBASE_API_KEY di .env belum diisi dengan API Key asli dari Firebase Console.';
      } else if (err.code === 'auth/unauthorized-domain') {
        msg = 'Domain ini belum ditambahkan ke "Authorized Domains" di Firebase Console -> Authentication -> Settings.';
      } else if (err.code === 'auth/popup-closed-by-user') {
        msg = 'Jendela login Google ditutup sebelum selesai.';
      }
      setAuthError(msg);
    }
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#131924] border border-gray-800 rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 bg-red-600/10 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-500">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Portal Administrasi ABB</h2>
          <p className="text-gray-400 text-sm mb-6">
            Silakan masuk dengan akun pengurus / administrator yang terverifikasi untuk mengakses dashboard operasional.
          </p>

          {authError && (
            <div className="mb-4 p-3 bg-red-950/60 border border-red-800/60 rounded-xl text-left text-xs text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-200">Gagal Login Firebase Auth:</p>
                <p className="mt-1">{authError}</p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleGoogleLogin}
              className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 text-xs"
            >
              Masuk dengan Google SSO
            </button>

            <button
              onClick={loginAsDemoAdmin}
              className="w-full py-2.5 px-4 bg-gray-800 hover:bg-gray-700 text-yellow-400 font-semibold rounded-xl transition flex items-center justify-center gap-2 border border-gray-700 text-xs"
            >
              <Zap className="w-4 h-4 text-yellow-400" /> Akses Cepat Demo (Super Admin)
            </button>
          </div>

          <div className="mt-6 border-t border-gray-800/80 pt-4 text-left">
            <div className="flex items-center gap-1.5 text-xs text-yellow-400 font-semibold mb-1">
              <KeyRound className="w-3.5 h-3.5" /> Petunjuk Pengaturan Firebase:
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Kredensial Firebase project <code className="text-white bg-gray-800 px-1 rounded">abbcommunityridersites</code> telah diaktifkan. Untuk Google SSO, daftarkan domain <code className="text-white bg-gray-800 px-1 rounded">abbcommunity.github.io</code> dan <code className="text-white bg-gray-800 px-1 rounded">localhost</code> di Firebase Console → Authentication → Settings → Authorized domains.
            </p>
          </div>

          <div className="mt-4">
            <Link to="/" className="text-xs text-gray-500 hover:text-gray-300 flex items-center justify-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Kembali ke Situs Publik
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#131924] border border-red-900/40 rounded-2xl p-8 text-center">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Akses Ditolak (403 Forbidden)</h2>
          <p className="text-gray-400 text-sm mb-4">
            Akun Anda (<span className="text-white font-mono">{profile.email}</span>) terdaftar sebagai <span className="text-yellow-400 font-semibold">{role}</span> dan tidak memiliki hak akses administrator.
          </p>
          <button
            onClick={logout}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm rounded-lg transition"
          >
            Keluar Akun
          </button>
        </div>
      </div>
    );
  }

  const navigationItems = [
    { label: 'Dashboard Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Manajemen Anggota', path: '/admin/members', icon: Users },
    { label: 'Manajemen Uang Kas', path: '/admin/treasury', icon: Wallet },
    { label: 'Manajemen Event', path: '/admin/events', icon: Calendar },
    { label: 'Artikel & Editorial', path: '/admin/stories', icon: BookOpen },
    { label: 'Dokumen Organisasi', path: '/admin/documents', icon: FileText },
    { label: 'Audit Trail Logs', path: '/admin/audit-logs', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-[#090D14] text-gray-100 flex font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#101622] border-r border-gray-800 flex flex-col justify-between hidden md:flex">
        <div>
          {/* Brand Logo */}
          <div className="p-6 border-b border-gray-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-600 text-white font-black flex items-center justify-center text-lg shadow-md shadow-red-600/30">
              ABB
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-wider text-white">ABB OPERATIONAL</h1>
              <p className="text-[10px] text-red-400 uppercase font-semibold">Admin Engine v2.0</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                    isActive
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/20 font-semibold'
                      : 'text-gray-400 hover:bg-gray-800/60 hover:text-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-gray-800 bg-[#0C111A]">
          <div className="flex items-center gap-3 mb-3">
            <img
              src={profile.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120'}
              alt={profile.displayName}
              className="w-8 h-8 rounded-full border border-red-500/40 object-cover"
            />
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{profile.displayName}</p>
              <span className="inline-block px-1.5 py-0.5 text-[9px] font-bold bg-red-950 text-red-400 border border-red-800/50 rounded uppercase">
                {profile.role}
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full py-1.5 px-3 bg-gray-800 hover:bg-red-900/40 hover:text-red-400 text-gray-400 text-xs rounded-lg transition flex items-center justify-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" /> Keluar Portal
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="h-16 bg-[#101622]/80 backdrop-blur border-b border-gray-800 px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Link to="/admin" className="hover:text-white transition">Admin</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-medium capitalize">
              {location.pathname.replace('/admin/', '').replace('/admin', 'Dashboard') || 'Dashboard'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="px-3 py-1.5 text-xs text-gray-300 hover:text-white bg-gray-800/60 hover:bg-gray-800 rounded-lg transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Lihat Website Publik
            </Link>
          </div>
        </header>

        {/* Outlet Page Container */}
        <main className="p-6 flex-1 bg-[#090D14]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
