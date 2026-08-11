import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ChevronDown, Calendar, ArrowRight, Heart, MapPin, Award, Users, Activity } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { StatsCounter } from '../components/ui/StatsCounter';
import { siteConfig } from '../data/siteConfig';
import { eventsData } from '../data/events';
import { storiesData } from '../data/stories';
import { socialImpactData } from '../data/socialImpact';

export const HomePage: React.FC = () => {
  const featuredEvent = eventsData[0];
  const featuredStories = storiesData.slice(0, 3);
  const featuredImpact = socialImpactData[0];

  return (
    <div className="space-y-24 pb-20">
      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-carbon">
        {/* Background Video / Visual Overlay */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-30 filter brightness-75 scale-105"
            poster="./images/event/event-2019-007.jpg"
          >
            <source src="./video/clear-mobile-video-logo.mp4" type="video/mp4" />
            <source src="./video/abb-community-mobile-video-logo.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-[#0B0F17]/60 to-[#0B0F17]/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0F17] via-transparent to-[#0B0F17]" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-950/60 border border-blue-500/30 text-blue-400 text-xs font-semibold tracking-wider uppercase backdrop-blur-md animate-fade-in">
            <Shield className="w-4 h-4 text-blue-400" />
            <span>Digital Home of ABB Community</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight font-display leading-none">
            RIDE TOGETHER.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-400 to-white">
              SERVE TOGETHER.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-xl text-gray-300 font-normal leading-relaxed">
            Komunitas bikers profesional persaudaraan berbasis lingkungan Primaya Hospital / Awal Bros Group. Menghubungkan hobi adventure riding dengan aksi kemanusiaan di seluruh Indonesia.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/about">
              <Button size="lg" variant="glow" icon={<ArrowRight className="w-5 h-5" />}>
                Jelajahi Komunitas
              </Button>
            </Link>
            <Link to="/events">
              <Button size="lg" variant="outline" icon={<Calendar className="w-5 h-5" />}>
                Kegiatan & Event
              </Button>
            </Link>
          </div>

          {/* Scroll Indicator */}
          <div className="pt-12 flex justify-center animate-bounce">
            <a href="#who-we-are" className="text-gray-400 hover:text-white transition-colors p-2">
              <ChevronDown className="w-6 h-6" />
            </a>
          </div>
        </div>
      </section>

      {/* STATS & WHO WE ARE */}
      <section id="who-we-are" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <StatsCounter end={siteConfig.establishedYear} label="Tahun Berdiri" prefix="" />
          <StatsCounter end={siteConfig.stats.membersCount} suffix="+" label="Anggota Aktif" />
          <StatsCounter end={siteConfig.stats.activitiesCount} suffix="+" label="Kegiatan & Touring" />
          <StatsCounter end={siteConfig.stats.yearsBrotherhood} suffix="+" label="Tahun Persaudaraan" />
        </div>

        {/* Who We Are Card */}
        <Card className="p-8 sm:p-12 relative overflow-hidden bg-gradient-to-br from-[#111827] to-[#0B0F17]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <Badge variant="cyan" size="md">WHO WE ARE</Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
                Lebih Dari Sekadar Klub Motor. Sebuah Keluarga Digital.
              </h2>
              <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                ABB Community (Awal Bros Bikers Community) berdiri sejak 2010 sebagai wadah bagi karyawan, manajemen, dan praktisi di lingkungan rumah sakit serta rekan sejawat pecinta otomotif untuk menjalin persaudaraan dan memberikan dampak nyata.
              </p>
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-gray-300">
                <div className="flex items-center gap-2 p-3 bg-gray-900/60 rounded-lg border border-gray-800">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span>Lintas Chapter & Regional</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-900/60 rounded-lg border border-gray-800">
                  <Heart className="w-4 h-4 text-red-400" />
                  <span>Aksi Medis & Khitanan Massal</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-900/60 rounded-lg border border-gray-800">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Safety Riding Standard</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-900/60 rounded-lg border border-gray-800">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>Sinergi Kesehatan Medis</span>
                </div>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
              <img
                src="./images/event/event-2019-001.jpg"
                alt="ABB Community Riders"
                className="w-full h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-4 left-4 right-4 p-4 bg-[#111827]/90 backdrop-blur-md rounded-xl border border-gray-700/80">
                <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Persaudaraan Tanpa Batas</p>
                <p className="text-sm font-bold text-white mt-0.5">Disiplin Formasi & Road Safety Campaign</p>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* FEATURED UPCOMING EVENT */}
      {featuredEvent && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Badge variant="blue" size="md">AGENDA UTAMA</Badge>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display mt-2">
                Event & Agenda Komunitas
              </h2>
            </div>
            <Link to="/events">
              <Button variant="ghost" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
                Lihat Semua Event
              </Button>
            </Link>
          </div>

          <Card className="grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
            <div className="lg:col-span-7 relative h-72 lg:h-auto">
              <img
                src={featuredEvent.coverImage}
                alt={featuredEvent.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent lg:hidden" />
            </div>

            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="amber">{featuredEvent.category}</Badge>
                  <span className="text-xs font-bold text-emerald-400 uppercase bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                    {featuredEvent.status}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white font-display leading-snug">
                  {featuredEvent.title}
                </h3>

                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  {featuredEvent.description}
                </p>

                <div className="space-y-2 text-xs text-gray-300 pt-2 border-t border-gray-800">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>{featuredEvent.date} ({featuredEvent.time})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>{featuredEvent.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{featuredEvent.participantsCount} Peserta Diterima</span>
                  </div>
                </div>
              </div>

              <Link to={`/events`}>
                <Button variant="primary" className="w-full justify-center">
                  Detail Event & Pendaftaran
                </Button>
              </Link>
            </div>
          </Card>
        </section>
      )}

      {/* SOCIAL IMPACT CALLOUT */}
      <section className="bg-gradient-to-r from-blue-950/40 via-[#0B0F17] to-cyan-950/40 border-y border-gray-800/80 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <Badge variant="crimson" size="md">SOCIAL IMPACT — RIDE BEYOND THE ROAD</Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-display max-w-3xl mx-auto">
            "Setiap Perjalanan Memiliki Tujuan. Ekspedisi Kami Menciptakan Dampak."
          </h2>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-gray-300 leading-relaxed">
            Melalui sinergi bersama tim kesehatan Primaya Hospital, ABB Community mengoperasikan bakti sosial khitanan massal gratis, donor darah, dan bantuan bencana.
          </p>

          <div className="pt-4 flex justify-center">
            <Link to="/social-impact">
              <Button variant="glow" icon={<Heart className="w-5 h-5 fill-white" />}>
                Lihat Program Kemanusiaan
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* LATEST STORIES & EDITORIAL */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <Badge variant="emerald" size="md">MEDIA & STORIES</Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display mt-2">
              Kisah & Ekspedisi Terbaru
            </h2>
          </div>
          <Link to="/stories">
            <Button variant="ghost" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
              Baca Selengkapnya
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredStories.map((story) => (
            <Card key={story.id} className="flex flex-col h-full group">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={story.coverImage}
                  alt={story.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <Badge variant="blue" size="sm">{story.category}</Badge>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[11px] text-gray-400">{story.publishedAt} • {story.readTime}</span>
                  <h3 className="text-base font-bold text-white font-display group-hover:text-blue-400 transition-colors mt-1 line-clamp-2">
                    {story.title}
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed mt-2 line-clamp-3">
                    {story.excerpt}
                  </p>
                </div>

                <Link to={`/stories`} className="inline-flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300">
                  <span>Baca Artikel</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA JOIN US */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="p-8 sm:p-12 text-center relative overflow-hidden bg-gradient-to-r from-blue-900/60 via-[#111827] to-cyan-900/60 border-blue-500/30">
          <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
              Siap Bergabung dengan ABB Community?
            </h2>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              Jadilah bagian dari keluarga persaudaraan bikers yang aktif, berdedikasi tinggi pada keselamatan berkendara, dan berjiwa sosial tinggi.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
              <Link to="/contact">
                <Button size="lg" variant="glow">
                  Daftar Anggota Baru
                </Button>
              </Link>
              <Link to="/documents">
                <Button size="lg" variant="outline">
                  Unduh SOP & AD/ART
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
};
