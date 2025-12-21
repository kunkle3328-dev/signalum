
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Source, AudioStyle, Theme, UserPlan, PersonaProfile, TrialState, BRAND_NAME, UserProfile, UsageStatus, PersonalityTraits, NeonIntensity, PromptVersion, PERSONA_REGISTRY } from '../types';
import { MilestoneBadge } from './MilestoneBadge';
import { InviteFriendsCard } from './InviteFriendsCard';
import { AuthUI } from './AuthUI';
import { AdminPanel } from './AdminPanel';

interface SourcesPanelProps {
  sources: Source[];
  onAddSource: (source: Source) => void;
  onRemoveSource: (id: string) => void;
  onToggleSource: (id: string) => void;
  disabled: boolean;
  isOpen: boolean;
  onClose: () => void;
  selectedStyle: AudioStyle;
  onStyleChange: (style: AudioStyle) => void;
  userName: string;
  onUserNameChange: (name: string) => void;
  isRevenueMode: boolean;
  onRevenueModeChange: (enabled: boolean) => void;
  theme: Theme;
  userPlan: UserPlan;
  onUpgrade: () => void;
  onStartTrial: () => void;
  trial: TrialState;
  onBulkDiscover: (topic: string, limit: number) => void;
  personaRegistry: Record<AudioStyle, PersonaProfile>;
  onboardingStep: number;
  onRerunOnboarding?: () => void;
  profile: UserProfile;
  showToast: (msg: string) => void;
  currentUser: any;
  usage?: UsageStatus | null;
  isResearchingGlobal: boolean;
  discoveryInbox: Source[];
  onImportSelected: (ids: string[]) => void;
  onClearDiscovery: () => void;
  voiceName: string;
  onVoiceNameChange: (val: string) => void;
  personality: PersonalityTraits;
  onPersonalityChange: (val: PersonalityTraits) => void;
  onUpdateSettings: (settings: any) => void;
  promptVersions: PromptVersion[];
  onRollback: (version: PromptVersion) => void;
  onOpenWizard?: () => void;
}

const VOICES = ['Zephyr', 'Puck', 'Charon', 'Kore', 'Fenrir'];

export const SourcesPanel: React.FC<SourcesPanelProps> = ({ 
  sources, onAddSource, onRemoveSource, onToggleSource, disabled, isOpen, onClose, selectedStyle, onStyleChange, userName, onUserNameChange, isRevenueMode, onRevenueModeChange, theme, userPlan, onUpgrade, onStartTrial, trial, onBulkDiscover, personaRegistry, onboardingStep, onRerunOnboarding, profile, showToast, currentUser, usage, isResearchingGlobal, discoveryInbox, onImportSelected, onClearDiscovery, voiceName, onVoiceNameChange, personality, onPersonalityChange, onUpdateSettings, promptVersions, onRollback, onOpenWizard
}) => {
  const [activeTab, setActiveTab] = useState<'sources' | 'history' | 'settings' | 'account' | 'admin'>('sources');
  const [activeCategory, setActiveCategory] = useState<'ENTERPRISE' | 'MONEY' | 'CONTENT' | 'LEARN' | 'CUSTOM'>('ENTERPRISE');
  const [inputMode, setInputMode] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTopic, setSearchTopic] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const personas = useMemo(() => {
    const disabledModes = JSON.parse(localStorage.getItem('SIGNALUM_DISABLED_MODES') || '{}') as Record<string, boolean>;
    const customModes = JSON.parse(localStorage.getItem('SIGNALUM_CUSTOM_MODES') || '{}') as Record<string, PersonaProfile>;
    
    const allPersonas = { ...personaRegistry, ...customModes };
    
    return (Object.values(allPersonas) as PersonaProfile[]).filter(p => p.category === activeCategory && !disabledModes[p.id]);
  }, [personaRegistry, activeCategory, isOpen]);

  const handleSourceClick = (type: string) => {
    if (type === 'pdf') {
      if (fileInputRef.current) { 
        fileInputRef.current.accept = '.pdf'; 
        fileInputRef.current.click(); 
      }
    } else { 
      setInputMode(type); 
      setInputValue(''); 
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    showToast(`Ingesting node ${file.name}...`);
    setTimeout(() => {
      onAddSource({ id: crypto.randomUUID(), title: file.name, content: "Neural document sync complete.", type: 'pdf' });
      setIsProcessing(false);
      showToast("PDF Synchronized.");
    }, 1200);
  };

  const handleSubmitInput = async () => {
    if (!inputValue.trim()) return;
    onAddSource({ id: crypto.randomUUID(), title: inputValue.split('\n')[0].substring(0, 30), content: inputValue, type: 'paste' });
    setInputMode(null);
    setInputValue('');
    showToast("Context Node Established.");
  };

  const handlePersonalityUpdate = (key: keyof PersonalityTraits, val: any) => {
    onPersonalityChange({ ...personality, [key]: val });
  };

  return (
    <>
      <div className={`fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] md:hidden transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
      <div className={`fixed inset-y-0 left-0 w-full md:w-[450px] ${theme.colors.bgPanel} border-r border-white/5 z-[110] transform transition-transform duration-500 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 flex flex-col h-screen shadow-[0_0_80px_rgba(0,0,0,0.8)]`}>
        
        <div className="shrink-0 z-20 border-b border-white/5 bg-black/20 backdrop-blur-3xl p-7">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" style={{ color: theme.colors.hexPrimary }}>
                    <path d="M12 3L4 7L12 11L20 7L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M4 12L12 16L20 12M4 17L12 21L20 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-black text-white font-display uppercase tracking-[0.25em] mb-1">SIGNALUM</h1>
                  <p className="text-[8px] text-slate-500 font-black uppercase tracking-[0.4em]">ENTERPRISE STUDIO</p>
                </div>
              </div>
              <button onClick={onClose} className="md:hidden p-3 text-white/20 hover:text-white bg-white/5 rounded-full transition-all active:scale-90">✕</button>
            </div>
            
            <div className="flex bg-black/40 rounded-2xl p-1 border border-white/5">
              {['sources', 'history', 'settings', 'account', 'admin'].filter(tab => tab !== 'admin' || profile.entitlements.is_admin).map((tab: any) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-3 text-[8px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === tab ? `bg-white/10 text-white` : 'text-slate-600 hover:text-slate-400'}`} style={{ color: activeTab === tab ? theme.colors.hexPrimary : undefined }}>{tab}</button>
              ))}
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-7 space-y-10 custom-scrollbar text-gray-200">
          
          {activeTab === 'sources' && (
            <>
              <section className="space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: theme.colors.hexSecondary }}>Intelligence Role</h3>
                <div className="flex bg-black/40 rounded-2xl p-1 border border-white/5">
                  {(['ENTERPRISE', 'MONEY', 'CONTENT', 'LEARN', 'CUSTOM'] as const).map(cat => (
                    <button key={cat} onClick={() => setActiveCategory(cat)} className={`flex-1 py-3 text-[8px] font-black uppercase tracking-widest rounded-xl transition-all ${activeCategory === cat ? 'text-white bg-white/10' : 'text-slate-600 hover:text-slate-400'}`} style={{ color: activeCategory === cat ? theme.colors.hexPrimary : undefined }}>{cat}</button>
                  ))}
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {personas.map(style => (
                    <button key={style.id} onClick={() => !disabled && onStyleChange(style.id)} className={`relative flex items-center gap-5 p-5 rounded-[1.5rem] border text-left transition-all ${selectedStyle === style.id ? `bg-white/5 border-white/20 shadow-xl` : `bg-black/30 border-white/5 hover:bg-white/5`}`} style={{ borderColor: selectedStyle === style.id ? theme.colors.hexPrimary + '50' : undefined }}>
                      <div className={`text-2xl transition-transform ${selectedStyle === style.id ? 'scale-110' : 'opacity-40'}`}>{style.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-black ${selectedStyle === style.id ? 'text-white' : 'text-slate-500'}`}>{style.name}</div>
                        <div className="text-[9px] text-slate-600 uppercase font-black tracking-widest truncate mt-1">{personaRegistry[style.id]?.rules[0] || style.rules[0]}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: theme.colors.hexSecondary }}>Intelligence Scan</h3>
                <div className="relative h-14">
                  <input 
                    type="text" 
                    value={searchTopic} 
                    onChange={(e) => setSearchTopic(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' && onBulkDiscover(searchTopic, 10)} 
                    placeholder="Search topic to synthesize..." 
                    className="w-full h-full bg-black/50 border border-white/10 rounded-2xl px-6 pr-14 text-sm text-white placeholder-slate-800 outline-none focus:border-white/20 transition-all shadow-inner" 
                  />
                  <button onClick={() => onBulkDiscover(searchTopic, 10)} disabled={isResearchingGlobal || !searchTopic.trim()} className="absolute right-2 top-2 h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:text-white transition-all disabled:opacity-30">
                    {isResearchingGlobal ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>}
                  </button>
                </div>
              </section>

              <section className="space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: theme.colors.hexSecondary }}>Context Nodes</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'web', label: 'Web Sync', icon: '🔗' },
                    { id: 'pdf', label: 'PDF Sync', icon: '📄' },
                    { id: 'paste', label: 'Paste Sync', icon: '📝' },
                    { id: 'youtube', label: 'Video Sync', icon: '📺' }
                  ].map(type => (
                    <button key={type.id} onClick={() => handleSourceClick(type.id)} disabled={disabled || isProcessing} className="flex flex-col items-center justify-center p-8 rounded-[1.75rem] bg-black/50 border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all group active:scale-95 shadow-lg">
                       <span className="text-4xl mb-4 group-hover:scale-110 transition-all">{type.icon}</span>
                       <span className="text-[10px] uppercase font-black text-slate-500 group-hover:text-white transition-colors tracking-widest">{type.label}</span>
                    </button>
                  ))}
                </div>
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
              </section>

              {inputMode && (
                <div className="glass-morphism rounded-[2.5rem] p-8 shadow-2xl animate-fade-in space-y-6 border border-white/10">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Sync: {inputMode}</h4>
                    <button onClick={() => setInputMode(null)} className="text-slate-500 hover:text-white p-2">✕</button>
                  </div>
                  <textarea value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder={`Enter ${inputMode} content...`} className="w-full bg-black/60 border border-white/10 rounded-2xl p-6 text-sm text-white outline-none focus:border-white/20 min-h-[120px]" />
                  <button onClick={handleSubmitInput} className={`w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all ${theme.id === 'focus_black' ? 'text-black' : 'text-white'}`} style={{ backgroundColor: theme.colors.hexPrimary }}>Anchor Node</button>
                </div>
              )}
            </>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-12 animate-fade-in">
              <section className="space-y-8">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: theme.colors.hexSecondary }}>Audio Architecture</h3>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] ml-2">Vocal Signature</label>
                  <select 
                    value={voiceName}
                    onChange={(e) => onVoiceNameChange(e.target.value)}
                    className="w-full h-14 bg-black/60 border border-white/10 rounded-2xl px-6 text-sm text-white outline-none focus:border-white/30 transition-all shadow-inner appearance-none cursor-pointer"
                  >
                    {VOICES.map(v => <option key={v} value={v} className="bg-slate-900">{v}</option>)}
                  </select>
                </div>
              </section>

              <section className="space-y-10">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: theme.colors.hexSecondary }}>Neural Personality Matrix</h3>
                <div className="space-y-12">
                   <PersonalitySlider label="Humor Quotient" value={personality.humor} onChange={(v: number) => handlePersonalityUpdate('humor', v)} color={theme.colors.hexPrimary} />
                   <PersonalitySlider label="Formality Level" value={personality.formality} onChange={(v: number) => handlePersonalityUpdate('formality', v)} color={theme.colors.hexPrimary} />
                   <PersonalitySlider label="Creativity Index" value={personality.creativity} onChange={(v: number) => handlePersonalityUpdate('creativity', v)} color={theme.colors.hexPrimary} />
                   <PersonalitySlider label="Enthusiasm Ratio" value={personality.enthusiasm} onChange={(v: number) => handlePersonalityUpdate('enthusiasm', v)} color={theme.colors.hexPrimary} />
                </div>
                <div className="flex items-center justify-between p-6 bg-black/40 rounded-3xl border border-white/5">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Adaptive Logic</p>
                    <p className="text-[9px] text-slate-700 uppercase mt-1">Dynamic context-shifting</p>
                  </div>
                  <button onClick={() => handlePersonalityUpdate('isAdaptive', !personality.isAdaptive)} className={`w-12 h-6 rounded-full relative transition-all ${personality.isAdaptive ? 'bg-emerald-500' : 'bg-slate-800'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${personality.isAdaptive ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
              </section>

              <section className="pt-6 border-t border-white/5">
                 <button onClick={onOpenWizard} className={`w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] border border-white/10 hover:bg-white/5 transition-all`}>Rerun Advanced Setup</button>
              </section>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="space-y-10 animate-fade-in">
              <section className="space-y-8">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: theme.colors.hexSecondary }}>Identity Registry</h3>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] ml-2">Studio Designation</label>
                    <input 
                      type="text" 
                      value={userName} 
                      onChange={(e) => onUserNameChange(e.target.value)} 
                      placeholder="User Designation..." 
                      className="w-full h-14 bg-black/60 border border-white/10 rounded-2xl px-6 text-sm text-white outline-none focus:border-white/30 transition-all shadow-inner" 
                    />
                 </div>
                 <AuthUI theme={theme} userEmail={currentUser?.email} onSuccess={() => {}} />
              </section>
              <MilestoneBadge metrics={profile.metrics} theme={theme} />
              <InviteFriendsCard referralCode={profile.referralCode} theme={theme} onCopy={showToast} />
            </div>
          )}

          {activeTab === 'admin' && <AdminPanel theme={theme} currentUserId={currentUser?.id} />}

        </div>
        <div className="p-7 border-t border-white/5 flex justify-center items-center gap-3 bg-black/20">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: theme.colors.hexPrimary }}></div>
          <p className="text-[9px] uppercase tracking-[0.4em] font-black text-slate-700">SIGNALUM ENCRYPTED NODE</p>
        </div>
      </div>
    </>
  );
};

const PersonalitySlider = ({ label, value, onChange, color }: any) => (
  <div className="space-y-5">
    <div className="flex justify-between items-center px-1">
      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">{label}</label>
      <span className="text-[11px] font-mono text-white bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 shadow-lg" style={{ color }}>{value}%</span>
    </div>
    <div className="px-1">
      <input type="range" min="0" max="100" value={value} onChange={(e) => onChange(parseInt(e.target.value))} className="w-full h-1.5 bg-black/80 rounded-full appearance-none cursor-pointer accent-current hover:brightness-125 transition-all shadow-inner" style={{ color }} />
    </div>
  </div>
);
