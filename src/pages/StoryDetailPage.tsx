import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { storiesData } from '../data/stories';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { ArrowLeft, Clock, Calendar, Share2 } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const StoryDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const story = storiesData.find(s => s.slug === slug) || storiesData[0];

  return (
    <div className="pt-28 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <Link to="/stories">
        <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
          Kembali ke Artikel
        </Button>
      </Link>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Badge variant="blue">{story.category}</Badge>
          <span className="text-xs text-gray-400">{story.publishedAt}</span>
          <span className="text-xs text-gray-400">•</span>
          <span className="text-xs text-gray-400">{story.readTime}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-display leading-tight">
          {story.title}
        </h1>

        <div className="flex items-center gap-3 pt-2">
          <img
            src={story.author.avatar}
            alt={story.author.name}
            className="w-10 h-10 rounded-full object-cover border border-blue-400"
          />
          <div>
            <span className="text-sm font-bold text-white block">{story.author.name}</span>
            <span className="text-xs text-blue-400 block">{story.author.role}</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-800 h-96">
        <img
          src={story.coverImage}
          alt={story.title}
          className="w-full h-full object-cover"
        />
      </div>

      <Card className="p-8 sm:p-12 space-y-6 text-gray-300 leading-relaxed text-base">
        <p className="text-lg text-gray-200 font-semibold italic border-l-4 border-blue-500 pl-4 py-1">
          {story.excerpt}
        </p>

        <div className="prose prose-invert max-w-none space-y-4 text-sm sm:text-base">
          {story.content.split('\n\n').map((paragraph, idx) => {
            if (paragraph.startsWith('### ')) {
              return <h3 key={idx} className="text-xl font-bold text-white font-display mt-6 mb-2">{paragraph.replace('### ', '')}</h3>;
            }
            if (paragraph.startsWith('> ')) {
              return <blockquote key={idx} className="bg-gray-900/80 p-4 rounded-xl border-l-4 border-cyan-400 my-4 text-cyan-200 font-medium">{paragraph.replace('> ', '')}</blockquote>;
            }
            return <p key={idx}>{paragraph}</p>;
          })}
        </div>
      </Card>
    </div>
  );
};
