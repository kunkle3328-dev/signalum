
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic2, 
  Database, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Check, 
  ChevronRight,
  HelpCircle,
  Clock,
  Lock,
  // Fix: Missing import for ShieldCheck
  ShieldCheck
} from 'lucide-react';

const APP_URL = "https://app.signalum.xyz";

export default function App() {
  const [view, setView] = useState<'home' | 'pricing'>('home');

  // Simple scroll to top on view change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-blue-600/30">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass-panel border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button 
            onClick={() => setView('home')} 
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Mic2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">Signalum</span>
          </button>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <button onClick={() => setView('home')} className={`hover:text-white transition-colors ${view === 'home' ? 'text-white' : ''}`}>Voxera</button>
            <a href="#features" onClick={() => setView('home')} className="hover:text-white transition-colors">Intelligence</a>
            <button onClick={() => setView('pricing')} className={`hover:text-white transition-colors ${view === 'pricing' ? 'text-white' : ''}`}>Pricing</button>
          </div>
          
          <a 
            href={APP_URL}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 rounded-full text-sm font-bold transition-all shadow-lg shadow-blue-900/20"
          >
            Start Free
          </a>
        </div>
      </nav>

      <AnimatePresence mode="wait">
        {view === 'home' ? (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Optimized Hero */}
            <section className="relative pt-40 pb-20 px-6 overflow-hidden">
              <div className="absolute inset-0 bg-radial-gradient" />
              <div className="max-w-5xl mx-auto text-center relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <span className="px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold tracking-[0.2em] uppercase mb-8 inline-block">
                    Your Personal Neural Studio
                  </span>
                  <h1 className="text-5xl md:text-8xl font-display font-bold tracking-tight mb-8 leading-[1.05] text-gradient">
                    Think out loud.<br />Get clarity.
                  </h1>
                  <p className="text-lg md:text-2xl text-slate-400 mb-10 max-w-3xl mx-auto leading-relaxed">
                    Studio-grade voice intelligence grounded in your sources, not generic hype. 
                    Voxera listens, thinks, and speaks with human pacing to help you build faster.
                  </p>
                  
                  <div className="flex flex-col md:flex-row items-center justify-center gap-5 mb-6">
                    <a 
                      href={APP_URL}
                      className="w-full md:w-auto px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-2xl shadow-blue-600/20 active:scale-95"
                    >
                      Start Free <ArrowRight className="w-5 h-5" />
                    </a>
                    <a 
                      href="#voxera"
                      className="w-full md:w-auto px-10 py-5 glass-panel hover:bg-white/5 rounded-2xl font-bold text-lg transition-all active:scale-95"
                    >
                      See How It Works
                    </a>
                  </div>
                  
                  <div className="text-slate-500 text-xs font-medium uppercase tracking-widest mb-16 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                    <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> No credit card</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Cancel anytime</span>
                    <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Your sources stay yours</span>
                  </div>

                  {/* Benefit Bullets */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-20 text-left">
                    <div className="flex gap-4">
                      <div className="shrink-0 w-5 h-5 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-500 mt-1">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <p className="text-sm text-slate-300"><span className="font-bold text-white">Grounded in your sources</span> — not generic answers from the public web.</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="shrink-0 w-5 h-5 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-500 mt-1">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <p className="text-sm text-slate-300"><span className="font-bold text-white">NotebookLM-level presence</span> — calm, human pacing with micro-hesitations.</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="shrink-0 w-5 h-5 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-500 mt-1">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <p className="text-sm text-slate-300"><span className="font-bold text-white">Built for outcomes</span> — tailored for learning, content, and money moves.</p>
                    </div>
                  </div>

                  {/* Micro-demo Prompt Chips */}
                  <div className="max-w-2xl mx-auto p-6 glass-panel rounded-3xl border-white/10 bg-white/[0.02]">
                    <div className="flex items-center gap-2 mb-4 justify-center">
                      <Zap className="w-4 h-4 text-blue-500" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400">Try asking Voxera</span>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <PromptChip label="Help me think through this decision out loud." />
                      <PromptChip label="Summarize these notes and tell me what matters most." />
                      <PromptChip label="Research this topic and give me a plan I can act on." />
                    </div>
                  </div>
                </motion.div>
              </div>
            </section>

            {/* Meet Voxera Section */}
            <section id="voxera" className="py-24 px-6 relative">
              <div className="max-w-7xl mx-auto">
                <div className="glass-panel rounded-[2.5rem] p-8 md:p-16 flex flex-col md:flex-row items-center gap-12 border-white/10">
                  <div className="flex-1">
                    <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">Natural Studio Presence</h2>
                    <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                      Voxera isn't just a text-to-speech model. It's a studio-grade neural presence that speaks with natural pacing, micro-hesitations, and intellectual depth. 
                    </p>
                    <ul className="space-y-4">
                      {[
                        "Natural human pacing and micro-breaths",
                        "Deep contextual reasoning over sources",
                        "Professional studio recording quality",
                        "Indistinguishable from a live companion"
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-slate-300">
                          <CheckCircle2 className="w-5 h-5 text-blue-500" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex-1 relative">
                    <div className="aspect-square bg-blue-600/20 rounded-full blur-[100px] absolute inset-0 animate-pulse" />
                    <div className="relative glass-panel rounded-3xl p-8 border-white/20 animate-float bg-slate-900/40">
                      <div className="flex flex-col gap-4">
                        {[1, 0.6, 0.8, 0.4, 0.9, 0.5].map((h, i) => (
                          <div key={i} className="w-full bg-blue-500/10 h-10 rounded-full overflow-hidden border border-white/5">
                              <motion.div 
                                className="h-full bg-gradient-to-r from-blue-600 to-blue-400"
                                animate={{ width: [`${h*100}%`, `${(h*0.3)*100}%`, `${h*100}%`] }}
                                transition={{ duration: 2 + i, repeat: Infinity, ease: "easeInOut" }}
                              />
                          </div>
                        ))}
                      </div>
                      <div className="mt-8 flex items-center justify-center gap-3 text-blue-400 font-display font-bold tracking-widest text-sm">
                        <Mic2 className="w-4 h-4 animate-pulse" />
                        VOXERA ACTIVE
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-24 px-6">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-6xl font-display font-bold mb-4 text-gradient">The Context Intelligence</h2>
                  <p className="text-slate-400 text-lg">Personalized AI that actually knows your specific day-to-day data.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                  <FeatureCard 
                    icon={<Database className="w-6 h-6 text-blue-500" />}
                    title="Active Context"
                    desc="Upload PDFs, paste notes, or link websites. Signalum anchors its intelligence entirely in your specific workspace."
                  />
                  <FeatureCard 
                    icon={<Search className="w-6 h-6 text-emerald-500" />}
                    title="Research Discovery"
                    desc="Enter a topic and Signalum will research up to 10 live web sources simultaneously, importing them into your active context."
                  />
                  <FeatureCard 
                    icon={<Zap className="w-6 h-6 text-amber-500" />}
                    title="Revenue Velocity"
                    desc="Toggle Revenue Mode to shift Voxera from conversational research into a high-speed business execution partner."
                  />
                </div>
              </div>
            </section>
          </motion.div>
        ) : (
          <motion.div
            key="pricing"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="pt-40 pb-20 px-6 max-w-7xl mx-auto"
          >
            <div className="text-center mb-16">
              <span className="px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold tracking-[0.2em] uppercase mb-6 inline-block">
                Pricing Plans
              </span>
              <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight mb-8 leading-tight text-gradient">
                Simple plans.<br />Studio-grade clarity.
              </h1>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                Start free. Upgrade when Signalum becomes part of your day.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-24">
              <PricingTier 
                title="Free"
                price="0"
                desc="Perfect for trying out studio-grade voice."
                features={[
                  "Studio-grade Voxera voice",
                  "Active Context (up to 3 sources)",
                  "Limited Research Discovery",
                  "Community Support"
                ]}
                cta="Start Free"
                onAction={() => window.location.href = APP_URL}
              />
              <PricingTier 
                title="Pro"
                price="19"
                desc="For creators and researchers needing more."
                features={[
                  "Unlimited studio conversations",
                  "Discover up to 10 sources per topic",
                  "Premium Personas (Money Engine, etc)",
                  "Save + share sessions",
                  "Priority Uplink processing"
                ]}
                cta="Upgrade to Pro"
                highlighted
                onAction={() => window.location.href = APP_URL}
              />
              <PricingTier 
                title="Agency"
                price="49"
                desc="Full custom studio workspace for teams."
                features={[
                  "Everything in Pro",
                  "Higher daily usage limits",
                  "Larger knowledge bases",
                  "Priority Support",
                  "Early Access to Beta Tools"
                ]}
                cta="Go Agency"
                onAction={() => window.location.href = APP_URL}
              />
            </div>

            {/* Comparison Table */}
            <div className="mb-24 overflow-x-auto">
              <h3 className="text-2xl font-display font-bold mb-8 text-center">Compare Features</h3>
              <table className="w-full text-left border-collapse glass-panel rounded-3xl overflow-hidden border-white/10">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02]">
                    <th className="p-6 text-sm font-bold uppercase tracking-widest text-slate-500">Feature</th>
                    <th className="p-6 text-sm font-bold uppercase tracking-widest">Free</th>
                    <th className="p-6 text-sm font-bold uppercase tracking-widest text-blue-400">Pro</th>
                    <th className="p-6 text-sm font-bold uppercase tracking-widest">Agency</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <ComparisonRow label="Active Sources" free="3" pro="Unlimited" agency="Unlimited" />
                  <ComparisonRow label="Voice Quality" free="Studio" pro="Studio+" agency="Studio+" />
                  <ComparisonRow label="Research Limit" free="3 sources" pro="10 sources" agency="10+ sources" />
                  <ComparisonRow label="Personas" free="Standard" pro="Premium" agency="Customizable" />
                  <ComparisonRow label="Data Persistence" free="None" pro="Yes" proChecked agency="Yes" agencyChecked />
                  <ComparisonRow label="Support" free="Community" pro="Standard" agency="Priority" />
                </tbody>
              </table>
            </div>

            {/* Pricing FAQ */}
            <div className="max-w-3xl mx-auto mb-24">
              <h3 className="text-2xl font-display font-bold mb-10 text-center">Pricing FAQ</h3>
              <div className="space-y-6">
                <FAQItem 
                  q="How is Signalum different from ChatGPT?" 
                  a="Signalum is designed for deep contextual research. Unlike generic models, Voxera is grounded specifically in your sources, has human-like pacing for better focus, and includes tools like 'Research Discovery' to automatically find and ingest data for you." 
                />
                <FAQItem 
                  q="Can I cancel my subscription anytime?" 
                  a="Yes. You can cancel your subscription at any time through the billing dashboard. Your Pro features will remain active until the end of your current billing cycle." 
                />
                <FAQItem 
                  q="Do I need a credit card to start for free?" 
                  a="No. You can initialize your neural studio and start speaking to Voxera immediately without entering any payment information." 
                />
                <FAQItem 
                  q="Is my source data safe?" 
                  a="Absolutely. Your sources are encrypted and only accessible to you. We do not use your private data to train our foundational models." 
                />
              </div>
            </div>

            {/* Bottom CTA */}
            <section className="text-center py-20 glass-panel rounded-[3rem] border-white/10 bg-blue-600/5 relative overflow-hidden">
               <div className="absolute inset-0 bg-radial-gradient opacity-30 pointer-events-none" />
               <div className="relative z-10">
                 <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">Ready to find clarity?</h2>
                 <p className="text-slate-400 mb-10 max-w-xl mx-auto">Start building your neural workspace today for free.</p>
                 <a 
                   href={APP_URL}
                   className="px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-lg transition-all inline-flex items-center gap-2 shadow-2xl active:scale-95"
                 >
                   Start Studio Free <ArrowRight className="w-5 h-5" />
                 </a>
               </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Footer */}
      <footer className="py-20 px-6 border-t border-white/5 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-50">
             <Mic2 className="w-5 h-5" />
             <span className="font-display font-bold">Signalum</span>
          </div>
          <div className="flex gap-8 text-sm text-slate-500">
            <button onClick={() => setView('home')} className="hover:text-white transition-colors">Home</button>
            <button onClick={() => setView('pricing')} className="hover:text-white transition-colors">Pricing</button>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
          <div className="text-slate-600 text-xs">
            © 2024 Signalum Studio. No credit card required.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="glass-panel p-8 rounded-3xl border-white/5 hover:border-white/20 transition-all hover:bg-white/[0.02] group">
      <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-4 font-display text-white">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">
        {desc}
      </p>
    </div>
  );
}

function PricingTier({ title, price, desc, features, cta, onAction, highlighted = false }: any) {
  return (
    <div className={`p-8 rounded-[2.5rem] flex flex-col border transition-all hover:scale-[1.02] ${highlighted ? 'border-blue-500/50 bg-blue-600/5 shadow-2xl shadow-blue-600/10' : 'border-white/5 glass-panel bg-white/[0.02]'}`}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className={`text-xl font-bold font-display ${highlighted ? 'text-blue-400' : 'text-white'}`}>{title}</h3>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-4xl font-bold">${price}</span>
            <span className="text-slate-500 text-xs uppercase tracking-widest font-bold">/mo</span>
          </div>
        </div>
        {highlighted && (
          <span className="bg-blue-500/20 text-blue-400 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest border border-blue-500/30">Popular</span>
        )}
      </div>
      <p className="text-slate-400 text-sm mb-8 leading-relaxed h-12">{desc}</p>
      <ul className="space-y-4 mb-10 flex-1">
        {features.map((f: string, i: number) => (
          <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
            <div className="mt-1 shrink-0 w-4 h-4 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Check className="w-2.5 h-2.5 text-blue-500" />
            </div>
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <button 
        onClick={onAction}
        className={`w-full py-4 rounded-2xl font-bold text-center transition-all active:scale-95 ${highlighted ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/20' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'}`}
      >
        {cta}
      </button>
    </div>
  );
}

function ComparisonRow({ label, free, pro, agency, proChecked = false, agencyChecked = false }: any) {
  return (
    <tr className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
      <td className="p-6 text-slate-400 font-medium">{label}</td>
      <td className="p-6 text-slate-300">{free}</td>
      <td className="p-6 text-blue-400 font-bold">{proChecked ? <Check className="w-5 h-5" /> : pro}</td>
      <td className="p-6 text-slate-300">{agencyChecked ? <Check className="w-5 h-5" /> : agency}</td>
    </tr>
  );
}

function FAQItem({ q, a }: any) {
  return (
    <div className="p-6 rounded-3xl glass-panel border-white/5 bg-white/[0.01]">
      <h4 className="font-bold text-lg mb-2 font-display flex items-center gap-3">
        <HelpCircle className="w-4 h-4 text-blue-500" />
        {q}
      </h4>
      <p className="text-slate-400 text-sm leading-relaxed ml-7">{a}</p>
    </div>
  );
}

function PromptChip({ label }: { label: string }) {
  return (
    <button className="px-4 py-2 rounded-full border border-white/5 bg-white/5 text-[11px] text-slate-400 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all active:scale-95 flex items-center gap-2 group">
      {label}
      <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
    </button>
  );
}
