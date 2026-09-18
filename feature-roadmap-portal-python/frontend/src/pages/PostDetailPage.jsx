import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronUp, Tag, Clock, Calendar } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ThreadedComments } from '../components/ThreadedComments';
import { PostCardSkeleton } from '../components/Skeletons';

export const PostDetailPage = ({ postId, onBack, onOpenAuthModal }) => {
  const { user, showToast } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVoting, setIsVoting] = useState(false);

  const fetchDetail = async () => {
    try {
      const [postRes, commentsRes] = await Promise.all([
        client.get(`/posts/${postId}`),
        client.get(`/posts/${postId}/comments`)
      ]);
      setPost(postRes.data);
      setComments(commentsRes.data);
    } catch (err) {
      showToast('Failed to load request details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [postId]);

  const handleUpvote = async () => {
    if (!user) {
      showToast('Please sign in to upvote.', 'info');
      onOpenAuthModal?.();
      return;
    }

    if (isVoting || !post) return;

    // Optimistic Update
    const prevCount = post.upvote_count;
    const prevHasUpvoted = post.has_upvoted;
    const nextHasUpvoted = !prevHasUpvoted;
    const nextCount = prevHasUpvoted ? prevCount - 1 : prevCount + 1;

    setPost({ ...post, has_upvoted: nextHasUpvoted, upvote_count: nextCount });
    setIsVoting(true);

    try {
      const res = await client.post(`/posts/${postId}/vote`);
      setPost(prev => ({ ...prev, upvote_count: res.data.upvote_count, has_upvoted: res.data.has_upvoted }));
    } catch (err) {
      setPost(prev => ({ ...prev, upvote_count: prevCount, has_upvoted: prevHasUpvoted }));
      showToast('Failed to vote.', 'error');
    } finally {
      setIsVoting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <button onClick={onBack} className="coss-btn coss-btn-secondary text-xs">
          <ArrowLeft className="w-4 h-4" /> Back to Feed
        </button>
        <PostCardSkeleton />
      </div>
    );
  }

  if (!post) return null;

  const statusBadges = {
    'Under Review': 'badge-review',
    'Planned': 'badge-planned',
    'In Progress': 'badge-progress',
    'Completed': 'badge-completed'
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button onClick={onBack} className="coss-btn coss-btn-secondary text-xs">
        <ArrowLeft className="w-4 h-4" /> Back to Feed
      </button>

      <div className="coss-glass coss-card p-6 border border-white/10 space-y-6">
        
        {/* Header Badges & Upvote */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`coss-badge ${statusBadges[post.status] || 'badge-review'}`}>
                {post.status}
              </span>
              <span className="coss-badge bg-white/5 text-gray-300 border border-white/10">
                <Tag className="w-3 h-3 text-indigo-400" /> {post.category}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white leading-tight">{post.title}</h1>
          </div>

          <button
            onClick={handleUpvote}
            className={`coss-upvote-btn shrink-0 ${post.has_upvoted ? 'active' : ''}`}
          >
            <ChevronUp className={`w-5 h-5 ${post.has_upvoted ? 'stroke-[3]' : ''}`} />
            <span>{post.upvote_count}</span>
          </button>
        </div>

        {/* Author Metadata */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
          <img 
            src={post.author?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author_id}`} 
            alt="avatar" 
            className="w-8 h-8 rounded-full bg-slate-800 border border-indigo-500/30"
          />
          <div>
            <p className="font-bold text-white">{post.author?.full_name || 'Anonymous'}</p>
            <p className="text-gray-400 flex items-center gap-1 mt-0.5">
              <Calendar className="w-3 h-3" /> Submitted on {new Date(post.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Markdown Description Body */}
        <div className="prose prose-invert max-w-none text-sm leading-relaxed text-gray-200 bg-slate-900/60 p-4 rounded-xl border border-white/5">
          <ReactMarkdown>{post.description}</ReactMarkdown>
        </div>

        {/* Threaded Comments Section */}
        <ThreadedComments 
          postId={post.id} 
          comments={comments} 
          onRefresh={fetchDetail} 
          onOpenAuthModal={onOpenAuthModal} 
        />
      </div>
    </div>
  );
};
