import React, { useState } from 'react';
import { X, Sparkles, Eye, Edit3 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

export const CreatePostModal = ({ isOpen, onClose, onCreated }) => {
  const { showToast } = useAuth();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('UI/UX');
  const [description, setDescription] = useState('');
  const [activeTab, setActiveTab] = useState('write'); // 'write' | 'preview'
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      showToast('Please provide both title and description.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await client.post('/posts', { title, category, description });
      showToast('Feature request submitted successfully!', 'success');
      onCreated(res.data);
      onClose();
      setTitle('');
      setDescription('');
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to submit post.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="coss-glass coss-card w-full max-w-2xl p-6 border border-white/10 relative shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Submit a Feature Request</h2>
            <p className="text-xs text-gray-400">Share your suggestion with the community and development team.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Feature Title</label>
            <input
              type="text"
              required
              placeholder="e.g., Add Dark Theme settings switch"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="coss-input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Category</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {['UI/UX', 'Integrations', 'Performance', 'General'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                    category === cat
                      ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-gray-300">Description (Markdown Supported)</label>
              <div className="flex gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveTab('write')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium ${
                    activeTab === 'write' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" /> Write
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium ${
                    activeTab === 'preview' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" /> Preview
                </button>
              </div>
            </div>

            {activeTab === 'write' ? (
              <textarea
                required
                rows={5}
                placeholder="Explain what problem this feature solves and any specific implementation ideas..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="coss-input resize-y font-mono text-sm"
              />
            ) : (
              <div className="coss-input min-h-[135px] max-h-[250px] overflow-y-auto prose prose-invert prose-sm p-3 bg-slate-900/90">
                {description.trim() ? (
                  <ReactMarkdown>{description}</ReactMarkdown>
                ) : (
                  <span className="text-gray-500 italic">Nothing to preview yet...</span>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="coss-btn coss-btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="coss-btn coss-btn-primary">
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
