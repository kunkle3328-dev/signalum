
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { UserEntitlements } from '../types';

export const INITIAL_ENTITLEMENTS: UserEntitlements = {
  pro_access: false,
  pro_themes: false,
  ambient_studio: false,
  premium_personas: false,
  founders_badge: false,
  lifetime_pro: false,
  referral_reward_active: false,
  is_admin: false
};

export async function fetchUserEntitlements(userId: string): Promise<UserEntitlements> {
  // Check if supabase is correctly configured before querying
  if (!isSupabaseConfigured()) {
    return INITIAL_ENTITLEMENTS;
  }

  try {
    const { data, error } = await supabase
      .from('user_entitlements_v')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return INITIAL_ENTITLEMENTS; // No row found
      throw error;
    }

    return {
      pro_access: data.pro_access,
      pro_themes: data.pro_access,
      ambient_studio: data.pro_access,
      premium_personas: data.pro_access,
      founders_badge: data.founders_badge,
      lifetime_pro: data.lifetime_pro,
      referral_reward_active: false,
      is_admin: data.is_admin
    };
  } catch (err) {
    console.error('Error fetching entitlements:', err);
    return INITIAL_ENTITLEMENTS;
  }
}
