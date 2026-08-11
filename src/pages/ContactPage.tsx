import React, { useState } from 'react';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { siteConfig } from '../data/siteConfig';
import { MapPin, Mail, Phone, Instagram, Facebook, Youtube, Send, CheckCircle2, Upload, Image as ImageIcon, Camera } from 'lucide-react';
import { memberService } from '../services/memberService';
import { convertGoogleDriveUrl, getAvatarUrl, handleAvatarError } from '../utils/imageUtils';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    nik: '',
    email: '',
    phone: '',
    address: '',
    motorcycle: '',
    chapter: 'Bekasi Chapter',
    photoURL: '',
    message: '',
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file foto maksimal 5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setFormData((prev) => ({ ...prev, photoURL: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const cleanPhoto = convertGoogleDriveUrl(formData.photoURL) || formData.photoURL;
      await memberService.createMember(
        {
          name: formData.name.trim(),
          nik: formData.nik.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          position: 'Anggota Baru',
          chapter: formData.chapter,
          joinYear: new Date().getFullYear(),
          status: 'active',
          visibility: 'public',
          motorcycle: { model: formData.motorcycle.trim() },
          photoURL: cleanPhoto,
          bio: formData.message.trim(),
        },
        'public_registration'
      );
      setSubmitted(true);
    } catch (err: any) {
      alert('Gagal mengirim pendaftaran: ' + (err.message || err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-28 pb-20 space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge variant="blue" size="md">PENDAFTARAN & KONTAK</Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white font-display">
          Formulir Pendaftaran Anggota Baru ABB
        </h1>
        <p className="text-base text-gray-300">
          Lengkapi seluruh isian wajib berikut untuk mendaftar sebagai anggota resmi Komunitas ABB (Adventurer Born in Bekasi).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Contact Info & Map */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 space-y-6 border-blue-500/30">
            <h3 className="text-lg font-bold text-white font-display">Informasi Sekretariat ABB</h3>
            <ul className="space-y-4 text-xs text-gray-300">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-900/50 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-white block mb-0.5">Alamat Sekretariat:</strong>
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

        {/* Right: Full Registration Form (Matches Backend 100%) */}
        <div className="lg:col-span-7">
          <Card className="p-8 space-y-6 border-blue-500/30">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <div>
                <h3 className="text-2xl font-bold text-white font-display">Formulir Pendaftaran Anggota Baru</h3>
                <p className="text-xs text-gray-400 mt-1">Seluruh kolom bertanda <strong className="text-red-400">*</strong> wajib diisi secara lengkap.</p>
              </div>
            </div>

            {submitted ? (
              <div className="p-6 bg-blue-950/60 border border-blue-500/40 rounded-xl text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-blue-400 mx-auto" />
                <h4 className="text-lg font-bold text-white font-display">Pendaftaran Terkirim & Tersimpan!</h4>
                <p className="text-xs text-gray-300">
                  Terima kasih <strong className="text-white">{formData.name}</strong>. Data anggota Anda telah terdaftar di database komunitas ABB. Tim pengurus akan mengkonfirmasi pendaftaran Anda via WhatsApp/Email.
                </p>
                <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
                  Daftar Anggota Lain
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {/* Photo Live Preview & Device File Upload */}
                <div className="bg-[#0B0F17] p-4 border border-gray-800 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative shrink-0">
                    <img
                      src={getAvatarUrl(formData.photoURL, formData.name)}
                      alt="Avatar Preview"
                      onError={(e) => handleAvatarError(e, formData.photoURL, formData.name)}
                      className="w-20 h-20 rounded-full object-cover border-2 border-blue-500 bg-gray-800 shadow-lg"
                    />
                  </div>
                  <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                    <label className="block text-xs font-bold text-white">Foto Profil * (Device / Google Drive)</label>
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition w-full sm:w-auto shadow-md">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Pilih Foto dari Device</span>
                        <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                      </label>
                      <span className="text-gray-500 text-[11px]">atau</span>
                      <input
                        type="text"
                        value={formData.photoURL}
                        onChange={(e) => setFormData({ ...formData, photoURL: e.target.value })}
                        placeholder="Tempel URL Google Drive..."
                        className="w-full bg-[#121824] text-white px-3 py-2 rounded-xl border border-gray-700 text-xs focus:border-blue-500 focus:outline-none font-mono"
                      />
                    </div>
                    <p className="text-[10px] text-gray-400">Bisa upload langsung dari Kamera/Galeri HP/PC atau paste URL Google Drive.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Nama Lengkap *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Masukkan nama lengkap Anda"
                      className="w-full bg-[#0B0F17] text-white px-4 py-2.5 rounded-xl border border-gray-700 text-xs focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">NIK (Nomor Induk Kependudukan) *</label>
                    <input
                      type="text"
                      required
                      value={formData.nik}
                      onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                      placeholder="Masukkan NIK 16 digit / No. Anggota"
                      className="w-full bg-[#0B0F17] text-white px-4 py-2.5 rounded-xl border border-gray-700 text-xs focus:border-blue-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Email Address *</label>
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
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Nomor WhatsApp / Telepon *</label>
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

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Alamat Tempat Tinggal *</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Masukkan alamat lengkap domisili Anda"
                    className="w-full bg-[#0B0F17] text-white px-4 py-2.5 rounded-xl border border-gray-700 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Merk & Model Motor *</label>
                    <input
                      type="text"
                      required
                      value={formData.motorcycle}
                      onChange={(e) => setFormData({ ...formData, motorcycle: e.target.value })}
                      placeholder="Contoh: Versys 650 / CB500X / NMAX"
                      className="w-full bg-[#0B0F17] text-white px-4 py-2.5 rounded-xl border border-gray-700 text-xs focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Pilihan Chapter Regional *</label>
                    <select
                      required
                      value={formData.chapter}
                      onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                      className="w-full bg-[#0B0F17] text-white px-4 py-2.5 rounded-xl border border-gray-700 text-xs focus:border-blue-500 focus:outline-none cursor-pointer"
                    >
                      <option value="Bekasi Chapter">Bekasi Chapter (HQ)</option>
                      <option value="Jakarta Chapter">Jakarta Chapter</option>
                      <option value="Tangerang Chapter">Tangerang Chapter</option>
                      <option value="Bogor Chapter">Bogor Chapter</option>
                      <option value="Bandung Chapter">Bandung Chapter</option>
                      <option value="Surabaya Chapter">Surabaya Chapter</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Pesan / Catatan Motivasi *</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tuliskan alasan bergabung atau catatan tambahan Anda..."
                    className="w-full bg-[#0B0F17] text-white px-4 py-2.5 rounded-xl border border-gray-700 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <Button
                  type="submit"
                  variant="glow"
                  disabled={isSubmitting}
                  className="w-full justify-center"
                  icon={isSubmitting ? <Upload className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                >
                  {isSubmitting ? 'Sedang Mengirim Pendaftaran...' : 'Kirim Formulir Pendaftaran'}
                </Button>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
