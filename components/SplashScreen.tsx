
import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('Initializing Neural Core...');

  useEffect(() => {
    const duration = 2800; // ms
    const interval = 30;
    const steps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const percent = Math.min(100, (currentStep / steps) * 100);
      setProgress(Math.round(percent));

      if (percent > 20 && percent < 40) setStage('Loading Signalum Model...');
      if (percent > 40 && percent < 70) setStage('Voxera Audio Calibration...');
      if (percent > 70 && percent < 90) setStage('Establishing Studio Uplink...');
      if (percent > 90) setStage('Voxera Ready.');

      if (currentStep >= steps) {
        clearInterval(timer);
        setTimeout(onComplete, 200);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] bg-[#020617] flex flex-col items-center justify-center font-display">
      <div className="w-full max-w-sm px-8">
        <div className="flex justify-center mb-12 relative">
             <div className="absolute inset-0 bg-blue-500/20 blur-[60px] rounded-full animate-pulse"></div>
             <svg className="w-20 h-20 text-white relative z-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
             </svg>
        </div>

        <h1 className="text-4xl font-bold text-center text-white tracking-[0.2em] mb-2 glitch" data-text="SIGNALUM">
            SIGNALUM
        </h1>
        <div className="flex justify-center gap-2 mb-12">
            <span className="h-[1px] w-8 bg-blue-500/50 block"></span>
            <p className="text-[10px] uppercase tracking-widest text-blue-500/80">Neural Studio Interface</p>
            <span className="h-[1px] w-8 bg-blue-500/50 block"></span>
        </div>

        <div className="relative h-1 w-full bg-gray-900 rounded-full overflow-hidden mb-4">
            <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-700 via-blue-500 to-white transition-all duration-100 ease-out shadow-[0_0_10px_rgba(59,130,246,0.8)]"
                style={{ width: `${progress}%` }}
            ></div>
        </div>

        <div className="flex justify-between items-end">
            <span className="text-xs text-gray-500 font-mono">{stage}</span>
            <span className="text-xl font-bold text-white font-mono">{progress}%</span>
        </div>
      </div>
    </div>
  );
};
