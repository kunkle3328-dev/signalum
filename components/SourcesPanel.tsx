
import React, { useState, useRef, useEffect } from 'react';
import { Source, AudioStyle, Theme, UserPlan, PersonaProfile, TrialState, BRAND_NAME, UserProfile } from '../types';
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
  onBulkDiscover?: (topic: string, limit: number) => void;
  personaRegistry: Record<AudioStyle, PersonaProfile>;
  onboardingStep: number;
  onRerunOnboarding?: () => void;
  profile: UserProfile;
  showToast: (msg: string) => void;
  currentUser: any;
}

const STYLE_CATEGORIES = {
  money: [
    { id: 'entrepreneur', label: 'Business Arch.', desc: 'General Strategy', icon: '🚀' },
    { id: 'money_engine', label: 'The Closer', desc: 'Strategist + Builder + Closer', icon: '⚙️' },
    { id: 'websites', label: 'Tech Architect', desc: 'SaaS & Web Tools', icon: '💻' },
    { id: 'plr', label: 'Licensing Expert', desc: 'Resale & Licensing', icon: '📦' },
  ],
  content: [
    { id: 'podcast', label: 'Studio Host', desc: 'Viral Podcast Personality', icon: '🎙️' },
    { id: 'creative', label: 'Creative Futurist', desc: 'Visionary & Thinker', icon: '✨' },
    { id: 'interview', label: 'Journalist', desc: 'Deep Interviewer', icon: '🎤' },
    { id: 'heated_debate', label: 'The Skeptic', desc: 'Intense Challenge', icon: '🔥' },
    { id: 'casual', label: 'Companion', desc: 'Chill Studio Guest', icon: '☕' },
  ],
  learn: [
    { id: 'expert_guide', label: 'Expert Guide', desc: 'In-Depth Mastery', icon: '🏛️' },
    { id: 'deep_learning', label: 'Professor', desc: 'First Principles', icon: '🧠' },
    { id: 'study', label: 'Socratic Tutor', desc: 'Insightful Coach', icon: '🎓' },
    { id: 'summary', label: 'Briefer', desc: 'Fast Takeaways', icon: '⚡' },
    { id: 'debate', label: 'Thinker', desc: 'Logical Analyst', icon: '⚔️' },
  ]
};

const SOURCE_TYPES = [
    { id: 'paste', label: 'Paste Text', icon: '📝' },
    { id: 'web', label: 'Web Link', icon: '🔗' },
    { id: 'pdf', label: 'PDF', icon: '📄' },
    { id: 'youtube', label: 'YouTube', icon: '📺' },
];

export const SourcesPanel: React.FC<SourcesPanelProps> = ({ 
  sources, onAddSource, onRemoveSource, onToggleSource, disabled, isOpen, onClose, selectedStyle, onStyleChange, userName, onUserNameChange, isRevenueMode, onRevenueModeChange, theme, userPlan, onUpgrade, onStartTrial, trial, onBulkDiscover, personaRegistry, onboardingStep, onRerunOnboarding, profile, showToast, currentUser
}) => {
  const [activeTab, setActiveTab] = useState<'sources' | 'account' | 'admin'>('sources');
  const [activeCategory, setActiveCategory] = useState<'money' | 'content' | 'learn'>('learn');
  const [inputMode, setInputMode] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTopic, setSearchTopic] = useState('');
  const [isResearching, setIsResearching] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // If not admin, reset tab if it was on admin
    if (activeTab === 'admin' && !profile.entitlements.is_admin) {
      setActiveTab('sources');
    }
  }, [profile.entitlements.is_admin, activeTab]);

  const ingestUrl = async (url: string): Promise<{ title: string; content: string; description: string }> => {
    try {
        const res = await fetch(url, { mode: 'cors' }).catch(() => null);
        if (!res) throw new Error("CORS Blocked");
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        ['script', 'style', 'nav', 'footer', 'header', 'iframe'].forEach(tag => {
            doc.querySelectorAll(tag).forEach(el => el.remove());
        });
        const title = doc.title || new URL(url).hostname;
        const cleanContent = doc.body.textContent?.replace(/\s+/g, ' ').trim().substring(0, 15000) || "";
        const description = cleanContent.substring(0, 200) + "...";
        return { title, content: cleanContent, description };
    } catch (e) {
        const hostname = new URL(url).hostname;
        return { title: hostname, content: "", description: `Saved as link anchor. Full neural extraction requires Signalum backend. Source: ${hostname}` };
    }
  };

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

  const extractPdfText = async (file: File) => {
    setIsProcessing(true);
    try {
      const pdfjsLib = (window as any).pdfjsLib;
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      let fullText = '';
      const pageLimit = Math.min(pdf.numPages, 20);
      for (let i = 1; i <= pageLimit; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n';
      }
      onAddSource({ 
        id: Date.now().toString(), 
        title: file.name, 
        content: fullText.substring(0, 30000), 
        description: `Signalum Extracted PDF: ${file.name}.`,
        type: 'pdf' 
      });
    } catch (e) {
      alert("Signalum PDF Extraction node error.");
    } finally { setIsProcessing(false); }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file?.type === 'application/pdf') extractPdfText(file);
  };

  const handleDiscover = async () => {
    if (!searchTopic.trim() || !onBulkDiscover) return;
    setIsResearching(true);
    try {
        await onBulkDiscover(searchTopic, 10);
        setSearchTopic('');
    } finally { setIsResearching(false); }
  };

  const handleSubmitInput = async () => {
      if (!inputValue.trim()) return;
      setIsProcessing(true);
      try {
          if (inputMode === 'paste') {
               onAddSource({ 
                   id: Date.now().toString(), 
                   title: inputValue.split('\n')[0].substring(0, 30), 
                   content: inputValue, 
                   description: "Manually pasted context.",
                   type: 'paste' 
               });
          } else if (inputMode === 'web' || inputMode === 'youtube') {
                const url = inputValue.startsWith('http') ? inputValue : `https://${inputValue}`;
                const meta = await ingestUrl(url);
                onAddSource({ 
                    id: Date.now().toString(), 
                    title: meta.title, 
                    url: url,
                    content: meta.content, 
                    description: meta.description,
                    type: inputMode as any 
                });
          }
          setInputMode(null);
          setInputValue('');
      } catch (e) {
          alert("Signalum extraction node unreachable.");
      } finally { setIsProcessing(false); }
  };

  return (
    <>
      <div className={`fixed inset-0 bg-black/90 backdrop-blur-md z-40 md:hidden transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
      <div className={`fixed inset-y-0 left-0 w-full md:w-[450px] ${theme.colors.bgPanel} border-r ${theme.colors.border} z-50 transform transition-transform duration-500 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 flex flex-col h-[100dvh] backdrop-blur-3xl`}>
        
        {/* HEADER */}
        <div className={`shrink-0 ${theme.colors.bgPanel} backdrop-blur-xl z-20 border-b ${theme.colors.border}`}>
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl ${theme.colors.primary} bg-opacity-10 border ${theme.colors.border} flex items-center justify-center ${theme.colors.secondary}`}><svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2"/><path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2"/><path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2"/></svg></div>
                <div>
                  <h1 className="text-xl font-bold text-white font-display uppercase tracking-widest">{BRAND_NAME}</h1>
                  <div className="flex items-center gap-2">
                    <p className={`text-[10px] ${theme.colors.secondary} uppercase tracking-widest`}>Neural Workspace</p>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${profile.entitlements.lifetime_pro ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' : profile.entitlements.founders_badge ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : profile.entitlements.pro_access ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800 text-gray-400'}`}>
                      {profile.entitlements.lifetime_pro ? 'LIFETIME' : profile.entitlements.founders_badge ? 'FOUNDER' : profile.entitlements.pro_access ? 'PRO' : 'FREE'}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="md:hidden p-3 text-white/50 hover:text-white bg-white/5 rounded-full border border-white/5"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
            </div>
            
            <div className="px-6 pb-4">
              <div className={`flex bg-black/40 rounded-2xl p-1 border ${theme.colors.border}`}>
                <button onClick={() => setActiveTab('sources')} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${activeTab === 'sources' ? `${theme.colors.primary} text-white` : 'text-slate-500'}`}>Sources</button>
                <button onClick={() => setActiveTab('account')} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${activeTab === 'account' ? `${theme.colors.primary} text-white` : 'text-slate-500'}`}>Account</button>
                {profile.entitlements.is_admin && (
                   <button onClick={() => setActiveTab('admin')} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${activeTab === 'admin' ? `bg-red-600/20 text-red-400 border border-red-500/30` : 'text-slate-500'}`}>Admin</button>
                )}
              </div>
            </div>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-32 md:pb-10 custom-scrollbar text-gray-100">
          
          {activeTab === 'sources' ? (
            <>
              <section className="animate-fade-in">
                <h3 className={`text-xs font-bold ${theme.colors.secondary} uppercase tracking-[0.2em] mb-4`}>Studio Persona</h3>
                <div onClick={() => !disabled && onRevenueModeChange(!isRevenueMode)} className={`flex items-center justify-between p-3 rounded-xl border mb-3 cursor-pointer transition-all ${isRevenueMode ? 'bg-green-900/10 border-green-500/50' : `bg-black/20 ${theme.colors.border} hover:bg-white/5`} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <div className="flex items-center gap-3"><div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${isRevenueMode ? 'bg-green-500/20 text-green-400' : 'bg-gray-800 text-gray-500'}`}>💸</div><div><div className={`text-sm font-bold ${isRevenueMode ? 'text-green-400' : 'text-gray-400'}`}>Revenue Velocity</div><div className="text-[10px] text-gray-600">Strict action-oriented logic.</div></div></div>
                    {!profile.entitlements.pro_access ? (
                        <span className="text-[8px] font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">PRO</span>
                    ) : (
                        <div className={`w-10 h-5 rounded-full relative transition-colors ${isRevenueMode ? 'bg-green-500' : 'bg-gray-700'}`}><div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-transform ${isRevenueMode ? 'left-6' : 'left-1'}`}></div></div>
                    )}
                </div>
                <div className={`flex bg-black/30 rounded-xl p-1 mb-4 border ${theme.colors.border}`}>{(['money', 'content', 'learn'] as const).map(cat => (<button key={cat} onClick={() => setActiveCategory(cat)} className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeCategory === cat ? `${theme.colors.primary} bg-opacity-20 ${theme.colors.textMain} border ${theme.colors.border}` : 'text-gray-500'}`}>{cat}</button>))}</div>
                <div className="grid grid-cols-1 gap-3 animate-fade-in">
                  {STYLE_CATEGORIES[activeCategory].map((style: any) => {
                    const profileP = personaRegistry[style.id as AudioStyle];
                    const isLocked = profileP?.isPremium && !profile.entitlements.pro_access;
                    return (
                      <button key={style.id} onClick={() => !disabled && onStyleChange(style.id)} disabled={disabled} className={`relative flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${selectedStyle === style.id ? `${theme.colors.primary} bg-opacity-10 ${theme.colors.border}` : `bg-black/20 border-white/5 hover:bg-white/5`} ${isLocked ? 'opacity-60' : ''}`}>
                        <div className={`text-2xl transition-transform ${selectedStyle === style.id ? 'scale-110' : 'grayscale'}`}>{style.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className={`text-sm font-semibold ${selectedStyle === style.id ? 'text-white' : `text-gray-400`}`}>{style.label}</div>
                            {isLocked && <span className="text-[7px] font-bold text-blue-400 bg-blue-500/10 px-1 py-0.5 rounded border border-blue-500/20 uppercase">Pro</span>}
                          </div>
                          <div className="text-[11px] text-gray-600 mt-0.5">{style.desc}</div>
                        </div>
                        {selectedStyle === style.id && (<div className={`absolute right-4 w-2 h-2 rounded-full ${theme.colors.primary} shadow-lg animate-pulse`}></div>)}
                      </button>
                    )
                  })}
                </div>
              </section>

              <section className="animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-xs font-bold ${theme.colors.secondary} uppercase tracking-[0.2em]`}>Context Base</h3>
                  <span className="text-[9px] text-gray-500 font-mono">{sources.length} / {profile.entitlements.pro_access ? '∞' : '3'}</span>
                </div>
                
                {sources.length > 0 && (<div className="space-y-3 mb-6">{sources.map(source => (
                    <div key={source.id} className={`group relative bg-black/20 border ${theme.colors.border} rounded-2xl p-4 transition-all duration-300 ${!source.isActive ? 'opacity-40 grayscale' : ''}`}>
                        <div className="flex items-start gap-4 relative z-10">
                            <button onClick={() => onToggleSource(source.id)} className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-white/5 bg-black/50 text-xl hover:scale-105 transition-transform`}>{source.type === 'web' ? '🔗' : source.type === 'pdf' ? '📄' : source.type === 'youtube' ? '📺' : '📝'}</button>
                            <div className="flex-1 min-w-0" onClick={() => onToggleSource(source.id)}><h4 className={`text-sm font-medium ${theme.colors.textMain} truncate cursor-pointer`}>{source.title}</h4><p className="text-[11px] text-gray-500 mt-1 line-clamp-1">{source.description || source.content}</p></div>
                            {!disabled && (<button onClick={() => onRemoveSource(source.id)} className="text-gray-600 hover:text-red-400 p-2 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>)}
                        </div>
                    </div>
                ))}</div>)}
                
                <div className="mb-4"><div className="relative group"><input type="text" value={searchTopic} onChange={(e) => setSearchTopic(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleDiscover()} placeholder="Research Discovery..." className={`w-full bg-black/30 border ${theme.colors.border} rounded-2xl py-4 px-4 pl-11 pr-14 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-white/20`} /><div className="absolute left-4 top-4 text-white/30">{isResearching ? (<svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>) : (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>)}</div><button onClick={handleDiscover} disabled={!searchTopic.trim() || isResearching} className={`absolute right-2 top-2 p-2 rounded-xl transition-all ${searchTopic.trim() && !isResearching ? `${theme.colors.primary} text-white` : 'text-transparent'}`}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg></button></div></div>
                
                {inputMode ? (<div className={`bg-black/40 border ${theme.colors.border} rounded-2xl p-4 shadow-2xl animate-fade-in`}>
                        <div className="flex justify-between items-center mb-3"><span className={`text-[10px] font-bold ${theme.colors.secondary} uppercase tracking-widest`}>{inputMode === 'paste' ? 'Paste Context' : inputMode === 'web' ? 'Link Mapping' : 'YouTube Context'}</span><button onClick={() => setInputMode(null)} className="text-gray-500 hover:text-white"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg></button></div>
                        {inputMode === 'paste' ? (<textarea value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Paste plain text context here..." className={`w-full text-sm bg-black/50 border ${theme.colors.border} rounded-xl p-3 resize-none h-32 text-gray-200 outline-none focus:border-white/20`} autoFocus />) : (<input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSubmitInput()} placeholder={inputMode === 'web' ? "Enter URL (https://...)" : "Enter Video/Channel URL"} className={`w-full text-sm bg-black/50 border ${theme.colors.border} rounded-xl p-3 text-gray-200 outline-none focus:border-white/20`} autoFocus />)}
                        <button onClick={handleSubmitInput} disabled={isProcessing || !inputValue.trim()} className={`w-full mt-3 ${theme.colors.primary} text-white text-xs font-bold py-3 rounded-xl disabled:opacity-50 transition-all uppercase tracking-widest`}>{isProcessing ? 'Syncing...' : 'Add to Workspace'}</button>
                    </div>) : (
                    <div className="grid grid-cols-2 gap-3">
                        {SOURCE_TYPES.map(type => (
                            <button key={type.id} onClick={() => handleSourceClick(type.id)} disabled={disabled || isProcessing} className={`group flex flex-col items-center justify-center p-4 rounded-2xl bg-black/20 border border-white/5 hover:${theme.colors.border} hover:bg-white/5 transition-all disabled:opacity-50 active:scale-95`}><div className="text-2xl mb-2 transition-transform group-hover:scale-110">{type.icon}</div><span className={`text-[10px] uppercase tracking-widest font-bold text-gray-500 group-hover:${theme.colors.textSecondary}`}>{type.label}</span></button>
                        ))}
                        <input type="file" min-width="1" file-limit="1" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                    </div>
                )}
              </section>
            </>
          ) : activeTab === 'account' ? (
            <div className="space-y-8 animate-fade-in">
              <section className="space-y-4">
                 <h3 className={`text-xs font-bold ${theme.colors.secondary} uppercase tracking-[0.2em]`}>Studio Account</h3>
                 <AuthUI theme={theme} userEmail={currentUser?.email} onSuccess={() => {}} />
              </section>

              <section className="space-y-4">
                 <h3 className={`text-xs font-bold ${theme.colors.secondary} uppercase tracking-[0.2em]`}>Identity</h3>
                 <div className="space-y-1.5">
                   <label className={`text-[10px] font-bold ${theme.colors.secondary} uppercase ml-1`}>Studio Alias</label>
                   <input type="text" value={userName} onChange={(e) => onUserNameChange(e.target.value)} placeholder="Enter Name..." className={`w-full bg-black/40 border ${theme.colors.border} rounded-xl py-3 px-4 text-sm ${theme.colors.textMain} outline-none transition-all`} />
                 </div>
              </section>

              <MilestoneBadge metrics={profile.metrics} theme={theme} />

              <InviteFriendsCard referralCode={profile.referralCode} theme={theme} onCopy={showToast} />

              <div className="flex flex-col items-center pt-8 border-t border-white/5 opacity-30 hover:opacity-100 transition-opacity">
                   <button onClick={onRerunOnboarding} className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-white mb-4">Re-run onboarding wizard</button>
              </div>
            </div>
          ) : (
            <AdminPanel theme={theme} currentUserId={currentUser?.id} />
          )}

        </div>
        <div className="hidden md:block p-6 border-t border-white/5 opacity-50"><div className="flex justify-center items-center gap-2"><div className={`w-1.5 h-1.5 rounded-full ${theme.colors.primary}`}></div><p className={`text-[10px] ${theme.colors.textSecondary} uppercase tracking-widest font-bold`}>Signalum Protocol Active</p></div></div>
      </div>
    </>
  );
};
