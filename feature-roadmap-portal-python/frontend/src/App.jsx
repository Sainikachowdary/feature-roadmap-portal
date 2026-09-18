import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { FeedPage } from './pages/FeedPage';
import { KanbanBoard } from './components/KanbanBoard';
import { PostDetailPage } from './pages/PostDetailPage';
import { AdminPage } from './pages/AdminPage';
import { CreatePostModal } from './components/CreatePostModal';
import { AuthModal } from './components/AuthModal';
import { Toast } from './components/Toast';
import client from './api/client';

function AppContent() {
  const [viewMode, setViewMode] = useState('feed'); // 'feed' | 'kanban' | 'admin' | 'detail'
  const [selectedPostId, setSelectedPostId] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortOption, setSortOption] = useState('trending');

  // Posts State
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = {
        sort: sortOption,
      };
      if (debouncedSearch.trim()) params.search = debouncedSearch;
      if (categoryFilter !== 'All') params.category = categoryFilter;
      if (statusFilter !== 'All') params.status = statusFilter;

      const res = await client.get('/posts', { params });
      setPosts(res.data);
    } catch (err) {
      console.error('Failed to fetch posts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [debouncedSearch, categoryFilter, statusFilter, sortOption]);

  const handlePostClick = (post) => {
    setSelectedPostId(post.id);
    setViewMode('detail');
  };

  return (
    <div className="min-h-screen pb-12 flex flex-col">
      <Navbar
        viewMode={viewMode}
        setViewMode={(mode) => {
          setViewMode(mode);
          setSelectedPostId(null);
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      <main className="max-w-7xl mx-auto w-full px-4 lg:px-8 pt-8 flex-1">
        {viewMode === 'feed' && (
          <FeedPage
            posts={posts}
            loading={loading}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            sortOption={sortOption}
            setSortOption={setSortOption}
            onPostClick={handlePostClick}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}

        {viewMode === 'kanban' && (
          <KanbanBoard
            posts={posts}
            onPostClick={handlePostClick}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onRefresh={fetchPosts}
          />
        )}

        {viewMode === 'detail' && selectedPostId && (
          <PostDetailPage
            postId={selectedPostId}
            onBack={() => setViewMode('feed')}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}

        {viewMode === 'admin' && (
          <AdminPage onRefreshAll={fetchPosts} />
        )}
      </main>

      {/* Modals */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={() => fetchPosts()}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Toast Notifications */}
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
