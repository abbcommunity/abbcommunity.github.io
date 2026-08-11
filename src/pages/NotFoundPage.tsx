import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Shield, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center pt-28 pb-20 max-w-xl mx-auto px-4 text-center space-y-6">
      <div className="w-20 h-20 rounded-2xl bg-blue-900/50 border border-blue-500/40 flex items-center justify-center text-blue-400 mx-auto shadow-glow-blue">
        <Shield className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 font-display">
          404
        </h1>
        <h2 className="text-2xl font-bold text-white font-display">Halaman Tidak Ditemukan</h2>
        <p className="text-xs text-gray-400 leading-relaxed">
          Rute yang Anda tuju di luar lintasan petualangan ABB Community. Kembali ke halaman utama.
        </p>
      </div>

      <Link to="/" className="inline-block">
        <Button variant="glow" icon={<Home className="w-4 h-4" />}>
          Kembali ke Beranda
        </Button>
      </Link>
    </div>
  );
};
