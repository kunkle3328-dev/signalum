
import React from 'react';
import { ThemeId } from '../types';

interface BackgroundProps {
  themeId: ThemeId;
}

export const Background: React.FC<BackgroundProps> = ({ themeId }) => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none bg-black transform-gpu">
      {themeId === 'midnight' && <MidnightTheme />}
      {themeId === 'clean_light' && <CleanLightTheme />}
      {themeId === 'signalum_studio' && <StudioTheme />}
      {themeId === 'focus_black' && <FocusBlackTheme />}
      {themeId === 'glass_horizon' && <GlassHorizonTheme />}
      {themeId === 'midnight_neon' && <MidnightNeonTheme />}
      {themeId === 'nebula' && <NebulaTheme />}
      {themeId === 'solaris' && <SolarisTheme />}
      {themeId === 'quantal' && <QuantalTheme />}
      {themeId === 'aether' && <AetherTheme />}
      {themeId === 'onyx' && <OnyxEliteTheme />}
      
      {/* Cinematic Grain & Vignette Overlay */}
      <div className="absolute inset-0 opacity-[0.06] mix-blend-overlay z-10 pointer-events-none" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}>
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.7)_100%)] z-20"></div>
    </div>
  );
};

const MidnightTheme = () => (
  <div className="absolute inset-0 bg-[#020617] transition-all duration-1000">
    <div className="absolute inset-[-50%] opacity-40 bg-[radial-gradient(ellipse_at_center,rgba(30,58,138,0.4)_0%,transparent_70%)] animate-[float-ethereal_25s_ease-in-out_infinite]"></div>
    <div className="absolute inset-[-40%] opacity-20 bg-[radial-gradient(ellipse_at_bottom,rgba(59,130,246,0.2)_0%,transparent_60%)] animate-[float-ethereal_20s_ease-in-out_infinite_reverse]"></div>
  </div>
);

const CleanLightTheme = () => (
  <div className="absolute inset-0 bg-slate-50 transition-all duration-1000">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(203,213,225,0.4)_0%,transparent_50%)]"></div>
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,rgba(203,213,225,0.4)_0%,transparent_50%)]"></div>
  </div>
);

const StudioTheme = () => (
  <div className="absolute inset-0 bg-[#000000]">
    <div className="absolute inset-[-10%] opacity-30 bg-[radial-gradient(ellipse_at_top,rgba(79,70,229,0.2)_0%,transparent_60%)]"></div>
    <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-indigo-950/20 to-transparent"></div>
    {/* Minimal Studio Grid */}
    <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:100px_100px]"></div>
  </div>
);

const FocusBlackTheme = () => (
  <div className="absolute inset-0 bg-[#000000]">
    {/* Pure Black distractions-free environment */}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_50%)]"></div>
  </div>
);

const GlassHorizonTheme = () => (
  <div className="absolute inset-0 bg-[#083344]">
    <div className="absolute inset-[-50%] opacity-40 bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,#0e7490_120deg,transparent_240deg,#06b6d4_360deg)] animate-[slow-rotate_60s_linear_infinite] filter blur-[100px]"></div>
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(8,51,68,0.8)_100%)]"></div>
  </div>
);

const MidnightNeonTheme = () => (
  <div className="absolute inset-0 bg-black">
    <div className="absolute top-0 left-1/4 w-[50vw] h-[50vh] bg-pink-600/5 blur-[120px]"></div>
    <div className="absolute bottom-0 right-1/4 w-[50vw] h-[50vh] bg-blue-600/5 blur-[120px]"></div>
    <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(219,39,119,0.02)_50%,transparent_100%)] animate-[scan-line-advanced_8s_linear_infinite]"></div>
  </div>
);

const NebulaTheme = () => (
  <div className="absolute inset-0 bg-[#0a0118]">
    <div className="absolute inset-[-100%] opacity-60 mix-blend-screen filter blur-[100px]">
        <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,#4c1d95_60deg,#c026d3_150deg,transparent_240deg,#2563eb_300deg,transparent_360deg)] animate-[slow-rotate_45s_linear_infinite]"></div>
    </div>
  </div>
);

const SolarisTheme = () => (
  <div className="absolute inset-0 bg-[#1f0a00]">
    <div className="absolute bottom-[-50%] left-[-20%] right-[-20%] h-[120vh] bg-[radial-gradient(circle_at_center,#f97316_0%,#ea580c_40%,#7c2d12_70%,transparent_100%)] filter blur-[60px] animate-[solar-flare_12s_ease-in-out_infinite]"></div>
  </div>
);

const QuantalTheme = () => (
  <div className="absolute inset-0 bg-black">
    <div className="absolute inset-0 opacity-20 perspective-[1200px]">
        <div className="absolute inset-[-100%] bg-[linear-gradient(rgba(16,185,129,0.2)_1.5px,transparent_1.5px),linear-gradient(90deg,rgba(16,185,129,0.2)_1.5px,transparent_1.5px)] 
             bg-[size:60px_60px] animate-[grid-warp_5s_linear_infinite]"></div>
    </div>
  </div>
);

const AetherTheme = () => (
  <div className="absolute inset-0 bg-[#030712]">
    <div className="absolute inset-0 opacity-50 mix-blend-screen overflow-hidden">
        <div className="absolute inset-[-50%] bg-[linear-gradient(45deg,transparent_20%,#6366f1_40%,#22d3ee_60%,transparent_80%)] blur-[100px] animate-[ribbon-flow_20s_ease-in-out_infinite] bg-[size:300%_300%]"></div>
    </div>
  </div>
);

const OnyxEliteTheme = () => (
  <div className="absolute inset-0 bg-black">
    <div className="absolute inset-0 opacity-70 mix-blend-color-dodge">
        <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,#000_0deg,#b45309_30deg,#fbbf24_45deg,#b45309_60deg,#000_120deg)] blur-[80px] animate-[slow-rotate_30s_linear_infinite]"></div>
    </div>
  </div>
);
