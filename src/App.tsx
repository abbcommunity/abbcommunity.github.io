import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { GlobalSearchModal } from './components/layout/GlobalSearchModal';

import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { MembersPage } from './pages/MembersPage';
import { EventsPage } from './pages/EventsPage';
import { StoriesPage } from './pages/StoriesPage';
import { StoryDetailPage } from './pages/StoryDetailPage';
import { GalleryPage } from './pages/GalleryPage';
import { GaragePage } from './pages/GaragePage';
import { RidesPage } from './pages/RidesPage';
import { SocialImpactPage } from './pages/SocialImpactPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { ContactPage } from './pages/ContactPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Admin Engine Pages
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminMembersPage } from './pages/admin/AdminMembersPage';
import { AdminEventsPage } from './pages/admin/AdminEventsPage';
import { AdminStoriesPage } from './pages/admin/AdminStoriesPage';
import { AdminDocumentsPage } from './pages/admin/AdminDocumentsPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';

export const App: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Keyboard shortcut Ctrl+K to trigger global search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Admin Portal Layout & Sub-routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="members" element={<AdminMembersPage />} />
            <Route path="events" element={<AdminEventsPage />} />
            <Route path="stories" element={<AdminStoriesPage />} />
            <Route path="documents" element={<AdminDocumentsPage />} />
            <Route path="audit-logs" element={<AdminAuditLogsPage />} />
          </Route>

          {/* Public Platform Layout */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex flex-col bg-[#0B0F17] text-gray-100 font-sans selection:bg-blue-600 selection:text-white">
                <Navbar onOpenSearch={() => setIsSearchOpen(true)} />

                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/members" element={<MembersPage />} />
                    <Route path="/events" element={<EventsPage />} />
                    <Route path="/stories" element={<StoriesPage />} />
                    <Route path="/stories/:slug" element={<StoryDetailPage />} />
                    <Route path="/gallery" element={<GalleryPage />} />
                    <Route path="/garage" element={<GaragePage />} />
                    <Route path="/rides" element={<RidesPage />} />
                    <Route path="/social-impact" element={<SocialImpactPage />} />
                    <Route path="/documents" element={<DocumentsPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </main>

                <Footer />

                {/* Global Fuzzy Search Modal */}
                <GlobalSearchModal
                  isOpen={isSearchOpen}
                  onClose={() => setIsSearchOpen(false)}
                />
              </div>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
