
import { UserMetrics } from '../types';
import { getProfile, updateProfile } from './entitlements';

export const trackSession = () => {
  const profile = getProfile();
  const metrics = { ...profile.metrics };
  metrics.studioSessionsCount += 1;
  updateProfile({ metrics });
};

export const trackMinute = () => {
  const profile = getProfile();
  const metrics = { ...profile.metrics };
  metrics.minutesSpent += 1;
  updateProfile({ metrics });
};

export const trackDiscover = () => {
  const profile = getProfile();
  const metrics = { ...profile.metrics };
  metrics.discoverTopicsCount += 1;
  updateProfile({ metrics });
};

export const checkMilestones = (metrics: UserMetrics): string[] => {
  const milestones = [];
  if (metrics.studioSessionsCount >= 10) milestones.push('Veteran Speaker');
  if (metrics.minutesSpent >= 50) milestones.push('Deep Thinker');
  if (metrics.discoverTopicsCount >= 5) milestones.push('Context Master');
  return milestones;
};
