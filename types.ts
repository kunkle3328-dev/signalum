
export const BRAND_NAME = "Signalum";
export const BRAND_PRONUNCIATION = "SIG-nuh-luhm";

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface VolumeLevel {
  user: number;
  model: number;
}

export type NeonIntensity = 'low' | 'medium' | 'high';

export interface PersonalityTraits {
  formality: number;   // 0-100
  humor: number;       // 0-100
  creativity: number;  // 0-100
  enthusiasm: number;  // 0-100
  isAdaptive: boolean; // Dynamic context shifting
}

export interface ExpressiveVoiceProfile {
  id: string;
  name: string;
  description: string;
  scope: 'global_default' | 'user_specific';
  isActive: boolean;
  
  // Core Delivery Controls (0-100)
  stability: number;       // Consistency vs natural variation
  expressiveness: number;  // How animated vs neutral
  clarity: number;         // Sentence simplification + structure
  warmth: number;          // Conversational softness
  emphasis: number;        // Verbal emphasis strength
  pace: number;            // Slower <-> Faster
  pauseFrequency: number;  // How often pauses are inserted
  teachingBias: number;    // How strongly to structure explanations
  speakerBoost: boolean;   // Favor confident delivery

  // Guardrails & Config
  maxSentenceLength?: number;
  forbiddenPatterns?: string[];
  
  // Legacy/LLM Specific
  steeringPrompt?: string; // Direct instruction for LLM providers
  pronunciationNotes?: string;

  version: number;
  lastUpdated: number;
}

export interface PromptVersion {
  id: string;
  versionNumber: number;
  timestamp: number;
  author: 'user' | 'system';
  summary: string;
  instruction: string;
  personality: PersonalityTraits;
  modeId: AudioStyle;
}

export interface UserEntitlements {
  pro_access: boolean;
  pro_themes: boolean;
  ambient_studio: boolean;
  premium_personas: boolean;
  founders_badge: boolean;
  lifetime_pro: boolean;
  referral_reward_active: boolean;
  is_admin?: boolean;
}

export interface UserGrant {
  id: string;
  user_id: string;
  grant_type: 'lifetime_pro' | 'pro_30d' | 'founders' | 'pro_trial';
  created_at: string | number;
  expires_at?: string | number | null;
  revoked_at?: string | number | null;
  note?: string;
}

export interface UserMetrics {
  studioSessionsCount: number;
  minutesSpent: number;
  discoverTopicsCount: number;
  lastMilestoneAwarded?: string;
}

export interface UserProfile {
  id: string;
  email?: string;
  plan: UserPlan;
  entitlements: UserEntitlements;
  grants: UserGrant[];
  metrics: UserMetrics;
  referralCode: string;
  settings: {
    animationsEnabled: boolean;
    neonIntensity: NeonIntensity;
    defaultModeId: AudioStyle;
  };
}

export interface Source {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'paste' | 'web' | 'pdf' | 'youtube';
  isActive?: boolean;
  priority?: number;
  url?: string;
  description?: string;
}

export type ModeCategory = 'ENTERPRISE' | 'MONEY' | 'CONTENT' | 'LEARN' | 'CUSTOM';
export type UserPlan = 'FREE' | 'PRO' | 'AGENCY';

export type ThemeId = 'midnight' | 'clean_light' | 'signalum_studio' | 'focus_black' | 'glass_horizon' | 'midnight_neon' | 'nebula' | 'solaris' | 'quantal' | 'aether' | 'onyx' | string;

export interface Theme {
  id: ThemeId;
  label: string;
  description: string;
  isPro: boolean;
  colors: {
    primary: string;
    secondary: string;
    accentGlow: string;
    textMain: string;
    textSecondary: string;
    border: string;
    bgPanel: string;
    hexPrimary: string;
    hexSecondary: string;
    neonColor: string;
  };
  visualProfile: {
    bgMain: string;
    bgSurface: string;
    textPrimary: string;
    textSecondary: string;
    accent: string;
    borderColor?: string;
    glassOpacity: string;
    glassBlur: string;
    vignette: number;
    grain: number;
    motionLevel: 'none' | 'low' | 'high';
    microInteractions?: boolean;
  };
}

export interface UsageStatus {
  plan: UserPlan;
  voiceSecondsUsed: number;
  voiceSecondsLimit: number;
  discoverCallsUsed: number;
  discoverCallsLimit: number;
  sourcesUsed: number;
  sourcesLimit: number;
  periodEnd: string | number | null;
}

export interface TrialState {
  isActive: boolean;
  startedAt: number | null;
  expiresAt: number | null;
}

export type AudioStyle = 
  | 'podcast' 
  | 'entrepreneur' 
  | 'websites' 
  | 'plr' 
  | 'money_engine' 
  | 'study' 
  | 'expert_guide' 
  | 'deep_learning' 
  | 'summary' 
  | 'creative' 
  | 'debate' 
  | 'interview' 
  | 'heated_debate' 
  | 'casual'
  | 'expert_coach'
  | 'developer'
  | 'strategy'
  | 'marketing'
  | 'mentor'
  | 'research_beast'
  | string; // Support for custom mode IDs

export interface PersonaProfile {
  id: AudioStyle;
  name: string;
  category: ModeCategory;
  rules: string[];
  responseFormat: string;
  voiceHints: string;
  isPremium?: boolean;
  isDisabled?: boolean;
  icon?: string;
}

export interface ResearchAssumption {
  text: string;
  type: 'implicit' | 'explicit';
}

export interface ResearchClaim {
  claim: string;
  confidence: 'high' | 'medium' | 'low';
  rationale: string;
}

export interface ResearchNextStep {
  step: string;
  why: string;
  effort: 'low' | 'med' | 'high';
}

export interface ResearchSource {
  title: string;
  url: string;
  snippet: string;
  provider: 'retrieval' | 'user' | 'system';
}

export interface ResearchMetadata {
  modeId: string;
  assumptions: ResearchAssumption[];
  sources: ResearchSource[];
  claims: ResearchClaim[];
  nextSteps: ResearchNextStep[];
  timestamp: number;
  topic: string;
}

export const PERSONA_REGISTRY: Record<AudioStyle, PersonaProfile> = {
  research_beast: {
    id: 'research_beast',
    name: 'Research Beast',
    category: 'ENTERPRISE',
    rules: ['Deep analysis', 'Source citation', 'Assumption checking'],
    responseFormat: 'Structured research report.',
    voiceHints: 'Analytical, thorough.',
    icon: '🦁'
  },
  developer: {
    id: 'developer',
    name: 'Tech Architect',
    category: 'ENTERPRISE',
    rules: ['Technical implementation', 'Code efficiency', 'System architecture'],
    responseFormat: 'Code-first and implementation-focused.',
    voiceHints: 'Precise, logical.',
    icon: '💻'
  },
  strategy: {
    id: 'strategy',
    name: 'Strategic Lead',
    category: 'ENTERPRISE',
    rules: ['High-level strategy', 'ROI focused', 'Market positioning'],
    responseFormat: 'Executive summary style.',
    voiceHints: 'Confident, authoritative.',
    icon: '📊'
  },
  marketing: {
    id: 'marketing',
    name: 'Growth Strategist',
    category: 'ENTERPRISE',
    rules: ['Brand positioning', 'Conversion optimization', 'Persuasive copy'],
    responseFormat: 'Action-oriented.',
    voiceHints: 'Energetic.',
    icon: '🚀'
  },
  mentor: {
    id: 'mentor',
    name: 'Performance Coach',
    category: 'ENTERPRISE',
    rules: ['Career growth', 'Leadership', 'Mental frameworks'],
    responseFormat: 'Structured motivational feedback.',
    voiceHints: 'Warm, calm.',
    icon: '🤝'
  },
  entrepreneur: {
    id: 'entrepreneur',
    name: 'Venture Arch.',
    category: 'MONEY',
    rules: ['Unit economics', 'Distribution moats'],
    responseFormat: 'Strategic briefing.',
    voiceHints: 'Assertive.',
    icon: '🏦'
  },
  money_engine: {
    id: 'money_engine',
    name: 'The Closer',
    category: 'MONEY',
    rules: ['Conversion velocity', 'Immediate cashflow'],
    responseFormat: 'Rapid-fire strategy.',
    voiceHints: 'High-energy.',
    icon: '⚙️'
  },
  websites: { id: 'websites', name: 'Web Architect', category: 'MONEY', rules: ['System scalability'], responseFormat: 'Technical roadmap.', voiceHints: 'Precise.', icon: '🌐' },
  plr: { id: 'plr', name: 'Licensing Expert', category: 'MONEY', rules: ['Resale rights'], responseFormat: 'Marketing advice.', voiceHints: 'Commercial.', icon: '📦' },
  podcast: {
    id: 'podcast',
    name: 'Studio Host',
    category: 'CONTENT',
    rules: ['Narrative bridging', 'Storytelling'],
    responseFormat: 'Conversational dialogue.',
    voiceHints: 'Witty, engaging.',
    icon: '🎙️'
  },
  creative: {
    id: 'creative',
    name: 'Creative Futurist',
    category: 'CONTENT',
    rules: ['Abstract possibilities', 'Metaphors'],
    responseFormat: 'Inspirational prose.',
    voiceHints: 'Dreamy, thoughtful.',
    icon: '✨'
  },
  casual: { id: 'casual', name: 'Companion', category: 'CONTENT', rules: ['Relaxed energy'], responseFormat: 'Casual flow.', voiceHints: 'Chill.', icon: '☕' },
  interview: { id: 'interview', name: 'Journalist', category: 'CONTENT', rules: ['Evidence based'], responseFormat: 'Interview style.', voiceHints: 'Professional.', icon: '🎤' },
  heated_debate: { id: 'heated_debate', name: 'The Skeptic', category: 'CONTENT', rules: ['Aggressive logic'], responseFormat: 'High-tension debate.', voiceHints: 'Intense.', icon: '🔥' },
  expert_guide: {
    id: 'expert_guide',
    name: 'Expert Guide',
    category: 'LEARN',
    rules: ['Nuanced explains', 'Source citations'],
    responseFormat: 'Deep professional summaries.',
    voiceHints: 'Authoritative.',
    icon: '🏛️'
  },
  expert_coach: {
    id: 'expert_coach',
    name: 'Elite Mentor',
    category: 'LEARN',
    rules: ['Socratic inquiry', 'intellectual rigor'],
    responseFormat: 'Challenging mentorship.',
    voiceHints: 'Intelligent.',
    icon: '🧠'
  },
  deep_learning: { id: 'deep_learning', name: 'Professor', category: 'LEARN', rules: ['First principles'], responseFormat: 'Academic-level deep dives.', voiceHints: 'Methodical.', icon: '🎓' },
  study: { id: 'study', name: 'Socratic Tutor', category: 'LEARN', rules: ['Questioning'], responseFormat: 'Dialectic style.', voiceHints: 'Encouraging.', icon: '💡' },
  summary: { id: 'summary', name: 'Briefer', category: 'LEARN', rules: ['Brevity'], responseFormat: 'Concise executive summaries.', voiceHints: 'Efficient.', icon: '⚡' },
  debate: { id: 'debate', name: 'Thinker', category: 'LEARN', rules: ['Logical analysis'], responseFormat: 'Nuanced comparisons.', voiceHints: 'Balanced.', icon: '⚔️' }
};
