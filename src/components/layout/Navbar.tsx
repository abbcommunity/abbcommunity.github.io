import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Menu, X, Shield, ChevronRight } from 'lucide-react';
import { siteConfig } from '../../data/siteConfig';
import { Button } from '../ui/Button';

interface NavbarProps {
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSearch }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Beranda', path: '/' },
    { name: 'Tentang Kami', path: '/about' },
    { name: 'Anggota', path: '/members' },
    { name: 'Kegiatan', path: '/events' },
    { name: 'Artikel', path: '/stories' },
    { name: 'Galeri', path: '/gallery' },
    { name: 'Garage', path: '/garage' },
    { name: 'Ride Map', path: '/rides' },
    { name: 'Social Impact', path: '/social-impact' },
    { name: 'Dokumen', path: '/documents' },
    { name: 'Kontak', path: '/contact' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#0B0F17]/90 backdrop-blur-xl border-b border-gray-800/80 py-3 shadow-2xl'
            : 'bg-gradient-to-b from-[#0B0F17]/90 via-[#0B0F17]/50 to-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 p-0.5 shadow-glow-blue transition-transform duration-300 group-hover:scale-105">
              <div className="w-full h-full bg-[#0B0F17] rounded-[10px] flex items-center justify-center">
                <img
                  src="./images/logo-circle.png"
                  alt="ABB Logo"
                  className="w-7 h-7 object-contain"
                  onError={(e) => {
                    // Fallback to shield icon if image fails
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <Shield className="w-5 h-5 text-blue-400 font-bold hidden group-has-[img:hidden]:block" />
              </div>
            </div>
            <div>
              <span className="text-lg font-black tracking-wider text-white font-display block leading-none">
                ABB <span className="text-blue-500">COMMUNITY</span>
              </span>
              <span className="text-[10px] tracking-widest text-gray-400 font-medium uppercase block mt-0.5">
                Adventurer Born in Bekasi
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden xl:flex items-center gap-1 bg-[#111827]/60 border border-gray-800/80 rounded-full px-4 py-1.5 backdrop-blur-md">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Actions: Search & Mobile Menu Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-300 bg-gray-900/80 hover:bg-gray-800 border border-gray-700/80 rounded-lg transition-colors"
              title="Search ABB Community (Ctrl+K)"
            >
              <Search className="w-4 h-4 text-blue-400" />
              <span className="hidden sm:inline">Cari...</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-gray-400 bg-gray-800 border border-gray-700 rounded">
                Ctrl K
              </kbd>
            </button>

            <Link to="/contact" className="hidden sm:block">
              <Button size="sm" variant="glow">
                Gabung
              </Button>
            </Link>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden text-gray-300 hover:text-white p-2 rounded-lg bg-gray-900/80 border border-gray-800"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-blue-400" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 xl:hidden flex flex-col bg-[#0B0F17]/95 backdrop-blur-2xl">
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white font-display">
                ABB
              </div>
              <span className="font-bold text-white tracking-wide">ABB COMMUNITY</span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                      : 'text-gray-300 hover:bg-gray-800/80 hover:text-white'
                  }`}
                >
                  <span>{link.name}</span>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </Link>
              );
            })}
          </div>

          <div className="p-4 border-t border-gray-800 space-y-3 bg-[#111827]">
            <Link to="/contact" className="block">
              <Button variant="glow" className="w-full justify-center">
                Gabung Komunitas
              </Button>
            </Link>
            <p className="text-center text-xs text-gray-500 font-medium">
              {siteConfig.tagline}
            </p>
          </div>
        </div>
      )}
    </>
  );
};
