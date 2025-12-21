
import { useState, useEffect, useCallback } from 'react';
import { UsageStatus, ConnectionState } from '../types';
import { supabase } from '../lib/supabaseClient';

export function useUsage(userId: string | undefined, sessionStatus: ConnectionState) {
  const [usage, setUsage] = useState<UsageStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchUsage = useCallback(async () => {
    if (!userId) {
      // Default state for unauthenticated users
      setUsage(null);
      return;
    }
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Attempt to fetch usage from API, fallback to basic mock if offline/client-only
      let data = null;
      if (session) {
        try {
            const response = await fetch('/api/usage/status', {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            if (response.ok) data = await response.json();
        } catch (e) {
            // API unreachable, ignore
        }
      }

      if (data) {
        setUsage(data);
      } else {
        // Fallback / Demo Data
        setUsage({
             plan: 'FREE',
             voiceSecondsUsed: 0,
             voiceSecondsLimit: 600,
             discoverCallsUsed: 0,
             discoverCallsLimit: 3,
             sourcesUsed: 0,
             sourcesLimit: 3,
             periodEnd: null
        });
      }
    } catch (e) {
      console.error("Failed to fetch Signalum usage", e);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Refresh usage data whenever the user changes or a session state transitions
  useEffect(() => {
    fetchUsage();
  }, [userId, sessionStatus, fetchUsage]);

  const commitVoiceTime = useCallback(async (seconds: number) => {
    if (!userId || seconds <= 0) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await fetch('/api/usage/commit-voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ seconds: Math.ceil(seconds) })
      }).catch(() => {});
      
      // Refresh usage after committing new consumption
      fetchUsage();
    } catch (e) {
      console.warn("Usage commit node error", e);
    }
  }, [userId, fetchUsage]);

  return { usage, loading, refreshUsage: fetchUsage, commitVoiceTime };
}
