import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { storiesData } from '../data/stories';
import { Clock, User, ArrowRight, Tag } from 'lucide-react';

export const StoriesPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const categories = ['all', 'Touring', 'Social Impact', 'Safety'];

  const filteredStories = storiesData.filter(s => {
    return selectedCategory === 'all' || s.category === selectedCategory;
  });

  const featuredStory = storiesData.find(s => s.featured) || storiesData[0];

  return (
    <div className="pt-28 pb-20 space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge variant="emerald" size="md">MEDIA EDITORIAL & STORIES</Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white font-display">
          Kisah & Ekspedisi ABB
        </h1>
        <p className="text-base text-gray-300">
          Catatan perjalanan, jurnal ekspedisi touring, panduan safety riding, dan kisah bakti sosial kemanusiaan.
        </p>
      </div>

      {/* Featured Main Editorial Story */}
      {featuredStory && (
        <Card className="grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden border-blue-500/30 group">
          <div className="lg:col-span-7 relative h-80 lg:h-auto overflow-hidden">
            <img
              src={featuredStory.coverImage}
              alt={featuredStory.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute top-4 left-4">
              <Badge variant="blue" size="md">FEATURED STORY</Badge>
            </div>
          </div>

          <div className="lg:col-span-5 p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>{featuredStory.publishedAt}</span>
                <span>•</span>
                <span>{featuredStory.readTime}</span>
              </div>

              <h2 className="text-2xl font-bold text-white font-display leading-snug group-hover:text-blue-400 transition-colors">
                {featuredStory.title}
              </h2>

              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                {featuredStory.excerpt}
              </p>

              <div className="flex items-center gap-3 pt-2">
                <img
                  src={featuredStory.author.avatar}
                  alt={featuredStory.author.name}
                  className="w-9 h-9 rounded-full object-cover border border-blue-400"
                />
                <div>
                  <span className="text-xs font-bold text-white block">{featuredStory.author.name}</span>
                  <span className="text-[10px] text-blue-400 block">{featuredStory.author.role}</span>
                </div>
              </div>
            </div>

            <Link to={`/stories/${featuredStory.slug}`}>
              <Button variant="glow" className="w-full justify-center" icon={<ArrowRight className="w-4 h-4" />}>
                Baca Artikel Lengkap
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Filter Category */}
      <div className="flex justify-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 text-xs font-semibold rounded-full transition-all uppercase tracking-wider ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-900 text-gray-400 hover:text-white'
            }`}
          >
            {cat === 'all' ? 'Semua Kategori' : cat}
          </button>
        ))}
      </div>

      {/* Stories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {filteredStories.map((story) => (
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

              <Link to={`/stories/${story.slug}`}>
                <Button variant="ghost" size="sm" className="w-full justify-between text-blue-400 hover:text-blue-300">
                  <span>Baca Selengkapnya</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
