import React from 'react';
import { Theme, ThemeId, UserPlan, UserEntitlements } from '../types';

interface ThemeSelectorProps {
  currentTheme: Theme;
  userPlan: UserPlan;
  onThemeChange: (themeId: ThemeId) => void;
  onUpgrade: () => void;
  isOpen: boolean;
  onClose: () => void;
  entitlements: UserEntitlements;
  themeRegistry: Record<string, Theme>; // Add this prop
}

const ThemeIconDefault = ({ theme }: { theme: Theme }) => (
  <div className="w-full h-full flex items-center justify-center" style={{ color: theme.colors.hexPrimary }}>
    <div className="w-4 h-4 rounded-full border-2 border-current"></div>
  </div>
);

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ currentTheme, userPlan, onThemeChange, onUpgrade, isOpen, onClose, entitlements, themeRegistry }) => {
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
                <button onClick={onClose} className="text-white/20 hover:text-white p-3 bg-white/5 rounded-full transition-all active:scale-95">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto custom-scrollbar pr-4">
                {(Object.values(themeRegistry) as Theme[]).map(theme => {
                    const isActive = currentTheme.id === theme.id;

                    return (
                      <button
                          key={theme.id}
                          onClick={() => handleThemeClick(theme)}
                          className={`relative flex flex-col gap-4 p-5 rounded-[2rem] border transition-all duration-500 group overflow-hidden ${isActive ? 'bg-white/5 shadow-2xl' : 'border-white/10 bg-black/40 hover:bg-white/[0.03] hover:border-white/20'}`}
                          style={{ borderColor: isActive ? theme.colors.hexPrimary + '50' : undefined }}
                      >
                          <div className="flex items-center gap-5">
                            <div 
                                className={`w-12 h-12 rounded-xl flex items-center justify-center relative overflow-hidden transition-all duration-700 ${isActive ? 'scale-110' : 'opacity-60'}`}
                                style={{ backgroundColor: theme.visualProfile.bgMain, borderColor: theme.colors.hexPrimary + '30' }}
                            >
                                 <div className="relative z-10 w-full h-full p-2">
                                    <ThemeIconDefault theme={theme} />
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