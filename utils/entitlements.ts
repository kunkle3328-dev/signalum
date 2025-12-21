
import { UserProfile, UserEntitlements, UserPlan } from '../types';

const STORAGE_KEY = 'signalum_profile_v4';

export const INITIAL_ENTITLEMENTS: UserEntitlements = {
  pro_access: false,
  pro_themes: false,
  ambient_studio: false,
  premium_personas: false,
  founders_badge: false,
  lifetime_pro: false,
  referral_reward_active: false
};

const generateReferralCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const computeEntitlements = (profile: Partial<UserProfile>): UserEntitlements => {
  const now = Date.now();
  const isProPlan = profile.plan === 'PRO' || profile.plan === 'AGENCY';
  const grants = profile.grants || [];
  
  const hasLifetime = grants.some(g => g.grant_type === 'lifetime_pro');
  const hasValidTrial = grants.some(g => g.grant_type === 'pro_trial' && (!g.expires_at || (typeof g.expires_at === 'number' ? g.expires_at : new Date(g.expires_at).getTime()) > now));
  const hasFounderGrant = grants.some(g => g.grant_type === 'founders');

  const proAccess = isProPlan || hasLifetime || hasValidTrial;

  return {
    pro_access: proAccess,
    pro_themes: proAccess,
    ambient_studio: proAccess,
    premium_personas: proAccess,
    founders_badge: hasFounderGrant,
    lifetime_pro: hasLifetime,
    referral_reward_active: profile.entitlements?.referral_reward_active || false
  };
};

export const setProfile = (profile: UserProfile): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
};

export const getProfile = (): UserProfile => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Ensure settings exist
      if (!parsed.settings) {
        parsed.settings = { animationsEnabled: true, neonIntensity: 'medium', defaultModeId: 'entrepreneur' };
      }
      return {
        ...parsed,
        entitlements: computeEntitlements(parsed)
      };
    } catch (e) {
      console.error("Failed to parse profile", e);
    }
  }

  const newProfile: UserProfile = {
    id: crypto.randomUUID(),
    plan: 'FREE',
    entitlements: INITIAL_ENTITLEMENTS,
    grants: [],
    metrics: {
      studioSessionsCount: 0,
      minutesSpent: 0,
      discoverTopicsCount: 0
    },
    referralCode: generateReferralCode(),
    settings: {
      animationsEnabled: true,
      neonIntensity: 'medium',
      defaultModeId: 'entrepreneur'
    }
  };

  setProfile(newProfile);
  return newProfile;
};

export const updateProfile = (updates: Partial<UserProfile>): UserProfile => {
  const current = getProfile();
  const next = { ...current, ...updates };
  next.entitlements = computeEntitlements(next);
  setProfile(next);
  return next;
};
