
import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { Theme, PERSONA_REGISTRY, AudioStyle, PersonaProfile } from '../types';

interface AdminPanelProps {
  theme: Theme;
  currentUserId: string;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ theme, currentUserId }) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [adminTab, setAdminTab] = useState<'users' | 'analytics' | 'oversight' | 'config'>('users');
  const [searchEmail, setSearchEmail] = useState('');
  const [targetUser, setTargetUser] = useState<{ id: string; email: string; referral_code: string } | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Custom Mode Creation State
  const [showAddMode, setShowAddMode] = useState(false);
  const [newMode, setNewMode] = useState<Partial<PersonaProfile>>({
    name: '', rules: [''], category: 'CUSTOM', icon: '🧠', responseFormat: '', voiceHints: ''
  });

  const [disabledModes, setDisabledModes] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('SIGNALUM_DISABLED_MODES');
    return saved ? JSON.parse(saved) : {};
  });

  const [customModes, setCustomModes] = useState<Record<string, PersonaProfile>>(() => {
    const saved = localStorage.getItem('SIGNALUM_CUSTOM_MODES');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('SIGNALUM_DISABLED_MODES', JSON.stringify(disabledModes));
  }, [disabledModes]);

  useEffect(() => {
    localStorage.setItem('SIGNALUM_CUSTOM_MODES', JSON.stringify(customModes));
  }, [customModes]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsUnlocked(true);
    } else {
      alert('Unauthorized access attempt logged.');
    }
  };

  const toggleMode = (id: string) => {
    setDisabledModes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleAddMode = () => {
    if (!newMode.name) return;
    const id = `custom-${Date.now()}`;
    const mode: PersonaProfile = {
      id,
      name: newMode.name,
      category: 'CUSTOM',
      rules: newMode.rules || ['Custom rules active.'],
      responseFormat: newMode.responseFormat || 'Custom response style.',
      voiceHints: newMode.voiceHints || 'Balanced.',
      icon: newMode.icon || '🧠'
    };
    setCustomModes(prev => ({ ...prev, [id]: mode }));
    setShowAddMode(false);
    setNewMode({ name: '', rules: [''], category: 'CUSTOM', icon: '🧠' });
  };

  const deleteCustomMode = (id: string) => {
    const next = { ...customModes };
    delete next[id];
    setCustomModes(next);
  };

  const fetchUserData = async () => {
    if (!searchEmail) return;
    setLoading(true);
    setTimeout(() => {
      setTargetUser({ id: 'demo-node-942', email: searchEmail.trim(), referral_code: 'SIG-DEMO-22' });
      setLoading(false);
    }, 800);
  };

  if (!isUnlocked) {
    return (
      <div className="space-y-6 animate-fade-in py-10 flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-2xl mb-4">🔐</div>
        <h3 className="text-sm font-black uppercase tracking-[0.4em] text-white">Admin Lock</h3>
        <p className="text-[10px] text-slate-500 text-center uppercase tracking-[0.2em] max-w-xs mb-6">Enter authorized credentials to gain studio oversight.</p>
        <form onSubmit={handleUnlock} className="w-full space-y-4">
          <input 
            type="password" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Studio Password..." 
            className="w-full h-14 bg-black/60 border border-white/10 rounded-2xl px-6 text-sm text-white outline-none focus:border-white/30 transition-all shadow-inner text-center" 
          />
          <button type="submit" className={`w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] transition-all shadow-lg active:scale-95 ${theme.id === 'focus_black' ? 'bg-white text-black' : 'bg-blue-600 text-white'}`}>Request Entry</button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex bg-black/40 rounded-xl p-1 border border-white/5 mb-4 shadow-inner">
        {(['users', 'analytics', 'oversight', 'config'] as const).map(tab => (
          <button 
            key={tab}
            onClick={() => setAdminTab(tab)}
            className={`flex-1 py-2.5 text-[8px] font-black uppercase tracking-widest rounded-lg transition-all ${adminTab === tab ? 'bg-white/10 text-white shadow-md' : 'text-slate-600 hover:text-slate-400'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {adminTab === 'users' && (
        <section className="space-y-4">
          <div className="flex gap-2">
            <input type="email" placeholder="Scan designation..." value={searchEmail} onChange={(e) => setSearchEmail(e.target.value)} className="flex-1 bg-black/40 border border-white/10 rounded-xl py-3.5 px-5 text-xs text-white outline-none focus:border-white/20" />
            <button onClick={fetchUserData} className={`px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 ${theme.id === 'focus_black' ? 'bg-white text-black' : 'bg-blue-700 text-white'}`}>Scan</button>
          </div>
          {targetUser && (
            <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem] animate-fade-in-up flex justify-between items-center">
              <div>
                <p className="text-[10px] text-slate-600 uppercase font-black mb-1">Authenticated Hub</p>
                <p className="text-sm text-white font-bold">{targetUser.email}</p>
              </div>
              <button className="px-4 py-2 bg-red-600/10 border border-red-500/20 text-red-500 rounded-xl text-[9px] font-black uppercase hover:bg-red-600/20 transition-all">Revoke</button>
            </div>
          )}
        </section>
      )}

      {adminTab === 'config' && (
        <div className="space-y-5 animate-fade-in">
          <div className="flex justify-between items-center px-1">
            <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Neural Mode Oversight</p>
            <button onClick={() => setShowAddMode(!showAddMode)} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 ${theme.id === 'focus_black' ? 'bg-white text-black' : 'bg-blue-600 text-white'}`}>
              {showAddMode ? 'Close Form' : 'New Mode'}
            </button>
          </div>

          {showAddMode && (
            <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4 animate-fade-in">
              <input type="text" placeholder="Mode Name..." value={newMode.name} onChange={e => setNewMode({...newMode, name: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs text-white" />
              <input type="text" placeholder="Icon (Emoji)..." value={newMode.icon} onChange={e => setNewMode({...newMode, icon: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs text-white" />
              <textarea placeholder="Primary Rules (comma separated)..." value={newMode.rules?.[0]} onChange={e => setNewMode({...newMode, rules: [e.target.value]})} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs text-white min-h-[80px]" />
              <button onClick={handleAddMode} className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest ${theme.id === 'focus_black' ? 'bg-emerald-400 text-black' : 'bg-emerald-600 text-white'}`}>Publish Mode</button>
            </div>
          )}

          <div className="space-y-2 max-h-[420px] overflow-y-auto custom-scrollbar pr-2">
            {[...Object.values(PERSONA_REGISTRY), ...Object.values(customModes)].map((p: PersonaProfile) => {
              const isActuallyDisabled = disabledModes[p.id];
              const isCustom = p.id.startsWith('custom-');
              return (
                <div key={p.id} className="flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-3xl transition-all hover:bg-white/[0.02] shadow-inner">
                  <div className="flex items-center gap-4">
                    <span className={`text-2xl transition-opacity ${isActuallyDisabled ? 'opacity-20' : 'opacity-100'}`}>{p.icon}</span>
                    <div>
                      <p className={`text-xs font-black transition-colors ${isActuallyDisabled ? 'text-slate-700' : 'text-white'}`}>{p.name}</p>
                      <p className="text-[9px] text-slate-700 uppercase tracking-widest mt-0.5">{p.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {isCustom && (
                      <button onClick={() => deleteCustomMode(p.id)} className="p-2 text-red-500 hover:text-red-400 transition-colors">✕</button>
                    )}
                    <button 
                      onClick={() => toggleMode(p.id)}
                      className={`w-14 h-7 rounded-full relative transition-all duration-500 shadow-inner ${!isActuallyDisabled ? 'bg-emerald-600' : 'bg-slate-900 border border-white/5'}`}
                    >
                      <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-xl ${!isActuallyDisabled ? 'translate-x-8' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const AnalyticsCard = ({ label, value, icon }: any) => (
  <div className="p-6 bg-white/5 border border-white/10 rounded-3xl shadow-2xl hover:bg-white/[0.08] transition-all group">
    <div className="text-3xl mb-4 transition-transform group-hover:scale-110 drop-shadow-lg">{icon}</div>
    <p className="text-2xl font-black text-white tracking-tight">{value}</p>
    <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest mt-1.5">{label}</p>
  </div>
);
