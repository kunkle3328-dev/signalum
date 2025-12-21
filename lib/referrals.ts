
import { supabase } from './supabaseClient';

const REF_STORAGE_KEY = 'signalum_pending_ref';

export const captureReferralCode = () => {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams(window.location.search);
  const ref = params.get('ref');
  if (ref) {
    localStorage.setItem(REF_STORAGE_KEY, ref);
  }
};

export const processPendingReferral = async (userId: string) => {
  const code = localStorage.getItem(REF_STORAGE_KEY);
  if (!code || !userId) return;

  try {
    // In a production environment, this would call a Supabase RPC or insert into a referrals table.
    // Example: await supabase.rpc('apply_referral', { code, user_id: userId });
    
    // For this client-side demo, we simply log it and clear storage to prevent loops.
    console.log(`[Signalum] Processing referral: ${code}`);
    localStorage.removeItem(REF_STORAGE_KEY);
  } catch (e) {
    console.error("Referral process error", e);
  }
};

export const fetchUserReferralCode = async (userId: string): Promise<string> => {
  try {
      const { data } = await supabase
        .from('user_profiles')
        .select('referral_code')
        .eq('user_id', userId)
        .single();
      
      if (data?.referral_code) return data.referral_code;
  } catch (e) {
      // Fail silently and fallback
  }
  
  // Deterministic fallback for demo/offline mode
  return `SIG-${userId.substring(0, 6).toUpperCase()}`;
};
