
import { createClient } from '@supabase/supabase-js';

// Robust environment variable getter for Vite and standard environments
const getEnv = (key: string) => {
  let val = '';
  try {
    // Check Vite's import.meta.env
    // @ts-ignore
    if (import.meta && import.meta.env) {
      // @ts-ignore
      val = import.meta.env[key] || '';
    }
  } catch (e) {}

  if (!val) {
    try {
      // Fallback to process.env
      val = process.env[key] || '';
    } catch (e) {}
  }
  return val;
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || getEnv('SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('SUPABASE_ANON_KEY');

export const isSupabaseConfigured = () => {
  return !!supabaseUrl && 
         !!supabaseAnonKey && 
         supabaseUrl.length > 0 &&
         !supabaseUrl.includes('placeholder') &&
         !supabaseUrl.includes('undefined');
};

if (!isSupabaseConfigured()) {
  console.log("Signalum Info: Supabase credentials missing. Auth features running in demo mode.");
}

// Initialize client with specific auth settings
// Using the module from import map
export const supabase = createClient(
  isSupabaseConfigured() ? supabaseUrl : 'https://placeholder.supabase.co', 
  isSupabaseConfigured() ? supabaseAnonKey : 'placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);
