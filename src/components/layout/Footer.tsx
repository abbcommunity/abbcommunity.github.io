import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Instagram, Facebook, Youtube, Mail, MapPin, Phone, Heart } from 'lucide-react';
import { siteConfig } from '../../data/siteConfig';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#080B11] border-t border-gray-800/80 pt-16 pb-12 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-blue-600/10 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Col 1 & 2: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 p-0.5 shadow-glow-blue">
                <div className="w-full h-full bg-[#0B0F17] rounded-[10px] flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-400 font-bold" />
                </div>
              </div>
              <div>
                <span className="text-xl font-black tracking-wider text-white font-display block leading-none">
                  ABB <span className="text-blue-500">COMMUNITY</span>
                </span>
                <span className="text-xs tracking-widest text-gray-400 uppercase block mt-1">
                  Adventurer Born in Bekasi Community
                </span>
              </div>
            </Link>

            <p className="text-sm text-gray-400 leading-relaxed pr-4">
              Rumah digital resmi komunitas motor persaudaraan profesional. Menyatukan kecintaan berkendara adventure, profesionalisme, dan aksi nyata pelayanan medis sosial bagi masyarakat.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href={siteConfig.social.instagram}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-600 hover:border-blue-500 transition-all"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={siteConfig.social.facebook}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-600 hover:border-blue-500 transition-all"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={siteConfig.social.youtube}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-red-600 hover:border-red-500 transition-all"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 3: Navigation */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-display">Eksplorasi</h4>
            <ul className="space-y-2 text-xs text-gray-400 font-medium">
              <li><Link to="/about" className="hover:text-blue-400 transition-colors">Tentang ABB</Link></li>
              <li><Link to="/members" className="hover:text-blue-400 transition-colors">Struktur & Anggota</Link></li>
              <li><Link to="/events" className="hover:text-blue-400 transition-colors">Jadwal Event</Link></li>
              <li><Link to="/stories" className="hover:text-blue-400 transition-colors">Artikel & Stories</Link></li>
              <li><Link to="/gallery" className="hover:text-blue-400 transition-colors">Galeri Dokumentasi</Link></li>
            </ul>
          </div>

          {/* Col 4: Platform Features */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-display">Fitur Platform</h4>
            <ul className="space-y-2 text-xs text-gray-400 font-medium">
              <li><Link to="/garage" className="hover:text-blue-400 transition-colors">ABB Garage Showcase</Link></li>
              <li><Link to="/rides" className="hover:text-blue-400 transition-colors">Interactive Ride Map</Link></li>
              <li><Link to="/social-impact" className="hover:text-blue-400 transition-colors">Social Impact & Bakti Medis</Link></li>
              <li><Link to="/documents" className="hover:text-blue-400 transition-colors">Pusat Dokumen & SOP</Link></li>
              <li><Link to="/contact" className="hover:text-blue-400 transition-colors">Pendaftaran Anggota</Link></li>
            </ul>
          </div>

          {/* Col 5: Contact Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-display">Markas Komunitas</h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>{siteConfig.contact.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <a href={`mailto:${siteConfig.contact.email}`} className="hover:text-white transition-colors">{siteConfig.contact.email}</a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <a href={siteConfig.social.whatsapp} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">{siteConfig.contact.phone}</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} {siteConfig.name} ({siteConfig.fullName}). All rights reserved.</p>
          <p className="flex items-center gap-1">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" />
            <span>by ABB Community Digital Team</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
