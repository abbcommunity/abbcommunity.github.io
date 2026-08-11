import Fuse from 'fuse.js';
import { SearchResult } from '../types';
import { membersData } from '../data/members';
import { eventsData } from '../data/events';
import { storiesData } from '../data/stories';
import { galleryData } from '../data/gallery';
import { garageData } from '../data/garage';
import { documentsData } from '../data/documents';

export function getGlobalSearchItems(): SearchResult[] {
  const items: SearchResult[] = [];

  // Add members
  membersData.forEach(m => {
    items.push({
      id: `member-${m.id}`,
      type: 'member',
      title: m.name,
      subtitle: `${m.position} • ${m.chapter} • ${m.motorcycle}`,
      url: `/members?id=${m.id}`,
      image: m.photo
    });
  });

  // Add events
  eventsData.forEach(e => {
    items.push({
      id: `event-${e.id}`,
      type: 'event',
      title: e.title,
      subtitle: `${e.category} • ${e.date} • ${e.location}`,
      url: `/events?id=${e.id}`,
      image: e.coverImage
    });
  });

  // Add stories
  storiesData.forEach(s => {
    items.push({
      id: `story-${s.id}`,
      type: 'story',
      title: s.title,
      subtitle: `${s.category} • ${s.readTime}`,
      url: `/stories/${s.slug}`,
      image: s.coverImage
    });
  });

  // Add gallery
  galleryData.forEach(g => {
    items.push({
      id: `gallery-${g.id}`,
      type: 'gallery',
      title: g.title,
      subtitle: `Gallery ${g.year} • ${g.category}`,
      url: `/gallery?id=${g.id}`,
      image: g.image
    });
  });

  // Add garage
  garageData.forEach(b => {
    items.push({
      id: `garage-${b.id}`,
      type: 'garage',
      title: `${b.ownerName} - ${b.brand} ${b.model}`,
      subtitle: `${b.engineCapacity} • ${b.chapter}`,
      url: `/garage?id=${b.id}`,
      image: b.image
    });
  });

  // Add documents
  documentsData.forEach(d => {
    items.push({
      id: `doc-${d.id}`,
      type: 'document',
      title: d.title,
      subtitle: `Dokumen ${d.category} • ${d.fileType} (${d.fileSize})`,
      url: `/documents`
    });
  });

  return items;
}

const fuseInstance = new Fuse(getGlobalSearchItems(), {
  keys: ['title', 'subtitle', 'type'],
  threshold: 0.3,
});

export function performGlobalSearch(query: string): SearchResult[] {
  if (!query.trim()) return [];
  return fuseInstance.search(query).map(result => result.item);
}
