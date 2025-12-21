
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { SourcesPanel } from './components/SourcesPanel';
import { Visualizer } from './components/Visualizer';
import { ControlBar } from './components/ControlBar';
import { SplashScreen } from './components/SplashScreen';
import { ThemeSelector } from './components/ThemeSelector';
import { THEME_REGISTRY } from './themes/themeRegistry';
import { Background } from './components/Backgrounds';
import { OnboardingWizard } from './components/OnboardingWizard';
import { useLiveAudio } from './hooks/useLiveAudio';
import { useUsage } from './hooks/useUsage';
import { Source, AudioStyle, ThemeId, PERSONA_REGISTRY, PersonaProfile, UserProfile, PersonalityTraits, NeonIntensity, PromptVersion } from './types';
import { getProfile, setProfile } from './utils/entitlements';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';
import { fetchUserEntitlements } from './lib/entitlements';
import { fetchUserReferralCode } from './lib/referrals';
import { GoogleGenAI } from "@google/genai";

function buildSystemInstruction(userName: string, persona: PersonaProfile, isRevenueMode: boolean, compiledContext: string, personality: PersonalityTraits) {
  const formalityDesc = personality.formality > 75 ? "highly formal and sophisticated" : personality.formality < 25 ? "relaxed and casual" : "professional";
  const humorDesc = personality.humor > 75 ? "witty, ironic and lighthearted" : personality.humor < 25 ? "serious, literal and stoic" : "neutral and balanced";
  const creativityDesc = personality.creativity > 75 ? "highly abstract and visionary" : personality.creativity < 25 ? "strictly literal and grounded" : "standard";
  
  const adaptiveLogic = personality.isAdaptive 
    ? "ADAPTIVE INTELLIGENCE: Dynamically shift tone between technical rigour and warm creative expansion based on the user's current topic intensity."
    : "";

  return `
    IDENTITY: You are Voxera, an elite neural companion by Signalum.
    USER_NAME: ${userName || "User"}.
    TONE: ${formalityDesc}, ${humorDesc}. 
    CREATIVITY_INDEX: ${creativityDesc}.
    ENTHUSIASM_RATIO: ${personality.enthusiasm}%.
    ${adaptiveLogic}
    PERSONA: ${persona.name}. 
    PERSONA_RULES: ${persona.rules.join(". ")}
    REVENUE_MODE: ${isRevenueMode ? 'ACTIVE. Focus exclusively on strategic ROI, systems efficiency, and market logic.' : 'INACTIVE.'}
    GROUNDING_CONTEXT: Use the following source data as your absolute source of truth. Do not hallucinate. 
    ---
    ${compiledContext || "No context nodes currently established."}
    ---
    `.trim();
}

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  
  const [profile, setProfileState] = useState<UserProfile>(() => {
    const p = getProfile();
    if (!p.settings) {
      p.settings = { animationsEnabled: true, neonIntensity: 'medium', defaultModeId: 'mentor' };
    }
    return { ...p, entitlements: { ...p.entitlements, is_admin: true } };
  });

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isResearching, setIsResearching] = useState(false);
  const [discoveryInbox, setDiscoveryInbox] = useState<Source[]>([]);

  const [sources, setSources] = useState<Source[]>(() => {
    const saved = localStorage.getItem('SIGNALUM_SOURCES');
    return saved ? JSON.parse(saved) : [{
      id: '1',
      title: 'Studio Initialization',
      content: 'Voxera is online. Neural workspace ready.',
      type: 'text',
      isActive: true
    }];
  });
  
  const [selectedStyle, setSelectedStyle] = useState<AudioStyle>(() => (localStorage.getItem('SIGNALUM_STYLE') as AudioStyle) || 'mentor');
  const [isRevenueMode, setIsRevenueMode] = useState(() => localStorage.getItem('SIGNALUM_REVENUE_MODE') === 'true');
  const [userName, setUserName] = useState(() => localStorage.getItem('SIGNALUM_USER_NAME') || 'Neural User');
  
  const [voiceName, setVoiceName] = useState(() => localStorage.getItem('SIGNALUM_VOICE_NAME') || 'Zephyr');
  const [personality, setPersonality] = useState<PersonalityTraits>(() => {
    const saved = localStorage.getItem('SIGNALUM_PERSONALITY');
    return saved ? JSON.parse(saved) : { formality: 50, humor: 50, creativity: 50, enthusiasm: 50, isAdaptive: true };
  });

  // Enterprise Versioning State
  const [promptVersions, setPromptVersions] = useState<PromptVersion[]>(() => {
    const saved = localStorage.getItem('SIGNALUM_VERSIONS');
    return saved ? JSON.parse(saved) : [];
  });

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false);
  const [currentThemeId, setCurrentThemeId] = useState<ThemeId>(() => (localStorage.getItem('SIGNALUM_THEME') as ThemeId) || 'midnight');
  
  const [toasts, setToasts] = useState<{id: number, message: string}[]>([]);
  const toastIdRef = useRef(0);
  const sessionStartTimeRef = useRef<number | null>(null);

  const theme = useMemo(() => THEME_REGISTRY[currentThemeId] || THEME_REGISTRY.midnight, [currentThemeId]);

  const handleSplashComplete = useCallback(() => {
    setLoaded(true);
  }, []);

  const trackVersion = useCallback((newInstruction: string, summary: string) => {
    setPromptVersions(prev => {
      const nextNum = prev.length + 1;
      const newVersion: PromptVersion = {
        id: crypto.randomUUID(),
        versionNumber: nextNum,
        timestamp: Date.now(),
        author: 'user',
        summary,
        instruction: newInstruction,
        personality: { ...personality },
        modeId: selectedStyle
      };
      const next = [newVersion, ...prev].slice(0, 50); 
      localStorage.setItem('SIGNALUM_VERSIONS', JSON.stringify(next));
      return next;
    });
  }, [personality, selectedStyle]);

  const compiledContext = useMemo(() => {
    return sources.filter(s => s.isActive).map(s => `[SOURCE: ${s.title}]\n${s.content || s.description}`).join('\n\n').substring(0, 7000);
  }, [sources]);

  const systemInstruction = useMemo(() => {
    const persona = PERSONA_REGISTRY[selectedStyle] || PERSONA_REGISTRY.mentor;
    return buildSystemInstruction(userName, persona, isRevenueMode, compiledContext, personality);
  }, [selectedStyle, userName, isRevenueMode, compiledContext, personality]);

  const lastInstructionRef = useRef(systemInstruction);
  useEffect(() => {
    if (lastInstructionRef.current !== systemInstruction) {
      trackVersion(systemInstruction, `Sync: ${selectedStyle} configuration changed.`);
      lastInstructionRef.current = systemInstruction;
    }
  }, [systemInstruction, trackVersion, selectedStyle]);

  useEffect(() => {
    localStorage.setItem('SIGNALUM_SOURCES', JSON.stringify(sources));
  }, [sources]);

  useEffect(() => {
    localStorage.setItem('SIGNALUM_STYLE', selectedStyle);
    localStorage.setItem('SIGNALUM_REVENUE_MODE', String(isRevenueMode));
    localStorage.setItem('SIGNALUM_USER_NAME', userName);
    localStorage.setItem('SIGNALUM_THEME', currentThemeId);
    localStorage.setItem('SIGNALUM_VOICE_NAME', voiceName);
    localStorage.setItem('SIGNALUM_PERSONALITY', JSON.stringify(personality));
  }, [selectedStyle, isRevenueMode, userName, currentThemeId, voiceName, personality]);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      const mockUser = localStorage.getItem('SIGNALUM_MOCK_USER');
      if (mockUser) setCurrentUser(JSON.parse(mockUser));
      return;
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user ?? null;
      setCurrentUser(user);
      if (user) syncUserEntitlements(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      setCurrentUser(user);
      if (user) syncUserEntitlements(user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const syncUserEntitlements = async (user: any) => {
    try {
      const entitlements = await fetchUserEntitlements(user.id);
      const referralCode = await fetchUserReferralCode(user.id);
      setProfileState(prev => {
        const next = { 
          ...prev, 
          entitlements: { ...entitlements, is_admin: true },
          referralCode: referralCode || prev.referralCode
        };
        setProfile(next);
        return next;
      });
    } catch (e) {
      console.error("Studio Sync Error:", e);
    }
  };

  const handleUpdateSettings = (settings: any) => {
    setProfileState(prev => {
      const next = { ...prev, settings: { ...prev.settings, ...settings } };
      setProfile(next);
      return next;
    });
  };

  const showToast = useCallback((message: string) => {
    const id = ++toastIdRef.current;
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const handleBulkDiscover = async (topic: string) => {
    if (!topic.trim()) return;
    setIsResearching(true);
    showToast(`Initializing Neural Scan...`);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Research authoritative sources for: "${topic}". Return top 10 articles with titles and URLs.`,
        config: { tools: [{ googleSearch: {} }] },
      });

      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks && chunks.length > 0) {
        const found: Source[] = [];
        chunks.forEach((chunk: any) => {
          if (chunk.web && chunk.web.uri) {
            found.push({
              id: crypto.randomUUID(),
              title: chunk.web.title || `Intel: ${topic}`,
              url: chunk.web.uri,
              content: "", 
              description: `Source discovered via Neural Scan.`,
              type: 'web',
              isActive: true
            });
          }
        });
        setDiscoveryInbox(found.slice(0, 10));
        setSources(prev => [...prev, ...found.slice(0, 5)]); 
        showToast(`Scan Complete. 5 nodes integrated.`);
      }
    } catch (err) {
      showToast("Neural scan failure.");
    } finally {
      setIsResearching(false);
    }
  };

  const handleImportSelected = (selectedIds: string[]) => {
    const toImport = discoveryInbox.filter(s => selectedIds.includes(s.id));
    setSources(prev => [...prev, ...toImport]);
    setDiscoveryInbox([]);
    showToast(`Nodes synced.`);
  };

  const handleRollback = (version: PromptVersion) => {
    setSelectedStyle(version.modeId);
    setPersonality(version.personality);
    showToast(`Reverted to prompt version ${version.versionNumber}.`);
  };

  const { status, isMuted, volume, connect, disconnect, toggleMute } = useLiveAudio({ 
    sources, voiceName, audioStyle: selectedStyle, userName, isRevenueMode, apiKey: process.env.API_KEY || "", 
    customSystemInstruction: systemInstruction 
  });

  const { usage, commitVoiceTime } = useUsage(currentUser?.id, status);

  useEffect(() => {
    if (status === 'connected') {
      sessionStartTimeRef.current = Date.now();
    } else if (status === 'disconnected' && sessionStartTimeRef.current) {
      commitVoiceTime((Date.now() - sessionStartTimeRef.current) / 1000);
      sessionStartTimeRef.current = null;
    }
  }, [status, commitVoiceTime]);

  if (!loaded) return <SplashScreen onComplete={handleSplashComplete} />;

  return (
    <div className={`flex h-screen w-full bg-black overflow-hidden relative selection:bg-blue-600/30`}>
      <Background themeId={currentThemeId} animationsEnabled={profile.settings.animationsEnabled} />
      
      {showWizard && (
        <OnboardingWizard 
          onComplete={() => setShowWizard(false)} 
          theme={theme} 
          userPlan={usage?.plan || 'FREE'} 
          onThemeChange={setCurrentThemeId} 
          onUpgrade={() => {}} 
        />
      )}

      <ThemeSelector 
        currentTheme={theme} userPlan={profile.plan} onThemeChange={setCurrentThemeId} 
        onUpgrade={() => setIsPanelOpen(true)} isOpen={isThemeSelectorOpen} onClose={() => setIsThemeSelectorOpen(false)} entitlements={{...profile.entitlements, pro_themes: true}} 
      />

      <SourcesPanel 
        sources={sources} onAddSource={(s) => setSources(prev => [...prev, {...s, isActive: true}])} 
        onRemoveSource={(id) => setSources(s => s.filter(x => x.id !== id))}
        onToggleSource={(id) => setSources(s => s.map(x => x.id === id ? {...x, isActive: !x.isActive} : x))}
        disabled={status === 'connected'} isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)}
        selectedStyle={selectedStyle} onStyleChange={setSelectedStyle}
        userName={userName} onUserNameChange={setUserName}
        isRevenueMode={isRevenueMode} onRevenueModeChange={setIsRevenueMode}
        theme={theme} userPlan={usage?.plan || 'FREE'} onUpgrade={() => {}} onStartTrial={() => {}}
        trial={{ isActive: false, startedAt: null, expiresAt: null }}
        personaRegistry={PERSONA_REGISTRY} onboardingStep={0} profile={profile} showToast={showToast}
        currentUser={currentUser} usage={usage} onBulkDiscover={handleBulkDiscover} isResearchingGlobal={isResearching}
        discoveryInbox={discoveryInbox} onImportSelected={handleImportSelected} onClearDiscovery={() => setDiscoveryInbox([])}
        voiceName={voiceName} onVoiceNameChange={setVoiceName}
        personality={personality} onPersonalityChange={setPersonality}
        onUpdateSettings={handleUpdateSettings}
        promptVersions={promptVersions} onRollback={handleRollback}
        onOpenWizard={() => setShowWizard(true)}
      />
      
      <main className="flex-1 flex flex-col relative z-10 w-full h-full">
         <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-20 pointer-events-none transition-all">
             <button onClick={() => setIsPanelOpen(true)} className="pointer-events-auto p-4 rounded-full bg-black/50 border border-white/5 hover:bg-white/10 text-white md:hidden backdrop-blur-2xl shadow-2xl active:scale-90 transition-all">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"/></svg>
             </button>
             <div className="flex items-center gap-4 pointer-events-auto ml-auto">
                 <button onClick={() => setIsThemeSelectorOpen(true)} className="p-3.5 rounded-full bg-black/50 border border-white/5 hover:bg-white/10 text-white transition-all backdrop-blur-2xl shadow-xl active:scale-90">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
                 </button>
                 <div className={`flex items-center gap-3 bg-black/70 backdrop-blur-3xl px-6 py-3 rounded-full border border-white/5 shadow-2xl`}>
                     <div className={`w-2 h-2 rounded-full transition-all duration-700 ${status === 'connected' ? 'animate-neon-pulse shadow-[0_0_12px_currentColor]' : ''}`} style={{ backgroundColor: status === 'connected' ? theme.colors.hexPrimary : status === 'connecting' ? '#fbbf24' : status === 'error' ? '#ef4444' : '#334155' }}></div>
                     <span className={`text-[10px] font-black tracking-[0.3em] uppercase font-display text-slate-400`}>{status === 'connected' ? 'NEURAL LIVE' : status === 'connecting' ? 'SYNCING' : 'STANDBY'}</span>
                 </div>
             </div>
         </div>
         
         <div className="flex-1 w-full h-full flex flex-col items-center justify-center relative">
            <Visualizer volume={volume} isActive={status === 'connected'} isMuted={isMuted} theme={theme} />
         </div>
      </main>

      <ControlBar status={status} isMuted={isMuted} onConnect={connect} onDisconnect={disconnect} onToggleMute={toggleMute} theme={theme} userPlan={usage?.plan || 'FREE'} onUpgrade={() => {}} onboardingStep={0} />

      <div className="fixed bottom-36 left-1/2 -translate-x-1/2 z-[150] flex flex-col items-center gap-3 pointer-events-none w-full max-w-sm">
        {toasts.map(toast => (
          <div key={toast.id} className="px-8 py-4 glass-morphism text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl animate-fade-in" style={{ borderColor: theme.colors.hexPrimary + '40' }}>{toast.message}</div>
        ))}
      </div>
    </div>
  );
}
