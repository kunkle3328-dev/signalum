
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Theme, ThemeId, UserPlan } from '../types';
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
    title: `Initialize Studio`,
    body: "Initialize Voxera — your personal neural intelligence for deep research and strategic growth.",
    bullets: [
      "Human-grade conversational flow",
      "Strategic synthesis architecture",
      "Contextually grounded logic"
    ],
    illustration: (color: string) => (
      <div className="relative w-32 h-32 mx-auto">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute inset-0 blur-3xl rounded-full"
          style={{ backgroundColor: color }}
        />
        <svg viewBox="0 0 200 200" className="w-full h-full relative z-10" fill="none">
          <circle cx="100" cy="100" r="70" stroke={color} strokeWidth="1" strokeDasharray="8 4" opacity="0.2" />
          <path d="M70 100c0-16.569 13.431-30 30-30s30 13.431 30 30-13.431 30-30 30-30-13.431-30-30z" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="2" />
        </svg>
      </div>
    )
  },
  {
    id: 'talk',
    title: "Live Connection",
    body: "Interact with Signalum using spoken language. It yields instantly when interrupted, just like a building partner.",
    bullets: [
      "Low latency neural connection",
      "Natural rhythmic pacing",
      "Studio recording depth"
    ],
    illustration: (color: string) => (
      <svg viewBox="0 0 200 200" className="w-32 h-32 mx-auto" fill="none">
        <rect x="80" y="60" width="40" height="80" rx="20" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.05" />
        <motion.circle 
          animate={{ r: [30, 45, 30], opacity: [0.1, 0, 0.1] }}
          transition={{ duration: 3, repeat: Infinity }}
          cx="100" cy="100" r="30" stroke={color} strokeWidth="1" 
        />
      </svg>
    )
  },
  {
    id: 'sources',
    title: "Context Gathers",
    body: "Ground Voxera by syncing PDF nodes, YouTube documentation, and live web research.",
    bullets: [
      "Search Intelligence Scan",
      "Zero-hallucination accuracy",
      "Massive knowledge ingestion"
    ],
    illustration: (color: string) => (
      <svg viewBox="0 0 200 200" className="w-32 h-32 mx-auto" fill="none">
        <path d="M60 40h60l20 20v100H60V40z" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.05" />
        <motion.path 
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          d="M80 80h40M80 100h40M80 120h20" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.4" 
        />
      </svg>
    )
  },
  {
    id: 'themes',
    title: "Neural Profile",
    body: "Select a visual profile for your building environment.",
    bullets: [],
    illustration: null
  }
];

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete, theme, userPlan, onThemeChange, onUpgrade }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [previewThemeId, setPreviewThemeId] = useState<ThemeId>(theme.id);

  const activeStep = STEPS[currentStep];
  const activePreviewTheme = THEME_REGISTRY[previewThemeId];

  const handleNext = useCallback(() => {
    if (currentStep < STEPS.length - 1) setCurrentStep(s => s + 1);
    else onComplete();
  }, [currentStep, onComplete]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) setCurrentStep(s => s - 1);
  }, [currentStep]);

  return (
    <div className="fixed inset-0 z-[1500] flex items-center justify-center p-6 bg-[#020205]/98 backdrop-blur-3xl overflow-hidden">
      <motion.div 
        animate={{ opacity: [0.05, 0.1, 0.05] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute inset-0 blur-[100px]"
        style={{ background: `radial-gradient(circle at center, ${activePreviewTheme.colors.hexPrimary}, transparent 60%)` }}
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className={`w-full max-w-[580px] bg-black/40 border border-white/10 rounded-[3rem] shadow-2xl relative z-10 overflow-hidden backdrop-blur-2xl`}
        style={{ borderColor: activePreviewTheme.colors.hexPrimary + '30' }}
      >
        <button onClick={() => onComplete()} className="absolute top-10 right-10 text-[9px] font-black uppercase tracking-[0.3em] text-white/20 hover:text-white transition-colors z-20">Skip Setup</button>

        <div className="p-10 md:p-14 flex flex-col items-center">
          <AnimatePresence mode="wait">
            <motion.div key={currentStep} initial={{ opacity: 0, filter: 'blur(5px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, filter: 'blur(5px)' }} transition={{ duration: 0.4 }} className="w-full text-center">
              {activeStep.illustration && <div className="mb-10">{activeStep.illustration(activePreviewTheme.colors.hexPrimary)}</div>}
              <h2 className="text-2xl font-black text-white mb-5 tracking-tight uppercase">{activeStep.title}</h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-10 max-w-sm mx-auto">{activeStep.body}</p>

              {activeStep.id === 'themes' && (
                <div className="grid grid-cols-2 gap-4 mb-12">
                  {(['focus_black', 'midnight', 'signalum_studio', 'onyx'] as ThemeId[]).map(id => {
                    const t = THEME_REGISTRY[id];
                    const isSelected = previewThemeId === id;
                    return (
                      <button key={id} onClick={() => { setPreviewThemeId(id); onThemeChange(id); }} className={`relative p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 group ${isSelected ? 'bg-white/5' : 'border-white/5 bg-black/20'}`} style={{ borderColor: isSelected ? t.colors.hexPrimary : undefined }}>
                        <div className={`w-8 h-8 rounded-xl ${t.colors.primary} border border-white/10 shadow-lg`} />
                        <span className={`text-[9px] font-black uppercase tracking-[0.1em] ${isSelected ? 'text-white' : 'text-slate-600'}`}>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {activeStep.bullets.length > 0 && (
                <ul className="space-y-3 mb-10 text-left max-w-[280px] mx-auto">
                  {activeStep.bullets.map((b, i) => (
                    <li key={i} className="flex items-center gap-4 text-xs font-bold text-slate-300">
                      <div className="shrink-0 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: activePreviewTheme.colors.hexPrimary, boxShadow: `0 0 5px ${activePreviewTheme.colors.hexPrimary}` }} />
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="w-full flex flex-col items-center gap-6">
            <div className="flex items-center justify-between w-full gap-5">
                <button onClick={handleBack} className={`px-8 py-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all ${currentStep === 0 ? 'opacity-0' : 'text-slate-600 hover:text-white'}`}>Back</button>
                <button onClick={handleNext} className={`flex-1 py-4 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl active:scale-[0.98] transition-all`} style={{ backgroundColor: activePreviewTheme.colors.hexPrimary }}>
                  {currentStep === STEPS.length - 1 ? 'Enter Workspace' : 'Continue'}
                </button>
            </div>
            <div className="flex gap-2">
              {STEPS.map((_, i) => (
                <div key={i} className={`h-0.5 rounded-full transition-all duration-300 ${i === currentStep ? 'w-6' : 'w-1 bg-white/10'}`} style={{ backgroundColor: i === currentStep ? activePreviewTheme.colors.hexPrimary : undefined }} />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
