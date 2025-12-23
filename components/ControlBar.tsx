
import React from 'react';
import { ConnectionState, Theme, UserPlan } from '../types';

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
  const isObsidian = theme.id === 'focus_black';

  return (
    <div className="fixed bottom-12 left-0 right-0 flex flex-col items-center gap-7 z-[40] pointer-events-none px-6">
      
      {status === 'disconnected' && (
        <div className="flex items-center gap-4 animate-fade-in">
           <div className={`pointer-events-auto bg-black/70 backdrop-blur-3xl border border-white/5 rounded-full px-12 py-4 flex items-center gap-5 shadow-2xl shadow-black/80`} style={{ borderColor: theme.visualProfile.borderColor }}>
              <div className={`w-3 h-3 rounded-full animate-pulse shadow-[0_0_15px_currentColor]`} style={{ backgroundColor: theme.colors.hexPrimary }}></div>
              <span className="text-[10px] font-black tracking-[0.4em] uppercase text-slate-500">VOXERA IDLE</span>
          </div>
        </div>
      )}

      <div className={`pointer-events-auto w-full max-w-xl glass-morphism p-5 rounded-[4rem] shadow-[0_40px_100px_rgba(0,0,0,0.9)] flex items-center justify-between gap-5 relative overflow-hidden group transition-all duration-700`} style={{ borderColor: theme.visualProfile.borderColor || theme.colors.hexPrimary + '30' }}>
        
        {/* Animated Inner Aura */}
        <div className={`absolute inset-0 opacity-10 blur-[60px] group-hover:opacity-25 transition-all duration-1000 ${status === 'connected' ? 'animate-neon-pulse' : ''}`} style={{ backgroundColor: theme.colors.hexPrimary }}></div>

        {status === 'connected' ? (
          <>
             <button 
               onClick={onToggleMute}
               title={isMuted ? "Unmute Neural Uplink" : "Mute Neural Uplink"}
               className={`h-18 w-18 rounded-full flex items-center justify-center transition-all duration-500 shrink-0 relative z-10 cyber-button ${
                   isMuted 
                   ? 'bg-red-600 text-white border border-red-500 shadow-[0_0_35px_rgba(239,68,68,0.5)]' 
                   : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
               }`}
               style={{ borderColor: !isMuted ? theme.visualProfile.borderColor : undefined }}
             >
               {isMuted ? (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18"/></svg>
               ) : (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>
               )}
             </button>
  
             <button 
               onClick={onDisconnect}
               className="flex-1 h-18 bg-red-950/20 border border-red-500/20 hover:bg-red-900/40 hover:border-red-500/60 text-red-200 rounded-full font-black text-[11px] tracking-[0.3em] uppercase transition-all shadow-inner flex items-center justify-center gap-4 relative z-10 active:scale-95 shadow-[0_0_40px_rgba(239,68,68,0.1)]"
             >
               <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_red]"></div>
               SEVER NODE LINK
             </button>
          </>
        ) : status === 'connecting' ? (
          <button 
            onClick={onDisconnect}
            className={`w-full h-18 bg-black/40 rounded-full font-bold flex items-center justify-center gap-5 border border-white/5 relative z-10 cursor-pointer hover:bg-red-950/30 hover:text-red-400 hover:border-red-500/30 transition-all group/cancel active:scale-[0.98] shadow-2xl`}
            style={{ color: theme.colors.hexPrimary, borderColor: theme.visualProfile.borderColor }}
          >
              <svg className="animate-spin h-7 w-7 group-hover/cancel:hidden" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
              <svg className="w-7 h-7 hidden group-hover/cancel:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              <span className="tracking-[0.4em] text-[10px] uppercase font-black">
                 <span className="group-hover/cancel:hidden">SYNCING NEURAL HUB...</span>
                 <span className="hidden group-hover/cancel:inline">ABORT CONNECTION</span>
              </span>
          </button>
        ) : status === 'error' ? (
          <button 
            onClick={onConnect}
            className={`w-full h-18 bg-red-900/20 border border-red-500/60 text-red-200 rounded-full font-black text-[11px] tracking-[0.3em] uppercase transition-all flex items-center justify-center gap-5 relative z-10 hover:bg-red-900/40 shadow-[0_0_50px_rgba(239,68,68,0.3)] active:scale-95`}
          >
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
             SYSTEM COLLAPSE - RE-SYNC
          </button>
        ) : (
          <button 
            onClick={onConnect}
            className={`w-full h-18 border border-white/20 rounded-full font-black text-[11px] tracking-[0.4em] uppercase transition-all flex items-center justify-center gap-6 active:scale-[0.98] group relative z-10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] cyber-button ${isObsidian ? 'text-black' : 'text-white'}`}
            style={{ backgroundColor: theme.colors.hexPrimary, borderColor: theme.visualProfile.borderColor }}
          >
            <div className={`w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-all shadow-inner border border-white/10`}>
                <svg className={`w-7 h-7 ${isObsidian ? 'text-black' : 'text-white'}`} fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
            </div>
            {onboardingStep === 0 ? 'INITIALIZE VOXERA' : 'ESTABLISH STUDIO UPLINK'}
          </button>
        )}
      </div>
    </div>
  );
};
