
import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { Theme, BRAND_NAME } from '../types';

interface AuthUIProps {
  theme: Theme;
  userEmail?: string;
  onSuccess: () => void;
}

export const AuthUI: React.FC<AuthUIProps> = ({ theme, userEmail, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const isConfigured = isSupabaseConfigured();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfigured) return;

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        setMessage({ text: error.message, type: 'error' });
      } else {
        setMessage({ text: 'Check your email for the magic link.', type: 'success' });
        setEmail('');
      }
    } catch (err: any) {
      setMessage({ text: 'Connection failed. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (!isConfigured) {
       window.location.reload();
       return;
    }
    await supabase.auth.signOut();
    window.location.reload();
  };

  if (userEmail) {
    return (
      <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Active Account</p>
          <p className="text-xs text-white truncate font-medium">{userEmail}</p>
        </div>
        <button 
          onClick={handleSignOut}
          className="ml-4 px-4 py-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!isConfigured && (
        <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
           <div className="flex items-center gap-2 mb-1">
             <span className="text-yellow-500">⚠️</span>
             <span className="text-[10px] text-yellow-400 font-bold uppercase tracking-widest">Setup Required</span>
           </div>
           <p className="text-[10px] text-slate-400 leading-relaxed">
             Connect Supabase to enable login.
           </p>
        </div>
      )}
      
      <form onSubmit={handleSignIn} className={`space-y-3 ${!isConfigured ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="space-y-1.5">
          <label className={`text-[10px] font-bold ${theme.colors.secondary} uppercase ml-1`}>Sign in to Studio</label>
          <input 
            type="email" 
            required
            disabled={!isConfigured || loading}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com" 
            className={`w-full bg-black/40 border ${theme.colors.border} rounded-xl py-3 px-4 text-sm text-white outline-none transition-all focus:border-white/30 disabled:opacity-50`} 
          />
        </div>
        <button 
          type="submit"
          disabled={loading || !isConfigured}
          className={`w-full py-4 ${theme.colors.primary} text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl transition-all disabled:opacity-50 active:scale-95`}
        >
          {loading ? 'Sending link...' : 'Get Magic Link'}
        </button>
      </form>
      {message && (
        <p className={`text-[10px] font-bold text-center uppercase tracking-widest ${message.type === 'error' ? 'text-red-400' : 'text-emerald-400'}`}>
          {message.text}
        </p>
      )}
    </div>
  );
};
