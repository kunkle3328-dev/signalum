
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Theme, ResearchMetadata } from '../types';

interface ResearchPanelProps {
  data: ResearchMetadata | null;
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
}

export const ResearchPanel: React.FC<ResearchPanelProps> = ({ data, isOpen, onClose, theme }) => {
  const [activeTab, setActiveTab] = useState<'assumptions' | 'sources' | 'claims' | 'nextSteps'>('assumptions');

  if (!isOpen) return null;

  const handleCopyBundle = () => {
    if (!data) return;
    const text = `
RESEARCH BUNDLE: ${data.topic}
---
ASSUMPTIONS:
${data.assumptions.map(a => `- [${a.type}] ${a.text}`).join('\n')}

CLAIMS:
${data.claims.map(c => `- (${c.confidence}) ${c.claim}: ${c.rationale}`).join('\n')}

NEXT STEPS:
${data.nextSteps.map(s => `- [${s.effort}] ${s.step}: ${s.why}`).join('\n')}

SOURCES:
${data.sources.map(s => `- ${s.title}: ${s.url}`).join('\n')}
    `.trim();
    navigator.clipboard.writeText(text);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[80] animate-fade-in" onClick={onClose} />
      <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 md:p-8 pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="pointer-events-auto w-full max-w-4xl h-[85vh] glass-morphism rounded-[2.5rem] flex flex-col overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.9)] border border-white/10"
          style={{ borderColor: theme.colors.hexPrimary + '40', backgroundColor: theme.visualProfile.bgSurface }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-8 border-b border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-white/5 border border-white/10 shadow-lg">
                🦁
              </div>
              <div>
                <h2 className="text-xl font-black font-display uppercase tracking-[0.15em] text-white">Research Beast</h2>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">
                  {data ? `Analysis: ${data.topic.substring(0, 40)}${data.topic.length > 40 ? '...' : ''}` : 'No Active Analysis'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-3 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          {!data ? (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 text-3xl opacity-30">
                🧬
              </div>
              <h3 className="text-lg font-bold text-white mb-2">No Research Data</h3>
              <p className="text-sm text-slate-500 max-w-md leading-relaxed">
                Run a "Research Discovery" scan from the side panel to populate this intelligence dashboard.
              </p>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex border-b border-white/5 px-8">
                {(['assumptions', 'sources', 'claims', 'nextSteps'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] border-b-2 transition-all hover:text-white ${activeTab === tab ? 'text-white border-current' : 'text-slate-500 border-transparent hover:border-white/20'}`}
                    style={{ color: activeTab === tab ? theme.colors.hexPrimary : undefined, borderColor: activeTab === tab ? theme.colors.hexPrimary : undefined }}
                  >
                    {tab === 'nextSteps' ? 'Next Steps' : tab}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-black/20">
                <AnimatePresence mode="wait">
                  {activeTab === 'assumptions' && (
                    <motion.div key="assumptions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid gap-4">
                      {data.assumptions.length === 0 && <p className="text-slate-500 text-sm italic">No explicit assumptions detected.</p>}
                      {data.assumptions.map((item, i) => (
                        <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all flex gap-4">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded bg-black/30 h-fit ${item.type === 'explicit' ? 'text-blue-400' : 'text-slate-400'}`}>{item.type}</span>
                          <p className="text-sm text-slate-200 leading-relaxed">{item.text}</p>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {activeTab === 'sources' && (
                    <motion.div key="sources" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid gap-4">
                      {data.sources.length === 0 && <p className="text-slate-500 text-sm italic">No sources retrieved.</p>}
                      {data.sources.map((item, i) => (
                        <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group">
                          <div className="flex justify-between items-start mb-2">
                             <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-white hover:underline truncate pr-4 block flex-1" style={{ color: theme.colors.hexPrimary }}>
                               {item.title || "Untitled Source"}
                             </a>
                             <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 bg-black/30 px-2 py-1 rounded">{item.provider}</span>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 mb-2">{item.snippet}</p>
                          <p className="text-[9px] text-slate-600 font-mono truncate">{item.url}</p>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {activeTab === 'claims' && (
                    <motion.div key="claims" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid gap-4">
                      {data.claims.length === 0 && <p className="text-slate-500 text-sm italic">No claims extracted.</p>}
                      {data.claims.map((item, i) => (
                        <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                          <div className="flex items-center gap-3 mb-3">
                             <div className={`w-2 h-2 rounded-full ${item.confidence === 'high' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : item.confidence === 'medium' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                             <span className={`text-[9px] font-black uppercase tracking-widest ${item.confidence === 'high' ? 'text-emerald-400' : item.confidence === 'medium' ? 'text-yellow-400' : 'text-red-400'}`}>
                               {item.confidence} Confidence
                             </span>
                          </div>
                          <p className="text-sm text-white font-medium mb-2">{item.claim}</p>
                          <p className="text-xs text-slate-400 leading-relaxed border-l-2 border-white/10 pl-3">Rationale: {item.rationale}</p>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {activeTab === 'nextSteps' && (
                    <motion.div key="nextSteps" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid gap-4">
                      {data.nextSteps.length === 0 && <p className="text-slate-500 text-sm italic">No next steps identified.</p>}
                      {data.nextSteps.map((item, i) => (
                        <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all flex items-start gap-4">
                          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5">{i+1}</div>
                          <div className="flex-1">
                             <div className="flex justify-between items-start mb-1">
                                <h4 className="text-sm font-bold text-white">{item.step}</h4>
                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-black/30 ${item.effort === 'high' ? 'text-red-400' : item.effort === 'med' ? 'text-yellow-400' : 'text-emerald-400'}`}>
                                  {item.effort} Effort
                                </span>
                             </div>
                             <p className="text-xs text-slate-400">{item.why}</p>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="p-6 border-t border-white/5 bg-black/20 flex justify-between items-center">
                 <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Research Timestamp: {new Date(data.timestamp).toLocaleTimeString()}</p>
                 <button onClick={handleCopyBundle} className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
                    Copy Bundle
                 </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </>
  );
};
