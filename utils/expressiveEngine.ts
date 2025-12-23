
import { ExpressiveVoiceProfile } from '../types';

/**
 * Deterministically rewrites text to optimize for spoken delivery
 * based on the Expressive Voice Profile configuration.
 */
export function rewriteForSpeech(
  text: string, 
  profile: ExpressiveVoiceProfile, 
  context: { isLearningMode?: boolean } = {}
): string {
  if (!text) return "";

  let processed = text;

  // --- A) NORMALIZATION ---
  // Collapse whitespace, fix common artifacts
  processed = processed
    .replace(/\s+/g, ' ')
    .replace(/\.\.\./g, '.')
    .replace(/\*\*/g, '') // Remove bold markdown
    .trim();

  // --- B) STRUCTURAL SIMPLIFICATION (CLARITY) ---
  const maxLen = profile.maxSentenceLength || 24;
  if (profile.clarity > 60) {
    // Split long sentences at conjunctions if they exceed max length
    const sentences = processed.split(/(?<=[.?!])\s+/);
    processed = sentences.map(s => {
      const words = s.split(' ');
      if (words.length > maxLen) {
        return s.replace(/, (and|but|so|because|however) /g, '. $1 ');
      }
      return s;
    }).join(' ');
  }

  // --- C) TEACHING STRUCTURE ---
  if (profile.teachingBias > 60 && (context.isLearningMode || text.length > 200)) {
    // Inject framing for clarity
    const intro = profile.warmth > 50 ? "Here's the breakdown. " : "To explain simply: ";
    if (!processed.startsWith("Here") && !processed.startsWith("To explain")) {
      processed = intro + processed;
    }
    
    // Ensure lists are spoken clearly
    processed = processed.replace(/(\d+)\./g, '\n$1.');
  }

  // --- D) PAUSE SHAPING ---
  // Scale pause frequency (0-100) to density of commas/dashes
  const pauseFactor = profile.pauseFrequency / 100;
  
  if (pauseFactor > 0.4) {
    // Add micro-pauses at logical breaks
    processed = processed.replace(/ that /g, ', that ');
    processed = processed.replace(/ which /g, ', which ');
    
    // For high pause frequency, use em-dashes for emphasis
    if (pauseFactor > 0.7) {
       processed = processed.replace(/:/g, ' — ');
       processed = processed.replace(/; /g, ' — ');
    }
  }

  // --- E) EMPHASIS & WARMTH ---
  if (profile.warmth > 60) {
    // soften stark statements
    processed = processed.replace(/^No\./, "Actually, no.");
    processed = processed.replace(/^Yes\./, "Exactly.");
  }

  // --- F) SAFETY & GUARDRAILS ---
  if (profile.forbiddenPatterns && profile.forbiddenPatterns.length > 0) {
    profile.forbiddenPatterns.forEach(pattern => {
      const regex = new RegExp(pattern, 'gi');
      processed = processed.replace(regex, '[REDACTED]');
    });
  }

  return processed;
}

/**
 * Fallback / Default profile if none exists
 */
export const DEFAULT_EXPRESSIVE_PROFILE: ExpressiveVoiceProfile = {
  id: 'global-default',
  name: 'Standard Expressive',
  description: 'Balanced professional cadence with natural micro-pauses.',
  scope: 'global_default',
  isActive: true,
  
  stability: 55,
  expressiveness: 35,
  clarity: 70,
  warmth: 50,
  emphasis: 40,
  pace: 50,
  pauseFrequency: 45,
  teachingBias: 60,
  speakerBoost: true,
  
  maxSentenceLength: 24,
  version: 1,
  lastUpdated: Date.now()
};
