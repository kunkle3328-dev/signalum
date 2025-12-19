
import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { Theme, UserGrant } from '../types';

interface AdminPanelProps {
  theme: Theme;
  currentUserId: string;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ theme, currentUserId }) => {
  const [searchEmail, setSearchEmail] = useState('');
  const [targetUser, setTargetUser] = useState<{ id: string; email: string } | null>(null);
  const [grants, setGrants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  if (!isSupabaseConfigured()) {
    return (
      <div className="p-6 bg-red-950/20 border border-red-500/20 rounded-2xl text-center">
        <p className="text-xs font-bold text-red-400 uppercase tracking-widest">Admin Console Offline</p>
        <p className="text-[10px] text-red-300 mt-2">Database connection required for studio administration.</p>
      </div>
    );
  }

  const fetchUserData = async () => {
    if (!searchEmail) return;
    setLoading(true);
    try {
      const { data: profile, error: pError } = await supabase
        .from('user_profiles')
        .select('user_id, email')
        .ilike('email', searchEmail.trim())
        .single();

      if (pError || !profile) throw new Error('User not found in Signalum records.');

      setTargetUser({ id: profile.user_id, email: profile.email });

      const { data: gData, error: gError } = await supabase
        .from('user_grants')
        .select('*')
        .eq('user_id', profile.user_id)
        .order('created_at', { ascending: false });

      if (gError) throw gError;
      setGrants(gData || []);
    } catch (err: any) {
      alert(err.message);
      setTargetUser(null);
    } finally {
      setLoading(false);
    }
  };

  const grantAccess = async (type: 'lifetime_pro' | 'pro_30d' | 'founders') => {
    if (!targetUser) return;
    setActionLoading(true);
    try {
      const expires_at = type === 'pro_30d' 
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() 
        : null;

      const { error } = await supabase.from('user_grants').insert({
        user_id: targetUser.id,
        grant_type: type,
        expires_at,
        created_by: currentUserId,
        note: 'Granted via Admin Studio Console'
      });

      if (error) throw error;
      fetchUserData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const revokeGrant = async (id: string) => {
    if (!window.confirm('Revoke this grant immediately?')) return;
    try {
      const { error } = await supabase
        .from('user_grants')
        .update({ revoked_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      fetchUserData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <section className="space-y-4">
        <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest">Studio Authority Control</h3>
        <div className="flex gap-2">
          <input 
            type="email" 
            placeholder="Search user email..." 
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            className="flex-1 bg-black/40 border border-red-500/20 rounded-xl py-3 px-4 text-xs text-white outline-none"
          />
          <button 
            onClick={fetchUserData}
            disabled={loading}
            className="px-6 bg-red-600 hover:bg-red-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest"
          >
            Lookup
          </button>
        </div>
      </section>

      {targetUser && (
        <section className="space-y-6 p-6 bg-white/5 border border-white/10 rounded-[2rem]">
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Target Node</p>
            <p className="text-sm text-white font-bold">{targetUser.email}</p>
          </div>

          <div className="grid grid-cols-1 gap-2">
             <button onClick={() => grantAccess('lifetime_pro')} disabled={actionLoading} className="w-full py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-500/20">Grant Lifetime Pro</button>
             <button onClick={() => grantAccess('pro_30d')} disabled={actionLoading} className="w-full py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-500/20">Grant 30D Trial</button>
             <button onClick={() => grantAccess('founders')} disabled={actionLoading} className="w-full py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-500/20">Grant Founder Badge</button>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest border-b border-white/5 pb-2">Active Grants History</p>
            {grants.length === 0 ? (
               <p className="text-[10px] text-slate-600 italic">No historical grants found.</p>
            ) : (
               <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                 {grants.map(g => (
                   <div key={g.id} className="p-3 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between">
                     <div>
                       <p className="text-[10px] font-bold text-white uppercase tracking-widest">{g.grant_type.replace('_', ' ')}</p>
                       <p className="text-[8px] text-slate-500">Issued: {new Date(g.created_at).toLocaleDateString()}</p>
                       {g.revoked_at && <p className="text-[8px] text-red-500 uppercase font-bold">REVOKED</p>}
                     </div>
                     {!g.revoked_at && (
                       <button onClick={() => revokeGrant(g.id)} className="text-[8px] text-red-400 font-bold uppercase hover:text-red-300">Revoke</button>
                     )}
                   </div>
                 ))}
               </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};
