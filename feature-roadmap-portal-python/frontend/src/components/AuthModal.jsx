import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User, ShieldCheck } from 'lucide-react';
import client from '../api/client';

export const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { login, signup, showToast } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'login' | 'signup' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifToken, setVerifToken] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (mode === 'login') {
      const res = await login(email, password);
      if (res.success) onClose();
    } else if (mode === 'signup') {
      const res = await signup(email, password, fullName);
      if (res.success && res.user.verification_token) {
        setVerifToken(res.user.verification_token);
      }
    } else if (mode === 'forgot') {
      try {
        const res = await client.post('/auth/forgot-password', { email });
        showToast(res.data.message, 'info');
        if (res.data.reset_token) {
          alert(`Simulated Reset Token: ${res.data.reset_token}\nCopy this token to reset your password.`);
        }
      } catch (err) {
        showToast('Error requesting password reset.', 'error');
      }
    }
    setLoading(false);
  };

  const handleSimulateVerify = async () => {
    if (!verifToken) return;
    try {
      await client.post('/auth/verify-email', { verification_token: verifToken });
      showToast('Email verified! You can now log in.', 'success');
      setMode('login');
      setVerifToken(null);
    } catch (e) {
      showToast('Verification failed.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="coss-glass coss-card w-full max-w-md p-6 border border-white/10 relative shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 mb-3 border border-indigo-500/30">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">
            {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Join Roadmap Portal' : 'Reset Password'}
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            {mode === 'login' ? 'Log in to submit requests & upvote ideas' : mode === 'signup' ? 'Create an account to participate' : 'Enter email to receive reset token'}
          </p>
        </div>

        {verifToken ? (
          <div className="p-4 rounded-xl bg-indigo-950/60 border border-indigo-500/40 text-center space-y-3">
            <ShieldCheck className="w-8 h-8 text-indigo-400 mx-auto" />
            <h3 className="font-semibold text-white">Simulated Email Verification</h3>
            <p className="text-xs text-gray-300">
              In a production system, a link is sent to <strong>{email}</strong>. For this assessment demo, click below to verify immediately.
            </p>
            <button
              onClick={handleSimulateVerify}
              className="coss-btn coss-btn-primary w-full py-2"
            >
              Verify Email Now
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Sarah Jenkins"
                    className="coss-input pl-9"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="coss-input pl-9"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-gray-300">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-xs text-indigo-400 hover:underline"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="coss-input pl-9"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="coss-btn coss-btn-primary w-full py-2.5 mt-2"
            >
              {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div className="mt-5 text-center text-xs text-gray-400">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button onClick={() => setMode('signup')} className="text-indigo-400 font-semibold hover:underline">
                Sign Up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button onClick={() => setMode('login')} className="text-indigo-400 font-semibold hover:underline">
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
