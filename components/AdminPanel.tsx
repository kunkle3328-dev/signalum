
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { Theme, PERSONA_REGISTRY, AudioStyle, PersonaProfile, ExpressiveVoiceProfile } from '../types';
import { DEFAULT_EXPRESSIVE_PROFILE, rewriteForSpeech } from '../utils/expressiveEngine';

interface AdminPanelProps {
  theme: Theme;
  currentUserId: string;
}

const HintIcon = ({ text }: { text: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Close hint after 3 seconds automatically to prevent clutter
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsOpen(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <div className="relative inline-flex ml-2 align-middle z-50">
      <button 
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(!isOpen); }}
        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[8px] font-mono transition-all duration-300 ${isOpen ? 'bg-white text-black border-white shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'border-white/30 text-slate-500 hover:text-white hover:border-white'}`}
      >
        i
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-40 p-3 bg-[#050505]/95 border border-white/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-[100] text-center backdrop-blur-xl pointer-events-none"
          >
            <div className="absolute inset-0 rounded-xl border border-white/5 pointer-events-none"></div>
            <p className="text-[9px] text-slate-300 leading-relaxed font-medium relative z-10">{text}</p>
            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-white/10"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ColorPicker = ({ label, value, onChange, hint }: { label: string, value: string, onChange: (val: string) => void, hint: string }) => (
  <div className="flex items-center gap-3 bg-black/30 p-2 rounded-2xl border border-white/5 pr-4 group hover:bg-black/50 transition-all">
    <div className="relative">
      <input 
        type="color" 
        value={value} 
        onChange={e => onChange(e.target.value)} 
        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
      />
      <div className="w-10 h-10 rounded-xl shadow-lg border border-white/20 flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: value }}>
         <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none"></div>
         {/* Premium Palette Icon Overlay */}
         <svg className="w-4 h-4 text-white drop-shadow-md opacity-60 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
           <path d="M19.5 13.572l-7.5 7.428l-7.5 -7.428m0 0a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />
         </svg>
      </div>
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center mb-0.5">
        <label className="text-[9px] text-slate-500 uppercase tracking-widest truncate">{label}</label>
        <HintIcon text={hint} />
      </div>
      <input 
        type="text" 
        value={value} 
        onChange={e => onChange(e.target.value)} 
        className="w-full bg-transparent text-xs text-white font-mono uppercase focus:outline-none" 
      />
    </div>
  </div>
);

export const AdminPanel: React.FC<AdminPanelProps> = ({ theme, currentUserId }) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [adminTab, setAdminTab] = useState<'users' | 'analytics' | 'tuning' | 'config' | 'themes'>('users');
  const [searchEmail, setSearchEmail] = useState('');
  const [targetUser, setTargetUser] = useState<{ id: string; email: string; referral_code: string } | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Custom Mode Creation State
  const [showAddMode, setShowAddMode] = useState(false);
  const [editingModeId, setEditingModeId] = useState<string | null>(null);
  const [newMode, setNewMode] = useState<Partial<PersonaProfile>>({
    name: '', rules: [''], category: 'CUSTOM', icon: '🧠', responseFormat: '', voiceHints: ''
  });

  // Custom Theme Creation State
  const [editingThemeId, setEditingThemeId] = useState<string | null>(null);
  const [newTheme, setNewTheme] = useState<Partial<Theme>>({
    label: 'New Theme',
    description: 'Custom studio environment'
  });

  // Detailed color inputs for theme creation
  const [themeColors, setThemeColors] = useState({
    primary: '#ffffff',
    secondary: '#9ca3af',
    accent: '#ffffff',
    background: '#000000',
    surface: '#111111',
    text: '#ffffff',
    border: '#333333'
  });

  // Advanced Theme Options
  const [themeAdvanced, setThemeAdvanced] = useState({
    glassOpacity: 90,
    glassBlur: 12,
    motionLevel: 'low' as 'none' | 'low' | 'high',
    microInteractions: true
  });

  // Voice Tuning State
  const [expressiveProfiles, setExpressiveProfiles] = useState<ExpressiveVoiceProfile[]>(() => {
    const saved = localStorage.getItem('SIGNALUM_VOICE_PROFILES');
    return saved ? JSON.parse(saved) : [DEFAULT_EXPRESSIVE_PROFILE];
  });
  const [editingProfile, setEditingProfile] = useState<ExpressiveVoiceProfile | null>(null);
  
  // Preview Sandbox state
  const [previewText, setPreviewText] = useState("Complex systems, like neural networks, are often misunderstood by the general public due to their opaque nature.");

  const [disabledModes, setDisabledModes] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('SIGNALUM_DISABLED_MODES');
    return saved ? JSON.parse(saved) : {};
  });

  const [customModes, setCustomModes] = useState<Record<string, PersonaProfile>>(() => {
    const saved = localStorage.getItem('SIGNALUM_CUSTOM_MODES');
    return saved ? JSON.parse(saved) : {};
  });

  const [customThemes, setCustomThemes] = useState<Record<string, Theme>>(() => {
    const saved = localStorage.getItem('SIGNALUM_CUSTOM_THEMES');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('SIGNALUM_DISABLED_MODES', JSON.stringify(disabledModes));
  }, [disabledModes]);

  useEffect(() => {
    localStorage.setItem('SIGNALUM_CUSTOM_MODES', JSON.stringify(customModes));
  }, [customModes]);

  useEffect(() => {
    localStorage.setItem('SIGNALUM_VOICE_PROFILES', JSON.stringify(expressiveProfiles));
  }, [expressiveProfiles]);

  useEffect(() => {
    localStorage.setItem('SIGNALUM_CUSTOM_THEMES', JSON.stringify(customThemes));
  }, [customThemes]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsUnlocked(true);
    } else {
      alert('Unauthorized access attempt logged.');
    }
  };

  const toggleMode = (id: string) => {
    setDisabledModes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const resetModeForm = () => {
    setEditingModeId(null);
    setNewMode({ name: '', rules: [''], category: 'CUSTOM', icon: '🧠', responseFormat: '', voiceHints: '' });
    setShowAddMode(false);
  };

  const handleEditMode = (mode: PersonaProfile) => {
    setEditingModeId(mode.id);
    setNewMode({
      name: mode.name,
      rules: mode.rules,
      category: mode.category,
      icon: mode.icon,
      responseFormat: mode.responseFormat,
      voiceHints: mode.voiceHints
    });
    setShowAddMode(true);
  };

  const handleSaveMode = () => {
    if (!newMode.name) return;
    const id = editingModeId || `custom-${Date.now()}`;
    const mode: PersonaProfile = {
      id,
      name: newMode.name,
      category: newMode.category || 'CUSTOM',
      rules: newMode.rules || ['Custom rules active.'],
      responseFormat: newMode.responseFormat || 'Custom response style.',
      voiceHints: newMode.voiceHints || 'Balanced.',
      icon: newMode.icon || '🧠'
    };
    setCustomModes(prev => ({ ...prev, [id]: mode }));
    resetModeForm();
    alert(editingModeId ? 'Mode Updated!' : 'Mode Created!');
  };

  const resetThemeForm = () => {
    setEditingThemeId(null);
    setNewTheme({ label: 'New Theme', description: 'Custom studio environment' });
    setThemeColors({
      primary: '#ffffff',
      secondary: '#9ca3af',
      accent: '#ffffff',
      background: '#000000',
      surface: '#111111',
      text: '#ffffff',
      border: '#333333'
    });
    setThemeAdvanced({
      glassOpacity: 90,
      glassBlur: 12,
      motionLevel: 'low',
      microInteractions: true
    });
  };

  const handleEditTheme = (t: Theme) => {
    setEditingThemeId(t.id);
    setNewTheme({
      label: t.label,
      description: t.description
    });
    setThemeColors({
      primary: t.colors.hexPrimary,
      secondary: t.colors.hexSecondary,
      accent: t.visualProfile.accent,
      background: t.visualProfile.bgMain,
      surface: t.visualProfile.bgSurface,
      text: t.visualProfile.textPrimary,
      border: t.visualProfile.borderColor || '#333333'
    });
    setThemeAdvanced({
      glassOpacity: parseFloat(t.visualProfile.glassOpacity) * 100,
      glassBlur: parseInt(t.visualProfile.glassBlur) || 12,
      motionLevel: t.visualProfile.motionLevel,
      microInteractions: t.visualProfile.microInteractions ?? true
    });
  };

  const handleSaveTheme = () => {
    if (!newTheme.label) return;
    const id = editingThemeId || `theme-${Date.now()}`;
    const themeObj: Theme = {
      id: id as any,
      label: newTheme.label,
      description: newTheme.description || 'Custom Theme',
      isPro: true,
      colors: {
        primary: 'bg-black',
        secondary: 'text-gray-400', 
        accentGlow: `${themeColors.accent}40`,
        textMain: 'text-white',
        textSecondary: 'text-gray-500',
        border: 'border-white/10',
        bgPanel: 'bg-black/50',
        hexPrimary: themeColors.primary,
        hexSecondary: themeColors.secondary,
        neonColor: themeColors.primary
      },
      visualProfile: {
        bgMain: themeColors.background,
        bgSurface: themeColors.surface,
        textPrimary: themeColors.text,
        textSecondary: themeColors.secondary,
        accent: themeColors.accent,
        borderColor: themeColors.border,
        glassOpacity: (themeAdvanced.glassOpacity / 100).toString(),
        glassBlur: `${themeAdvanced.glassBlur}px`,
        vignette: 0.5,
        grain: 0.05,
        motionLevel: themeAdvanced.motionLevel,
        microInteractions: themeAdvanced.microInteractions
      }
    };
    setCustomThemes(prev => ({ ...prev, [id]: themeObj }));
    resetThemeForm();
    alert(editingThemeId ? 'Theme Updated!' : 'Theme Created! Refresh to see in selector.');
  };

  const deleteCustomMode = (id: string) => {
    const next = { ...customModes };
    delete next[id];
    setCustomModes(next);
  };

  const deleteCustomTheme = (id: string) => {
    if (editingThemeId === id) resetThemeForm();
    const next = { ...customThemes };
    delete next[id];
    setCustomThemes(next);
  };

  const handleSaveProfile = () => {
    if (!editingProfile) return;
    const updated = { ...editingProfile, lastUpdated: Date.now(), version: editingProfile.version + 1 };
    setExpressiveProfiles(prev => {
      const idx = prev.findIndex(p => p.id === updated.id);
      if (idx >= 0) {
        const newArr = [...prev];
        newArr[idx] = updated;
        return newArr;
      }
      return [...prev, updated];
    });
    setEditingProfile(null);
  };

  const handleCreateProfile = () => {
    const newProfile: ExpressiveVoiceProfile = {
      ...DEFAULT_EXPRESSIVE_PROFILE,
      id: `evp-${Date.now()}`,
      name: 'New Expressive Profile',
      scope: 'user_specific',
      isActive: false
    };
    setEditingProfile(newProfile);
  };

  const handleDeleteProfile = (id: string) => {
    if (confirm('Delete this expressive voice profile? This cannot be undone.')) {
      setExpressiveProfiles(prev => prev.filter(p => p.id !== id));
      if (editingProfile?.id === id) setEditingProfile(null);
    }
  };

  const handleActivateProfile = (id: string) => {
    setExpressiveProfiles(prev => prev.map(p => ({
      ...p,
      isActive: p.id === id 
    })));
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
            className="w-full h-14 input-pop rounded-2xl px-6 text-sm text-white outline-none transition-all text-center" 
          />
          <button type="submit" className={`w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] transition-all shadow-lg active:scale-95 ${theme.id === 'focus_black' ? 'bg-white text-black' : 'bg-blue-600 text-white'}`}>Request Entry</button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex bg-black/40 rounded-xl p-1 border border-white/5 mb-4 shadow-inner overflow-x-auto">
        {(['users', 'analytics', 'tuning', 'config', 'themes'] as const).map(tab => (
          <button 
            key={tab}
            onClick={() => setAdminTab(tab)}
            className={`flex-1 min-w-[80px] py-2.5 text-[8px] font-black uppercase tracking-widest rounded-lg transition-all ${adminTab === tab ? 'bg-white/10 text-white shadow-md' : 'text-slate-600 hover:text-slate-400'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {adminTab === 'tuning' && (
        <section className="space-y-6 animate-fade-in">
          {!editingProfile ? (
            <>
              <div className="flex justify-between items-center px-1">
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Expressive Voice Profiles</h3>
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-1">Configure the provider-agnostic engine.</p>
                </div>
                <button onClick={handleCreateProfile} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 ${theme.id === 'focus_black' ? 'bg-white text-black' : 'bg-blue-600 text-white'}`}>Create Profile</button>
              </div>
              
              <div className="space-y-3">
                {expressiveProfiles.map(profile => (
                  <div key={profile.id} className={`p-5 rounded-2xl border transition-all ${profile.isActive ? 'bg-emerald-900/10 border-emerald-500/30' : 'bg-white/5 border-white/10'}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{profile.name}</h4>
                          {profile.isActive && <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded uppercase font-black tracking-wider">Active</span>}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">{profile.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingProfile(profile)} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">✎</button>
                        <button onClick={() => handleDeleteProfile(profile.id)} className="p-2 hover:bg-red-500/20 rounded-lg text-slate-600 hover:text-red-400 transition-colors">✕</button>
                      </div>
                    </div>
                    
                    <div className="flex gap-4 border-t border-white/5 pt-3">
                      <button 
                         onClick={() => handleActivateProfile(profile.id)}
                         disabled={profile.isActive}
                         className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${profile.isActive ? 'opacity-50 cursor-default' : 'hover:bg-white/10 text-slate-400 hover:text-white'}`}
                      >
                        {profile.isActive ? 'Deployed' : 'Deploy Profile'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                 <button onClick={() => setEditingProfile(null)} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white">← Back</button>
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Editing: {editingProfile.name}</span>
              </div>
              
              <div className="grid gap-6">
                 <div className="space-y-3">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Profile Identity</label>
                    <input type="text" value={editingProfile.name} onChange={e => setEditingProfile({...editingProfile, name: e.target.value})} className="w-full input-pop rounded-xl p-3 text-xs text-white" placeholder="Profile Name" />
                    <input type="text" value={editingProfile.description} onChange={e => setEditingProfile({...editingProfile, description: e.target.value})} className="w-full input-pop rounded-xl p-3 text-xs text-white" placeholder="Description" />
                 </div>

                 <div className="space-y-6 bg-white/5 p-5 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-center mb-4">
                       <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400">Core Delivery Engine</h4>
                       <div className="flex items-center gap-2">
                         <span className="text-[9px] uppercase font-black text-slate-500">Speaker Boost</span>
                         <button onClick={() => setEditingProfile({...editingProfile, speakerBoost: !editingProfile.speakerBoost})} className={`w-10 h-5 rounded-full relative transition-all ${editingProfile.speakerBoost ? 'bg-emerald-500' : 'bg-slate-800'}`}>
                           <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${editingProfile.speakerBoost ? 'translate-x-6' : 'translate-x-1'}`} />
                         </button>
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <RangeControl label="Pace (Speed)" value={editingProfile.pace} onChange={v => setEditingProfile({...editingProfile, pace: v})} minLabel="Deliberate" maxLabel="Rapid" theme={theme} hint="Overall speaking rate." />
                      <RangeControl label="Pause Frequency" value={editingProfile.pauseFrequency} onChange={v => setEditingProfile({...editingProfile, pauseFrequency: v})} minLabel="Flowing" maxLabel="Thoughtful" theme={theme} hint="Density of micro-pauses for effect." />
                      <RangeControl label="Emphasis" value={editingProfile.emphasis} onChange={v => setEditingProfile({...editingProfile, emphasis: v})} minLabel="Flat" maxLabel="Dynamic" theme={theme} hint="Vocal stress on key terms." />
                      <RangeControl label="Warmth" value={editingProfile.warmth} onChange={v => setEditingProfile({...editingProfile, warmth: v})} minLabel="Neutral" maxLabel="Empathetic" theme={theme} hint="Softness and conversational lead-ins." />
                      <RangeControl label="Clarity" value={editingProfile.clarity} onChange={v => setEditingProfile({...editingProfile, clarity: v})} minLabel="Raw" maxLabel="Structured" theme={theme} hint="Sentence simplification strength." />
                      <RangeControl label="Teaching Bias" value={editingProfile.teachingBias} onChange={v => setEditingProfile({...editingProfile, teachingBias: v})} minLabel="None" maxLabel="Instructional" theme={theme} hint="Structure responses for learning." />
                      <RangeControl label="Stability" value={editingProfile.stability} onChange={v => setEditingProfile({...editingProfile, stability: v})} minLabel="Varied" maxLabel="Consistent" theme={theme} hint="Output consistency control." />
                      <RangeControl label="Expressiveness" value={editingProfile.expressiveness} onChange={v => setEditingProfile({...editingProfile, expressiveness: v})} minLabel="Calm" maxLabel="Animated" theme={theme} hint="Emotional range." />
                    </div>
                 </div>

                 {/* Preview Sandbox */}
                 <div className="p-5 bg-black/30 rounded-2xl border border-white/5 space-y-3">
                   <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400">Deterministic Engine Preview</h4>
                   <textarea 
                     value={previewText}
                     onChange={(e) => setPreviewText(e.target.value)}
                     className="w-full h-20 bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-slate-300 font-mono"
                   />
                   <div className="p-4 bg-emerald-900/10 border border-emerald-500/20 rounded-xl">
                      <p className="text-[8px] uppercase tracking-widest text-emerald-500 mb-2">Spoken Output Rewrite</p>
                      <p className="text-xs text-emerald-100 leading-relaxed whitespace-pre-wrap">
                        {rewriteForSpeech(previewText, editingProfile)}
                      </p>
                   </div>
                 </div>

                 <button onClick={handleSaveProfile} className={`w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] shadow-lg active:scale-95 ${theme.id === 'focus_black' ? 'bg-white text-black' : 'bg-emerald-600 text-white'}`}>Save Profile</button>
              </div>
            </div>
          )}
        </section>
      )}

      {adminTab === 'themes' && (
        <section className="space-y-6 animate-fade-in">
          <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem] space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">
                {editingThemeId ? `Editing: ${newTheme.label}` : 'Theme Studio'}
              </h3>
              {editingThemeId && (
                <button onClick={resetThemeForm} className="text-[9px] font-bold text-slate-500 hover:text-white uppercase tracking-widest">
                  Cancel Edit
                </button>
              )}
            </div>
            
            <input type="text" placeholder="Theme Label..." value={newTheme.label} onChange={e => setNewTheme({...newTheme, label: e.target.value})} className="w-full input-pop rounded-xl py-3 px-4 text-xs text-white" />
            
            <div className="space-y-6">
              <div>
                <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3 border-b border-white/5 pb-2">Chromatic Palette</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ColorPicker label="Primary Color" hint="Active states, buttons, and key interactive elements." value={themeColors.primary} onChange={v => setThemeColors({...themeColors, primary: v})} />
                  <ColorPicker label="Secondary Color" hint="Supporting accents, gradients, and decorative elements." value={themeColors.secondary} onChange={v => setThemeColors({...themeColors, secondary: v})} />
                  <ColorPicker label="Accent Color" hint="High-visibility glows and neon effects." value={themeColors.accent} onChange={v => setThemeColors({...themeColors, accent: v})} />
                  <ColorPicker label="App Background" hint="The main canvas color behind all elements." value={themeColors.background} onChange={v => setThemeColors({...themeColors, background: v})} />
                  <ColorPicker label="Surface (Cards)" hint="Background for cards, panels, and menus." value={themeColors.surface} onChange={v => setThemeColors({...themeColors, surface: v})} />
                  <ColorPicker label="Text Color" hint="Main content legibility color." value={themeColors.text} onChange={v => setThemeColors({...themeColors, text: v})} />
                  <ColorPicker label="Border Color" hint="Structural definition for UI components." value={themeColors.border} onChange={v => setThemeColors({...themeColors, border: v})} />
                </div>
              </div>

              <div>
                <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3 border-b border-white/5 pb-2">Material Physics</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-black/20 p-4 rounded-2xl">
                   <RangeControl label="Frosted Glass Opacity" hint="Transparency level of glass panels (0% to 100%)." value={themeAdvanced.glassOpacity} onChange={v => setThemeAdvanced({...themeAdvanced, glassOpacity: v})} minLabel="Transparent" maxLabel="Opaque" theme={theme} />
                   <RangeControl label="Frosted Glass Blur" hint="Strength of the background blur effect behind glass." value={themeAdvanced.glassBlur} onChange={v => setThemeAdvanced({...themeAdvanced, glassBlur: v})} minLabel="Clear" maxLabel="Deep Blur" theme={theme} />
                </div>
              </div>

              <div>
                <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3 border-b border-white/5 pb-2">Motion Dynamics</h4>
                <div className="flex flex-col gap-4">
                   <div className="flex items-center justify-between p-3 bg-black/20 rounded-xl">
                      <div className="flex items-center">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Background Motion</span>
                        <HintIcon text="Intensity of ambient background animations." />
                      </div>
                      <div className="flex gap-2">
                        {['none', 'low', 'high'].map((lvl: any) => (
                          <button 
                            key={lvl}
                            onClick={() => setThemeAdvanced({...themeAdvanced, motionLevel: lvl})}
                            className={`px-3 py-1.5 rounded-lg text-[8px] font-bold uppercase tracking-wider transition-all ${themeAdvanced.motionLevel === lvl ? 'bg-white text-black' : 'bg-white/5 text-slate-500 hover:text-white'}`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                   </div>
                   <div className="flex items-center justify-between p-3 bg-black/20 rounded-xl">
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Micro-Animations</span>
                          <HintIcon text="Enable subtle reactive movements on hover and click." />
                        </div>
                        <span className="text-[8px] text-slate-600 mt-0.5">Interactive hover effects</span>
                      </div>
                      <button 
                        onClick={() => setThemeAdvanced({...themeAdvanced, microInteractions: !themeAdvanced.microInteractions})}
                        className={`w-10 h-5 rounded-full relative transition-all ${themeAdvanced.microInteractions ? 'bg-emerald-500' : 'bg-slate-800'}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${themeAdvanced.microInteractions ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                   </div>
                </div>
              </div>
            </div>

            <button onClick={handleSaveTheme} className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest ${theme.id === 'focus_black' ? 'bg-white text-black' : 'bg-purple-600 text-white'}`}>
              {editingThemeId ? 'Update Theme' : 'Build & Save Theme'}
            </button>
          </div>

          <div className="space-y-2">
            <p className="text-[9px] text-slate-500 uppercase tracking-widest">Custom Themes</p>
            {(Object.values(customThemes) as Theme[]).map(t => (
              <div key={t.id} className={`flex items-center justify-between p-4 border rounded-2xl transition-all ${editingThemeId === t.id ? 'bg-white/10 border-white/30' : 'bg-white/5 border-white/10'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full" style={{ backgroundColor: t.colors.hexPrimary }}></div>
                  <span className="text-xs font-bold text-white">{t.label}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEditTheme(t)} className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:text-white hover:bg-blue-500/20 text-[10px] font-bold uppercase tracking-wider transition-all">Edit</button>
                  <button onClick={() => deleteCustomTheme(t.id)} className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 hover:text-white hover:bg-red-500/20 text-[10px] font-bold uppercase tracking-wider transition-all">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {adminTab === 'users' && (
        <section className="space-y-4">
          <div className="flex gap-2">
            <input type="email" placeholder="Scan designation..." value={searchEmail} onChange={(e) => setSearchEmail(e.target.value)} className="flex-1 input-pop rounded-xl py-3.5 px-5 text-xs text-white outline-none" />
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
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{editingModeId ? 'Editing Mode' : 'Create Mode'}</span>
                {editingModeId && <button onClick={resetModeForm} className="text-[8px] text-slate-500 hover:text-white uppercase tracking-widest">Cancel</button>}
              </div>
              <input type="text" placeholder="Mode Name..." value={newMode.name} onChange={e => setNewMode({...newMode, name: e.target.value})} className="w-full input-pop rounded-xl py-3 px-4 text-xs text-white" />
              <input type="text" placeholder="Icon (Emoji)..." value={newMode.icon} onChange={e => setNewMode({...newMode, icon: e.target.value})} className="w-full input-pop rounded-xl py-3 px-4 text-xs text-white" />
              <textarea placeholder="Primary Rules (comma separated)..." value={newMode.rules?.[0]} onChange={e => setNewMode({...newMode, rules: [e.target.value]})} className="w-full input-pop rounded-xl py-3 px-4 text-xs text-white min-h-[80px]" />
              <div className="grid grid-cols-2 gap-4">
                 <input type="text" placeholder="Voice Hints (e.g. Calm)" value={newMode.voiceHints} onChange={e => setNewMode({...newMode, voiceHints: e.target.value})} className="w-full input-pop rounded-xl py-3 px-4 text-xs text-white" />
                 <input type="text" placeholder="Category" value={newMode.category} onChange={e => setNewMode({...newMode, category: e.target.value as any})} className="w-full input-pop rounded-xl py-3 px-4 text-xs text-white" />
              </div>
              <button onClick={handleSaveMode} className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest ${theme.id === 'focus_black' ? 'bg-emerald-400 text-black' : 'bg-emerald-600 text-white'}`}>{editingModeId ? 'Update Mode' : 'Publish Mode'}</button>
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
                    <button onClick={() => handleEditMode(p)} className="p-2 text-slate-500 hover:text-white transition-colors">✎</button>
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

const RangeControl = ({ label, value, onChange, minLabel, maxLabel, theme, hint }: any) => (
  <div className="space-y-3">
    <div className="flex justify-between items-end">
       <div className="flex items-center">
          <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</label>
          {hint && <HintIcon text={hint} />}
       </div>
       <span className="text-[10px] font-mono text-white">{value}%</span>
    </div>
    <input 
      type="range" 
      min="0" max="100" 
      value={value} 
      onChange={e => onChange(parseInt(e.target.value))}
      className="w-full h-1.5 bg-black/40 rounded-full appearance-none cursor-pointer accent-current hover:brightness-125 transition-all"
      style={{ color: theme.colors.hexPrimary }} 
    />
    <div className="flex justify-between text-[8px] uppercase tracking-wider text-slate-600 font-bold">
      <span>{minLabel}</span>
      <span>{maxLabel}</span>
    </div>
  </div>
);
