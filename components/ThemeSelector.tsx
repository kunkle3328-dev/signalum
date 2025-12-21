
import React from 'react';
import { Theme, ThemeId, UserPlan, UserEntitlements } from '../types';
import { THEME_REGISTRY } from '../themes/themeRegistry';

interface ThemeSelectorProps {
  currentTheme: Theme;
  userPlan: UserPlan;
  onThemeChange: (themeId: ThemeId) => void;
  onUpgrade: () => void;
  isOpen: boolean;
  onClose: () => void;
  entitlements: UserEntitlements;
}

const THEME_ICONS: Record<ThemeId, React.ReactNode> = {
    midnight: (
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-cyan-400 neon-glow-cyan">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" fill="currentColor"/>
        </svg>
    ),
    clean_light: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-slate-800">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    signalum_studio: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-blue-500">
          <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
          <path d="M7 8h10M7 12h10M7 16h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    focus_black: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-zinc-300">
          <rect x="4" y="4" width="16" height="16" stroke="currentColor" strokeWidth="2"/>
          <circle cx="12" cy="12" r="2" fill="currentColor"/>
      </svg>
    ),
    glass_horizon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-cyan-200">
          <path d="M21 9a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2"/>
          <path d="M7 9l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    midnight_neon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-pink-500 neon-glow-magenta">
          <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor" fillOpacity="0.2"/>
          <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    nebula: (
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-purple-500 neon-glow-purple">
            <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
            <circle cx="12" cy="12" r="3" fill="currentColor" className="animate-pulse"/>
        </svg>
    ),
    solaris: (
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-orange-500">
            <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 2V4M12 20V22M2 12H4M20 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
    ),
    quantal: (
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-emerald-500">
            <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
            <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
            <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
            <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
        </svg>
    ),
    aether: (
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-blue-400">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 3V21M3 12H21" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
            <path d="M12 7V17M7 12H17" stroke="currentColor" strokeWidth="2"/>
        </svg>
    ),
    onyx: (
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-yellow-500">
            <path d="M12 2L2 8L12 14L22 8L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="currentColor" fillOpacity="0.2"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    )
};

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ currentTheme, userPlan, onThemeChange, onUpgrade, isOpen, onClose, entitlements }) => {
  if (!isOpen) return null;

  const handleThemeClick = (theme: Theme) => {
    onThemeChange(theme.id);
    onClose();
  };

  return (
    <>
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[60] animate-fade-in" onClick={onClose} />
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl glass-morphism rounded-[3rem] p-10 z-[70] shadow-[0_40px_100px_rgba(0,0,0,0.9)] animate-fade-in" style={{ borderColor: currentTheme.colors.hexPrimary + '30' }}>
            <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-[0.4em] text-white">Neural Environments</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black mt-2">Personalize your synthesis workspace</p>
                </div>
                <button onClick={onClose} className="text-white/20 hover:text-white p-3 bg-white/5 rounded-full transition-all active:scale-90">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto custom-scrollbar pr-4">
                {Object.values(THEME_REGISTRY).map(theme => {
                    const isActive = currentTheme.id === theme.id;

                    return (
                      <button
                          key={theme.id}
                          onClick={() => handleThemeClick(theme)}
                          className={`relative flex flex-col gap-4 p-5 rounded-[2rem] border transition-all duration-500 group overflow-hidden ${isActive ? 'bg-white/5 shadow-2xl' : 'border-white/5 bg-black/40 hover:bg-white/[0.03] hover:border-white/10'}`}
                          style={{ borderColor: isActive ? theme.colors.hexPrimary + '50' : undefined }}
                      >
                          <div className="flex items-center gap-5">
                            <div 
                                className={`w-12 h-12 rounded-xl flex items-center justify-center relative overflow-hidden transition-all duration-700 ${isActive ? 'scale-110' : 'opacity-40'}`}
                                style={{ backgroundColor: theme.visualProfile.bgMain, borderColor: theme.colors.hexPrimary + '30' }}
                            >
                                 <div className="relative z-10">
                                    {THEME_ICONS[theme.id]}
                                 </div>
                                 <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/10"></div>
                            </div>
                            <div className="text-left flex-1 min-w-0">
                                <h4 className={`text-xs font-black uppercase tracking-[0.1em] ${isActive ? 'text-white' : 'text-slate-600'}`}>
                                    {theme.label}
                                </h4>
                                <p className="text-[9px] text-slate-700 uppercase font-black tracking-tighter truncate mt-1">
                                    {theme.description}
                                </p>
                            </div>
                          </div>
                          
                          {isActive && (
                               <div className="absolute top-4 right-4 animate-neon-pulse" style={{ color: theme.colors.hexPrimary }}>
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                               </div>
                          )}
                          
                          {/* Hover Accent Line */}
                          <div className={`absolute bottom-0 left-0 h-[3px] transition-all duration-700 ${isActive ? 'w-full' : 'w-0 group-hover:w-1/2'}`} style={{ backgroundColor: theme.colors.hexPrimary }} />
                      </button>
                    );
                })}
            </div>
        </div>
    </>
  );
};
