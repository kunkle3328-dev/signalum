
import React, { useState } from 'react';
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
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-blue-200">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" fill="currentColor"/>
        </svg>
    ),
    clean_light: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-slate-400">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    signalum_studio: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-indigo-400">
          <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
          <path d="M7 8h10M7 12h10M7 16h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    focus_black: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-zinc-400">
          <rect x="4" y="4" width="16" height="16" stroke="currentColor" strokeWidth="2"/>
          <circle cx="12" cy="12" r="2" fill="currentColor"/>
      </svg>
    ),
    glass_horizon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-cyan-300">
          <path d="M3 15h18M3 18h18M3 21h18" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
          <path d="M21 9a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2"/>
          <path d="M7 9l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    midnight_neon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-pink-400">
          <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor" fillOpacity="0.2"/>
          <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="7" r="1" fill="currentColor" className="animate-pulse"/>
      </svg>
    ),
    nebula: (
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-purple-200">
            <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
            <circle cx="12" cy="12" r="3" fill="currentColor" className="animate-pulse"/>
        </svg>
    ),
    solaris: (
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-orange-200">
            <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 2V4M12 20V22M2 12H4M20 12H22M4.93 4.93L6.34 6.34M17.66 17.66L19.07 19.07M4.93 19.07L6.34 17.66M17.66 6.34L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
    ),
    quantal: (
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-emerald-200">
            <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
            <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
            <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
            <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
            <path d="M7 10V14M14 10V14M10 7H14M10 17H14" stroke="currentColor" strokeWidth="1"/>
        </svg>
    ),
    aether: (
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-indigo-200">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20Z" fill="currentColor" opacity="0.2"/>
            <path d="M7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17C9.24 17 7 14.76 7 12Z" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 2V7M12 17V22M2 12H7M17 12H22" stroke="currentColor" strokeWidth="1"/>
        </svg>
    ),
    onyx: (
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-yellow-500">
            <path d="M12 2L2 8L12 14L22 8L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="currentColor" fillOpacity="0.2"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    )
};

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ currentTheme, userPlan, onThemeChange, onUpgrade, isOpen, onClose, entitlements }) => {
  const [lockedClickedId, setLockedClickedId] = useState<ThemeId | null>(null);

  if (!isOpen) return null;

  const handleThemeClick = (theme: Theme) => {
    const isLocked = theme.isPro && !entitlements.pro_themes;
    if (isLocked) {
      setLockedClickedId(theme.id);
      return;
    }
    onThemeChange(theme.id);
    onClose();
  };

  return (
    <>
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" onClick={onClose} />
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#0a0a0a]/95 border border-white/10 rounded-3xl p-6 z-[70] shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white">Select Environment</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Personalize your neural studio</p>
                </div>
                <button onClick={onClose} className="text-gray-500 hover:text-white p-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
            </div>

            <div className="grid grid-cols-1 gap-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                {Object.values(THEME_REGISTRY).map(theme => {
                    const isLocked = theme.isPro && !entitlements.pro_themes;
                    const isActive = currentTheme.id === theme.id;
                    const isClickedLocked = lockedClickedId === theme.id;

                    return (
                        <div key={theme.id} className="flex flex-col gap-2">
                          <button
                              onClick={() => handleThemeClick(theme)}
                              className={`relative flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 overflow-hidden group
                                  ${isActive 
                                      ? `${theme.colors.border} bg-white/5` 
                                      : 'border-white/5 hover:border-white/20 hover:bg-white/5'
                                  }
                                  ${isLocked ? 'grayscale-[0.5]' : ''}
                              `}
                          >
                              {/* Theme Gradient Preview */}
                              <div 
                                  className={`w-12 h-12 rounded-lg ${theme.colors.primary} shadow-lg shrink-0 flex items-center justify-center relative overflow-hidden`}
                                  style={{ 
                                    boxShadow: isActive ? `0 0 15px ${theme.colors.hexPrimary}` : 'none',
                                    backgroundColor: theme.visualProfile.bgMain 
                                  }}
                              >
                                   <div className="relative z-10">
                                      {THEME_ICONS[theme.id]}
                                   </div>
                                   {/* Glass shimmer overlay */}
                                   <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/10"></div>
                              </div>

                              <div className="text-left flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h4 className={`text-sm font-bold ${isActive ? 'text-white' : 'text-slate-400'}`}>
                                        {theme.label}
                                    </h4>
                                    {theme.isPro && (
                                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${isLocked ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'}`}>
                                        PRO
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-gray-500 truncate">
                                      {theme.description}
                                  </p>
                              </div>

                              {isActive && !isLocked && (
                                   <div className={`text-xl ${theme.colors.secondary}`}>
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                                   </div>
                              )}
                              
                              {isLocked && (
                                <div className="text-slate-600">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                                </div>
                              )}
                          </button>
                          
                          {isClickedLocked && (
                            <div className="mx-2 p-3 bg-blue-600/10 border border-blue-500/20 rounded-xl flex items-center justify-between gap-4 animate-fade-in">
                              <p className="text-[10px] text-blue-300 leading-tight">Pro theme — designed for deeper focus and atmospheric clarity.</p>
                              <button 
                                onClick={(e) => { e.stopPropagation(); onUpgrade(); }} 
                                className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-white bg-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-500"
                              >
                                Unlock
                              </button>
                            </div>
                          )}
                        </div>
                    );
                })}
            </div>
        </div>
    </>
  );
};
