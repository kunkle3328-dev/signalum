
export const BRAND_NAME = "Signalum";
export const BRAND_PRONUNCIATION = "SIG-nuh-luhm";

export interface UserEntitlements {
  pro_access: boolean;
  pro_themes: boolean;
  ambient_studio: boolean;
  premium_personas: boolean;
  founders_badge: boolean;
  lifetime_pro: boolean;
  referral_reward_active: boolean;
  is_admin?: boolean; // Server-derived admin state
}

export interface UserGrant {
  id?: string;
  user_id: string;
  type: 'lifetime_pro' | 'pro_trial' | 'founders';
  grant_type?: 'lifetime_pro' | 'pro_30d' | 'founders'; // DB field name
  expiresAt?: number;
  expires_at?: string; // DB field name
  redeemedAt: number;
  created_at?: string;
  revoked_at?: string | null;
  note?: string;
  created_by_email?: string;
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

export type ModeCategory = 'MONEY' | 'CONTENT' | 'LEARN';

export type UserPlan = 'FREE' | 'PRO' | 'AGENCY';

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
  | 'casual';

export type SpeakingPace = 'slow' | 'normal' | 'fast';
export type PauseDensity = 'low' | 'medium' | 'high';
export type VoiceWarmth = 'crisp' | 'natural' | 'cozy';
export type VoiceDirectness = 'conversational' | 'structured';

export interface PersonaProfile {
  id: AudioStyle;
  name: string;
  category: ModeCategory;
  rules: string[];
  responseFormat: string;
  voiceHints: string;
  isPremium?: boolean;
}

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface VolumeLevel {
  user: number;
  model: number;
}

export type ThemeId = 
  | 'midnight' 
  | 'clean_light' 
  | 'signalum_studio' 
  | 'focus_black' 
  | 'glass_horizon' 
  | 'midnight_neon' 
  | 'nebula' 
  | 'solaris' 
  | 'quantal' 
  | 'aether' 
  | 'onyx';

export interface VisualProfile {
  bgMain: string;
  bgSurface: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  glassOpacity: string;
  glassBlur: string;
  vignette: number;
  grain: number;
  motionLevel: 'none' | 'low' | 'high';
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accentGlow: string;
  textMain: string;
  textSecondary: string;
  border: string;
  bgPanel: string;
  hexPrimary: string;
  hexSecondary: string;
}

export interface Theme {
  id: ThemeId;
  label: string;
  description: string;
  isPro: boolean;
  colors: ThemeColors;
  visualProfile: VisualProfile;
}
