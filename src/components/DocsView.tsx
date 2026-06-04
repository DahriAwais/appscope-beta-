import React from 'react';
import { 
  FileText, 
  HelpCircle, 
  Zap, 
  Settings, 
  CheckCircle, 
  ArrowRight,
  Shield,
  Smartphone,
  Info,
  DollarSign
} from 'lucide-react';

export default function DocsView() {
  return (
    <div className="space-y-8 animate-fade-in py-4 max-w-4xl mx-auto">
      {/* Docs Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/40 border border-emerald-500/15 rounded-full mb-1 shadow-[0_2px_8px_rgba(4,47,31,0.2)]">
          <FileText className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-mono text-[9px] uppercase tracking-widest text-[#24e09e] font-semibold">
            Technical Documentation
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </div>
        <h2 className="text-3xl font-display font-bold text-zinc-100 tracking-tight">
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-100 to-teal-400 animate-pulse">AppScope Docs</span>
        </h2>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Comprehensive guide detailing AppScope's capabilities, architecture, and cross-platform store intelligence metrics.
        </p>
      </div>

      {/* Grid: Overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-panel p-5 rounded-xl border border-zinc-900 bg-zinc-950/40 space-y-2">
          <h3 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            What is AppScope?
          </h3>
          <p className="text-[11px] text-zinc-300 leading-relaxed font-sans">
            AppScope is a premium developer-focused intelligence platform specializing in cross-platform search tracking, category analysis, app store rankings, media-asset metadata, and subscription recurring revenue estimations.
          </p>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-zinc-900 bg-zinc-950/40 space-y-2">
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#24e09e] font-bold flex items-center gap-1.5">
            <DollarSign className="w-4 h-4" />
            How We Calculate MRR & ARR
          </h3>
          <p className="text-[11px] text-zinc-300 leading-relaxed font-sans">
            AppScope builds custom regression logic combining price plans, categories, download velocities, and historical feedback counts to project **Monthly Recurring Revenue (MRR)** and **Annual Recurring Revenue (ARR)**.
          </p>
        </div>
      </div>

      {/* Main Docs Flow Sections */}
      <div className="space-y-6">
        {/* Section 1: Features guide */}
        <div className="glass-panel p-6 rounded-2xl border border-zinc-900 bg-zinc-950/20 space-y-4">
          <h3 className="text-xs uppercase font-mono font-black text-zinc-200 tracking-widest pb-2 border-b border-zinc-800">
            1. Core Features & Capabilities
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px]">
            <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl space-y-1">
              <span className="font-semibold text-zinc-100 block flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                Cross-Platform Search
              </span>
              <p className="text-zinc-400 leading-relaxed">
                Search millions of real iOS and Play Store apps with live autocomplete, platform-specific categorizations, pricing, and publisher data.
              </p>
            </div>

            <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl space-y-1">
              <span className="font-semibold text-zinc-100 block flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                ASO Keyword Performance
              </span>
              <p className="text-zinc-400 leading-relaxed">
                Evaluate high-yield organic search indices. Instantly discover volume metrics, competition difficulty, and recommended long-tail terms.
              </p>
            </div>

            <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl space-y-1">
              <span className="font-semibold text-zinc-100 block flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                MRR & ARR Projection Generator
              </span>
              <p className="text-zinc-400 leading-relaxed">
                Input store parameters like downloads, target subscription prices, and benchmark conversion indexes to map financial potential.
              </p>
            </div>

            <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl space-y-1">
              <span className="font-semibold text-zinc-100 block flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                Asset & Screen Downloads
              </span>
              <p className="text-zinc-400 leading-relaxed">
                Audit media metadata catalog. Preview and download hi-res screenshot layouts and assets direct from official iTunes registries.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Vercel / Production Ready Guide */}
        <div className="glass-panel p-6 rounded-2xl border border-zinc-900 bg-zinc-950/20 space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-xs uppercase font-mono font-black text-zinc-200 tracking-widest pb-2 border-b border-zinc-805 flex-1">
              2. Production & Vercel Deployment Guild
            </h3>
            <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-mono border border-emerald-500/20">
              Verified
            </span>
          </div>

          <div className="space-y-3 text-[11px] font-sans text-zinc-300 leading-relaxed">
            <p>
              AppScope is engineered with an **Offline-First & Hybrid-API Architecture**. If you deploy this app on **Vercel** or other static-hosting providers, it detects if the local Express API is inaccessible and automatically pivots to **100% peer-to-peer browser-direct requests** to ITunes search endpoints!
            </p>

            <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl space-y-3">
              <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest block">STEPS TO LAUNCH ON VERCEL</span>
              
              <ol className="list-decimal list-inside space-y-2 text-zinc-400 font-sans">
                <li>
                  <strong className="text-zinc-200">Import Git Repository</strong>: Connect your GitHub account and select your AppScope project on Vercel's dashboard.
                </li>
                <li>
                  <strong className="text-zinc-250">Build Commands Configuration</strong>:
                  <ul className="list-disc list-inside pl-4 mt-1 space-y-1 font-mono text-[10px] text-emerald-400/90">
                    <li>Build Command: npm run build</li>
                    <li>Output Directory: dist</li>
                  </ul>
                </li>
                <li>
                  <strong className="text-zinc-205">Click "Deploy"</strong>: Within ~45 seconds, your static web application is active and optimized on Vercel's Edge networks!
                </li>
              </ol>
            </div>

            <div className="p-3 bg-emerald-950/10 border border-emerald-900/35 rounded-lg flex items-start gap-2">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-zinc-400">
                <strong>Referrer Policy safety:</strong> Every official preview imagery uses explicit <code className="text-emerald-300">referrerPolicy="no-referrer"</code> rules, guaranteeing consistent rendering on cross-origin requests hosted under public SSL headers.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ section */}
        <div className="glass-panel p-6 rounded-2xl border border-zinc-900 bg-zinc-950/20 space-y-4">
          <h3 className="text-xs uppercase font-mono font-black text-zinc-200 tracking-widest pb-2 border-b border-zinc-800 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-[#24e09e]" />
            Frequently Asked Questions
          </h3>

          <div className="divide-y divide-zinc-900 space-y-3">
            {[
              {
                q: "How correct are the MRR & ARR estimations?",
                a: "Estimations are benchmark-driven calculations computed via official categories, premium price points, and active indices. While they are simulations, they closely model actual average conversions for verified digital products."
              },
              {
                q: "Why do some icons and screenshots render instantly?",
                a: "Our system tries direct official CDN connections first with cross-domain bypass configurations, falling back to an internal image proxy only when required. This significantly decreases container request loads."
              },
              {
                q: "Is there any charge for AppScope Pro Features?",
                a: "No, AppScope is 100% active and free for research developers. Sandbox constraints are unlocked by default to allow exploring complete metadata reports."
              }
            ].map((faq, i) => (
              <div key={i} className="pt-3 space-y-1">
                <span className="font-semibold text-zinc-100 text-xs block font-display">Q: {faq.q}</span>
                <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
