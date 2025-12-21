
import React from 'react';
import { ThemeId } from '../types';

interface BackgroundProps {
  themeId: ThemeId;
  animationsEnabled?: boolean;
}

export const Background: React.FC<BackgroundProps> = ({ themeId, animationsEnabled = true }) => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none bg-black transform-gpu">
      {themeId === 'midnight' && <CyberTheme color="#00f3ff" />}
      {themeId === 'midnight_neon' && <CyberTheme color="#ff00f3" />}
      {themeId === 'nebula' && <CyberTheme color="#9d00ff" />}
      {themeId === 'quantal' && <CyberTheme color="#10b981" />}
      {themeId === 'focus_black' && <FocusBlackTheme />}
      {themeId === 'onyx' && <OnyxEliteTheme />}
      {themeId === 'clean_light' && <CleanLightTheme />}
      {themeId === 'signalum_studio' && <CyberTheme color="#2563eb" />}
      {themeId === 'glass_horizon' && <GlassHorizonTheme />}
      {themeId === 'solaris' && <SolarisTheme />}
      {themeId === 'aether' && <AetherTheme />}
      
      {/* Premium Cinematic Overlays */}
      <div className="absolute inset-0 cyber-grid opacity-[0.4] mix-blend-overlay"></div>
      
      <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay z-10 pointer-events-none" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}>
      </div>

      {animationsEnabled && (
        <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(255,255,255,0.03)_50%,transparent_100%)] animate-[scan-line-advanced_12s_linear_infinite] z-20"></div>
      )}
      
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.8)_100%)] z-30"></div>
    </div>
  );
};

const CyberTheme = ({ color }: { color: string }) => (
  <div className="absolute inset-0 bg-black transition-all duration-1000">
    <div className="absolute inset-[-50%] opacity-20 bg-[radial-gradient(ellipse_at_center,var(--color)_0%,transparent_70%)] animate-[float-ethereal_30s_ease-in-out_infinite]" style={{ '--color': color } as any}></div>
    <div className="absolute top-1/4 left-1/4 w-[60vw] h-[60vh] opacity-10 blur-[150px] rounded-full" style={{ backgroundColor: color }}></div>
    <div className="absolute bottom-1/4 right-1/4 w-[60vw] h-[60vh] opacity-10 blur-[150px] rounded-full" style={{ backgroundColor: color }}></div>
  </div>
);

const MidnightTheme = () => (
  <div className="absolute inset-0 bg-[#020205] transition-all duration-1000">
    <div className="absolute inset-[-50%] opacity-30 bg-[radial-gradient(ellipse_at_center,rgba(0,243,255,0.3)_0%,transparent_70%)] animate-[float-ethereal_25s_ease-in-out_infinite]"></div>
  </div>
);

const CleanLightTheme = () => (
  <div className="absolute inset-0 bg-white transition-all duration-1000">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(15,23,42,0.05)_0%,transparent_50%)]"></div>
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,rgba(15,23,42,0.05)_0%,transparent_50%)]"></div>
  </div>
);

const FocusBlackTheme = () => (
  <div className="absolute inset-0 bg-black">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.01)_0%,transparent_60%)]"></div>
  </div>
);

const GlassHorizonTheme = () => (
  <div className="absolute inset-0 bg-[#05161c]">
    <div className="absolute inset-[-50%] opacity-20 bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,#06b6d4_120deg,transparent_240deg,#06b6d4_360deg)] animate-[slow-rotate_60s_linear_infinite] filter blur-[100px]"></div>
  </div>
);

const SolarisTheme = () => (
  <div className="absolute inset-0 bg-[#080200]">
    <div className="absolute bottom-[-40%] left-[-10%] right-[-10%] h-[100vh] bg-[radial-gradient(circle_at_center,#ea580c_0%,#ea580c_40%,transparent_100%)] filter blur-[120px] opacity-40 animate-[solar-flare_15s_ease-in-out_infinite]"></div>
  </div>
);

const AetherTheme = () => (
  <div className="absolute inset-0 bg-[#010205]">
    <div className="absolute inset-0 opacity-40 mix-blend-screen overflow-hidden">
        <div className="absolute inset-[-50%] bg-[linear-gradient(45deg,transparent_20%,#0062ff_40%,#67e8f9_60%,transparent_80%)] blur-[100px] animate-[ribbon-flow_25s_ease-in-out_infinite] bg-[size:300%_300%]"></div>
    </div>
  </div>
);

const OnyxEliteTheme = () => (
  <div className="absolute inset-0 bg-black">
    <div className="absolute inset-0 opacity-40 mix-blend-color-dodge">
        <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,#000_0deg,#ca8a04_30deg,#fbbf24_45deg,#ca8a04_60deg,#000_120deg)] blur-[100px] animate-[slow-rotate_40s_linear_infinite]"></div>
    </div>
  </div>
);
