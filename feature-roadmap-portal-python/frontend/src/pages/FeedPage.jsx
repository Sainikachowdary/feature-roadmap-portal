import React from 'react';
import { PostCard } from '../components/PostCard';
import { PostCardSkeleton } from '../components/Skeletons';
import { Flame, Clock, MessageSquare, Filter, PlusCircle } from 'lucide-react';

export const FeedPage = ({ 
  posts = [], 
  loading, 
  categoryFilter, 
  setCategoryFilter, 
  statusFilter, 
  setStatusFilter, 
  sortOption, 
  setSortOption, 
  onPostClick, 
  onOpenCreateModal, 
  onOpenAuthModal 
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      
      {/* Sidebar Filters */}
      <div className="lg:col-span-1 space-y-6">
        
        {/* Sort Options */}
        <div className="coss-glass rounded-xl p-4 border border-white/10 space-y-3">
          <h3 className="font-bold text-white text-xs uppercase tracking-wider text-gray-400">Sort Feed</h3>
          <div className="space-y-1">
            {[
              { id: 'trending', label: 'Trending / Upvoted', icon: Flame },
              { id: 'newest', label: 'Newest Submissions', icon: Clock },
              { id: 'discussed', label: 'Most Discussed', icon: MessageSquare },
            ].map(item => {
              const IconComp = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setSortOption(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                    sortOption === item.id
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <IconComp className="w-4 h-4" /> {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Categories Filter */}
        <div className="coss-glass rounded-xl p-4 border border-white/10 space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400 flex items-center justify-between">
            <span>Categories</span>
            <Filter className="w-3.5 h-3.5" />
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {['All', 'UI/UX', 'Integrations', 'Performance', 'General'].map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                  categoryFilter === cat
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div className="coss-glass rounded-xl p-4 border border-white/10 space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400">Status</h3>
          <div className="space-y-1">
            {['All', 'Under Review', 'Planned', 'In Progress', 'Completed'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                  statusFilter === st
                    ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50'
                    : 'bg-transparent text-gray-400 border-transparent hover:bg-white/5 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Main Feed Content */}
      <div className="lg:col-span-3 space-y-4">
        {loading ? (
          <>
            <PostCardSkeleton />
            <PostCardSkeleton />
            <PostCardSkeleton />
          </>
        ) : posts.length === 0 ? (
          <div className="coss-glass rounded-xl p-12 text-center border border-white/10 space-y-4">
            <div className="w-16 h-16 rounded-full bg-white/5 mx-auto flex items-center justify-center text-gray-500 border border-white/10">
              <PlusCircle className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-white">No feature requests found</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Be the first to submit a suggestion or adjust your search filters!
            </p>
            <button onClick={onOpenCreateModal} className="coss-btn coss-btn-primary py-2 px-4 text-xs">
              Submit Request
            </button>
          </div>
        ) : (
          posts.map(post => (
            <PostCard 
              key={post.id} 
              post={post} 
              onPostClick={onPostClick} 
              onOpenAuthModal={onOpenAuthModal} 
            />
          ))
        )}
      </div>

    </div>
  );
};
