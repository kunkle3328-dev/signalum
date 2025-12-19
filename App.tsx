
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { SourcesPanel } from './components/SourcesPanel';
import { Visualizer } from './components/Visualizer';
import { ControlBar } from './components/ControlBar';
import { SplashScreen } from './components/SplashScreen';
import { ThemeSelector } from './components/ThemeSelector';
import { THEME_REGISTRY } from './themes/themeRegistry';
import { Background } from './components/Backgrounds';
import { OnboardingWizard } from './components/OnboardingWizard';
import { FounderWelcomeCard } from './components/FounderWelcomeCard';
import { useLiveAudio } from './hooks/useLiveAudio';
import { Source, AudioStyle, ThemeId, PersonaProfile, SpeakingPace, PauseDensity, VoiceWarmth, VoiceDirectness, UserPlan, TrialState, BRAND_NAME, BRAND_PRONUNCIATION, UserProfile } from './types';
import { GoogleGenAI, Type } from "@google/genai";
import { getProfile, updateProfile, INITIAL_ENTITLEMENTS as LOCAL_INITIAL_ENTITLEMENTS } from './utils/entitlements';
import { trackSession, trackMinute, trackDiscover } from './utils/metrics';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';
import { fetchUserEntitlements } from './lib/entitlements';

const PERSONA_REGISTRY: Record<AudioStyle, PersonaProfile> = {
  entrepreneur: {
    id: 'entrepreneur',
    name: 'Business Architect',
    category: 'MONEY',
    rules: ['Think like a venture partner', 'Focus on product-market fit', 'Speak in terms of traction and moats'],
    responseFormat: 'Strategic spoken overview with actionable business phases.',
    voiceHints: 'Confident, strategic, executive.',
    isPremium: true
  },
  money_engine: {
    id: 'money_engine',
    name: 'The Closer',
    category: 'MONEY',
    rules: ['Maximize conversion velocity', 'Cut non-essential features', 'Focus on immediate cashflow'],
    responseFormat: 'Rapid-fire strategy, direct and high-energy.',
    voiceHints: 'Fast, assertive, focused.',
    isPremium: true
  },
  websites: {
    id: 'websites',
    name: 'Tech Architect',
    category: 'MONEY',
    rules: ['Focus on system scalability', 'Technical feasibility first', 'Suggest modern SaaS stacks'],
    responseFormat: 'Technical roadmap with clear logical dependencies.',
    voiceHints: 'Precise, logical, analytical.',
    isPremium: true
  },
  plr: {
    id: 'plr',
    name: 'Licensing Expert',
    category: 'MONEY',
    rules: ['Think about resale rights', 'Bundle for high perceived value', 'Focus on white-label potential'],
    responseFormat: 'Marketing-centric advice for product creators.',
    voiceHints: 'Knowledgeable, commercial.',
    isPremium: true
  },
  podcast: {
    id: 'podcast',
    name: 'Studio Host',
    category: 'CONTENT',
    rules: ['Bridge topics with stories', 'Invite the user to think deeply', 'Maintain a rhythmic curiosity'],
    responseFormat: 'Narrative-driven, highly conversational expert dialogue.',
    voiceHints: 'Warm, wity, engaging cadence.',
    isPremium: true
  },
  creative: {
    id: 'creative',
    name: 'Creative Futurist',
    category: 'CONTENT',
    rules: ['Explore abstract possibilities', 'Use poetic metaphors', 'Challenge literal thinking'],
    responseFormat: 'Inspirational prose that paints a picture of the future.',
    voiceHints: 'Dreamy, thoughtful, expansive.'
  },
  expert_guide: {
    id: 'expert_guide',
    name: 'Expert Guide',
    category: 'LEARN',
    rules: ['Mastery of nuance', 'Cite sources explicitly but naturally', 'Explain complexity with ease'],
    responseFormat: 'Deep professional summaries with source-grounded insights.',
    voiceHints: 'Calm, authoritative, grounded.'
  },
  deep_learning: {
    id: 'deep_learning',
    name: 'Professor',
    category: 'LEARN',
    rules: ['First-principles thinking', 'Deep logical inquiry', 'Checks for conceptual understanding'],
    responseFormat: 'Academic-level spoken deep dives.',
    voiceHints: 'Slow, deliberate, methodical.',
    isPremium: true
  },
  study: {
    id: 'study',
    name: 'Socratic Tutor',
    category: 'LEARN',
    rules: ['Teach by questioning', 'Provide encouraging feedback', 'Break down walls, not just problems'],
    responseFormat: 'Interactive, dialectic-style support.',
    voiceHints: 'Encorgaging, bright, energetic.'
  },
  summary: {
    id: 'summary',
    name: 'Executive Briefer',
    category: 'LEARN',
    rules: ['Absolute brevity', 'Impact over process', 'Focus on the "So What?"'],
    responseFormat: 'Concise, spoken executive summaries.',
    voiceHints: 'Efficient, clear, punchy.'
  },
  casual: { id: 'casual', name: 'Studio Companion', category: 'CONTENT', rules: ['Relaxed energy', 'Authentic presence', 'Low friction conversation'], responseFormat: 'Casual, human flow.', voiceHints: 'Chill, warm.' },
  interview: { id: 'interview', name: 'Lead Journalist', category: 'CONTENT', rules: ['Evidence based', 'Probing questions', 'Neutral stance'], responseFormat: 'Direct interview style.', voiceHints: 'Professional, sharp.', isPremium: true },
  heated_debate: { id: 'heated_debate', name: 'The Skeptic', category: 'CONTENT', rules: ['Challenge assumptions', 'Aggressive logic', 'Devil\'s advocacy'], responseFormat: 'High-tension debate counters.', voiceHints: 'Intense, fast, provocative.', isPremium: true },
  debate: { id: 'debate', name: 'Critical Thinker', category: 'LEARN', rules: ['Balanced perspective', 'Fair inquiry', 'Exploration of opposites'], responseFormat: 'Nuanced logical comparison.', voiceHints: 'Logical, balanced.' }
};

const emitEvent = (eventName: string, data: any = {}) => {
  console.log(`[Signalum Event] ${eventName}:`, data);
};

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [showFounderWelcome, setShowFounderWelcome] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(() => getProfile());
  const [onboardingStep, setOnboardingStep] = useState(() => parseInt(localStorage.getItem('SIGNALUM_ONBOARDING') || '0'));
  
  // Auth State
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [sources, setSources] = useState<Source[]>(() => {
    const saved = localStorage.getItem('SIGNALUM_SOURCES');
    return saved ? JSON.parse(saved) : [
      {
        id: '1',
        title: `${BRAND_NAME} Welcome Guide`,
        content: `Welcome to ${BRAND_NAME}. I am Voxera, your neural studio intelligence. To begin, connect our studio link and speak naturally.`,
        type: 'text',
        isActive: true
      }
    ];
  });
  
  const [selectedVoice] = useState('Zephyr'); 
  const [selectedStyle, setSelectedStyle] = useState<AudioStyle>(() => (localStorage.getItem('SIGNALUM_STYLE') as AudioStyle) || 'study');
  const [isRevenueMode, setIsRevenueMode] = useState(() => localStorage.getItem('SIGNALUM_REVENUE_MODE') === 'true');
  const [userName, setUserName] = useState(() => localStorage.getItem('SIGNALUM_USER_NAME') || '');
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false);
  const [currentThemeId, setCurrentThemeId] = useState<ThemeId>(() => (localStorage.getItem('SIGNALUM_THEME') as ThemeId) || 'midnight');

  const [speakingPace, setSpeakingPace] = useState<SpeakingPace>(() => (localStorage.getItem('SIGNALUM_PACE') as SpeakingPace) || 'normal');
  const [pauseDensity, setPauseDensity] = useState<PauseDensity>(() => (localStorage.getItem('SIGNALUM_PAUSES') as PauseDensity) || 'medium');
  const [warmth, setWarmth] = useState<VoiceWarmth>(() => (localStorage.getItem('SIGNALUM_WARMTH') as VoiceWarmth) || 'natural');
  const [directness, setDirectness] = useState<VoiceDirectness>(() => (localStorage.getItem('SIGNALUM_DIRECTNESS') as VoiceDirectness) || 'conversational');
  
  const [toasts, setToasts] = useState<{id: number, message: string}[]>([]);
  const toastIdRef = useRef(0);

  const theme = useMemo(() => THEME_REGISTRY[currentThemeId] || THEME_REGISTRY.midnight, [currentThemeId]);

  // Auth & Entitlements Sync
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    // Add .catch to suppress unhandled promise rejections if network fails
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setCurrentUser(session?.user ?? null);
        if (session?.user) syncUserEntitlements(session.user);
      })
      .catch(() => {
        // Silently fail if auth endpoint is unreachable
        setCurrentUser(null);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      setCurrentUser(user);
      if (user) syncUserEntitlements(user);
      else setProfile(prev => ({ ...prev, entitlements: LOCAL_INITIAL_ENTITLEMENTS }));
    });

    return () => subscription.unsubscribe();
  }, []);

  const syncUserEntitlements = async (user: any) => {
    if (!isSupabaseConfigured()) return;

    try {
      // 1. Upsert profile so lookup by email works for admin
      await supabase.from('user_profiles').upsert({ user_id: user.id, email: user.email }, { onConflict: 'user_id' });
      
      // 2. Fetch real-time resolved entitlements
      const entitlements = await fetchUserEntitlements(user.id);
      
      setProfile(prev => {
        const next = { ...prev, entitlements };
        localStorage.setItem('SIGNALUM_PLAN', entitlements.pro_access ? 'PRO' : 'FREE');
        return next;
      });
    } catch (e) {
      console.error("Signalum Auth Sync Error:", e);
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    const vp = theme.visualProfile;
    root.style.setProperty('--bg-main', vp.bgMain);
    root.style.setProperty('--bg-surface', vp.bgSurface);
    root.style.setProperty('--text-primary', vp.textPrimary);
    root.style.setProperty('--text-secondary', vp.textSecondary);
    root.style.setProperty('--accent', vp.accent);
    root.style.setProperty('--glass-blur', vp.glassBlur);
    root.style.setProperty('--glass-opacity', vp.glassOpacity);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('SIGNALUM_SOURCES', JSON.stringify(sources));
    localStorage.setItem('SIGNALUM_STYLE', selectedStyle);
    localStorage.setItem('SIGNALUM_REVENUE_MODE', String(isRevenueMode));
    localStorage.setItem('SIGNALUM_USER_NAME', userName);
    localStorage.setItem('SIGNALUM_THEME', currentThemeId);
    localStorage.setItem('SIGNALUM_PACE', speakingPace);
    localStorage.setItem('SIGNALUM_PAUSES', pauseDensity);
    localStorage.setItem('SIGNALUM_WARMTH', warmth);
    localStorage.setItem('SIGNALUM_DIRECTNESS', directness);
    localStorage.setItem('SIGNALUM_ONBOARDING', onboardingStep.toString());
  }, [sources, selectedStyle, isRevenueMode, userName, currentThemeId, speakingPace, pauseDensity, warmth, directness, onboardingStep]);

  const showToast = useCallback((message: string) => {
    const id = ++toastIdRef.current;
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const handleStartTrial = useCallback(() => {
    showToast("Login to Studio to manage memberships.");
    setIsPanelOpen(true);
  }, [showToast]);

  const handleUpgrade = useCallback(() => {
    showToast("Redirecting to Studio Billing...");
  }, [showToast]);

  const compiledContext = useMemo(() => {
    const active = sources.filter(s => s.isActive);
    if (active.length === 0) return "No active sources. Rely on your internal studio training while staying in persona.";
    
    let text = "### AUTHORITATIVE SOURCE DATA (GROUNDING TRUTH):\n";
    active.forEach((s, i) => {
      text += `[SOURCE ${i+1}: ${s.title}]\n`;
      if (s.url) text += `URL: ${s.url}\n`;
      text += `${s.content || s.description || '[Source content unavailable]'}\n\n`;
    });
    return text.substring(0, 20000);
  }, [sources]);

  const systemInstruction = useMemo(() => {
    const profileP = PERSONA_REGISTRY[selectedStyle];
    const paceVal = speakingPace === 'slow' ? '135-150' : speakingPace === 'fast' ? '180-200' : '155-170';
    const pauseVal = pauseDensity === 'high' ? 'frequent, deep pauses of 600-1000ms' : pauseDensity === 'low' ? 'minimal pauses' : 'natural pauses of 300-500ms';
    const warmthVal = warmth === 'cozy' ? 'warm, intimate, and comforting' : warmth === 'crisp' ? 'professional, analytical, and sharp' : 'natural and authentically human';
    const directnessVal = directness === 'structured' ? 'organized with logical signposts' : 'flowing and organic';

    const studioDirective = `
    ### THE STUDIO VOICE DIRECTIVE (ONE-ON-ONE DIALOGUE)
    Your name is Voxera. You are a high-level expert in a professional studio, speaking LIVE to ${userName || 'the user'} through the ${BRAND_NAME} interface.
    Your delivery must be indistinguishable from a real person who is thinking as they speak.

    PRONUNCIATION:
    - ${BRAND_NAME} = "${BRAND_PRONUNCIATION}" (signal + um; stress on SIG).
    - Use this pronunciation strictly when saying the brand name.

    PERFORMANCE RULES:
    1. NEVER "READ" TEXT. You are SHARING IDEAS.
    2. IDENTITY: You are Voxera. You represent the pinnacle of ${BRAND_NAME}'s studio intelligence.
    3. PACING: Aim for ${paceVal} words per minute. Vary speed naturally.
    4. PAUSING: Use ${pauseVal}. Pause when transitioning between complex ideas.
    5. LANGUAGE SHAPING: Use short, punchy sentences. Use conversational contractions (don't, can't, it's). 
    6. INTERRUPTIONS: Yield instantly. Stop talking the moment ${userName || 'the user'} speaks.
    7. TONE & WARMTH: Your presence is ${warmthVal}. You are ${directnessVal}.
    8. HUMAN CUES: Use very sparse human cues (inhale before a point, a soft "Right..." or "Hmm").

    THINKING DISCIPLINE (${BRAND_NAME} style):
    - Identify the core "So What?" of the current topic.
    - Ground every factual claim in the active sources provided. 
    - Reference sources naturally ("As the document mentions...", "In that guide you shared...").
    `;

    return `
    ${studioDirective}
    CURRENT STUDIO ROLE: ${profileP.name}
    OPERATING RULES:
    ${profileP.rules.map(r => `- ${r}`).join('\n')}
    ${isRevenueMode ? '### REVENUE VELOCITY OVERRIDE: prioritize action, ROI, and direct answers above all else. ###' : ''}
    ### ACTIVE CONTEXT ###
    ${compiledContext}
    `;
  }, [selectedStyle, userName, isRevenueMode, compiledContext, speakingPace, pauseDensity, warmth, directness]);

  const handleSplashComplete = useCallback(() => {
    setLoaded(true);
    const hasOnboarded = localStorage.getItem('signalum_onboarding_v1') === 'done';
    if (!hasOnboarded) {
      setShowWizard(true);
      emitEvent('onboarding_started');
    } else {
      if (profile.entitlements.founders_badge && localStorage.getItem('signalum_founder_welcome_shown') !== 'true') {
        setShowFounderWelcome(true);
      }
    }
  }, [profile.entitlements.founders_badge]);

  const handleOnboardingComplete = (action?: 'talk' | 'source') => {
    localStorage.setItem('signalum_onboarding_v1', 'done');
    setShowWizard(false);
    setOnboardingStep(2); 
    emitEvent('onboarding_completed', { action });
    if (action === 'source') setIsPanelOpen(true);
    
    if (profile.entitlements.founders_badge && localStorage.getItem('signalum_founder_welcome_shown') !== 'true') {
      setShowFounderWelcome(true);
    }
  };

  const handleFounderWelcomeClose = () => {
    localStorage.setItem('signalum_founder_welcome_shown', 'true');
    setShowFounderWelcome(false);
  };

  const { status, isMuted, volume, connect, disconnect, toggleMute } = useLiveAudio({ 
    sources, voiceName: selectedVoice, audioStyle: selectedStyle, userName, isRevenueMode, apiKey: "", 
    customSystemInstruction: systemInstruction 
  });

  // Minute Tracker Hook
  useEffect(() => {
    if (status === 'connected') {
      const interval = setInterval(() => {
        trackMinute();
        setProfile(getProfile());
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [status]);

  useEffect(() => {
    if (onboardingStep === 1 && volume.model > 0.1) {
      setOnboardingStep(2);
      emitEvent('first_conversation_successful');
    }
  }, [volume.model, onboardingStep]);

  const handleStartConversation = useCallback(() => {
    connect();
    trackSession();
    setProfile(getProfile());
    if (onboardingStep === 0) setOnboardingStep(1);
  }, [connect, onboardingStep]);

  const handleAddSource = (source: Source) => {
    if (!profile.entitlements.pro_access && sources.length >= 3) {
      showToast("Free Workspace Capacity reached. Use your 7-day Pro Trial to expand.");
      return;
    }
    setSources(prev => {
      if (source.url && prev.some(s => s.url === source.url)) {
          showToast("Context already mapped.");
          return prev;
      }
      return [...prev, { ...source, isActive: true }];
    });
    emitEvent('source_added', { type: source.type });
    if (onboardingStep === 2) setOnboardingStep(3);
  };

  const handleRemoveSource = (id: string) => setSources(prev => prev.filter(s => s.id !== id));
  const handleToggleSource = (id: string) => setSources(prev => prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));

  const handleBulkDiscover = async (topic: string, limit: number = 10) => {
    const finalLimit = !profile.entitlements.pro_access ? 3 : limit;
    if (!profile.entitlements.pro_access && limit > 3) showToast("Discovery Node: restricted on Free plan.");

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Research up to ${finalLimit} high-quality, diverse web sources regarding: "${topic}". Provide a JSON array of objects with keys: "title", "url", and "snippet".`,
            config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            url: { type: Type.STRING },
                            snippet: { type: Type.STRING }
                        },
                        required: ["title", "url", "snippet"]
                    }
                }
            }
        });

        const results = JSON.parse(response.text);
        if (Array.isArray(results)) {
            showToast(`Linking ${results.length} ${BRAND_NAME} sources...`);
            trackDiscover();
            setProfile(getProfile());
            for (const res of results) {
                handleAddSource({
                    id: Math.random().toString(36).substr(2, 9),
                    title: res.title,
                    url: res.url,
                    content: '',
                    description: res.snippet,
                    type: 'web',
                    isActive: true
                });
            }
        }
    } catch (e) {
        showToast(`${BRAND_NAME} Research Node error.`);
    }
  };

  const handleRerunOnboarding = () => {
    localStorage.removeItem('signalum_onboarding_v1');
    setShowWizard(true);
  };

  const activeSourceCount = sources.filter(s => s.isActive).length;
  const currentTopic = useMemo(() => {
    if (onboardingStep === 0) return `Welcome to ${BRAND_NAME}`;
    if (onboardingStep === 1) return "Connecting Voxera...";
    if (activeSourceCount > 0) return sources.filter(s => s.isActive)[activeSourceCount - 1].title;
    return 'Neural Studio Active';
  }, [onboardingStep, activeSourceCount, sources]);

  if (!loaded) return <SplashScreen onComplete={handleSplashComplete} />;

  return (
    <div className="flex h-screen w-full bg-[#000000] overflow-hidden font-sans text-gray-100 relative selection:bg-blue-600/30">
      <Background themeId={currentThemeId} />
      
      {showWizard && (
        <OnboardingWizard 
          theme={theme} 
          userPlan={profile.plan}
          onThemeChange={setCurrentThemeId}
          onUpgrade={handleUpgrade}
          onComplete={handleOnboardingComplete} 
        />
      )}

      <FounderWelcomeCard isOpen={showFounderWelcome} onClose={handleFounderWelcomeClose} theme={theme} />
      
      <SourcesPanel 
        sources={sources} 
        onAddSource={handleAddSource} 
        onRemoveSource={handleRemoveSource}
        onToggleSource={handleToggleSource}
        disabled={status === 'connected' || status === 'connecting'} 
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        selectedStyle={selectedStyle}
        onStyleChange={(s) => {
          const persona = PERSONA_REGISTRY[s];
          if (persona.isPremium && !profile.entitlements.pro_access) {
            showToast("Persona Restricted: PRO license required.");
            return;
          }
          setSelectedStyle(s);
        }}
        userName={userName}
        onUserNameChange={setUserName}
        isRevenueMode={isRevenueMode}
        onRevenueModeChange={(e) => {
          if (!profile.entitlements.pro_access) {
            showToast(`Strategic velocity mode restricted to ${BRAND_NAME} PRO.`);
            return;
          }
          setIsRevenueMode(e);
        }}
        theme={theme}
        userPlan={profile.plan}
        onUpgrade={handleUpgrade}
        onStartTrial={handleStartTrial}
        trial={{ isActive: profile.entitlements.pro_access, startedAt: null, expiresAt: null }}
        onBulkDiscover={handleBulkDiscover}
        personaRegistry={PERSONA_REGISTRY}
        onboardingStep={onboardingStep}
        onRerunOnboarding={handleRerunOnboarding}
        profile={profile}
        showToast={showToast}
        currentUser={currentUser}
      />
      
      <ThemeSelector 
        currentTheme={theme} 
        userPlan={profile.plan} 
        onThemeChange={setCurrentThemeId} 
        onUpgrade={handleUpgrade} 
        isOpen={isThemeSelectorOpen} 
        onClose={() => setIsThemeSelectorOpen(false)} 
        entitlements={profile.entitlements}
      />

      <main className="flex-1 flex flex-col relative z-10 w-full h-full">
        <div className={`absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-start z-20 pointer-events-none transition-all`}>
            <button onClick={() => setIsPanelOpen(true)} className={`pointer-events-auto p-3.5 rounded-full bg-black/40 border ${theme.colors.border} hover:bg-white/10 ${theme.colors.textSecondary} md:hidden backdrop-blur-xl shadow-xl active:scale-95`}><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"/></svg></button>
            <div className="flex items-center gap-4 pointer-events-auto ml-auto">
                 <button onClick={() => setIsThemeSelectorOpen(true)} className={`p-2.5 rounded-full bg-black/40 border ${theme.colors.border} hover:bg-white/10 ${theme.colors.textMain} transition-all backdrop-blur-xl`}><svg className="w-5 h-5 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg></button>
                <div className={`flex items-center gap-2 bg-black/80 backdrop-blur-2xl px-5 py-2.5 rounded-full border ${theme.colors.border}`}>
                    <div className={`w-2 h-2 rounded-full transition-colors ${status === 'connected' ? 'bg-emerald-400' : status === 'connecting' ? 'bg-yellow-400' : status === 'error' ? 'bg-red-500' : 'bg-gray-600'}`}></div>
                    <span className={`text-[10px] font-bold ${theme.colors.textSecondary} tracking-[0.2em] uppercase font-display`}>{status === 'connected' ? 'STUDIO LIVE' : status === 'connecting' ? 'SYNCING' : 'STANDBY'}</span>
                </div>
            </div>
        </div>
        <div className="flex-1 w-full h-full flex flex-col items-center justify-center relative">
           <div className="absolute top-[22%] w-full px-6 text-center z-10 animate-fade-in-down pointer-events-none">
              <h2 className={`text-[10px] font-bold ${theme.colors.textSecondary} uppercase tracking-[0.4em] mb-6 font-display`}>{profile.entitlements.pro_access ? (profile.entitlements.lifetime_pro ? 'Lifetime Pro' : 'Studio Node') : 'Community Node'}</h2>
              <h1 className="text-4xl md:text-7xl font-light tracking-tighter leading-[1.1] font-display"><span className={`${theme.colors.textMain} opacity-90`}>{currentTopic}</span></h1>
              {!showWizard && onboardingStep === 0 && (
                <div className="mt-8 max-w-lg mx-auto space-y-4 px-4 bg-black/20 py-8 rounded-[2rem] border border-white/5 backdrop-blur-sm">
                   <p className="text-gray-400 text-sm leading-relaxed">
                     {BRAND_NAME} is your personal neural studio. Connect the uplink to meet <span className="text-blue-400 font-bold">Voxera</span>—an intelligence grounded entirely in the context you provide.
                   </p>
                   <div className="flex items-center justify-center gap-2 text-blue-500/80 animate-pulse">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
                      <span className="text-[10px] uppercase font-bold tracking-widest">Connect link below to start</span>
                   </div>
                </div>
              )}
           </div>
           <div className="w-full h-[55%] md:h-2/3 mt-20"><Visualizer volume={volume} isActive={status === 'connected'} isMuted={isMuted} theme={theme} /></div>
        </div>
        <ControlBar status={status} isMuted={isMuted} onConnect={handleStartConversation} onDisconnect={disconnect} onToggleMute={toggleMute} theme={theme} userPlan={profile.plan} onUpgrade={handleUpgrade} onboardingStep={onboardingStep} />
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none w-full max-w-sm">
          {toasts.map(toast => (
            <div key={toast.id} className="px-6 py-4 bg-black/90 border border-white/10 backdrop-blur-xl text-white rounded-2xl text-xs font-medium shadow-2xl animate-fade-in-up border-b-2 border-b-blue-500/50">{toast.message}</div>
          ))}
        </div>
      </main>
    </div>
  );
}
