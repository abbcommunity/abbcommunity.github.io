import React, { useState } from 'react';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { siteConfig } from '../data/siteConfig';
import { MapPin, Mail, Phone, Instagram, Facebook, Youtube, Send, CheckCircle2 } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    motorcycle: '',
    chapter: 'Bekasi Chapter',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="pt-28 pb-20 space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge variant="blue" size="md">JOIN & KONTAK</Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white font-display">
          Hubungi & Bergabung Dengan ABB
        </h1>
        <p className="text-base text-gray-300">
          Punya pertanyaan seputar keanggotaan, pendaftaran touring, atau kerjasama bakti sosial? Hubungi pengurus kami.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Contact Info & Map */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 space-y-6 border-blue-500/30">
            <h3 className="text-xl font-bold text-white font-display border-b border-gray-800 pb-3">Informasi Kontak Resmi</h3>

            <ul className="space-y-4 text-xs sm:text-sm text-gray-300">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-900/50 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-white block">Markas Besar:</strong>
                  <span>{siteConfig.contact.address}</span>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-900/50 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-white block">Email Resmi:</strong>
                  <a href={`mailto:${siteConfig.contact.email}`} className="text-blue-400 hover:underline">{siteConfig.contact.email}</a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-900/50 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-white block">WhatsApp / Telp:</strong>
                  <a href={siteConfig.social.whatsapp} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">{siteConfig.contact.phone}</a>
                </div>
              </li>
            </ul>

            <div className="pt-2">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Ikuti Media Sosial Kami:</h4>
              <div className="flex gap-3">
                <a href={siteConfig.social.instagram} target="_blank" rel="noreferrer" className="p-3 bg-gray-900 rounded-xl border border-gray-800 text-gray-300 hover:text-white hover:bg-blue-600 transition-all">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href={siteConfig.social.facebook} target="_blank" rel="noreferrer" className="p-3 bg-gray-900 rounded-xl border border-gray-800 text-gray-300 hover:text-white hover:bg-blue-600 transition-all">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href={siteConfig.social.youtube} target="_blank" rel="noreferrer" className="p-3 bg-gray-900 rounded-xl border border-gray-800 text-gray-300 hover:text-white hover:bg-red-600 transition-all">
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>
          </Card>

          {/* Maps Embed Container */}
          <div className="rounded-2xl overflow-hidden border border-gray-800 h-64 shadow-xl">
            <iframe
              title="Google Maps Primaya Hospital Bekasi Barat"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.113076899738!2d106.9902113!3d-6.2488257!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e698c4dfd964177%3A0xb3a228f4e24ab49e!2sPrimaya%20Hospital%20Bekasi%20Barat!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid"
              width="100%"
              height="100%"
              style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
              allowFullScreen={false}
              loading="lazy"
            />
          </div>
        </div>

        {/* Right: Registration / Contact Form */}
        <div className="lg:col-span-7">
          <Card className="p-8 space-y-6 border-blue-500/30">
            <h3 className="text-2xl font-bold text-white font-display">Formulir Pendaftaran & Pesan</h3>

            {submitted ? (
              <div className="p-6 bg-blue-950/60 border border-blue-500/40 rounded-xl text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-blue-400 mx-auto" />
                <h4 className="text-lg font-bold text-white font-display">Pesan & Pendaftaran Terkirim!</h4>
                <p className="text-xs text-gray-300">
                  Terima kasih <strong className="text-white">{formData.name}</strong>. Tim humas ABB Community akan menghubungi Anda via WhatsApp/Email dalam 1x24 jam.
                </p>
                <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
                  Kirim Pesan Lain
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Nama Lengkap *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Masukkan nama Anda"
                      className="w-full bg-[#0B0F17] text-white px-4 py-2.5 rounded-xl border border-gray-700 text-xs focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Nomor WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="0812-xxxx-xxxx"
                      className="w-full bg-[#0B0F17] text-white px-4 py-2.5 rounded-xl border border-gray-700 text-xs focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="nama@email.com"
                      className="w-full bg-[#0B0F17] text-white px-4 py-2.5 rounded-xl border border-gray-700 text-xs focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Merk & Model Motor</label>
                    <input
                      type="text"
                      value={formData.motorcycle}
                      onChange={(e) => setFormData({ ...formData, motorcycle: e.target.value })}
                      placeholder="Contoh: Versys 650 / CB500X"
                      className="w-full bg-[#0B0F17] text-white px-4 py-2.5 rounded-xl border border-gray-700 text-xs focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Pilihan Chapter Regional</label>
                  <select
                    value={formData.chapter}
                    onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                    className="w-full bg-[#0B0F17] text-white px-4 py-2.5 rounded-xl border border-gray-700 text-xs focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Bekasi Chapter">Bekasi Chapter (HQ)</option>
                    <option value="Jakarta Chapter">Jakarta Chapter</option>
                    <option value="Tangerang Chapter">Tangerang Chapter</option>
                    <option value="Bogor Chapter">Bogor Chapter</option>
                    <option value="Bandung Chapter">Bandung Chapter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Pesan / Catatan *</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tuliskan alasan bergabung, pertanyaan event, atau penawaran kerjasama..."
                    className="w-full bg-[#0B0F17] text-white px-4 py-2.5 rounded-xl border border-gray-700 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <Button type="submit" variant="glow" className="w-full justify-center" icon={<Send className="w-4 h-4" />}>
                  Kirim Formulir
                </Button>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
