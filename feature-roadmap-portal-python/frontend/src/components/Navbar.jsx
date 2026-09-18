import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Search, Plus, LayoutGrid, Kanban, ShieldAlert, LogOut, User } from 'lucide-react';

export const Navbar = ({ 
  viewMode, 
  setViewMode, 
  searchQuery, 
  setSearchQuery, 
  onOpenCreateModal, 
  onOpenAuthModal 
}) => {
  const { user, isAdmin, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#0b0f19]/80 border-b border-white/10 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & View Switcher */}
        <div className="flex items-center justify-between w-full md:w-auto gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-white text-base tracking-tight leading-none">FeaturePortal</h1>
              <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">Coss UI Roadmap</span>
            </div>
          </div>

          {/* Navigation View Mode Tabs */}
          <div className="flex items-center p-1 bg-white/5 rounded-xl border border-white/10">
            <button
              onClick={() => setViewMode('feed')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'feed' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Feed
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'kanban' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" /> Roadmap
            </button>
            {isAdmin && (
              <button
                onClick={() => setViewMode('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  viewMode === 'admin' ? 'bg-amber-600 text-white shadow-md' : 'text-amber-400 hover:text-amber-300'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" /> Admin
              </button>
            )}
          </div>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Debounced Search Input */}
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
            <input
              type="text"
              placeholder="Search feature requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="coss-input pl-9 text-xs py-2 bg-slate-900/90"
            />
          </div>

          {/* Submit Request Button */}
          <button
            onClick={() => user ? onOpenCreateModal() : onOpenAuthModal()}
            className="coss-btn coss-btn-primary shrink-0 py-2 text-xs"
          >
            <Plus className="w-4 h-4" /> Submit Request
          </button>

          {/* User Auth Profile / Login Button */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
              <img 
                src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} 
                alt="user avatar" 
                className="w-8 h-8 rounded-full border border-indigo-500/50 bg-slate-800"
              />
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-white line-clamp-1">{user.full_name}</p>
                <span className="text-[10px] text-gray-400 capitalize">{user.role}</span>
              </div>
              <button 
                onClick={logout} 
                title="Logout"
                className="p-2 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-white/5 transition ml-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="coss-btn coss-btn-secondary shrink-0 py-2 text-xs"
            >
              <User className="w-4 h-4" /> Sign In
            </button>
          )}

        </div>
      </div>
    </header>
  );
};
