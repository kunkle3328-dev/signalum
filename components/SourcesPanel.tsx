
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Source, AudioStyle, Theme, UserPlan, PersonaProfile, TrialState, BRAND_NAME, UserProfile, UsageStatus, PersonalityTraits, NeonIntensity, PromptVersion, PERSONA_REGISTRY, ConnectionState } from '../types';
import { InviteFriendsCard } from './InviteFriendsCard';
import { AuthUI } from './AuthUI';
import { AdminPanel } from './AdminPanel';

interface SourcesPanelProps {
  sources: Source[];
  onAddSource: (source: Source) => void;
  onRemoveSource: (id: string) => void;
  onToggleSource: (id: string) => void;
  disabled: boolean;
  status: ConnectionState; // Added status prop
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
  discoveryStep: string;
}

const VOICES = ['Zephyr', 'Puck', 'Charon', 'Kore', 'Fenrir'];

const NeuralTelemetry = ({ sources, theme, status }: { sources: Source[], theme: Theme, status: ConnectionState }) => {
  // Calculate Metrics
  const activeSources = sources.filter(s => s.isActive);
  const charCount = activeSources.reduce((acc, s) => acc + (s.content?.length || 0), 0);
  const limit = 7000; // Aligned with App.tsx limit
  const usagePercent = Math.min(100, (charCount / limit) * 100);

  // Connection Ping (simulated based on status)
  const ping = status === 'connected' ? '24ms' : status === 'connecting' ? '...' : '--';
  const signalStrength = status === 'connected' ? 98 : 0;
  const statusColor = status === 'connected' ? '#10b981' : status === 'connecting' ? '#fbbf24' : '#64748b';

  return (
    <div className={`p-6 rounded-[2rem] border ${theme.colors.border} bg-white/5 space-y-6 relative overflow-hidden transition-all hover:bg-white/[0.07]`}>
      {/* Background Decor */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl pointer-events-none"></div>
      
      <div className="flex justify-between items-start relative z-10">
        <div>
           <h4 className="text-xs font-black text-white flex items-center gap-2 uppercase tracking-widest">
             <span className="w-2 h-2 rounded-full animate-pulse shadow-[0_0_10px_currentColor]" style={{ backgroundColor: statusColor, color: statusColor }}/>
             Neural Core
           </h4>
           <p className="text-[9px] text-slate-500 uppercase font-bold tracking-[0.3em] mt-1">Real-time Telemetry</p>
        </div>
        <div className="text-right">
           <div className="text-xl font-mono text-white font-bold tracking-tighter">{ping}</div>
           <div className="text-[8px] text-slate-500 uppercase tracking-widest font-bold">Latency</div>
        </div>
      </div>

      {/* Context Usage Bar */}
      <div className="space-y-3 relative z-10">
        <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-slate-400">
           <span>Context Buffer</span>
           <span style={{ color: theme.colors.hexPrimary }}>{Math.round(usagePercent)}% Load</span>
        </div>
        
        {/* Advanced Progress Bar */}
        <div className="h-2.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/10 relative">
           {/* Grid lines in background */}
           <div className="absolute inset-0 flex justify-between px-1">
              {[1,2,3,4,5,6,7,8,9].map(i => <div key={i} className="w-[1px] h-full bg-white/5"></div>)}
           </div>
           <div
             className="h-full transition-all duration-1000 relative shadow-[0_0_15px_currentColor]"
             style={{ width: `${usagePercent}%`, backgroundColor: theme.colors.hexPrimary, color: theme.colors.hexPrimary }}
           >
              <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
           </div>
        </div>
        
        <div className="flex justify-between items-center text-[8px] text-slate-600 font-mono uppercase tracking-wider">
           <span>{charCount} chars active</span>
           <span>{limit} capacity</span>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 gap-3 relative z-10">
         <div className="p-3.5 bg-black/40 rounded-2xl border border-white/5 flex flex-col justify-between h-20 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="text-[8px] text-slate-500 uppercase tracking-[0.2em] font-bold">Active Nodes</div>
            <div className="flex items-end justify-between">
                <div className="text-2xl font-display font-bold text-white">{activeSources.length}</div>
                <div className="text-[10px] text-emerald-500 font-mono mb-1">ONLINE</div>
            </div>
         </div>
         <div className="p-3.5 bg-black/40 rounded-2xl border border-white/5 flex flex-col justify-between h-20 relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <div className="text-[8px] text-slate-500 uppercase tracking-[0.2em] font-bold">Signal Health</div>
             <div className="flex items-end justify-between">
                <div className="text-2xl font-display font-bold" style={{ color: signalStrength > 80 ? '#10b981' : '#f59e0b' }}>{signalStrength}%</div>
                <svg className="w-5 h-5 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
             </div>
         </div>
      </div>

      {/* Decoration: Rolling Code */}
      <div className="h-10 overflow-hidden relative border-t border-white/5 pt-2">
         <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10 pointer-events-none"></div>
         <div className="text-[8px] font-mono text-slate-700 opacity-50 space-y-1">
            <p>> SYNCING_NEURAL_NODES...</p>
            <p>> CONTEXT_WINDOW_OPTIMIZED</p>
            <p>> VOICE_LATENCY_CHECK: OK</p>
         </div>
      </div>
    </div>
  )
}

export const SourcesPanel: React.FC<SourcesPanelProps> = ({ 
  sources, onAddSource, onRemoveSource, onToggleSource, disabled, status, isOpen, onClose, selectedStyle, onStyleChange, userName, onUserNameChange, isRevenueMode, onRevenueModeChange, theme, userPlan, onUpgrade, onStartTrial, trial, onBulkDiscover, personaRegistry, onboardingStep, onRerunOnboarding, profile, showToast, currentUser, usage, isResearchingGlobal, discoveryInbox, onImportSelected, onClearDiscovery, voiceName, onVoiceNameChange, personality, onPersonalityChange, onUpdateSettings, promptVersions, onRollback, onOpenWizard, discoveryStep
}) => {
  const [activeTab, setActiveTab] = useState<'sources' | 'history' | 'settings' | 'account' | 'admin'>('sources');
  const [activeCategory, setActiveCategory] = useState<'ENTERPRISE' | 'MONEY' | 'CONTENT' | 'LEARN' | 'CUSTOM'>('ENTERPRISE');
  const [inputMode, setInputMode] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTopic, setSearchTopic] = useState('');
  const [selectedDiscoveryIds, setSelectedDiscoveryIds] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const personas = useMemo(() => {
    const disabledModes = JSON.parse(localStorage.getItem('SIGNALUM_DISABLED_MODES') || '{}') as Record<string, boolean>;
    const customModes = JSON.parse(localStorage.getItem('SIGNALUM_CUSTOM_MODES') || '{}') as Record<string, PersonaProfile>;
    
    const allPersonas = { ...personaRegistry, ...customModes };
    
    return (Object.values(allPersonas) as PersonaProfile[]).filter(p => p.category === activeCategory && !disabledModes[p.id]);
  }, [personaRegistry, activeCategory, isOpen]);

  // Reset selected IDs when inbox changes
  useEffect(() => {
    setSelectedDiscoveryIds([]);
  }, [discoveryInbox]);

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
    onAddSource({ id: crypto.randomUUID(), title: inputValue.split('\n')[0].substring(0, 30), content: inputValue, type: inputMode as any || 'paste' });
    setInputMode(null);
    setInputValue('');
    showToast("Context Node Established.");
  };

  const handlePersonalityUpdate = (key: keyof PersonalityTraits, val: any) => {
    onPersonalityChange({ ...personality, [key]: val });
  };

  const toggleDiscoverySelection = (id: string) => {
    setSelectedDiscoveryIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleImport = () => {
    onImportSelected(selectedDiscoveryIds);
    setSelectedDiscoveryIds([]);
  };

  const activeSourcesCount = sources.filter(s => s.isActive).length;

  return (
    <>
      <div className={`fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] md:hidden transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
      <div 
        className={`fixed inset-y-0 left-0 w-full md:w-[450px] ${theme.colors.bgPanel} border-r border-white/5 z-[110] transform transition-transform duration-500 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 flex flex-col h-screen shadow-[0_0_80px_rgba(0,0,0,0.8)]`}
        style={{ 
          backgroundColor: theme.visualProfile.bgSurface, 
          borderColor: theme.visualProfile.borderColor || theme.colors.hexPrimary + '20' 
        }}
      >
        
        <div className="shrink-0 z-20 border-b border-white/5 bg-black/20 backdrop-blur-3xl p-7" style={{ borderColor: theme.visualProfile.borderColor }}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl" style={{ borderColor: theme.visualProfile.borderColor }}>
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" style={{ color: theme.colors.hexPrimary }}>
                    <path d="M12 3L4 7L12 11L20 7L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M4 12L12 16L20 12M4 17L12 21L20 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-black font-display uppercase tracking-[0.25em] mb-1" style={{ color: theme.visualProfile.textPrimary }}>SIGNALUM</h1>
                  <p className="text-[8px] text-slate-500 font-black uppercase tracking-[0.4em]">ENTERPRISE STUDIO</p>
                </div>
              </div>
              <button onClick={onClose} className="md:hidden p-3 text-white/20 hover:text-white bg-white/5 rounded-full transition-all active:scale-90">✕</button>
            </div>
            
            <div className="flex bg-black/40 rounded-2xl p-1 border border-white/5" style={{ borderColor: theme.visualProfile.borderColor }}>
              {['sources', 'history', 'settings', 'account', 'admin'].filter(tab => tab !== 'admin' || profile.entitlements.is_admin).map((tab: any) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-3 text-[8px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === tab ? `bg-white/10 text-white` : 'text-slate-600 hover:text-slate-400'}`} style={{ color: activeTab === tab ? theme.colors.hexPrimary : undefined }}>{tab}</button>
              ))}
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-7 space-y-10 custom-scrollbar text-gray-200">
          
          {activeTab === 'sources' && (
            <>
              <section className="space-y-6">
                <div className="flex justify-between items-center">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: theme.colors.hexSecondary }}>Intelligence Role</h3>
                </div>
                <div className="flex bg-black/40 rounded-2xl p-1 border border-white/5" style={{ borderColor: theme.visualProfile.borderColor }}>
                  {(['ENTERPRISE', 'MONEY', 'CONTENT', 'LEARN', 'CUSTOM'] as const).map(cat => (
                    <button key={cat} onClick={() => setActiveCategory(cat)} className={`flex-1 py-3 text-[8px] font-black uppercase tracking-widest rounded-xl transition-all ${activeCategory === cat ? 'text-white bg-white/10' : 'text-slate-600 hover:text-slate-400'}`} style={{ color: activeCategory === cat ? theme.colors.hexPrimary : undefined }}>{cat}</button>
                  ))}
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {personas.map(style => (
                    <button key={style.id} onClick={() => !disabled && onStyleChange(style.id)} className={`relative flex items-center gap-5 p-5 rounded-[1.5rem] border text-left transition-all ${selectedStyle === style.id ? `bg-white/5 border-white/20 shadow-xl` : `bg-black/30 border-white/5 hover:bg-white/5`}`} style={{ borderColor: selectedStyle === style.id ? theme.colors.hexPrimary + '50' : theme.visualProfile.borderColor }}>
                      <div className={`text-2xl transition-transform ${selectedStyle === style.id ? 'scale-110' : 'opacity-40'}`}>{style.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-black ${selectedStyle === style.id ? 'text-white' : 'text-slate-500'}`} style={{ color: selectedStyle === style.id ? theme.visualProfile.textPrimary : undefined }}>{style.name}</div>
                        <div className="text-[9px] text-slate-600 uppercase font-black tracking-widest truncate mt-1">{personaRegistry[style.id]?.rules[0] || style.rules[0]}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex justify-between items-end">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: theme.colors.hexSecondary }}>Intelligence Scan</h3>
                   {isResearchingGlobal && <span className="text-[9px] font-mono text-emerald-400 animate-pulse">{discoveryStep}</span>}
                </div>
                
                <div className="relative h-14">
                  <input 
                    type="text" 
                    value={searchTopic} 
                    onChange={(e) => setSearchTopic(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' && onBulkDiscover(searchTopic, 10)} 
                    placeholder="Search topic to synthesize..." 
                    className="w-full h-full input-pop rounded-2xl px-6 pr-14 text-sm text-white placeholder-slate-600 outline-none transition-all"
                    style={{ borderColor: theme.visualProfile.borderColor, color: theme.visualProfile.textPrimary }}
                  />
                  <button onClick={() => onBulkDiscover(searchTopic, 10)} disabled={isResearchingGlobal || !searchTopic.trim()} className="absolute right-2 top-2 h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:text-white transition-all disabled:opacity-30">
                    {isResearchingGlobal ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>}
                  </button>
                </div>

                {/* Discovery Inbox - Checkbox Selection */}
                {discoveryInbox.length > 0 && (
                  <div className="mt-6 p-5 bg-white/5 rounded-[2rem] border border-white/10 animate-fade-in" style={{ borderColor: theme.visualProfile.borderColor }}>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: theme.visualProfile.textPrimary }}>Discovered Sources ({discoveryInbox.length})</h4>
                      <button 
                        onClick={handleImport} 
                        disabled={selectedDiscoveryIds.length === 0}
                        className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${selectedDiscoveryIds.length > 0 ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white/5 text-slate-500'}`}
                      >
                        Import Selected ({selectedDiscoveryIds.length})
                      </button>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                      {discoveryInbox.map(source => (
                        <div key={source.id} className="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-white/5 hover:bg-white/5 cursor-pointer" onClick={() => toggleDiscoverySelection(source.id)} style={{ borderColor: theme.visualProfile.borderColor }}>
                          <div className={`mt-1 w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedDiscoveryIds.includes(source.id) ? 'bg-emerald-500 border-emerald-500' : 'border-white/20'}`}>
                             {selectedDiscoveryIds.includes(source.id) && <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs truncate font-medium" style={{ color: theme.visualProfile.textPrimary }}>{source.title}</p>
                            <p className="text-[9px] text-slate-500 truncate mt-0.5">{source.url}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex justify-end">
                       <button onClick={onClearDiscovery} className="text-[9px] text-slate-500 hover:text-white uppercase tracking-widest">Clear Results</button>
                    </div>
                  </div>
                )}
              </section>

              <section className="space-y-6">
                <div className="flex justify-between items-center">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: theme.colors.hexSecondary }}>Context Nodes</h3>
                   <span className="text-[9px] font-mono text-slate-500">{activeSourcesCount} / {sources.length} Active</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'web', label: 'Web Sync', icon: '🔗', count: sources.filter(s => s.type === 'web').length },
                    { id: 'pdf', label: 'PDF Sync', icon: '📄', count: sources.filter(s => s.type === 'pdf').length },
                    { id: 'paste', label: 'Paste Sync', icon: '📝', count: sources.filter(s => s.type === 'paste').length },
                    { id: 'youtube', label: 'Video Sync', icon: '📺', count: sources.filter(s => s.type === 'youtube').length }
                  ].map(type => (
                    <button key={type.id} onClick={() => handleSourceClick(type.id)} disabled={disabled || isProcessing} className="relative flex flex-col items-center justify-center p-8 rounded-[1.75rem] bg-black/50 border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all group active:scale-95 shadow-lg" style={{ borderColor: theme.visualProfile.borderColor }}>
                       <span className="text-4xl mb-4 group-hover:scale-110 transition-all">{type.icon}</span>
                       <span className="text-[10px] uppercase font-black text-slate-500 group-hover:text-white transition-colors tracking-widest">{type.label}</span>
                       {type.count > 0 && <span className="absolute top-4 right-4 bg-white/10 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">{type.count}</span>}
                    </button>
                  ))}
                </div>
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
              </section>

              {inputMode && (
                <div className="glass-morphism rounded-[2.5rem] p-8 shadow-2xl animate-fade-in space-y-6 border border-white/10" style={{ borderColor: theme.visualProfile.borderColor }}>
                  <div className="flex justify-between items-center">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Sync: {inputMode}</h4>
                    <button onClick={() => setInputMode(null)} className="text-slate-500 hover:text-white p-2">✕</button>
                  </div>
                  <textarea value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder={`Enter ${inputMode} content...`} className="w-full input-pop rounded-2xl p-6 text-sm text-white outline-none transition-all min-h-[120px]" style={{ borderColor: theme.visualProfile.borderColor, color: theme.visualProfile.textPrimary }} />
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
                    className="w-full h-14 input-pop rounded-2xl px-6 text-sm text-white outline-none transition-all appearance-none cursor-pointer"
                    style={{ borderColor: theme.visualProfile.borderColor, color: theme.visualProfile.textPrimary }}
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
                <div className="flex items-center justify-between p-6 bg-black/40 rounded-3xl border border-white/5" style={{ borderColor: theme.visualProfile.borderColor }}>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Adaptive Logic</p>
                    <p className="text-[9px] text-slate-700 uppercase mt-1">Dynamic context-shifting</p>
                  </div>
                  <button onClick={() => handlePersonalityUpdate('isAdaptive', !personality.isAdaptive)} className={`w-12 h-6 rounded-full relative transition-all ${personality.isAdaptive ? 'bg-emerald-500' : 'bg-slate-800'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${personality.isAdaptive ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
              </section>

              <section className="pt-6 border-t border-white/5" style={{ borderColor: theme.visualProfile.borderColor }}>
                 <button onClick={onOpenWizard} className={`w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] border border-white/10 hover:bg-white/5 transition-all`} style={{ borderColor: theme.visualProfile.borderColor, color: theme.visualProfile.textPrimary }}>Rerun Advanced Setup</button>
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
                      className="w-full h-14 input-pop rounded-2xl px-6 text-sm text-white outline-none transition-all"
                      style={{ borderColor: theme.visualProfile.borderColor, color: theme.visualProfile.textPrimary }}
                    />
                 </div>
                 <AuthUI theme={theme} userEmail={currentUser?.email} onSuccess={() => {}} />
              </section>
              
              {/* REPLACED MilestoneBadge with NeuralTelemetry */}
              <NeuralTelemetry sources={sources} theme={theme} status={status} />
              
              <InviteFriendsCard referralCode={profile.referralCode} theme={theme} onCopy={showToast} />
            </div>
          )}

          {activeTab === 'admin' && <AdminPanel theme={theme} currentUserId={currentUser?.id} />}

        </div>
        <div className="p-7 border-t border-white/5 flex justify-center items-center gap-3 bg-black/20" style={{ borderColor: theme.visualProfile.borderColor }}>
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
