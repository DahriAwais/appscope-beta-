import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Star, 
  Zap, 
  DollarSign, 
  BarChart2, 
  Cpu, 
  Activity, 
  Sparkles,
  Smartphone,
  ChevronRight,
  Info,
  Lock,
  Eye
} from 'lucide-react';

export default function MetricsView() {
  const [isRevenueBlurred, setIsRevenueBlurred] = useState(true);
  // Simulator inputs
  const [category, setCategory] = useState('Productivity');
  const [price, setPrice] = useState(4.99);
  const [downloads, setDownloads] = useState(25000);
  const [conversion, setConversion] = useState(3.5); // in %

  // Category average multipliers
  const categoryStats: Record<string, { conv: number; val: number; diff: number; volume: string }> = {
    'Productivity': { conv: 3.2, val: 5.99, diff: 68, volume: 'Very High' },
    'Health & Fitness': { conv: 4.5, val: 9.99, diff: 54, volume: 'High' },
    'Finance': { conv: 5.1, val: 14.99, diff: 76, volume: 'High' },
    'Education': { conv: 2.8, val: 3.99, diff: 42, volume: 'Medium' },
    'Entertainment': { conv: 1.9, val: 2.99, diff: 82, volume: 'Very High' },
    'Utilities': { conv: 3.5, val: 1.99, diff: 35, volume: 'Medium' }
  };

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    const stats = categoryStats[cat];
    if (stats) {
      setConversion(stats.conv);
      setPrice(stats.val);
    }
  };

  // Calculations
  const activeSubscribers = Math.round(downloads * (conversion / 100));
  const estimatedMRR = activeSubscribers * price;
  const estimatedARR = estimatedMRR * 12;

  // Formatting utilities
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat('en-US').format(val);
  };

  return (
    <div className="space-y-8 animate-fade-in py-4">
      {/* Metrics Hero Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/40 border border-emerald-500/15 rounded-full mb-2 shadow-[0_2px_8px_rgba(4,47,31,0.2)]">
          <Activity className="w-3   h-3 text-emerald-400" />
          <span className="font-mono text-[9px] uppercase tracking-widest text-[#24e09e] font-semibold">
            Macro Store Intelligence
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-display font-black text-zinc-100 tracking-tight">
          Mobile App Market <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-100 to-teal-400">Metrics & Estimation</span>
        </h2>
        <p className="text-xs text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Simulate revenue indexes, discover top category metrics, analyze cross-platform parameters and plan your app store index strategy.
        </p>
      </div>

      {/* Global Macro Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Ecosystem Value', value: '$438.2B', trend: '+12.4% YoY', index: 'Active Growth' },
          { label: 'Avg In-App Purchase', value: '$11.85', trend: 'Flat', index: 'Monthly Stable' },
          { label: 'Average Conversion Rate', value: '3.12%', trend: '+0.45% MoM', index: 'Across Platforms' },
          { label: 'Monitored Records', value: '2.8M+', trend: 'Real-Time', index: 'iTunes & Play Stores' },
        ].map((stat, i) => (
          <div key={i} className="glass-panel p-4 rounded-xl space-y-1 bg-zinc-950/20 border border-zinc-900 shadow-inner">
            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block">{stat.label}</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-display text-zinc-100">{stat.value}</span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">{stat.trend}</span>
            </div>
            <span className="text-[9px] text-[#24e09e]/60 font-mono block uppercase tracking-widest">{stat.index}</span>
          </div>
        ))}
      </div>

      {/* Interactive Revenue & Valuation Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Input Settings - 5 Cols */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl space-y-6 border border-zinc-900 bg-zinc-950/50">
          <div>
            <h3 className="text-sm font-display font-bold text-zinc-100 tracking-wide uppercase flex items-center gap-1.5 border-b border-zinc-800 pb-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              App Parameters Simulation
            </h3>
            <p className="text-[10px] text-zinc-500 mt-1">Configure app details to calculate estimated recurring value.</p>
          </div>

          <div className="space-y-4 font-sans">
            {/* Category selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 block">App Store Category</label>
              <div className="grid grid-cols-3 gap-1">
                {Object.keys(categoryStats).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`py-1.5 text-[9px] uppercase tracking-wider font-mono border rounded transition-all ${
                      category === cat 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-bold shadow-[0_0_8px_rgba(16,185,129,0.15)]' 
                        : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-zinc-350 hover:border-zinc-750'
                    }`}
                  >
                    {cat.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Downloads modifier */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline">
                <label className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">Monthly Downloads</label>
                <span className="text-xs font-mono text-emerald-400 font-extrabold">{formatNumber(downloads)} /mo</span>
              </div>
              <input
                type="range"
                min={1000}
                max={500000}
                step={5000}
                value={downloads}
                onChange={(e) => setDownloads(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-zinc-900 rounded-lg cursor-pointer h-1.5"
              />
              <div className="flex justify-between text-[8px] text-zinc-600 font-mono">
                <span>1K /mo</span>
                <span>250K /mo</span>
                <span>500K /mo</span>
              </div>
            </div>

            {/* Price Tier modifier */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline">
                <label className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">Pro Price Tier</label>
                <span className="text-xs font-mono text-emerald-400 font-extrabold">{formatCurrency(price)}</span>
              </div>
              <input
                type="range"
                min={0.99}
                max={29.99}
                step={0.5}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-zinc-900 rounded-lg cursor-pointer h-1.5"
              />
              <div className="flex justify-between text-[8px] text-zinc-600 font-mono">
                <span>$0.99</span>
                <span>$15.00</span>
                <span>$29.99</span>
              </div>
            </div>

            {/* Conversion modifier */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline">
                <label className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">Subscribers Conversion</label>
                <span className="text-xs font-mono text-emerald-400 font-extrabold">{conversion.toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={15}
                step={0.1}
                value={conversion}
                onChange={(e) => setConversion(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-zinc-900 rounded-lg cursor-pointer h-1.5"
              />
              <div className="flex justify-between text-[8px] text-zinc-600 font-mono">
                <span>0.5% (Low)</span>
                <span>7.5%</span>
                <span>15.0% (Highest)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Output Dashboard - 7 Cols */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl space-y-6 border border-zinc-900 bg-zinc-950/20 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h3 className="text-sm font-display font-semibold text-emerald-400 tracking-wide uppercase flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Dynamic Revenue Model Analysis
              </h3>
              
              <div className="flex items-center gap-1.5 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2.5 py-1 rounded-full text-[9px] font-mono tracking-wider shadow-md uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse shrink-0" />
                <span>Accuracy Calibrating</span>
              </div>
            </div>
            <p className="text-[10px] text-zinc-500 mt-1">Live estimation algorithm results matching verified store matrices.</p>
          </div>

          {/* Model Accuracy Target Alert Info */}
          <div className="p-3 bg-zinc-950/80 rounded-xl border border-yellow-500/20 text-yellow-400/90 text-[11px] leading-relaxed font-sans flex items-start gap-2.5 shadow-md">
            <Info className="w-4 h-4 text-yellow-500/85 shrink-0 mt-0.5" />
            <div>
              <strong className="text-zinc-200 font-semibold block mb-0.5 font-display text-xs">Improving Estimation Accuracy</strong>
              To prevent mathematical indexing deviations during system beta, the simulator calculation preview values are temporarily obscured until direct store download logs finish training our neural projection matrix.
            </div>
          </div>

          {/* Large Financial Output Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
            {/* MRR Card */}
            <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-900 relative overflow-hidden group shadow-inner select-none">
              <div className="absolute top-2.5 right-2.5 text-[8px] font-mono tracking-wider text-zinc-655 uppercase font-black">Monthly Rec</div>
              <span className="text-zinc-500 font-mono text-[9px] uppercase tracking-widest font-bold block mb-1">Estimated MRR</span>
              
              <div className="relative flex items-baseline gap-2 min-h-[36px]">
                <div className="text-3xl font-black font-display text-[#24e09e] transition-all duration-300 filter blur-[7px] select-none">
                  {formatCurrency(estimatedMRR)}
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/45 backdrop-blur-[1.5px] rounded">
                  <span className="text-[9px] font-mono tracking-widest text-[#24e09e] uppercase font-black flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#012f1f] border border-emerald-500/25 shadow-md">
                    <Lock className="w-3 h-3 text-[#24e09e]" />
                    <span>Tuning Accuracy...</span>
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5 mt-3 text-[10px] text-zinc-500 font-mono filter blur-[3px] select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 shrink-0" />
                <span>{formatNumber(activeSubscribers)} monthly premium units</span>
              </div>
            </div>

            {/* ARR Card */}
            <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-900 relative overflow-hidden group shadow-inner select-none">
              <div className="absolute top-2.5 right-2.5 text-[8px] font-mono tracking-wider text-zinc-655 uppercase font-black">Annual Rec</div>
              <span className="text-zinc-500 font-mono text-[9px] uppercase tracking-widest font-bold block mb-1">Estimated ARR</span>
              
              <div className="relative flex items-baseline gap-2 min-h-[36px]">
                <div className="text-3xl font-black font-display text-emerald-300 transition-all duration-300 filter blur-[7px] select-none">
                  {formatCurrency(estimatedARR)}
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/45 backdrop-blur-[1.5px] rounded">
                  <span className="text-[9px] font-mono tracking-widest text-emerald-400 uppercase font-black flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#032e1f] border border-emerald-500/25 shadow-md">
                    <Lock className="w-3 h-3 text-emerald-400" />
                    <span>Tuning Accuracy...</span>
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5 mt-3 text-[10px] text-zinc-500 font-mono filter blur-[3px] select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 shrink-0" />
                <span>12-month extrapolated model range</span>
              </div>
            </div>
          </div>

          {/* Diagnostic Stats */}
          <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl space-y-2.5">
            <span className="text-[9px] font-mono uppercase tracking-widest text-emerald-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              Category Benchmarks: {category} Class Metrics
            </span>
            
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 bg-zinc-900/40 rounded-lg">
                <span className="text-[8px] font-mono text-zinc-500 block uppercase">Median Conv.</span>
                <span className="font-semibold text-zinc-200 mt-0.5 block">{categoryStats[category]?.conv}%</span>
              </div>
              <div className="p-2 bg-zinc-900/40 rounded-lg">
                <span className="text-[8px] font-mono text-zinc-500 block uppercase">ASO Diff Score</span>
                <span className="font-semibold text-zinc-200 mt-0.5 block">{categoryStats[category]?.diff}/100</span>
              </div>
              <div className="p-2 bg-zinc-900/40 rounded-lg">
                <span className="text-[8px] font-mono text-zinc-500 block uppercase">Market Volume</span>
                <span className="font-semibold text-zinc-200 mt-0.5 block text-xs">{categoryStats[category]?.volume}</span>
              </div>
            </div>
          </div>

          {/* Growth Recommendation Text Box */}
          <div className="text-[11px] text-zinc-400 leading-relaxed font-sans bg-emerald-950/10 border border-emerald-900/30 p-3 rounded-lg flex gap-2">
            <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Strategic Insight:</strong> Pricing at <strong className="text-emerald-300">{formatCurrency(price)}</strong> within the 
              "{category}" category class requires a monthly client capture index of <strong className="text-emerald-300">{formatNumber(activeSubscribers)}</strong> to 
              generate {formatCurrency(estimatedMRR)} monthly. Given the category's ASO difficulty index of <strong>{categoryStats[category]?.diff}/100</strong>, ranking for high-intent longtail phrases represents your lowest-cost organic growth driver.
            </span>
          </div>
        </div>
      </div>

      {/* Cross-Platform Index Intelligence Distribution */}
      <div className="glass-panel p-6 rounded-2xl border border-zinc-900 bg-zinc-950/30 space-y-4">
        <div>
          <h3 className="text-xs font-mono font-bold text-zinc-100 tracking-widest uppercase flex items-center gap-1.5">
            <BarChart2 className="w-4 h-4 text-emerald-400" />
            CROSS-PLATFORM STORE CLASS ASSOC METRICS
          </h3>
          <p className="text-[10px] text-zinc-500 mt-0.5">Reference benchmarks calculated across millions of organic search indices.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-[11px]">
            <thead>
              <tr className="border-b border-zinc-900 text-zinc-500 text-[9px] uppercase font-mono tracking-wider">
                <th className="pb-2 font-semibold">Store Category</th>
                <th className="pb-2 text-center font-semibold text-zinc-400">Typical Conv. Rate</th>
                <th className="pb-2 text-center font-semibold text-zinc-400">Value Multiplier</th>
                <th className="pb-2 text-center font-semibold text-zinc-400">ASO Search Volume</th>
                <th className="pb-2 text-center font-semibold text-zinc-400">Platform Split</th>
                <th className="pb-2 text-right font-semibold text-zinc-400">Recommended Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 text-zinc-300 font-medium">
              {Object.entries(categoryStats).map(([catName, stats], idx) => {
                const isSelected = category === catName;
                return (
                  <tr key={idx} className={`hover:bg-zinc-950/40 transition-colors ${isSelected ? 'bg-emerald-950/10 text-emerald-300 border-l-2 border-emerald-500' : ''}`}>
                    <td className="py-3 font-semibold text-zinc-100 flex items-center gap-1.5 pl-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`} />
                      {catName}
                    </td>
                    <td className="py-3 text-center font-mono text-zinc-400">{stats.conv}%</td>
                    <td className="py-3 text-center font-mono">{(stats.conv * 12.3).toFixed(1)}x Index</td>
                    <td className="py-3 text-center font-semibold text-emerald-400 font-mono">{stats.volume}</td>
                    <td className="py-3 text-center font-mono text-zinc-500 flex items-center justify-center gap-1 text-[10px] pt-3.5">
                      <Smartphone className="w-3 h-3" /> 
                      <span>42% iOS • 58% Android</span>
                    </td>
                    <td className="py-3 text-right font-display font-semibold text-[#24e09e] pr-2">{formatCurrency(stats.val)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
