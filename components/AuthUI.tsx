
import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { Theme } from '../types';

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
    setLoading(true);
    setMessage(null);

    if (!isConfigured) {
      setTimeout(() => {
        const mockUser = { email: email.toLowerCase(), id: 'mock-node-123' };
        localStorage.setItem('SIGNALUM_MOCK_USER', JSON.stringify(mockUser));
        window.location.reload();
        setLoading(false);
      }, 1500);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) setMessage({ text: error.message, type: 'error' });
      else {
        setMessage({ text: 'Check your email for the magic link.', type: 'success' });
        setEmail('');
      }
    } catch (err: any) {
      setMessage({ text: 'Connection failed.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (!isConfigured) {
       localStorage.removeItem('SIGNALUM_MOCK_USER');
       window.location.reload();
       return;
    }
    await supabase.auth.signOut();
    window.location.reload();
  };

  if (userEmail) {
    return (
      <div className="p-5 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between backdrop-blur-xl" style={{ borderColor: theme.colors.hexPrimary + '30' }}>
        <div className="min-w-0">
          <p className="text-[9px] uppercase font-black tracking-[0.2em] mb-1" style={{ color: theme.colors.hexPrimary }}>Authenticated Node</p>
          <p className="text-xs text-white truncate font-bold">{userEmail}</p>
        </div>
        <button 
          onClick={handleSignOut}
          className="ml-4 px-5 py-2.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSignIn} className="space-y-4">
        <div className="space-y-2">
          <label className={`text-[10px] font-black uppercase tracking-[0.2em] ml-1`} style={{ color: theme.colors.hexSecondary }}>Link Identity Node</label>
          <input 
            type="email" 
            required
            disabled={loading}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="node-identity@signalum.io" 
            className={`w-full bg-black/60 border border-white/10 rounded-2xl py-4 px-5 text-sm text-white outline-none focus:border-white/30 transition-all disabled:opacity-50`} 
            style={{ borderColor: theme.colors.hexPrimary + '20' }}
          />
        </div>
        <button 
          type="submit"
          disabled={loading}
          className={`w-full py-5 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3`}
          style={{ backgroundColor: theme.colors.hexPrimary }}
        >
          {loading ? (
             <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
          ) : 'ESTABLISH NEURAL LINK'}
        </button>
      </form>
      {message && (
        <p className={`text-[10px] font-bold text-center uppercase tracking-widest ${message.type === 'error' ? 'text-red-400' : 'text-emerald-400'} animate-fade-in`}>
          {message.text}
        </p>
      )}
      {!isConfigured && (
        <p className="text-[8px] text-slate-600 text-center uppercase tracking-[0.2em]">Demo Studio Identity Module Active</p>
      )}
    </div>
  );
};
