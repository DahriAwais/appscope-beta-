import React, { useState } from 'react';
import { Layers, HelpCircle, FileText, ArrowUpRight, Send, Star, Zap, Crown, ShieldAlert, Github } from 'lucide-react';

interface AppHeaderProps {
  onGoHome: () => void;
  currentPage: 'home' | 'details';
  isPremiumUnlocked?: boolean;
  setIsPremiumUnlocked?: (val: boolean) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function AppHeader({ 
  onGoHome, 
  currentPage, 
  isPremiumUnlocked = false, 
  setIsPremiumUnlocked,
  activeTab,
  onTabChange
}: AppHeaderProps) {
  const [showContact, setShowContact] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState('');

  const menuItems = [
    { name: 'Search', icon: Zap },
    { name: 'Metrics', icon: Star },
    { name: 'Docs', icon: FileText }
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setEmailSent(true);
      setTimeout(() => {
        setEmailSent(false);
        setShowContact(false);
        setEmail('');
      }, 2500);
    }
  };

  return (
    <header className="relative z-50 w-full px-6 py-5 max-w-7xl mx-auto flex items-center justify-between">
      {/* Brand Logo & Identifier */}
      <button 
        onClick={() => {
          onTabChange('Search');
          onGoHome();
        }}
        className="flex items-center gap-2.5 group cursor-pointer border border-emerald-500/10 bg-emerald-950/20 px-3.5 py-1.5 rounded-full backdrop-blur-sm transition-all hover:border-emerald-500/30"
        id="header-logo-btn"
      >
        <div className="w-7 h-7 rounded-sm bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-transform group-hover:scale-105">
          <Layers className="w-4 h-4 text-[#030d0a] stroke-[2.5]" />
        </div>
        <span className="font-display font-bold tracking-tight text-lg text-emerald-50 bg-clip-text">
          App<span className="text-emerald-400 font-extrabold text-lg">Scope</span>
        </span>
        <span className="text-[10px] font-mono text-emerald-500 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/30 tracking-widest uppercase">
          Beta
        </span>
      </button>

      {/* Center Floating Capsule Menu - Pixel matched to mockup! */}
      <nav 
        className="hidden md:flex items-center gap-1.5 glass-panel py-1.5 px-2 rounded-full shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
        id="header-nav-menu"
      >
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.name;
          return (
            <button
              key={item.name}
              onClick={() => {
                onTabChange(item.name);
                if (item.name === 'Search') onGoHome();
              }}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-display font-medium tracking-wide transition-all duration-300 ${
                isActive 
                  ? 'bg-gradient-to-r from-emerald-500/15 to-emerald-600/25 text-emerald-300 border border-emerald-500/20 shadow-[0_2px_10px_rgba(16,185,129,0.1)]' 
                  : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`} />
              {item.name}
            </button>
          );
        })}
      </nav>

      {/* Right Side Glass Button & Premium Sandbox Switch */}
      <div className="flex items-center gap-3">
        <a
          href="https://github.com/DahriAwais/appscope-beta-"
          target="_blank"
          rel="noopener noreferrer"
          title="GitHub Repository"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-extrabold bg-zinc-900/80 text-zinc-300 hover:text-[#24e09e] hover:bg-zinc-900 border border-zinc-800 hover:border-emerald-500/30 transition-all cursor-pointer shadow-md select-none"
        >
          <Github className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">GitHub</span>
        </a>
        {setIsPremiumUnlocked && (
          <div
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
            id="premium-sandbox-toggle"
          >
            <Crown className="w-3" />
            <span>Pro Activated • 100% Free</span>
          </div>
        )}
      </div>

      {/* Floating Dialog Modal - Inhouse customized subscription/contact feedback */}
      {showContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div 
            className="w-full max-w-md glass-panel p-6 rounded-2xl relative shadow-[0_20px_50px_rgba(4,47,31,0.3)] animate-float"
            id="contact-popup-container"
          >
            <div className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-200">
              <button 
                onClick={() => setShowContact(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-emerald-950/40 border border-emerald-800/30 text-zinc-400 hover:text-emerald-200 transition-all text-sm font-bold"
              >
                ✕
              </button>
            </div>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <HelpCircle className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-zinc-100 text-base">Request Custom Research</h3>
                <p className="text-xs text-zinc-400">Export millions of cross-platform app metadata points</p>
              </div>
            </div>

            {emailSent ? (
              <div className="py-8 text-center" id="success-state">
                <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-full mx-auto flex items-center justify-center text-emerald-400 mb-3">
                  ✓
                </div>
                <h4 className="font-display font-medium text-emerald-300 text-sm">Request Submitted successfully!</h4>
                <p className="text-xs text-zinc-400 mt-1">Our Store Intelligence team will reach out within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider font-mono text-zinc-500">Workspace Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full bg-zinc-950 border border-emerald-500/10 focus:border-emerald-500/50 text-zinc-100 placeholder:text-zinc-600 rounded-lg px-3.5 py-2.5 text-xs text-zinc-200 focus:outline-none transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider font-mono text-zinc-500">Information Requirements</label>
                  <textarea
                    rows={3}
                    placeholder="Please specify store target, competitor ranges, categories or keyword trends..."
                    className="w-full bg-zinc-950 border border-emerald-100/10 focus:border-emerald-500/50 text-zinc-100 placeholder:text-zinc-600 rounded-lg p-3 text-xs focus:outline-none transition-all resize-none"
                    defaultValue="Looking for App Store competitors analysis..."
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-zinc-950 font-display font-semibold text-xs rounded-lg active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(16,185,129,0.2)]"
                >
                  <span>Submit Inquiry</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
