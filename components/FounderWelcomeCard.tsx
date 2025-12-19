
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Theme, BRAND_NAME } from '../types';

interface FounderWelcomeCardProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
}

export const FounderWelcomeCard: React.FC<FounderWelcomeCardProps> = ({ isOpen, onClose, theme }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`w-full max-w-md ${theme.colors.bgPanel} border-2 border-yellow-500/30 rounded-[3rem] p-10 text-center shadow-[0_0_50px_rgba(234,179,8,0.2)]`}
          >
            <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-3xl mx-auto mb-6">
              ✨
            </div>
            <h2 className="text-2xl font-display font-bold text-white mb-4">Founders Pro</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              You’re early. Thank you for building {BRAND_NAME} with us. 
              Voxera will keep improving fast, and your early support makes it possible.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={onClose}
                className="w-full py-4 bg-yellow-600 hover:bg-yellow-500 text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all"
              >
                Got it
              </button>
              <button className="text-[10px] font-bold text-yellow-500/60 uppercase tracking-widest hover:text-yellow-500 transition-colors">
                What's new in Studio
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
