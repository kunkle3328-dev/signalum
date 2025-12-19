
import React from 'react';
import { UserMetrics, Theme } from '../types';

interface MilestoneBadgeProps {
  metrics: UserMetrics;
  theme: Theme;
}

const MILESTONES = [
  { id: 'sessions', label: 'Veteran Speaker', threshold: 10, field: 'studioSessionsCount', icon: '🎙️' },
  { id: 'minutes', label: 'Deep Thinker', threshold: 50, field: 'minutesSpent', icon: '🧠' },
  { id: 'topics', label: 'Context Master', threshold: 5, field: 'discoverTopicsCount', icon: '💎' },
];

export const MilestoneBadge: React.FC<MilestoneBadgeProps> = ({ metrics, theme }) => {
  return (
    <div className="space-y-3">
      <h4 className={`text-[10px] font-bold ${theme.colors.secondary} uppercase tracking-widest`}>Achievements</h4>
      <div className="grid grid-cols-1 gap-2">
        {MILESTONES.map(m => {
          const val = (metrics as any)[m.field] || 0;
          const isUnlocked = val >= m.threshold;
          const progress = Math.min(100, (val / m.threshold) * 100);

          return (
            <div key={m.id} className={`p-3 rounded-xl border ${isUnlocked ? `${theme.colors.border} bg-white/5` : 'border-white/5 bg-black/20 opacity-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{isUnlocked ? m.icon : '🔒'}</span>
                  <span className={`text-[11px] font-bold ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>{m.label}</span>
                </div>
                <span className="text-[9px] font-mono text-slate-500">{val} / {m.threshold}</span>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${theme.colors.primary} transition-all duration-1000`} 
                  style={{ width: `${progress}%` }} 
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
