
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { SourcesPanel } from './components/SourcesPanel';
import { Visualizer } from './components/Visualizer';
import { ControlBar } from './components/ControlBar';
import { SplashScreen } from './components/SplashScreen';
import { ThemeSelector } from './components/ThemeSelector';
import { THEME_REGISTRY } from './themes/themeRegistry';
import { Background } from './components/Backgrounds';
import { OnboardingWizard } from './components/OnboardingWizard';
import { ResearchPanel } from './components/ResearchPanel';
import { useLiveAudio } from './hooks/useLiveAudio';
import { useUsage } from './hooks/useUsage';
import { Source, AudioStyle, ThemeId, PERSONA_REGISTRY, PersonaProfile, UserProfile, PersonalityTraits, NeonIntensity, PromptVersion, ExpressiveVoiceProfile, Theme, ResearchMetadata, ResearchSource } from './types';
import { getProfile, setProfile } from './utils/entitlements';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';
import { fetchUserEntitlements } from './lib/entitlements';
import { fetchUserReferralCode } from './lib/referrals';
import { GoogleGenAI } from "@google/genai";
import { DEFAULT_EXPRESSIVE_PROFILE } from './utils/expressiveEngine';

function buildSystemInstruction(
  userName: string, 
  persona: PersonaProfile, 
  isRevenueMode: boolean, 
  compiledContext: string, 
  personality: PersonalityTraits,
  voiceProfile: ExpressiveVoiceProfile | undefined
) {
  const formalityDesc = personality.formality > 75 ? "highly formal and sophisticated" : personality.formality < 25 ? "very casual, using slang and loose grammar" : "professional but approachable";
  
  // Base Humanizer Logic
  let humanizer = `
  CRITICAL SPEECH PATTERNS:
  1. DO NOT speak in perfect paragraphs. Speak like a real human thinking out loud.
  2. Use natural fillers naturally but not excessively (um, uh, like, you know) to simulate thinking time.
  3. Include micro-pauses "..." for dramatic effect or when switching complex thoughts.
  4. Vary your intonation. Don't be monotone. Be excited about insights, deeper/slower when explaining complex concepts.
  5. If interrupted, stop immediately.
  6. Use "Active Listening" phrases: "Right," "Exactly," "That makes sense."
  `;

  // Apply Expressive Voice Profile Modifiers
  if (voiceProfile) {
     const p = voiceProfile;
     
     // Teaching Bias
     if (p.teachingBias > 60) {
        humanizer += `\n7. TEACHING MODE: Structure complex answers clearly. Use framing like "Here's the key point." or "Simply put." Ensure steps are spoken distinctly.`;
     }
     
     // Warmth
     if (p.warmth > 60) {
        humanizer += `\n8. WARMTH: Be highly empathetic, use soft conversational openers, and validate the user's perspective frequently.`;
     } else if (p.warmth < 30) {
        humanizer += `\n8. COOLNESS: Maintain a detached, objective, and analytical tone.`;
     }

     // Speaker Boost (Confidence)
     if (p.speakerBoost) {
        humanizer += `\n9. CONFIDENCE: Speak with authority. Avoid hedging language like "I think" or "maybe".`;
     }

     // Pace & Pause
     const paceDesc = p.pace > 70 ? "fast, energetic" : p.pace < 30 ? "slow, deliberate" : "moderate conversational";
     const pauseDesc = p.pauseFrequency > 60 ? "frequent pauses for emphasis" : "fluid, continuous flow";
     humanizer += `\n\nDELIVERY SETTINGS:\n- Pace: ${paceDesc}\n- Pausing: ${pauseDesc}`;
  }

  const adaptiveLogic = personality.isAdaptive 
    ? "ADAPTIVE INTELLIGENCE: Dynamically shift tone between technical rigour and warm creative expansion based on the user's current topic intensity."
    : "";

  return `
    IDENTITY: You are Voxera, an elite neural companion by Signalum.
    USER_NAME: ${userName || "User"}.
    TONE: ${formalityDesc}.
    ENTHUSIASM_RATIO: ${personality.enthusiasm}%.
    ${adaptiveLogic}
    ${humanizer}
    
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
  
  // Initialize wizard based on persistence
  const [showWizard, setShowWizard] = useState(() => {
    return !localStorage.getItem('SIGNALUM_ONBOARDING_COMPLETED');
  });
  
  const [profile, setProfileState] = useState<UserProfile>(() => {
    const p = getProfile();
    if (!p.settings) {
      p.settings = { animationsEnabled: true, neonIntensity: 'medium', defaultModeId: 'mentor' };
    }
    return { ...p, entitlements: { ...p.entitlements, is_admin: true } };
  });

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isResearching, setIsResearching] = useState(false);
  const [discoveryStep, setDiscoveryStep] = useState<string>(''); // For loading UI
  const [discoveryInbox, setDiscoveryInbox] = useState<Source[]>([]);
  
  // Research Beast State
  const [researchData, setResearchData] = useState<ResearchMetadata | null>(null);
  const [isResearchPanelOpen, setIsResearchPanelOpen] = useState(false);

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

  // Load Voice Tuning Profiles
  const [expressiveProfiles] = useState<ExpressiveVoiceProfile[]>(() => {
    const saved = localStorage.getItem('SIGNALUM_VOICE_PROFILES');
    return saved ? JSON.parse(saved) : [DEFAULT_EXPRESSIVE_PROFILE];
  });

  const activeVoiceProfile = useMemo(() => {
    return expressiveProfiles.find(p => p.isActive) || DEFAULT_EXPRESSIVE_PROFILE;
  }, [expressiveProfiles]);

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false);
  const [currentThemeId, setCurrentThemeId] = useState<ThemeId>(() => (localStorage.getItem('SIGNALUM_THEME') as ThemeId) || 'midnight');
  
  const [toasts, setToasts] = useState<{id: number, message: string}[]>([]);
  const toastIdRef = useRef(0);
  const sessionStartTimeRef = useRef<number | null>(null);

  // Dynamic Theme Integration
  const [mergedThemeRegistry, setMergedThemeRegistry] = useState(THEME_REGISTRY);

  useEffect(() => {
    const customThemes = JSON.parse(localStorage.getItem('SIGNALUM_CUSTOM_THEMES') || '{}');
    setMergedThemeRegistry({ ...THEME_REGISTRY, ...customThemes });
  }, [isPanelOpen, isThemeSelectorOpen, showWizard]); // Refresh when panels open or wizard is active

  const theme = useMemo(() => mergedThemeRegistry[currentThemeId] || THEME_REGISTRY.midnight, [currentThemeId, mergedThemeRegistry]);

  const handleSplashComplete = useCallback(() => {
    setLoaded(true);
  }, []);

  const handleWizardComplete = () => {
    localStorage.setItem('SIGNALUM_ONBOARDING_COMPLETED', 'true');
    setShowWizard(false);
  };

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
    const customModes = JSON.parse(localStorage.getItem('SIGNALUM_CUSTOM_MODES') || '{}');
    const fullRegistry = { ...PERSONA_REGISTRY, ...customModes };
    const persona = fullRegistry[selectedStyle] || PERSONA_REGISTRY.mentor;
    
    return buildSystemInstruction(userName, persona, isRevenueMode, compiledContext, personality, activeVoiceProfile);
  }, [selectedStyle, userName, isRevenueMode, compiledContext, personality, activeVoiceProfile]);

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
    setDiscoveryInbox([]); // Clear previous
    setResearchData(null); // Clear previous research
    showToast(`Initializing Research Beast...`);
    
    try {
      setDiscoveryStep('Scanning Web Nodes...');
      await new Promise(r => setTimeout(r, 1200));

      setDiscoveryStep('Structuring Intelligence...');
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash", // Use 2.5-flash for better tool + structure support
        contents: `You are a deep research engine (Research Beast). Analyze the topic '${topic}'. Use Google Search to find authoritative information.
        
        Return a strict JSON object with this schema:
        {
          "assumptions": [{"text": "string", "type": "explicit" | "implicit"}],
          "claims": [{"claim": "string", "confidence": "high" | "medium" | "low", "rationale": "string"}],
          "nextSteps": [{"step": "string", "why": "string", "effort": "low" | "med" | "high"}],
          "sources": [{"title": "string", "url": "string", "snippet": "string", "provider": "retrieval"}]
        }
        
        Ensure "sources" are populated from the search results.
        CRITICAL: Output ONLY the valid JSON string. Do not use Markdown formatting, do not use code blocks.`,
        config: { 
          tools: [{ googleSearch: {} }],
          // responseMimeType: "application/json" // REMOVED: Incompatible with tools in current API version
        },
      });

      let jsonText = response.text || "{}";
      // Manually clean markdown if the model hallucinates it despite instructions
      jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();

      const metadata = JSON.parse(jsonText) as Partial<ResearchMetadata>;
      
      if (metadata.sources) {
        // Standardize source format for inbox
        const found: Source[] = metadata.sources.map((s: ResearchSource) => ({
          id: crypto.randomUUID(),
          title: s.title || `Intel: ${topic}`,
          url: s.url,
          content: "", 
          description: s.snippet || `Source discovered via Neural Scan.`,
          type: 'web',
          isActive: true
        }));
        
        // Remove duplicates based on URL
        const uniqueFound = found.filter((v,i,a)=>a.findIndex(t=>(t.url === v.url))===i).slice(0, 10);
        setDiscoveryInbox(uniqueFound);
      }

      // Populate Research Panel Data
      setResearchData({
        modeId: 'research_beast',
        topic,
        timestamp: Date.now(),
        assumptions: metadata.assumptions || [],
        claims: metadata.claims || [],
        nextSteps: metadata.nextSteps || [],
        sources: metadata.sources || []
      });

      setDiscoveryStep('Intelligence Ready');
      showToast(`Scan Complete. Research Beast Panel Updated.`);
      setIsResearchPanelOpen(true); // Auto-open panel on success

    } catch (err) {
      console.error("Research Failed:", err);
      showToast("Neural scan failure.");
    } finally {
      setIsResearching(false);
      setDiscoveryStep('');
    }
  };

  const handleImportSelected = (selectedIds: string[]) => {
    const toImport = discoveryInbox.filter(s => selectedIds.includes(s.id));
    setSources(prev => [...prev, ...toImport]);
    setDiscoveryInbox([]); // Clear inbox after import
    showToast(`${toImport.length} Nodes Synced.`);
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
    <div className={`flex h-screen w-full bg-black overflow-hidden relative selection:bg-blue-600/30`} style={{ color: theme.visualProfile.textPrimary }}>
      <Background themeId={currentThemeId} theme={theme} animationsEnabled={profile.settings.animationsEnabled} />
      
      {showWizard && (
        <OnboardingWizard 
          onComplete={handleWizardComplete} 
          theme={theme} 
          userPlan={usage?.plan || 'FREE'} 
          onThemeChange={setCurrentThemeId} 
          onUpgrade={() => {}} 
        />
      )}

      <ThemeSelector 
        currentTheme={theme} userPlan={profile.plan} onThemeChange={setCurrentThemeId} 
        onUpgrade={() => setIsPanelOpen(true)} isOpen={isThemeSelectorOpen} onClose={() => setIsThemeSelectorOpen(false)} entitlements={{...profile.entitlements, pro_themes: true}} 
        themeRegistry={mergedThemeRegistry}
      />

      <ResearchPanel 
        isOpen={isResearchPanelOpen} 
        onClose={() => setIsResearchPanelOpen(false)} 
        data={researchData} 
        theme={theme}
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
        discoveryStep={discoveryStep}
        status={status} // Pass status to SourcesPanel for telemetry
      />
      
      <main className="flex-1 flex flex-col relative z-10 w-full h-full">
         <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-20 pointer-events-none transition-all">
             <button onClick={() => setIsPanelOpen(true)} className="pointer-events-auto p-4 rounded-full bg-black/50 border border-white/5 hover:bg-white/10 text-white md:hidden backdrop-blur-2xl shadow-2xl active:scale-90 transition-all" style={{ borderColor: theme.visualProfile.borderColor }}>
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"/></svg>
             </button>
             <div className="flex items-center gap-4 pointer-events-auto ml-auto">
                 {/* Research Panel Toggle Button */}
                 <button 
                   onClick={() => setIsResearchPanelOpen(true)} 
                   className={`p-3.5 rounded-full bg-black/50 border border-white/5 hover:bg-white/10 text-white transition-all backdrop-blur-2xl shadow-xl active:scale-90 ${researchData ? 'animate-pulse border-emerald-500/50' : ''}`} 
                   style={{ borderColor: theme.visualProfile.borderColor }}
                   title="Open Research Beast Panel"
                 >
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                 </button>

                 <button onClick={() => setIsThemeSelectorOpen(true)} className="p-3.5 rounded-full bg-black/50 border border-white/5 hover:bg-white/10 text-white transition-all backdrop-blur-2xl shadow-xl active:scale-90" style={{ borderColor: theme.visualProfile.borderColor }}>
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
                 </button>
                 <div className={`flex items-center gap-3 bg-black/70 backdrop-blur-3xl px-6 py-3 rounded-full border border-white/5 shadow-2xl`} style={{ borderColor: theme.visualProfile.borderColor }}>
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
          <div key={toast.id} className="px-8 py-4 glass-morphism text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl animate-fade-in" style={{ borderColor: theme.colors.hexPrimary + '40', backgroundColor: theme.visualProfile.bgSurface }}>{toast.message}</div>
        ))}
      </div>
    </div>
  );
}
