
import React from 'react';
import { Theme, BRAND_NAME } from '../types';

interface InviteFriendsCardProps {
  referralCode: string;
  theme: Theme;
  onCopy: (msg: string) => void;
}

export const InviteFriendsCard: React.FC<InviteFriendsCardProps> = ({ referralCode, theme, onCopy }) => {
  const inviteLink = `https://signalum.xyz/?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    onCopy("Invite link copied to studio clipboard.");
  };

  return (
    <div className={`p-6 rounded-[2rem] border ${theme.colors.border} bg-white/5 space-y-4`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-xl">
          🤝
        </div>
        <div>
          <h4 className="text-sm font-bold text-white">Invite a friend</h4>
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Growth Loop</p>
        </div>
      </div>
      <p className="text-[11px] text-slate-400 leading-relaxed">
        Invite a colleague to {BRAND_NAME}. If they join our neural network, you both get a studio perk.
      </p>
      <div className="flex gap-2">
        <div className="flex-1 bg-black/40 border border-white/5 rounded-xl px-4 py-2 flex items-center text-[10px] font-mono text-slate-500 truncate">
          {inviteLink}
        </div>
        <button 
          onClick={handleCopy}
          className={`p-2 rounded-xl ${theme.colors.primary} text-white hover:brightness-110 transition-all`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 012-2v-8a2 2 0 01-2-2h-8a2 2 0 01-2 2v8a2 2 0 012 2z" />
          </svg>
        </button>
      </div>
      <p className="text-[8px] text-slate-600 text-center uppercase tracking-tighter">Referral rewards sync requires backend integration.</p>
    </div>
  );
};
