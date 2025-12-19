
import React from 'react';
import { ConnectionState, Theme, UserPlan } from '../types';
import { getProfile } from '../utils/entitlements';

interface ControlBarProps {
  status: ConnectionState;
  isMuted: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onToggleMute: () => void;
  theme: Theme;
  userPlan: UserPlan;
  onUpgrade: () => void;
  onboardingStep: number;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  status,
  isMuted,
  onConnect,
  onDisconnect,
  onToggleMute,
  theme,
  userPlan,
  onUpgrade,
  onboardingStep
}) => {
  const profile = getProfile();
  
  const getBadgeContent = () => {
    if (profile.entitlements.lifetime_pro) return "LIFETIME PRO";
    if (profile.entitlements.founders_badge) return "FOUNDERS PRO";
    if (profile.entitlements.pro_access) return "PRO STUDIO";
    return "FREE NODE";
  };

  return (
    <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-6 z-30 pointer-events-none px-6">
      
      {/* Neural Voice Identity */}
      {status === 'disconnected' && (
        <div className="flex items-center gap-3 animate-fade-in-up">
           <div className={`pointer-events-auto bg-black/40 backdrop-blur-xl border ${theme.colors.border} rounded-full px-8 py-3 flex items-center gap-3 shadow-2xl`}>
              <div className={`w-2 h-2 rounded-full ${theme.colors.primary} animate-pulse`}></div>
              <span className="text-[10px] font-bold text-white tracking-[0.3em] uppercase">{getBadgeContent()}</span>
          </div>
          {!profile.entitlements.pro_access && onboardingStep >= 2 && (
            <button onClick={onUpgrade} className="pointer-events-auto px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-full text-[10px] font-bold uppercase tracking-widest shadow-xl transition-all">
               Upgrade
            </button>
          )}
        </div>
      )}

      {/* Main Action Bar */}
      <div className={`pointer-events-auto w-full max-w-lg ${theme.colors.bgPanel} backdrop-blur-3xl border ${theme.colors.border} p-3 rounded-[2.5rem] shadow-2xl flex items-center justify-between gap-3 relative overflow-hidden group`}>
        
        {/* Glow behind container */}
        <div className="absolute inset-0 opacity-20 blur-xl transition-colors duration-500" style={{ backgroundColor: theme.colors.hexPrimary }}></div>

        {status === 'connected' ? (
          <>
             <button 
               onClick={onToggleMute}
               title={isMuted ? "Unmute Studio Uplink" : "Mute Studio Uplink"}
               className={`h-16 w-16 rounded-[2rem] flex items-center justify-center transition-all duration-300 shrink-0 relative z-10 ${
                   isMuted 
                   ? 'bg-red-500 text-white border border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.5)]' 
                   : `bg-white/5 ${theme.colors.secondary} border ${theme.colors.border} hover:bg-white/10`
               }`}
             >
               {isMuted ? (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18"/></svg>
               ) : (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>
               )}
             </button>
  
             <button 
               onClick={onDisconnect}
               className="flex-1 h-16 bg-red-950/40 border border-red-500/20 hover:bg-red-900/60 hover:border-red-500/50 text-red-100 rounded-[2rem] font-bold text-sm tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(239,68,68,0.1)] flex items-center justify-center gap-3 relative z-10"
             >
               <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_red]"></span>
               Terminate Link
             </button>
          </>
        ) : status === 'connecting' ? (
          <button disabled className={`w-full h-16 bg-black/30 ${theme.colors.secondary} rounded-[2rem] font-medium flex items-center justify-center gap-3 border ${theme.colors.border} relative z-10`}>
              <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
              <span className="tracking-widest text-xs uppercase font-bold text-blue-400">Syncing Uplink...</span>
          </button>
        ) : (
          <button 
            onClick={onConnect}
            className={`w-full h-16 ${theme.colors.primary} border ${theme.colors.border} hover:brightness-110 text-white rounded-[2rem] font-bold text-lg transition-all flex items-center justify-center gap-4 active:scale-[0.98] group relative z-10 ${onboardingStep === 0 ? 'animate-pulse' : ''}`}
            style={{ boxShadow: `0 0 40px ${theme.colors.hexPrimary}4d` }}
          >
            <div className={`w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
            </div>
            {onboardingStep === 0 ? 'Initialize Voxera Link' : 'Establish Studio Uplink'}
          </button>
        )}
      </div>
    </div>
  );
};
