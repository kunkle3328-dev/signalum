
import { Theme, ThemeId } from '../types';

export const THEME_REGISTRY: Record<ThemeId, Theme> = {
  midnight: {
    id: 'midnight',
    label: 'Cyber Cyan',
    description: 'Electric cyan horizon with deep obsidian background.',
    isPro: false,
    colors: {
      primary: 'bg-cyan-600',
      secondary: 'text-cyan-400',
      accentGlow: 'rgba(0, 243, 255, 0.5)',
      textMain: 'text-cyan-100',
      textSecondary: 'text-cyan-300',
      border: 'border-cyan-500/30',
      bgPanel: 'bg-[#05050a]/90',
      hexPrimary: '#00f3ff',
      hexSecondary: '#60eaff',
      neonColor: '#00f3ff'
    },
    visualProfile: {
      bgMain: '#020205',
      bgSurface: 'rgba(5, 5, 10, 0.6)',
      textPrimary: '#f1f5f9',
      textSecondary: '#94a3b8',
      accent: '#00f3ff',
      glassOpacity: '0.6',
      glassBlur: '14px',
      vignette: 0.6,
      grain: 0.05,
      motionLevel: 'low'
    }
  },
  midnight_neon: {
    id: 'midnight_neon',
    label: 'Neon Magenta',
    description: 'Vibrant magenta aesthetics for a high-intensity vibe.',
    isPro: false,
    colors: {
      primary: 'bg-pink-600',
      secondary: 'text-pink-400',
      accentGlow: 'rgba(255, 0, 243, 0.4)',
      textMain: 'text-pink-50',
      textSecondary: 'text-pink-300/60',
      border: 'border-pink-500/30',
      bgPanel: 'bg-[#050205]/95',
      hexPrimary: '#ff00f3',
      hexSecondary: '#ff70f8',
      neonColor: '#ff00f3'
    },
    visualProfile: {
      bgMain: '#020002',
      bgSurface: 'rgba(5, 0, 5, 0.9)',
      textPrimary: '#fdf2f8',
      textSecondary: '#f472b6',
      accent: '#ff00f3',
      glassOpacity: '0.9',
      glassBlur: '12px',
      vignette: 0.7,
      grain: 0.15,
      motionLevel: 'low'
    }
  },
  nebula: {
    id: 'nebula',
    label: 'Deep Violet',
    description: 'Ultraviolet harmonics with cosmic purple accents.',
    isPro: false,
    colors: {
      primary: 'bg-purple-600',
      secondary: 'text-fuchsia-400',
      accentGlow: 'rgba(157, 0, 255, 0.5)',
      textMain: 'text-purple-100',
      textSecondary: 'text-fuchsia-300',
      border: 'border-purple-500/30',
      bgPanel: 'bg-[#080112]/90',
      hexPrimary: '#9d00ff',
      hexSecondary: '#e879f9',
      neonColor: '#9d00ff'
    },
    visualProfile: {
      bgMain: '#05010a',
      bgSurface: 'rgba(10, 2, 20, 0.65)',
      textPrimary: '#f5f3ff',
      textSecondary: '#d8b4fe',
      accent: '#9d00ff',
      glassOpacity: '0.65',
      glassBlur: '16px',
      vignette: 0.6,
      grain: 0.08,
      motionLevel: 'high'
    }
  },
  quantal: {
    id: 'quantal',
    label: 'Matrix Green',
    description: 'The definitive digital architect environment.',
    isPro: false,
    colors: {
      primary: 'bg-emerald-600',
      secondary: 'text-teal-400',
      accentGlow: 'rgba(16, 185, 129, 0.4)',
      textMain: 'text-emerald-100',
      textSecondary: 'text-teal-300',
      border: 'border-emerald-500/30',
      bgPanel: 'bg-[#000805]/95',
      hexPrimary: '#10b981',
      hexSecondary: '#34d399',
      neonColor: '#10b981'
    },
    visualProfile: {
      bgMain: '#000201',
      bgSurface: 'rgba(0, 8, 5, 0.85)',
      textPrimary: '#ecfdf5',
      textSecondary: '#34d399',
      accent: '#10b981',
      glassOpacity: '0.85',
      glassBlur: '10px',
      vignette: 0.4,
      grain: 0.1,
      motionLevel: 'low'
    }
  },
  focus_black: {
    id: 'focus_black',
    label: 'Obsidian Prime',
    description: 'Minimalist high-contrast studio for zero-distraction building.',
    isPro: false,
    colors: {
      primary: 'bg-white',
      secondary: 'text-gray-400',
      accentGlow: 'rgba(255, 255, 255, 0.1)',
      textMain: 'text-white',
      textSecondary: 'text-gray-500',
      border: 'border-white/10',
      bgPanel: 'bg-black',
      hexPrimary: '#ffffff',
      hexSecondary: '#9ca3af',
      neonColor: '#ffffff'
    },
    visualProfile: {
      bgMain: '#000000',
      bgSurface: 'rgba(0, 0, 0, 1)',
      textPrimary: '#ffffff',
      textSecondary: '#9ca3af',
      accent: '#ffffff',
      glassOpacity: '1',
      glassBlur: '0px',
      vignette: 0.95,
      grain: 0.02,
      motionLevel: 'none'
    }
  },
  onyx: {
    id: 'onyx',
    label: 'Onyx Elite',
    description: 'Luxury gold and obsidian for executive neural synthesis.',
    isPro: false,
    colors: {
      primary: 'bg-yellow-600',
      secondary: 'text-yellow-400',
      accentGlow: 'rgba(234, 179, 8, 0.4)',
      textMain: 'text-gray-100',
      textSecondary: 'text-yellow-600',
      border: 'border-yellow-600/30',
      bgPanel: 'bg-[#050505]/95',
      hexPrimary: '#eab308',
      hexSecondary: '#ca8a04',
      neonColor: '#eab308'
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
  },
  clean_light: {
    id: 'clean_light',
    label: 'Neural White',
    description: 'Pristine, high-contrast light mode for daytime research.',
    isPro: false,
    colors: {
      primary: 'bg-slate-900',
      secondary: 'text-slate-600',
      accentGlow: 'rgba(148, 163, 184, 0.2)',
      textMain: 'text-slate-900',
      textSecondary: 'text-slate-500',
      border: 'border-slate-200',
      bgPanel: 'bg-white/95',
      hexPrimary: '#0f172a',
      hexSecondary: '#64748b',
      neonColor: '#0f172a'
    },
    visualProfile: {
      bgMain: '#ffffff',
      bgSurface: 'rgba(255, 255, 255, 0.85)',
      textPrimary: '#0f172a',
      textSecondary: '#64748b',
      accent: '#0f172a',
      glassOpacity: '0.85',
      glassBlur: '20px',
      vignette: 0.1,
      grain: 0.01,
      motionLevel: 'none'
    }
  },
  signalum_studio: {
    id: 'signalum_studio',
    label: 'Enterprise Blue',
    description: 'The standard professional AI intelligence environment.',
    isPro: false,
    colors: {
      primary: 'bg-blue-600',
      secondary: 'text-blue-400',
      accentGlow: 'rgba(37, 99, 235, 0.4)',
      textMain: 'text-white',
      textSecondary: 'text-blue-200',
      border: 'border-blue-500/30',
      bgPanel: 'bg-black/80',
      hexPrimary: '#2563eb',
      hexSecondary: '#60a5fa',
      neonColor: '#2563eb'
    },
    visualProfile: {
      bgMain: '#000000',
      bgSurface: 'rgba(0, 0, 0, 0.7)',
      textPrimary: '#ffffff',
      textSecondary: '#93c5fd',
      accent: '#2563eb',
      glassOpacity: '0.7',
      glassBlur: '24px',
      vignette: 0.8,
      grain: 0.1,
      motionLevel: 'low'
    }
  },
  glass_horizon: {
    id: 'glass_horizon',
    label: 'Frozen Cyan',
    description: 'High-transparency glass aesthetics with arctic accents.',
    isPro: false,
    colors: {
      primary: 'bg-cyan-500',
      secondary: 'text-cyan-300',
      accentGlow: 'rgba(6, 182, 212, 0.3)',
      textMain: 'text-white',
      textSecondary: 'text-cyan-100',
      border: 'border-white/10',
      bgPanel: 'bg-white/5',
      hexPrimary: '#06b6d4',
      hexSecondary: '#22d3ee',
      neonColor: '#06b6d4'
    },
    visualProfile: {
      bgMain: '#05161c',
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
  solaris: {
    id: 'solaris',
    label: 'Amber Flare',
    description: 'Atmospheric orange flare with high-warmth characteristics.',
    isPro: false,
    colors: {
      primary: 'bg-orange-600',
      secondary: 'text-amber-400',
      accentGlow: 'rgba(234, 88, 12, 0.5)',
      textMain: 'text-orange-100',
      textSecondary: 'text-amber-200',
      border: 'border-orange-500/20',
      bgPanel: 'bg-[#120800]/95',
      hexPrimary: '#ea580c',
      hexSecondary: '#fbbf24',
      neonColor: '#ea580c'
    },
    visualProfile: {
      bgMain: '#080200',
      bgSurface: 'rgba(15, 5, 0, 0.7)',
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
  aether: {
    id: 'aether',
    label: 'Electric Blue',
    description: 'Ultra-modern electric harmonics with high energy.',
    isPro: false,
    colors: {
      primary: 'bg-blue-500',
      secondary: 'text-cyan-300',
      accentGlow: 'rgba(0, 98, 255, 0.6)',
      textMain: 'text-blue-50',
      textSecondary: 'text-slate-300',
      border: 'border-blue-500/30',
      bgPanel: 'bg-[#02050a]/90',
      hexPrimary: '#0062ff',
      hexSecondary: '#67e8f9',
      neonColor: '#0062ff'
    },
    visualProfile: {
      bgMain: '#010205',
      bgSurface: 'rgba(5, 10, 20, 0.7)',
      textPrimary: '#f8fafc',
      textSecondary: '#94a3b8',
      accent: '#0062ff',
      glassOpacity: '0.7',
      glassBlur: '32px',
      vignette: 0.3,
      grain: 0.04,
      motionLevel: 'high'
    }
  }
};
