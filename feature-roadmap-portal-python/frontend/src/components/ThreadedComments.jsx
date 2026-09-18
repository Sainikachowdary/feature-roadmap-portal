import React, { useState } from 'react';
import { Reply, Trash2, Send, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';

export const CommentItem = ({ comment, postId, onRefresh, depth = 0 }) => {
  const { user, isAdmin, showToast } = useAuth();
  const [replying, setReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isAuthorOrAdmin = user && (user.id === comment.user_id || isAdmin);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setSubmitting(true);
    try {
      await client.post(`/posts/${postId}/comments`, {
        content: replyContent,
        parent_id: comment.id
      });
      showToast('Reply added!', 'success');
      setReplyContent('');
      setReplying(false);
      onRefresh?.();
    } catch (err) {
      showToast('Failed to add reply.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    try {
      await client.delete(`/comments/${comment.id}`);
      showToast('Comment deleted.', 'info');
      onRefresh?.();
    } catch (err) {
      showToast('Failed to delete comment.', 'error');
    }
  };

  return (
    <div className={`mt-3 ${depth > 0 ? 'ml-6 pl-4 border-l-2 border-white/10' : ''}`}>
      <div className="coss-glass p-3.5 rounded-xl border border-white/5 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src={comment.author?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user_id}`} 
              alt="avatar" 
              className="w-6 h-6 rounded-full bg-slate-800"
            />
            <span className="text-xs font-bold text-white">{comment.author?.full_name || 'User'}</span>
            <span className="text-[10px] text-gray-500">• {new Date(comment.created_at).toLocaleDateString()}</span>
          </div>

          <div className="flex items-center gap-2">
            {user && depth < 3 && (
              <button 
                onClick={() => setReplying(!replying)}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
              >
                <Reply className="w-3 h-3" /> Reply
              </button>
            )}
            {isAuthorOrAdmin && (
              <button 
                onClick={handleDelete}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition ml-2"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        <div className="text-xs text-gray-300 prose prose-invert prose-xs">
          <ReactMarkdown>{comment.content}</ReactMarkdown>
        </div>

        {replying && (
          <form onSubmit={handleSendReply} className="mt-3 flex gap-2">
            <input
              type="text"
              required
              placeholder="Write a reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="coss-input text-xs py-1.5 flex-1"
            />
            <button type="submit" disabled={submitting} className="coss-btn coss-btn-primary py-1 px-3 text-xs">
              <Send className="w-3 h-3" />
            </button>
          </form>
        )}
      </div>

      {/* Render Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-2">
          {comment.replies.map(reply => (
            <CommentItem 
              key={reply.id} 
              comment={reply} 
              postId={postId} 
              onRefresh={onRefresh} 
              depth={depth + 1} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const ThreadedComments = ({ postId, comments = [], onRefresh, onOpenAuthModal }) => {
  const { user, showToast } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      onOpenAuthModal?.();
      return;
    }

    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      await client.post(`/posts/${postId}/comments`, { content: newComment });
      showToast('Comment posted!', 'success');
      setNewComment('');
      onRefresh?.();
    } catch (err) {
      showToast('Failed to post comment.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
      <h3 className="font-bold text-white text-sm flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-indigo-400" /> Discussion ({comments.length})
      </h3>

      {/* Main Comment Box */}
      {user ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            required
            placeholder="Share your thoughts or feedback on this idea..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="coss-input text-sm flex-1"
          />
          <button type="submit" disabled={submitting} className="coss-btn coss-btn-primary">
            Post
          </button>
        </form>
      ) : (
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center text-xs text-gray-400">
          <button onClick={onOpenAuthModal} className="text-indigo-400 font-semibold hover:underline">Log in</button> to join the discussion.
        </div>
      )}

      {/* Root Comments */}
      <div className="space-y-3">
        {comments.length === 0 ? (
          <p className="text-xs text-gray-500 italic">No comments yet. Be the first to start the discussion!</p>
        ) : (
          comments.map(c => (
            <CommentItem key={c.id} comment={c} postId={postId} onRefresh={onRefresh} depth={0} />
          ))
        )}
      </div>
    </div>
  );
};
