
import { UserProfile, UserGrant } from '../types';
import { updateProfile, getProfile } from './entitlements';

// Client-side code verification logic
// Format: PREFIX-SALT-CHECK
const SALT = "SIG-STUDIO";

export const generateCode = (type: 'lifetime_pro' | 'pro_trial' | 'founders'): string => {
  const prefix = type === 'lifetime_pro' ? 'LT' : type === 'pro_trial' ? 'TR' : 'FD';
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  // Simple deterministic "checksum" for local validation
  const check = (prefix.charCodeAt(0) + random.charCodeAt(0)).toString(16).toUpperCase();
  return `SIG-${prefix}-${random}-${check}`;
};

export const redeemCode = (code: string): boolean => {
  const parts = code.split('-');
  if (parts.length !== 4 || parts[0] !== 'SIG') return false;

  const prefix = parts[1];
  const random = parts[2];
  const check = parts[3];

  // Validation
  const expectedCheck = (prefix.charCodeAt(0) + random.charCodeAt(0)).toString(16).toUpperCase();
  if (check !== expectedCheck) return false;

  // Corrected property reference to grant_type
  const grantType: UserGrant['grant_type'] = 
    prefix === 'LT' ? 'lifetime_pro' : 
    prefix === 'TR' ? 'pro_trial' : 
    'founders';

  // Get current profile to get user_id and existing grants
  const currentProfile = getProfile();

  // Aligned object keys with UserGrant interface and added missing id
  const newGrant: UserGrant = {
    id: crypto.randomUUID(),
    user_id: currentProfile.id,
    grant_type: grantType,
    created_at: Date.now(),
    expires_at: grantType === 'pro_trial' ? Date.now() + (30 * 24 * 60 * 60 * 1000) : undefined
  };

  // Fixed the grant list update logic
  const profile = updateProfile({
    grants: [...(currentProfile.grants || []), newGrant], 
    plan: grantType === 'lifetime_pro' ? 'PRO' : undefined
  });

  // Also update standard plan logic for compatibility
  if (grantType === 'lifetime_pro' || grantType === 'pro_trial') {
    localStorage.setItem('SIGNALUM_PLAN', 'PRO');
  }

  return true;
};
