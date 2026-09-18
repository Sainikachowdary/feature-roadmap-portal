import React, { useState } from 'react';
import { ChevronUp, MessageSquare, Tag, Clock } from 'lucide-react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

export const PostCard = ({ post, onPostClick, onOpenAuthModal }) => {
  const { user, showToast } = useAuth();
  
  // Optimistic UI State
  const [upvoteCount, setUpvoteCount] = useState(post.upvote_count);
  const [hasUpvoted, setHasUpvoted] = useState(post.has_upvoted);
  const [isVoting, setIsVoting] = useState(false);

  const statusBadges = {
    'Under Review': 'badge-review',
    'Planned': 'badge-planned',
    'In Progress': 'badge-progress',
    'Completed': 'badge-completed'
  };

  const handleUpvote = async (e) => {
    e.stopPropagation();
    
    // Unauthenticated user prompt
    if (!user) {
      showToast('Please log in or sign up to vote on feature requests.', 'info');
      onOpenAuthModal?.();
      return;
    }

    if (isVoting) return;

    // Optimistic Update
    const prevCount = upvoteCount;
    const prevHasUpvoted = hasUpvoted;

    const nextHasUpvoted = !prevHasUpvoted;
    const nextCount = prevHasUpvoted ? prevCount - 1 : prevCount + 1;

    setHasUpvoted(nextHasUpvoted);
    setUpvoteCount(nextCount);
    setIsVoting(true);

    try {
      const res = await client.post(`/posts/${post.id}/vote`);
      setUpvoteCount(res.data.upvote_count);
      setHasUpvoted(res.data.has_upvoted);
    } catch (err) {
      // Rollback on error
      setUpvoteCount(prevCount);
      setHasUpvoted(prevHasUpvoted);
      showToast('Failed to update vote. Rolled back.', 'error');
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div 
      onClick={() => onPostClick?.(post)}
      className="coss-glass coss-card p-5 mb-4 flex gap-4 items-start cursor-pointer group"
    >
      {/* Upvote Button Primitive */}
      <button
        onClick={handleUpvote}
        className={`coss-upvote-btn shrink-0 ${hasUpvoted ? 'active' : ''}`}
        title={user ? (hasUpvoted ? 'Remove vote' : 'Upvote idea') : 'Log in to upvote'}
      >
        <ChevronUp className={`w-5 h-5 transition-transform group-hover:-translate-y-0.5 ${hasUpvoted ? 'stroke-[3]' : ''}`} />
        <span>{upvoteCount}</span>
      </button>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          <span className={`coss-badge ${statusBadges[post.status] || 'badge-review'}`}>
            {post.status}
          </span>
          <span className="coss-badge bg-white/5 text-gray-300 border border-white/10">
            <Tag className="w-3 h-3 text-indigo-400" /> {post.category}
          </span>
        </div>

        <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition line-clamp-1">
          {post.title}
        </h3>

        <p className="text-xs text-gray-300 mt-1 line-clamp-2 leading-relaxed">
          {post.description.replace(/[#*`_]/g, '')}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-400 mt-4 pt-3 border-t border-white/5">
          <div className="flex items-center gap-2">
            <img 
              src={post.author?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author_id}`} 
              alt="avatar" 
              className="w-5 h-5 rounded-full bg-slate-800"
            />
            <span className="font-medium text-gray-300">{post.author?.full_name || 'Anonymous'}</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 hover:text-white transition">
              <MessageSquare className="w-3.5 h-3.5 text-indigo-400" /> {post.comment_count}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {new Date(post.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
