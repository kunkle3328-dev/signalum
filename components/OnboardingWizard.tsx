
import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Theme, ThemeId, UserPlan } from '../types';
import { THEME_REGISTRY } from '../themes/themeRegistry';

interface OnboardingWizardProps {
  onComplete: () => void;
  theme: Theme;
  userPlan: UserPlan;
  onThemeChange: (themeId: ThemeId) => void;
  onUpgrade: () => void;
}

const WelcomeIllustration = ({ color }: { color: string }) => (
  <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
    <motion.div
      animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className="absolute inset-0 rounded-full blur-3xl"
      style={{ backgroundColor: color }}
    />
    <svg viewBox="0 0 100 100" className="w-24 h-24 relative z-10 overflow-visible">
       <motion.circle
         cx="50" cy="50" r="30"
         stroke={color} strokeWidth="2" fill="none"
         initial={{ scale: 0, opacity: 0 }}
         animate={{ scale: 1, opacity: 0.5 }}
         transition={{ duration: 1.5, ease: "easeOut" }}
       />
       <motion.path
         d="M50 20 L50 80 M20 50 L80 50"
         stroke={color} strokeWidth="1" strokeLinecap="round"
         initial={{ pathLength: 0, opacity: 0 }}
         animate={{ pathLength: 1, opacity: 1 }}
         transition={{ delay: 0.5, duration: 1.5, ease: "easeInOut" }}
       />
       <motion.circle
         cx="50" cy="50" r="10"
         fill={color}
         initial={{ scale: 0 }}
         animate={{ scale: 1 }}
         transition={{ delay: 1, type: "spring", stiffness: 200 }}
       />
       <motion.circle
         cx="50" cy="50" r="45"
         stroke={color} strokeWidth="1" strokeDasharray="4 4" fill="none"
         animate={{ rotate: 360 }}
         transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
         className="opacity-40"
       />
    </svg>
  </div>
);

const ConnectionIllustration = ({ color }: { color: string }) => (
  <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
    <svg viewBox="0 0 100 100" className="w-32 h-32 relative z-10">
      {[0, 1, 2, 3].map((i) => (
        <motion.rect
          key={i}
          x={35 + i * 8}
          y="40"
          width="4"
          height="20"
          rx="2"
          fill={color}
          animate={{ 
            height: [20, 60, 20], 
            y: [40, 20, 40],
            opacity: [0.5, 1, 0.5] 
          }}
          transition={{ 
            duration: 1, 
            repeat: Infinity, 
            delay: i * 0.1,
            ease: "easeInOut" 
          }}
        />
      ))}
    </svg>
    <motion.div 
      className="absolute inset-0 border-2 rounded-full border-dashed opacity-20"
      style={{ borderColor: color }}
      animate={{ rotate: -360 }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
    />
  </div>
);

const ContextIllustration = ({ color }: { color: string }) => (
  <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
    <div className="relative z-10 grid grid-cols-2 gap-2">
       {[0, 1, 2, 3].map((i) => (
         <motion.div
           key={i}
           initial={{ scale: 0, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ delay: i * 0.2, type: "spring" }}
           className="w-10 h-12 rounded border bg-white/5 flex flex-col p-1.5 gap-1"
           style={{ borderColor: color + '60' }}
         >
            <div className="w-full h-1.5 rounded-sm opacity-50" style={{ backgroundColor: color }}></div>
            <div className="w-3/4 h-1.5 rounded-sm bg-white/10"></div>
            <div className="w-1/2 h-1.5 rounded-sm bg-white/10"></div>
         </motion.div>
       ))}
    </div>
    <motion.div
       className="absolute inset-0"
       animate={{ rotate: 360 }}
       transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
    >
       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }}></div>
    </motion.div>
  </div>
);

const STEPS = [
  {
    id: 'welcome',
    title: `Initialize Studio`,
    body: "Welcome to Voxera — your personal neural intelligence for deep research and strategic growth.",
    illustration: WelcomeIllustration
  },
  {
    id: 'talk',
    title: "Live Connection",
    body: "Interact with Signalum using natural spoken language. It yields instantly when interrupted, just like a real partner.",
    illustration: ConnectionIllustration
  },
  {
    id: 'sources',
    title: "Context Gathers",
    body: "Ground Voxera by syncing PDF nodes, YouTube documentation, and live web research into your active context.",
    illustration: ContextIllustration
  },
  {
    id: 'themes',
    title: "Neural Profile",
    body: "Select a visual profile for your building environment.",
    illustration: null
  }
];

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete, theme, userPlan, onThemeChange, onUpgrade }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [previewThemeId, setPreviewThemeId] = useState<ThemeId>(theme.id);

  const activeStep = STEPS[currentStep];
  const activeTheme = THEME_REGISTRY[previewThemeId] || THEME_REGISTRY.midnight;

  const handleNext = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      setDirection(1);
      setCurrentStep(s => s + 1);
    } else {
      onComplete();
    }
  }, [currentStep, onComplete]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(s => s - 1);
    }
  }, [currentStep]);

  // Sync theme change to main app background
  const handleThemePreview = (id: ThemeId) => {
    setPreviewThemeId(id);
    onThemeChange(id);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0,
      scale: 0.95
    })
  };

  return (
    <div className="fixed inset-0 z-[1500] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm overflow-hidden transition-colors duration-700">
      
      {/* Dynamic Glow Behind Card */}
      <motion.div 
        animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.1, 1] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] blur-[120px] rounded-full pointer-events-none"
        style={{ backgroundColor: activeTheme.colors.hexPrimary, opacity: 0.15 }}
      />

      <div className="w-full max-w-[500px] relative z-10 perspective-1000">
        <motion.div 
          className="relative bg-[#050505]/80 border border-white/10 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden backdrop-blur-2xl"
          style={{ borderColor: activeTheme.colors.hexPrimary + '30' }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/5">
             <motion.div 
               className="h-full transition-colors duration-500"
               style={{ backgroundColor: activeTheme.colors.hexPrimary }}
               initial={{ width: 0 }}
               animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
               transition={{ duration: 0.5, ease: "easeInOut" }}
             />
          </div>

          <button onClick={onComplete} className="absolute top-6 right-8 text-[9px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-white transition-colors z-20">Skip</button>

          <div className="p-10 pt-16 min-h-[500px] flex flex-col">
            <div className="flex-1 flex flex-col items-center justify-center text-center relative">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={currentStep}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                  className="w-full flex flex-col items-center"
                >
                  {activeStep.illustration && (
                    <div className="mb-8">
                       <activeStep.illustration color={activeTheme.colors.hexPrimary} />
                    </div>
                  )}

                  <h2 className="text-3xl font-black text-white mb-6 font-display tracking-tight uppercase">
                    {activeStep.title}
                  </h2>
                  <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto font-medium">
                    {activeStep.body}
                  </p>

                  {activeStep.id === 'themes' && (
                    <div className="grid grid-cols-2 gap-3 w-full max-w-sm mt-8">
                      {(['midnight', 'focus_black', 'signalum_studio', 'onyx'] as ThemeId[]).map(id => {
                        const t = THEME_REGISTRY[id];
                        const isSelected = previewThemeId === id;
                        return (
                          <button 
                            key={id} 
                            onClick={() => handleThemePreview(id)}
                            className={`group relative p-4 rounded-xl border transition-all duration-300 flex flex-col items-center gap-3 ${isSelected ? 'bg-white/10' : 'bg-black/40 hover:bg-white/5'} ${isSelected ? 'border-white/20' : 'border-white/5'}`}
                            style={{ borderColor: isSelected ? t.colors.hexPrimary : undefined }}
                          >
                             <div className="w-full h-8 rounded-lg overflow-hidden relative shadow-inner">
                                <div className="absolute inset-0" style={{ backgroundColor: t.visualProfile.bgMain }}></div>
                                <div className="absolute inset-0 opacity-50 bg-gradient-to-tr from-transparent to-white/10"></div>
                             </div>
                             <span className={`text-[10px] font-black uppercase tracking-wider ${isSelected ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>{t.label}</span>
                             {isSelected && <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20 pointer-events-none"></div>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-12 flex items-center justify-between w-full">
               <button 
                 onClick={handleBack} 
                 className={`px-6 py-3 text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 hover:text-white transition-colors ${currentStep === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
               >
                 Back
               </button>
               
               <div className="flex gap-2">
                  {STEPS.map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-1 rounded-full transition-all duration-300 ${i === currentStep ? 'w-6' : 'w-1 bg-white/10'}`} 
                      style={{ backgroundColor: i === currentStep ? activeTheme.colors.hexPrimary : undefined }} 
                    />
                  ))}
               </div>

               <button 
                 onClick={handleNext} 
                 className={`px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.25em] text-white shadow-lg transition-all hover:brightness-110 active:scale-95`}
                 style={{ backgroundColor: activeTheme.colors.hexPrimary, color: activeTheme.id === 'focus_black' ? 'black' : 'white' }}
               >
                 {currentStep === STEPS.length - 1 ? 'Finish' : 'Next'}
               </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
