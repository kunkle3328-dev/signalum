
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BRAND_NAME, Theme, ThemeId, UserPlan } from '../types';
import { THEME_REGISTRY } from '../themes/themeRegistry';

interface OnboardingWizardProps {
  onComplete: (action?: 'talk' | 'source') => void;
  theme: Theme;
  userPlan: UserPlan;
  onThemeChange: (themeId: ThemeId) => void;
  onUpgrade: () => void;
}

const STEPS = [
  {
    id: 'welcome',
    title: `Welcome to ${BRAND_NAME}`,
    body: "Meet Voxera — your studio-grade voice intelligence. Talk naturally and get clarity fast.",
    bullets: [
      "Human pacing. No robotic vibe.",
      "Built for decisions, learning, and execution."
    ],
    illustration: (color: string) => (
      <svg viewBox="0 0 200 200" className="w-48 h-48 mx-auto" fill="none">
        <circle cx="100" cy="100" r="80" stroke={color} strokeWidth="2" strokeDasharray="10 5" opacity="0.2" />
        <rect x="70" y="60" width="60" height="80" rx="30" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="2" />
        <path d="M85 90h30M90 110h20" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <circle cx="100" cy="100" r="40" stroke={color} strokeWidth="1" opacity="0.3">
          <animate attributeName="r" values="40;50;40" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3;0;0.3" dur="3s" repeatCount="indefinite" />
        </circle>
      </svg>
    )
  },
  {
    id: 'talk',
    title: "Talk it through",
    body: "Signalum works best when you speak like you would to a smart colleague.",
    bullets: [
      "Short questions are fine.",
      "Interrupt anytime — Voxera yields instantly."
    ],
    illustration: (color: string) => (
      <svg viewBox="0 0 200 200" className="w-48 h-48 mx-auto" fill="none">
        <path d="M40 100c0-33.137 26.863-60 60-60s60 26.863 60 60c0 14.5-5.1 27.8-13.6 38.2L160 170l-35-15c-7.8 3.2-16.2 5-25 5-33.137 0-60-26.863-60-60z" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.05" />
        <circle cx="80" cy="90" r="4" fill={color} />
        <circle cx="100" cy="90" r="4" fill={color} />
        <circle cx="120" cy="90" r="4" fill={color} />
        <path d="M80 120s10 5 20 5 20-5 20-5" stroke={color} strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: 'sources',
    title: "Ground everything",
    body: "Add notes, links, PDFs, or YouTube to shape how Voxera thinks and responds.",
    bullets: [
      "Less guessing. More accuracy.",
      "Your context stays in focus."
    ],
    illustration: (color: string) => (
      <svg viewBox="0 0 200 200" className="w-48 h-48 mx-auto" fill="none">
        <rect x="50" y="40" width="100" height="120" rx="8" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.05" />
        <path d="M70 70h60M70 95h60M70 120h40" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        <circle cx="150" cy="150" r="25" fill={color} />
        <path d="M150 140v20M140 150h20" stroke="white" strokeWidth="3" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: 'themes',
    title: "Choose your workspace",
    body: "Your theme sets the tone for how you think with Voxera.",
    bullets: [],
    illustration: null
  },
  {
    id: 'flow',
    title: "Your Flow",
    body: "Start a conversation now, or add a source first — either way, Voxera adapts.",
    bullets: [],
    illustration: (color: string) => (
      <svg viewBox="0 0 200 200" className="w-48 h-48 mx-auto" fill="none">
        <path d="M40 100h120M100 40v120" stroke={color} strokeWidth="1" strokeDasharray="4 4" opacity="0.2" />
        <circle cx="100" cy="100" r="30" fill={color} fillOpacity="0.2" />
        <path d="M85 100l10 10 20-20" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="100" cy="100" r="60" stroke={color} strokeWidth="1" opacity="0.1" />
      </svg>
    )
  }
];

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete, theme, userPlan, onThemeChange, onUpgrade }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [previewThemeId, setPreviewThemeId] = useState<ThemeId>(theme.id);
  const [showUpgradeTip, setShowUpgradeTip] = useState(false);

  const activeStep = STEPS[currentStep];
  const activePreviewTheme = THEME_REGISTRY[previewThemeId];

  const handleNext = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      onComplete('talk');
    }
  }, [currentStep, onComplete]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(s => s - 1);
    }
  }, [currentStep]);

  const handleThemeSelect = (id: ThemeId) => {
    const selected = THEME_REGISTRY[id];
    if (selected.isPro && userPlan === 'FREE') {
      setShowUpgradeTip(true);
      return;
    }
    setShowUpgradeTip(false);
    setPreviewThemeId(id);
    onThemeChange(id);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handleBack();
      if (e.key === 'Escape') onComplete();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handleBack, onComplete]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl transition-all duration-500">
      {/* Background glow reflecting selected theme */}
      <div 
        className="absolute inset-0 opacity-20 transition-all duration-1000 blur-[100px]"
        style={{ background: `radial-gradient(circle at center, ${activePreviewTheme.colors.hexPrimary}, transparent 70%)` }}
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className={`w-full max-w-[580px] ${activePreviewTheme.colors.bgPanel} border ${activePreviewTheme.colors.border} rounded-[3rem] shadow-2xl overflow-hidden relative z-10 transition-colors duration-500`}
      >
        <button 
          onClick={() => onComplete()}
          className="absolute top-8 right-8 text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-white transition-colors z-20"
        >
          Skip
        </button>

        <div className="p-10 pt-16 flex flex-col items-center text-center">
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full"
            >
              {activeStep.illustration && (
                <div className="mb-10 transition-colors duration-500">
                  {activeStep.illustration(activePreviewTheme.colors.hexPrimary)}
                </div>
              )}

              <h2 className="text-3xl font-display font-bold text-white mb-4 tracking-tight">
                {activeStep.title}
              </h2>
              
              <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
                {activeStep.body}
              </p>

              {activeStep.id === 'themes' && (
                <div className="grid grid-cols-2 gap-3 mb-10 w-full">
                  {(['midnight', 'clean_light', 'signalum_studio', 'focus_black'] as ThemeId[]).map(id => {
                    const t = THEME_REGISTRY[id];
                    const isLocked = t.isPro && userPlan === 'FREE';
                    const isSelected = previewThemeId === id;
                    return (
                      <button 
                        key={id}
                        onClick={() => handleThemeSelect(id)}
                        className={`relative p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 group ${isSelected ? `${t.colors.border} bg-white/5` : 'border-white/5 hover:bg-white/5'}`}
                      >
                        <div className={`w-8 h-8 rounded-full ${t.colors.primary} border border-white/20`} />
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${isSelected ? 'text-white' : 'text-slate-500'}`}>
                          {t.label}
                        </span>
                        {t.isPro && (
                          <span className={`absolute top-2 right-2 text-[7px] font-bold px-1 rounded ${isLocked ? 'bg-slate-800 text-slate-500' : 'bg-blue-500/20 text-blue-400'}`}>
                            PRO
                          </span>
                        )}
                        {isLocked && <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg></div>}
                      </button>
                    );
                  })}
                </div>
              )}

              {showUpgradeTip && activeStep.id === 'themes' && (
                <div className="mb-8 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-between gap-4 animate-fade-in">
                  <p className="text-[10px] text-blue-300 text-left">This environment is reserved for Signalum Pro users.</p>
                  <button onClick={onUpgrade} className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-white bg-blue-600 px-3 py-1.5 rounded-lg">Upgrade</button>
                </div>
              )}

              {activeStep.bullets.length > 0 && (
                <ul className="space-y-3 mb-10 text-left max-w-[280px] mx-auto">
                  {activeStep.bullets.map((b, i) => (
                    <li key={i} className="flex items-center gap-3 text-xs text-slate-300">
                      <div className={`w-1.5 h-1.5 rounded-full ${activePreviewTheme.colors.primary}`} />
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="w-full space-y-6">
            {currentStep < STEPS.length - 1 ? (
              <div className="flex items-center justify-between gap-4">
                <button 
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className={`px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all ${currentStep === 0 ? 'opacity-0 pointer-events-none' : 'text-slate-500 hover:text-white'}`}
                >
                  Back
                </button>
                <button 
                  onClick={handleNext}
                  className={`flex-1 py-4 ${activePreviewTheme.colors.primary} text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-xl active:scale-95 transition-all`}
                >
                  Next
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => onComplete('talk')}
                  className={`w-full py-5 ${activePreviewTheme.colors.primary} text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-xl active:scale-95 transition-all`}
                >
                  Start talking to Voxera
                </button>
                <button 
                  onClick={() => onComplete('source')}
                  className="w-full py-4 text-slate-400 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors"
                >
                  Add a source first
                </button>
              </div>
            )}

            <div className="flex items-center justify-center gap-2">
              {STEPS.map((_, i) => (
                <div 
                  key={i}
                  className={`h-1 rounded-full transition-all duration-300 ${i === currentStep ? `w-6 ${activePreviewTheme.colors.primary}` : 'w-1 bg-white/10'}`}
                />
              ))}
            </div>
            <p className="text-[9px] text-white/20 uppercase tracking-[0.2em] font-bold">
              Step {currentStep + 1} of {STEPS.length}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
