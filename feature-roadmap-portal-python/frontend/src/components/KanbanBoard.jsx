import React, { useState } from 'react';
import { PostCard } from './PostCard';
import { KanbanSkeleton } from './Skeletons';
import { Layers, ChevronRight, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';

export const KanbanBoard = ({ posts = [], onPostClick, onOpenAuthModal, onRefresh }) => {
  const { isAdmin, showToast } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('All');

  const columns = [
    { key: 'Planned', title: 'Planned', icon: Clock, badgeClass: 'badge-planned', desc: 'Approved & scheduled for development' },
    { key: 'In Progress', title: 'In Progress', icon: Sparkles, badgeClass: 'badge-progress', desc: 'Currently under active implementation' },
    { key: 'Completed', title: 'Completed', icon: CheckCircle2, badgeClass: 'badge-completed', desc: 'Shipped & available in production' }
  ];

  const handleAdminStatusChange = async (postId, newStatus) => {
    try {
      await client.patch(`/admin/posts/${postId}/status`, { status: newStatus });
      showToast(`Feature status moved to ${newStatus}!`, 'success');
      onRefresh?.();
    } catch (err) {
      showToast('Failed to update status.', 'error');
    }
  };

  const filteredPosts = posts.filter(p => {
    if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Category Filter Pills for Kanban */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl coss-glass border border-white/5">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          <h2 className="font-bold text-white text-base">Public Product Roadmap</h2>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {['All', 'UI/UX', 'Integrations', 'Performance', 'General'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition shrink-0 ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                  : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 3-Column Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {columns.map(col => {
          const colPosts = filteredPosts.filter(p => p.status === col.key);
          const IconComponent = col.icon;

          return (
            <div 
              key={col.key} 
              className="coss-glass rounded-xl p-4 border border-white/10 flex flex-col min-h-[550px] shadow-xl"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-lg ${col.badgeClass}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm flex items-center gap-2">
                      {col.title}
                      <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-white/10 text-gray-300">
                        {colPosts.length}
                      </span>
                    </h3>
                  </div>
                </div>
              </div>

              {/* Column Cards */}
              <div className="space-y-4 flex-1">
                {colPosts.length === 0 ? (
                  <div className="h-40 flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 text-center p-4">
                    <p className="text-xs text-gray-500 font-medium">No items in {col.title}</p>
                  </div>
                ) : (
                  colPosts.map(post => (
                    <div key={post.id} className="relative group">
                      <PostCard 
                        post={post} 
                        onPostClick={onPostClick} 
                        onOpenAuthModal={onOpenAuthModal} 
                      />

                      {/* Admin Quick Status Switcher */}
                      {isAdmin && (
                        <div className="px-3 py-2 bg-slate-900/90 rounded-b-xl border-x border-b border-indigo-500/30 -mt-5 mb-4 flex items-center justify-between text-xs">
                          <span className="text-indigo-300 font-semibold">Admin Move:</span>
                          <div className="flex gap-1">
                            {['Under Review', 'Planned', 'In Progress', 'Completed']
                              .filter(s => s !== post.status)
                              .map(nextStatus => (
                                <button
                                  key={nextStatus}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAdminStatusChange(post.id, nextStatus);
                                  }}
                                  className="px-2 py-0.5 rounded bg-white/10 hover:bg-indigo-600 text-gray-300 hover:text-white text-[10px] transition"
                                >
                                  → {nextStatus}
                                </button>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
