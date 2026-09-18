import React, { useState, useEffect } from 'react';
import { ShieldCheck, Trash2, Tag, Layers, CheckCircle2, AlertCircle } from 'lucide-react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { PostCardSkeleton } from '../components/Skeletons';

export const AdminPage = ({ onRefreshAll }) => {
  const { isAdmin, showToast } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminPosts = async () => {
    try {
      const res = await client.get('/admin/posts');
      setPosts(res.data);
    } catch (err) {
      showToast('Failed to load admin posts.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchAdminPosts();
  }, [isAdmin]);

  const handleStatusUpdate = async (postId, newStatus) => {
    try {
      await client.patch(`/admin/posts/${postId}/status`, { status: newStatus });
      showToast('Post status updated successfully!', 'success');
      fetchAdminPosts();
      onRefreshAll?.();
    } catch (err) {
      showToast('Failed to update status.', 'error');
    }
  };

  const handleDeletePost = async (postId, title) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await client.delete(`/admin/posts/${postId}`);
      showToast('Feature request deleted.', 'info');
      fetchAdminPosts();
      onRefreshAll?.();
    } catch (err) {
      showToast('Failed to delete post.', 'error');
    }
  };

  if (!isAdmin) {
    return (
      <div className="coss-glass rounded-xl p-8 text-center border border-rose-500/30 text-rose-300 max-w-md mx-auto space-y-3">
        <AlertCircle className="w-10 h-10 mx-auto text-rose-400" />
        <h2 className="font-bold text-lg">Access Denied</h2>
        <p className="text-xs">You need Administrator permissions to view this portal.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 rounded-xl coss-glass border border-amber-500/30 bg-amber-950/20">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-amber-400" />
          <div>
            <h2 className="font-bold text-white text-base">Admin RBAC Control Panel</h2>
            <p className="text-xs text-amber-200/80">Manage feature request statuses, moderation, and roadmap synchronization.</p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/40">
          Admin Active
        </span>
      </div>

      {loading ? (
        <PostCardSkeleton />
      ) : (
        <div className="coss-glass rounded-xl border border-white/10 overflow-hidden">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-white/5 border-b border-white/10 uppercase font-bold text-gray-400">
              <tr>
                <th className="p-4">Title & Category</th>
                <th className="p-4">Author</th>
                <th className="p-4 text-center">Votes</th>
                <th className="p-4">Status Control</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {posts.map(post => (
                <tr key={post.id} className="hover:bg-white/5 transition">
                  <td className="p-4">
                    <p className="font-bold text-white text-sm">{post.title}</p>
                    <span className="inline-flex items-center gap-1 text-[10px] text-indigo-400 font-semibold mt-0.5">
                      <Tag className="w-3 h-3" /> {post.category}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <img 
                        src={post.author?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author_id}`} 
                        alt="avatar" 
                        className="w-5 h-5 rounded-full bg-slate-800"
                      />
                      <span>{post.author?.full_name || 'User'}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center font-bold text-indigo-400 text-sm">
                    {post.upvote_count}
                  </td>
                  <td className="p-4">
                    <select
                      value={post.status}
                      onChange={(e) => handleStatusUpdate(post.id, e.target.value)}
                      className="coss-input text-xs py-1 px-2 font-semibold bg-slate-900 border-white/20"
                    >
                      <option value="Under Review">Under Review</option>
                      <option value="Planned">Planned</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDeletePost(post.id, post.title)}
                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 transition"
                      title="Delete Request"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
