
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('Neural Core Offline');

  useEffect(() => {
    const duration = 2800; 
    const interval = 20;
    const steps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const percent = Math.min(100, (currentStep / steps) * 100);
      setProgress(Math.round(percent));

      if (percent > 5 && percent < 30) setStage('Initializing Mapping...');
      if (percent >= 30 && percent < 60) setStage('Calibrating Voxera...');
      if (percent >= 60 && percent < 90) setStage('Synchronizing Nodes...');
      if (percent >= 90) setStage('Studio Ready.');

      if (currentStep >= steps) {
        clearInterval(timer);
        setTimeout(onComplete, 400);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[1000] bg-[#020205] flex flex-col items-center justify-center overflow-hidden">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.05, 0.15, 0.05] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(41,98,255,0.1),transparent_70%)]"
      />
      
      <div className="w-full max-w-sm px-10 relative z-10">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-center mb-12 relative"
        >
             <div className="absolute inset-0 bg-blue-500/10 blur-[60px] rounded-full animate-pulse"></div>
             <motion.div
               animate={{ rotate: 360 }}
               transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
               className="relative"
             >
               <svg className="w-20 h-20 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.3"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
               </svg>
             </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-3xl font-black text-white tracking-[0.4em] mb-2 font-display uppercase">
              SIGNALUM
          </h1>
          <p className="text-[8px] uppercase tracking-[0.5em] font-black text-blue-500/60 mb-12">STUDIO INTERFACE v3</p>

          <div className="relative h-[2px] w-full bg-white/5 rounded-full overflow-hidden mb-5">
              <motion.div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-transparent via-blue-500 to-white shadow-[0_0_10px_rgba(59,130,246,0.8)]"
                  style={{ width: `${progress}%` }}
              />
          </div>

          <div className="flex justify-between items-center px-0.5">
              <motion.span 
                key={stage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                className="text-[9px] text-white font-black uppercase tracking-[0.2em]"
              >
                {stage}
              </motion.span>
              <span className="text-[10px] font-bold text-white font-mono opacity-30">{progress}%</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
