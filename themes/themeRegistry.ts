
import { Theme, ThemeId } from '../types';

export const THEME_REGISTRY: Record<ThemeId, Theme> = {
  midnight: {
    id: 'midnight',
    label: 'Deep Midnight',
    description: 'The standard Signalum dark experience.',
    isPro: false,
    colors: {
      primary: 'bg-blue-600',
      secondary: 'text-blue-400',
      accentGlow: 'rgba(37,99,235,0.5)',
      textMain: 'text-blue-100',
      textSecondary: 'text-blue-300',
      border: 'border-blue-500/20',
      bgPanel: 'bg-[#020617]/90',
      hexPrimary: '#2563eb',
      hexSecondary: '#60a5fa'
    },
    visualProfile: {
      bgMain: '#020617',
      bgSurface: 'rgba(15, 23, 42, 0.6)',
      textPrimary: '#f1f5f9',
      textSecondary: '#94a3b8',
      accent: '#2563eb',
      glassOpacity: '0.6',
      glassBlur: '12px',
      vignette: 0.5,
      grain: 0.05,
      motionLevel: 'low'
    }
  },
  clean_light: {
    id: 'clean_light',
    label: 'Pure Light',
    description: 'A bright, high-contrast workspace.',
    isPro: false,
    colors: {
      primary: 'bg-slate-800',
      secondary: 'text-slate-600',
      accentGlow: 'rgba(100,116,139,0.3)',
      textMain: 'text-slate-900',
      textSecondary: 'text-slate-500',
      border: 'border-slate-200',
      bgPanel: 'bg-white/95',
      hexPrimary: '#1e293b',
      hexSecondary: '#64748b'
    },
    visualProfile: {
      bgMain: '#f8fafc',
      bgSurface: 'rgba(255, 255, 255, 0.8)',
      textPrimary: '#0f172a',
      textSecondary: '#64748b',
      accent: '#334155',
      glassOpacity: '0.8',
      glassBlur: '16px',
      vignette: 0.2,
      grain: 0.02,
      motionLevel: 'none'
    }
  },
  signalum_studio: {
    id: 'signalum_studio',
    label: 'Signalum Studio',
    description: 'Studio-grade environment for deep thinking.',
    isPro: true,
    colors: {
      primary: 'bg-indigo-600',
      secondary: 'text-indigo-400',
      accentGlow: 'rgba(79,70,229,0.4)',
      textMain: 'text-white',
      textSecondary: 'text-indigo-200',
      border: 'border-indigo-500/30',
      bgPanel: 'bg-black/80',
      hexPrimary: '#4f46e5',
      hexSecondary: '#818cf8'
    },
    visualProfile: {
      bgMain: '#000000',
      bgSurface: 'rgba(0, 0, 0, 0.7)',
      textPrimary: '#ffffff',
      textSecondary: '#a5b4fc',
      accent: '#6366f1',
      glassOpacity: '0.7',
      glassBlur: '24px',
      vignette: 0.8,
      grain: 0.1,
      motionLevel: 'low'
    }
  },
  focus_black: {
    id: 'focus_black',
    label: 'Focus Black',
    description: 'Ultra-minimal, distraction-free workspace.',
    isPro: true,
    colors: {
      primary: 'bg-zinc-800',
      secondary: 'text-zinc-400',
      accentGlow: 'rgba(255,255,255,0.05)',
      textMain: 'text-zinc-100',
      textSecondary: 'text-zinc-500',
      border: 'border-zinc-800',
      bgPanel: 'bg-[#050505]',
      hexPrimary: '#27272a',
      hexSecondary: '#71717a'
    },
    visualProfile: {
      bgMain: '#000000',
      bgSurface: 'rgba(5, 5, 5, 1)',
      textPrimary: '#fafafa',
      textSecondary: '#71717a',
      accent: '#27272a',
      glassOpacity: '1',
      glassBlur: '0px',
      vignette: 0.4,
      grain: 0,
      motionLevel: 'none'
    }
  },
  glass_horizon: {
    id: 'glass_horizon',
    label: 'Glass Horizon',
    description: 'Modern glass workspace with calm depth.',
    isPro: true,
    colors: {
      primary: 'bg-cyan-500',
      secondary: 'text-cyan-300',
      accentGlow: 'rgba(6,182,212,0.3)',
      textMain: 'text-white',
      textSecondary: 'text-cyan-100',
      border: 'border-white/10',
      bgPanel: 'bg-white/5',
      hexPrimary: '#06b6d4',
      hexSecondary: '#22d3ee'
    },
    visualProfile: {
      bgMain: '#083344',
      bgSurface: 'rgba(255, 255, 255, 0.05)',
      textPrimary: '#ffffff',
      textSecondary: '#cffafe',
      accent: '#0891b2',
      glassOpacity: '0.1',
      glassBlur: '40px',
      vignette: 0.3,
      grain: 0.03,
      motionLevel: 'high'
    }
  },
  midnight_neon: {
    id: 'midnight_neon',
    label: 'Midnight Neon',
    description: 'High-end AI lab aesthetic.',
    isPro: true,
    colors: {
      primary: 'bg-pink-600',
      secondary: 'text-pink-400',
      accentGlow: 'rgba(219,39,119,0.3)',
      textMain: 'text-pink-50',
      textSecondary: 'text-pink-300/60',
      border: 'border-pink-500/20',
      bgPanel: 'bg-black/90',
      hexPrimary: '#db2777',
      hexSecondary: '#f472b6'
    },
    visualProfile: {
      bgMain: '#000000',
      bgSurface: 'rgba(0, 0, 0, 0.9)',
      textPrimary: '#fdf2f8',
      textSecondary: '#f472b6',
      accent: '#db2777',
      glassOpacity: '0.9',
      glassBlur: '12px',
      vignette: 0.7,
      grain: 0.15,
      motionLevel: 'low'
    }
  },
  nebula: {
    id: 'nebula',
    label: 'Nebula',
    description: 'Atmospheric cosmic energy.',
    isPro: true,
    colors: {
      primary: 'bg-purple-600',
      secondary: 'text-fuchsia-400',
      accentGlow: 'rgba(147,51,234,0.5)',
      textMain: 'text-purple-100',
      textSecondary: 'text-fuchsia-300',
      border: 'border-purple-500/20',
      bgPanel: 'bg-[#0f0518]/90',
      hexPrimary: '#9333ea',
      hexSecondary: '#e879f9'
    },
    visualProfile: {
      bgMain: '#0a0118',
      bgSurface: 'rgba(15, 5, 24, 0.6)',
      textPrimary: '#f5f3ff',
      textSecondary: '#d8b4fe',
      accent: '#9333ea',
      glassOpacity: '0.6',
      glassBlur: '16px',
      vignette: 0.6,
      grain: 0.08,
      motionLevel: 'high'
    }
  },
  solaris: {
    id: 'solaris',
    label: 'Solaris',
    description: 'High-heat energy workspace.',
    isPro: true,
    colors: {
      primary: 'bg-orange-600',
      secondary: 'text-amber-400',
      accentGlow: 'rgba(234,88,12,0.5)',
      textMain: 'text-orange-100',
      textSecondary: 'text-amber-200',
      border: 'border-orange-500/20',
      bgPanel: 'bg-[#1a0b00]/90',
      hexPrimary: '#ea580c',
      hexSecondary: '#fbbf24'
    },
    visualProfile: {
      bgMain: '#1f0a00',
      bgSurface: 'rgba(26, 11, 0, 0.7)',
      textPrimary: '#fff7ed',
      textSecondary: '#fdba74',
      accent: '#f97316',
      glassOpacity: '0.7',
      glassBlur: '20px',
      vignette: 0.5,
      grain: 0.05,
      motionLevel: 'high'
    }
  },
  quantal: {
    id: 'quantal',
    label: 'Quantal',
    description: 'Cybernetic matrix environment.',
    isPro: true,
    colors: {
      primary: 'bg-emerald-600',
      secondary: 'text-teal-400',
      accentGlow: 'rgba(5,150,105,0.5)',
      textMain: 'text-emerald-100',
      textSecondary: 'text-teal-300',
      border: 'border-emerald-500/20',
      bgPanel: 'bg-[#001510]/90',
      hexPrimary: '#059669',
      hexSecondary: '#2dd4bf'
    },
    visualProfile: {
      bgMain: '#000000',
      bgSurface: 'rgba(0, 21, 16, 0.8)',
      textPrimary: '#ecfdf5',
      textSecondary: '#34d399',
      accent: '#10b981',
      glassOpacity: '0.8',
      glassBlur: '8px',
      vignette: 0.4,
      grain: 0.1,
      motionLevel: 'low'
    }
  },
  aether: {
    id: 'aether',
    label: 'Aether',
    description: 'Surreal sky-bound intelligence.',
    isPro: true,
    colors: {
      primary: 'bg-indigo-500',
      secondary: 'text-cyan-300',
      accentGlow: 'rgba(99,102,241,0.5)',
      textMain: 'text-indigo-50',
      textSecondary: 'text-slate-300',
      border: 'border-indigo-500/20',
      bgPanel: 'bg-[#0f172a]/90',
      hexPrimary: '#6366f1',
      hexSecondary: '#67e8f9'
    },
    visualProfile: {
      bgMain: '#030712',
      bgSurface: 'rgba(15, 23, 42, 0.7)',
      textPrimary: '#f8fafc',
      textSecondary: '#94a3b8',
      accent: '#6366f1',
      glassOpacity: '0.7',
      glassBlur: '32px',
      vignette: 0.3,
      grain: 0.04,
      motionLevel: 'high'
    }
  },
  onyx: {
    id: 'onyx',
    label: 'Black Onyx Elite',
    description: 'Liquid metal and gold luxury.',
    isPro: true,
    colors: {
      primary: 'bg-[#1a1a1a]',
      secondary: 'text-yellow-400',
      accentGlow: 'rgba(234, 179, 8, 0.4)',
      textMain: 'text-gray-100',
      textSecondary: 'text-yellow-600',
      border: 'border-yellow-600/40',
      bgPanel: 'bg-[#050505]/95',
      hexPrimary: '#eab308',
      hexSecondary: '#ca8a04'
    },
    visualProfile: {
      bgMain: '#000000',
      bgSurface: 'rgba(5, 5, 5, 0.95)',
      textPrimary: '#f3f4f6',
      textSecondary: '#d97706',
      accent: '#eab308',
      glassOpacity: '0.95',
      glassBlur: '12px',
      vignette: 0.9,
      grain: 0.02,
      motionLevel: 'low'
    }
  }
};
