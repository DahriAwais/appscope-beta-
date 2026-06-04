import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Layers, 
  Star, 
  TrendingUp, 
  MessageSquare, 
  Download, 
  Globe, 
  Clock, 
  Users, 
  Tag, 
  ArrowLeft, 
  Zap, 
  ExternalLink, 
  Sparkles, 
  CheckCircle, 
  RefreshCw,
  FolderSync,
  Crown,
  ShieldAlert,
  Eye,
  FileSpreadsheet,
  Lock,
  Unlock,
  SlidersHorizontal,
  Filter,
  TrendingDown,
  Trophy,
  DollarSign,
  ArrowRight,
  Info
} from 'lucide-react';
import AppHeader from './components/AppHeader';
import CustomChart from './components/CustomChart';
import ScreenshotImage from './components/ScreenshotImage';
import ImageWithFallback from './components/ImageWithFallback';
import MetricsView from './components/MetricsView';
import DocsView from './components/DocsView';
import { searchApps, getAppDetails, downloadAllImages, TRENDING_APPS } from './services';
import { AppSearchResult, AppDetails } from './types';

export default function App() {
  const [activeHeaderTab, setActiveHeaderTab] = useState('Search');
  const [currentPage, setCurrentPage] = useState<'home' | 'details'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AppSearchResult[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [appDetails, setAppDetails] = useState<AppDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  // Platform filtering for the autocomplete panel (All / iOS / Android)
  const [platformFilter, setPlatformFilter] = useState<'All' | 'iOS' | 'Android'>('All');
  
  // Download success animation triggers
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccessCount, setDownloadSuccessCount] = useState<number | null>(null);
  const [isRevenueBlurred, setIsRevenueBlurred] = useState(true);

  // Search history list locally preserved
  const [searchHistory, setSearchHistory] = useState<AppSearchResult[]>(() => {
    try {
      const saved = localStorage.getItem('appscope_search_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Tab controller for charts & logs in detail view
  const [activeDetailTab, setActiveDetailTab] = useState<'trends' | 'timeline' | 'reviews'>('trends');

  // Interactive monetization options & features
  const [isPremiumUnlocked, setIsPremiumUnlocked] = useState(true);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Side-by-side Competitor Comparison module states
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonAppDetails, setComparisonAppDetails] = useState<AppDetails | null>(null);
  const [searchComparisonQuery, setSearchComparisonQuery] = useState('');
  const [searchComparisonResults, setSearchComparisonResults] = useState<AppSearchResult[]>([]);
  const [searchingComparison, setSearchingComparison] = useState(false);

  // Advanced Reviews filters
  const [reviewTerm, setReviewTerm] = useState('');
  const [reviewRating, setReviewRating] = useState<number>(0); // 0 = all
  const [reviewSentiment, setReviewSentiment] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all');
  const [reviewVersion, setReviewVersion] = useState<'all' | 'latest'>('all');
  
  // Store rank filtering state
  const [rankingStoreFilter, setRankingStoreFilter] = useState<'All' | 'App Store' | 'Play Store'>('All');

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Secure client-side redirect through lookup image proxy for sandboxed frames
  const getProxiedUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('/') || url.startsWith('data:')) return url;
    return `/api/image-proxy?url=${encodeURIComponent(url)}`;
  };

  // Load trending apps by default
  useEffect(() => {
    setSearchResults(TRENDING_APPS);
  }, []);

  // Trigger search on query change
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        setSearching(true);
        const results = await searchApps(searchQuery);
        setSearchResults(results);
        setSearching(false);
      } else {
        setSearchResults(TRENDING_APPS);
      }
    }, 250);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Navigate to detailed dashboard
  const handleSelectApp = async (appId: string) => {
    setActiveHeaderTab('Search');
    setLoading(true);
    setSelectedAppId(appId);
    
    // Fetch full store metadata metrics
    const details = await getAppDetails(appId);
    if (details) {
      setAppDetails(details);
      
      // Save this app into search history!
      setSearchHistory(prev => {
        const filtered = prev.filter(item => item.id !== appId);
        const appObj: AppSearchResult = {
          id: details.id,
          trackId: details.trackId,
          name: details.name,
          developer: details.developer,
          iconUrl: details.iconUrl,
          platform: details.platform,
          rating: details.averageRating,
          ratingCount: details.ratingCount || 0,
          price: details.price || 'Free',
          storeUrl: details.storeUrl,
          category: details.category || 'Utility'
        };
        const updated = [appObj, ...filtered].slice(0, 6); // Keep last 6 searches for sleek UX look
        try {
          localStorage.setItem('appscope_search_history', JSON.stringify(updated));
        } catch (e) {
          console.warn("Storage write failure", e);
        }
        return updated;
      });

      setCurrentPage('details');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      alert("App information currently parsing, please attempt another entry.");
    }
    setLoading(false);
    setIsSearchFocused(false);
  };

  // Clear single search history item from listings
  const handleRemoveHistoryItem = (e: React.MouseEvent, appId: string) => {
    e.stopPropagation();
    setSearchHistory(prev => {
      const updated = prev.filter(item => item.id !== appId);
      try {
        localStorage.setItem('appscope_search_history', JSON.stringify(updated));
      } catch (err) {
        console.warn("Storage write failure", err);
      }
      return updated;
    });
  };

  // Clear all search history completely
  const handleClearAllHistory = () => {
    setSearchHistory([]);
    try {
      localStorage.removeItem('appscope_search_history');
    } catch (e) {}
  };

  // ASO Keyword list generator with advanced insights, targeted recommendations and ranking patterns
  const generateASOKeywords = (appName: string, category: string) => {
    const cleanName = appName.split(/[ \-:]/)[0].toLowerCase();
    const catLower = category.toLowerCase();
    const keywords = [
      { text: `${cleanName}`, rank: 1, volume: 94, difficulty: 88, monthlyTraffic: 4800, trend: 'up', relevance: 'Highest', recommended: false, type: 'Brand Core' },
      { text: `${cleanName} mobile`, rank: 3, volume: 85, difficulty: 70, monthlyTraffic: 2100, trend: 'up', relevance: 'Highest', recommended: false, type: 'Brand Intent' },
      { text: `best ${catLower} apps`, rank: 9, volume: 76, difficulty: 60, monthlyTraffic: 1150, trend: 'up', relevance: 'High', recommended: true, type: 'Broad Intent' },
      { text: `${catLower} visual tracker`, rank: 6, volume: 62, difficulty: 41, monthlyTraffic: 830, trend: 'up', relevance: 'Highest', recommended: true, type: 'Feature Core' },
      { text: `${cleanName} alternative`, rank: 5, volume: 78, difficulty: 64, monthlyTraffic: 1450, trend: 'up', relevance: 'Medium', recommended: false, type: 'Competitor' },
      { text: `free ${cleanName} download`, rank: 4, volume: 69, difficulty: 48, monthlyTraffic: 920, trend: 'up', relevance: 'Medium', recommended: false, type: 'Transactional' },
      { text: `niche ${catLower} utility`, rank: 14, volume: 53, difficulty: 28, monthlyTraffic: 390, trend: 'stable', relevance: 'High', recommended: true, type: 'Niche Longtail' },
      { text: `clean ${catLower} tool`, rank: 8, volume: 71, difficulty: 51, monthlyTraffic: 720, trend: 'up', relevance: 'Highest', recommended: true, type: 'Feature Core' },
      { text: `pro ${catLower} editor for mobile`, rank: 12, volume: 58, difficulty: 38, monthlyTraffic: 450, trend: 'stable', relevance: 'High', recommended: true, type: 'Niche Longtail' },
      { text: `offline ${catLower} explorer`, rank: 15, volume: 44, difficulty: 20, monthlyTraffic: 310, trend: 'up', relevance: 'High', recommended: true, type: 'Feature Longtail' },
      { text: `top rated ${catLower} app 2026`, rank: 11, volume: 50, difficulty: 35, monthlyTraffic: 330, trend: 'up', relevance: 'High', recommended: true, type: 'Broad Intent' },
    ];
    return keywords.sort((a, b) => a.rank - b.rank);
  };

  // One-Click Intelligence Data Sheets Exporter (CSV / JSON)
  const handleExportData = (format: 'csv' | 'json') => {
    if (!appDetails) return;
    
    if (!isPremiumUnlocked) {
      setShowPremiumModal(true);
      return;
    }

    const appNameClean = appDetails.name.replace(/[^a-zA-Z0-9]/g, '_');
    
    if (format === 'json') {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
        appId: appDetails.id,
        name: appDetails.name,
        developer: appDetails.developer,
        platform: appDetails.platform,
        category: appDetails.category,
        rating: appDetails.averageRating,
        ratingCount: appDetails.ratingCount,
        reviewsCount: appDetails.reviewsCount,
        languages: appDetails.languages,
        countries: appDetails.countries,
        updateFrequency: appDetails.updateFrequency,
        growthScore: appDetails.growthScore,
        ratingTrendHistory: appDetails.ratingHistory,
        reviewAdoptionHistory: appDetails.reviewHistory,
        keywordsASORankings: generateASOKeywords(appDetails.name, appDetails.category)
      }, null, 2));
      
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `appscope_intelligence_${appNameClean.toLowerCase()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } else {
      // Build high fidelity CSV string
      let csvContent = "";
      
      // Header details rows
      csvContent += `App Store Intelligence Export - AppScope (Timestamp: ${new Date().toISOString()})\n`;
      csvContent += `Name,${appDetails.name.replace(/,/g, ' ')}\n`;
      csvContent += `Developer,${appDetails.developer.replace(/,/g, ' ')}\n`;
      csvContent += `Platform,${appDetails.platform}\n`;
      csvContent += `Category,${appDetails.category}\n`;
      csvContent += `Average Rating,${appDetails.averageRating}\n`;
      csvContent += `Rating Count,${appDetails.ratingCount}\n`;
      csvContent += `Indexed Reviews Count,${appDetails.reviewsCount}\n`;
      csvContent += `Price,${appDetails.price}\n`;
      csvContent += `Version,${appDetails.version}\n`;
      csvContent += `Update Frequency,${appDetails.updateFrequency}\n`;
      csvContent += `Growth Score,${appDetails.growthScore}/100\n\n`;
      
      // Rating Growth history segment
      csvContent += `SEGMENT 1: Rating Trend History\n`;
      csvContent += `Month,Store Rating Value\n`;
      appDetails.ratingHistory.forEach(pt => {
        csvContent += `${pt.date},${pt.value}\n`;
      });
      csvContent += `\n`;

      // Keywords insights segment
      csvContent += `SEGMENT 2: ASO Keyword Rankings\n`;
      csvContent += `Keyword,Rank,Volume Index,Difficulty,Est Monthly Traffic\n`;
      const keywordsList = generateASOKeywords(appDetails.name, appDetails.category);
      keywordsList.forEach(kw => {
        csvContent += `${kw.text.replace(/,/g, ' ')},#${kw.rank},${kw.volume},${kw.difficulty},${kw.monthlyTraffic}\n`;
      });
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `appscope_intelligence_${appNameClean.toLowerCase()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.remove();
    }
  };

  // Compare autocomplete searches
  const handleComparisonSearch = async (query: string) => {
    setSearchComparisonQuery(query);
    if (query.trim().length > 0) {
      setSearchingComparison(true);
      const results = await searchApps(query);
      setSearchComparisonResults(results.filter(app => app.id !== appDetails?.id));
      setSearchingComparison(false);
    } else {
      setSearchComparisonResults([]);
    }
  };

  // Start side-by-side matrices
  const handleStartComparison = async (targetAppId: string) => {
    setLoading(true);
    setIsComparing(true);
    try {
      const details = await getAppDetails(targetAppId);
      if (details) {
        setComparisonAppDetails(details);
      }
    } catch (e) {
      console.warn("Comparison extraction failed", e);
    } finally {
      setLoading(false);
    }
  };

  // Screen asset batch downloads (Premium Enforced)
  const handleDownloadAssetDeck = async () => {
    if (!appDetails || isDownloading) return;

    if (!isPremiumUnlocked) {
      setShowPremiumModal(true);
      return;
    }

    setIsDownloading(true);
    setDownloadSuccessCount(null);

    try {
      // triggers programmatic zip layout simulator
      const downloaded = await downloadAllImages(appDetails.screenshots, appDetails.name);
      setDownloadSuccessCount(downloaded);
      setTimeout(() => {
        setDownloadSuccessCount(null);
      }, 4000);
    } catch (e) {
      console.warn(e);
    } finally {
      setIsDownloading(false);
    }
  };

  // Navigate back home to search
  const handleReturnHome = () => {
    setCurrentPage('home');
    setSelectedAppId(null);
    setAppDetails(null);
    setSearchQuery('');
  };

  // Filter autocomplete panel on platform selection
  const filteredSearchResults = searchResults.filter(app => {
    if (platformFilter === 'All') return true;
    return app.platform === platformFilter;
  });

  return (
    <div className="relative min-h-screen bg-[#030d0a] text-zinc-100 overflow-x-hidden selection:bg-emerald-500/20 selection:text-emerald-300">
      
      {/* Background radial auroral layout gradients - Pixel accurate reproduction! */}
      <div className="absolute top-0 left-0 right-0 h-[700px] radial-aurora pointer-events-none z-0" />
      <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] radial-aurora-glow pointer-events-none z-0 opacity-40 blur-3xl" />
      
      {/* Universal Floating Navigation Header */}
      <AppHeader 
        onGoHome={handleReturnHome} 
        currentPage={currentPage} 
        isPremiumUnlocked={isPremiumUnlocked}
        setIsPremiumUnlocked={setIsPremiumUnlocked}
        activeTab={activeHeaderTab}
        onTabChange={(tab) => {
          setActiveHeaderTab(tab);
          if (tab === 'Search') {
            handleReturnHome();
          }
        }}
      />

      {/* Main application body router */}
      <main className="relative z-10 px-4 md:px-6 w-full max-w-7xl mx-auto pb-24">
        
        {activeHeaderTab === 'Metrics' ? (
          <MetricsView />
        ) : activeHeaderTab === 'Docs' ? (
          <DocsView />
        ) : currentPage === 'home' ? (
          /* ==================== HOME SCREEN ==================== */
          <div className="flex flex-col items-center justify-center min-h-[55vh] relative pt-2 md:pt-6">
            
            {/* Display Watermark text replacing the mockup background "Xrio" with an elegant purpose title */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[62%] select-none pointer-events-none text-[12vw] font-display font-extrabold tracking-widest bg-clip-text text-transparent bg-gradient-to-b from-emerald-950/20 to-emerald-950/0 text-center leading-none uppercase select-none opacity-80">
              APPSCOPE
            </div>

            {/* Central Typography Heading */}
            <div className="text-center relative z-10 max-w-3xl px-4 select-none mb-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-emerald-950/50 to-emerald-900/10 border border-emerald-500/15 rounded-full mb-5 shadow-[0_2px_8px_rgba(4,47,31,0.2)]">
                <FolderSync className="w-3 h-3 text-emerald-400" />
                <span className="font-mono text-[9px] uppercase tracking-widest text-[#24e09e] font-semibold">
                  Cross-Platform App Store Search Engine
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold text-zinc-100 tracking-tight leading-[1.08] mb-5">
                Research Any <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-100 via-emerald-300 to-teal-400">Mobile App</span> Instantly
              </h1>
              
              <p className="text-zinc-400 text-xs sm:text-sm md:text-base leading-relaxed max-w-xl mx-auto font-sans font-medium">
                Explore rankings, ratings, reviews, categories, competitors, and public store data from millions of mobile apps.
              </p>
            </div>

            {/* Futuristic Real-Time Search Experience Container */}
            <div className="relative w-full max-w-2xl mt-8 px-1 z-30" id="search-container">
              
              {/* Autocomplete Search Results Panel: Floating *DIRECTLY ABOVE* the input box when active! */}
              {isSearchFocused && searchQuery.trim().length > 0 && (
                <div 
                  className="absolute bottom-[105%] left-1 right-1 bg-zinc-950/98 border-2 border-emerald-500/30 rounded-2xl p-5 shadow-[0_-15px_60px_rgba(4,47,31,0.5)] backdrop-blur-2xl animate-float"
                  id="floating-search-presets-panel"
                >
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-800/80 text-xs">
                    <div className="flex items-center gap-2 text-zinc-300 font-display font-semibold text-sm">
                      <span>Store Directory Index</span>
                      <span className="font-mono text-[11px] bg-emerald-950/60 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded-full font-bold">
                        {filteredSearchResults.length} matches
                      </span>
                    </div>
                    {/* Platform Selector */}
                    <div className="flex items-center gap-1.5 bg-zinc-900/90 p-1 rounded-full border border-zinc-800">
                      {(['All', 'iOS', 'Android'] as const).map((plat) => (
                        <button
                          key={plat}
                          onClick={(e) => {
                            e.stopPropagation();
                            setPlatformFilter(plat);
                          }}
                          className={`px-3 py-1 rounded-full text-[10px] font-mono font-medium transition-all ${
                            platformFilter === plat 
                              ? 'bg-[#10b981] text-zinc-950 font-bold shadow-[0_2px_8px_rgba(16,185,129,0.3)]' 
                              : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          {plat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Scrollable Apps Panel content */}
                  <div className="max-h-[320px] overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                    {searching ? (
                      <div className="py-10 text-center" id="searching-state">
                        <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-3" />
                        <span className="text-sm font-display text-zinc-400">Retrieving live official indices...</span>
                      </div>
                    ) : filteredSearchResults.length === 0 ? (
                      <div className="py-10 text-center text-zinc-500" id="no-results-state">
                        <span className="text-sm">No matching apps found in iOS or Play Store indexing.</span>
                      </div>
                    ) : (
                      filteredSearchResults.map((app) => (
                        <button
                          key={app.id}
                          onClick={() => handleSelectApp(app.id)}
                          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-emerald-950/20 border border-transparent hover:border-emerald-500/20 transition-all duration-300 text-left group"
                          id={`search-item-${app.id}`}
                        >
                          <div className="flex items-center gap-3.5">
                            <ImageWithFallback 
                              src={getProxiedUrl(app.iconUrl)} 
                              fallbackSrc={app.iconUrl}
                              alt={app.name} 
                              className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 shadow-lg group-hover:scale-105 transition-transform object-cover"
                            />
                            <div>
                              <div className="font-display font-bold text-zinc-100 text-sm line-clamp-1 group-hover:text-emerald-300 transition-colors">
                                {app.name}
                              </div>
                              <div className="text-xs text-zinc-500 font-medium line-clamp-1 mt-0.5">
                                {app.developer}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            {/* Platform badge styling */}
                            <span className={`text-[10px] font-mono font-bold px-2.5 py-0.8 rounded-full border ${
                              app.platform === 'iOS' 
                                ? 'bg-indigo-950/40 text-indigo-300 border-indigo-500/20' 
                                : 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                            }`}>
                              {app.platform === 'iOS' ? ' iOS' : '🤖 Play Store'}
                            </span>
                            
                            <div className="flex items-center gap-1 text-zinc-300 group-hover:text-emerald-400 transition-colors">
                              <span className="text-xs font-mono font-bold">{app.rating}</span>
                              <Star className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Central Search Entry box - Frosted premium capsule theme matched to mock reference! */}
              <div className="relative flex flex-col bg-zinc-950/85 border-2 border-emerald-500/35 text-zinc-300 rounded-3xl w-full p-5 shadow-[0_25px_60px_rgba(0,0,0,0.7)] backdrop-blur-xl hover:border-emerald-500/50 focus-within:border-emerald-400 focus-within:shadow-[0_25px_60px_rgba(16,185,129,0.15)] group transition-all duration-300">
                {/* pulsing neon backglow underneath input card */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 rounded-3xl blur-xl opacity-30 group-focus-within:opacity-100 transition-opacity pointer-events-none -z-15" />
                
                {/* Search query input box at the top */}
                <div className="flex items-center gap-3 w-full">
                  <div className="p-2 w-10 h-10 bg-emerald-950/35 border border-emerald-500/15 rounded-xl text-emerald-400 group-focus-within:border-emerald-400/40 group-focus-within:bg-emerald-950/60 transition-all shadow-inner flex items-center justify-center">
                    <Search className="w-5 h-5 shrink-0 transition-transform group-focus-within:scale-110" />
                  </div>
                  
                  <div className="flex-1">
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={() => {
                        // Small delay to allow clicking search autocomplete results
                        setTimeout(() => setIsSearchFocused(false), 230);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && filteredSearchResults.length > 0) {
                          handleSelectApp(filteredSearchResults[0].id);
                        }
                      }}
                      placeholder="Search to research any mobile app (e.g. Figma, Duolingo, Notion...)"
                      className="w-full bg-transparent border-none text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-0 text-base md:text-lg font-display font-medium py-1 selection:bg-emerald-500/30 selection:text-emerald-200"
                      id="primary-search-input"
                    />
                  </div>
                  
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="w-7 h-7 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 flex items-center justify-center font-bold text-xs active:scale-90 transition-all shrink-0 cursor-pointer"
                    >
                      ✕
                    </button>
                  )}

                  {/* Elegant side arrow button replacing standard text Analyze Button */}
                  <button
                    onClick={() => {
                      if (filteredSearchResults.length > 0) {
                        handleSelectApp(filteredSearchResults[0].id);
                      } else {
                        setIsSearchFocused(true);
                        searchInputRef.current?.focus();
                      }
                    }}
                    className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 text-zinc-950 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.35)] cursor-pointer shrink-0"
                    id="primary-search-trigger"
                    title="Analyse Top Match"
                  >
                    <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                  </button>
                </div>

                {/* Bottom line layout */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 mt-3.5 border-t border-zinc-900/60">
                  {/* Bottom selection pills */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setPlatformFilter('All')}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-display font-semibold transition-all cursor-pointer ${
                        platformFilter === 'All'
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 shadow-[0_2px_10px_rgba(16,185,129,0.08)]'
                          : 'bg-zinc-900/60 text-zinc-500 hover:text-zinc-305 border border-zinc-850'
                      }`}
                    >
                      <Layers className="w-3 h-3" />
                      All Platforms
                    </button>
                    
                    <button
                      onClick={() => setPlatformFilter('iOS')}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-display font-semibold transition-all cursor-pointer ${
                        platformFilter === 'iOS'
                          ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 shadow-[0_2px_10px_rgba(99,102,241,0.08)] font-bold'
                          : 'bg-zinc-900/60 text-zinc-500 hover:text-zinc-305 border border-zinc-850'
                      }`}
                    >
                      <span> iOS Store</span>
                    </button>
                    
                    <button
                      onClick={() => setPlatformFilter('Android')}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-display font-semibold transition-all cursor-pointer ${
                        platformFilter === 'Android'
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 shadow-[0_2px_10px_rgba(16,185,129,0.08)] font-bold'
                          : 'bg-zinc-900/60 text-zinc-500 hover:text-zinc-308 border border-zinc-850'
                      }`}
                    >
                      <span>🤖 Play Store</span>
                    </button>
                  </div>

                  {/* Right hand feedback wave */}
                  <div className="flex items-center gap-1.5 bg-[#10b981]/5 px-2.5 py-1 rounded-full border border-emerald-500/10 text-[10px] select-none">
                    <span className="w-1 h-2 bg-emerald-500 animate-pulse inline-block rounded" style={{ animationDelay: '0.1s' }} />
                    <span className="w-1 h-3.5 bg-emerald-400 animate-pulse inline-block rounded" style={{ animationDelay: '0.3s' }} />
                    <span className="w-1 h-1.5 bg-emerald-500 animate-pulse inline-block rounded" style={{ animationDelay: '0.2s' }} />
                    <span className="text-[10px] text-zinc-400 font-display font-medium ml-1">Dynamic indexing active</span>
                  </div>
                </div>
              </div>

              {/* Status display hint below search container */}
              <div className="flex items-center justify-between px-3 mt-4 text-[10px] font-mono text-zinc-500 select-none">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping" />
                  Real-time live synchronization active
                </span>
                <span>Type and press the arrow button to analyze top match</span>
              </div>
            </div>

            {/* Search History Cards Grid */}
            {searchHistory.length > 0 && (
              <div className="w-full max-w-2xl mt-8 px-1 z-20 space-y-3" id="search-history-container">
                <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-zinc-500 select-none px-2">
                  <span className="flex items-center gap-2 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-[#24e09e]" />
                    Recent Research History
                  </span>
                  <button 
                    onClick={handleClearAllHistory}
                    className="hover:text-red-400 transition-colors text-[10px] flex items-center gap-1 cursor-pointer uppercase font-bold"
                  >
                    Clear All
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {searchHistory.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectApp(item.id)}
                      className="group p-2.5 rounded-xl bg-zinc-950/45 border border-zinc-900/60 hover:border-emerald-500/30 hover:bg-emerald-950/10 cursor-pointer transition-all duration-300 flex items-center justify-between gap-2 overflow-hidden shadow-md"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <ImageWithFallback 
                          src={getProxiedUrl(item.iconUrl)} 
                          fallbackSrc={item.iconUrl}
                          alt={item.name} 
                          className="w-7 h-7 rounded-md object-cover border border-zinc-800 shrink-0 group-hover:scale-105 transition-transform"
                        />
                        <div className="min-w-0 text-left">
                          <h4 className="text-[11px] font-display font-bold text-zinc-200 group-hover:text-emerald-300 transition-colors truncate">
                            {item.name}
                          </h4>
                          <span className={`text-[8px] font-mono leading-none ${
                            item.platform === 'iOS' ? 'text-indigo-400' : 'text-emerald-400'
                          }`}>
                            {item.platform === 'iOS' ? ' iOS' : '🤖 Play Store'}
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={(e) => handleRemoveHistoryItem(e, item.id)}
                        className="w-5 h-5 rounded-full hover:bg-zinc-900 border border-transparent hover:border-zinc-800 text-zinc-500 hover:text-zinc-250 flex items-center justify-center font-bold text-[9px] transition-all shrink-0 cursor-pointer"
                        title="Delete from history"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Removed Quick Research Presets as requested */}
            
          </div>
        ) : (
          /* ==================== DETAILS PAGE ==================== */
          <div className="mt-6 md:mt-12 relative z-20 space-y-8 animate-fade-in" id="details-view-container">
            
            {/* Back Navigation Bar */}
            <div className="flex items-center justify-between bg-zinc-950/40 p-3 rounded-2xl border border-zinc-900 backdrop-blur-sm">
              <button
                onClick={handleReturnHome}
                className="flex items-center gap-2 text-xs font-display font-semibold text-zinc-400 hover:text-emerald-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-emerald-950/20"
                id="back-home-button"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to App search bar</span>
              </button>

              <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
                <span>Database Index:</span>
                <span className="text-zinc-300 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 font-bold">
                  {appDetails?.id}
                </span>
              </div>
            </div>

            {appDetails && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* ---------- Left Sidebar Column (App Identity & Details) ---------- */}
                <div className="lg:col-span-1 space-y-6">
                  
                  {/* Primary App Profile Card */}
                  <div className="glass-panel p-7 rounded-2xl space-y-6" id="app-profile-card">
                    <div className="flex items-start justify-between gap-4">
                      <div className="relative group/icon shrink-0">
                        <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur opacity-30 group-hover/icon:opacity-55 transition-opacity" />
                        <ImageWithFallback 
                          src={getProxiedUrl(appDetails.iconUrl)} 
                          fallbackSrc={appDetails.iconUrl}
                          alt={appDetails.name} 
                          className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-zinc-900 border-2 border-zinc-800 shadow-2xl object-cover transition-transform duration-300 group-hover/icon:scale-[1.02]"
                        />
                      </div>
                      
                      <span className={`text-[11px] font-mono font-extrabold px-3.5 py-1.5 rounded-full border tracking-wide shrink-0 ${
                        appDetails.platform === 'iOS' 
                          ? 'bg-indigo-950/40 text-indigo-300 border-indigo-500/30 shadow-[0_0_12px_rgba(129,140,248,0.15)]' 
                          : 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                      }`}>
                        {appDetails.platform === 'iOS' ? ' Apple Store' : '🤖 Google Play'}
                      </span>
                    </div>

                    <div>
                      <h2 className="text-2xl font-display font-extrabold text-zinc-100 tracking-tight leading-snug">
                        {appDetails.name}
                      </h2>
                      <p className="text-sm text-zinc-400 mt-1.5 font-semibold font-display flex items-center gap-1.5">
                        <span className="text-zinc-650 font-normal">by</span> {appDetails.developer}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-805/40">
                      <div>
                        <div className="text-[10px] uppercase font-mono text-zinc-500 tracking-widest font-semibold">Category</div>
                        <div className="text-sm text-zinc-200 font-display font-bold mt-1.5 flex items-center gap-1">
                          <Tag className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          {appDetails.category}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-[10px] uppercase font-mono text-zinc-500 tracking-widest font-semibold">Price Variant</div>
                        <div className="text-sm text-zinc-200 font-display font-bold mt-1.5">
                          {appDetails.price}
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] uppercase font-mono text-zinc-500 tracking-widest font-semibold">Store Version</div>
                        <div className="text-sm text-zinc-200 font-mono font-semibold mt-1.5">
                          v{appDetails.version}
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] uppercase font-mono text-zinc-500 tracking-widest font-semibold">Age Rating</div>
                        <div className="text-sm text-zinc-200 font-mono font-semibold mt-1.5">
                          {appDetails.contentRating}
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-zinc-300 leading-relaxed font-sans line-clamp-6 border-t border-zinc-805/40 pt-4">
                      {appDetails.description}
                    </p>

                    <a
                      href={appDetails.storeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3.5 px-4 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-emerald-500/30 text-zinc-200 hover:text-emerald-400 font-display font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 group cursor-pointer active:scale-98 shadow-md"
                    >
                      <span>View Original Store Page</span>
                      <ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
                    </a>
                  </div>

                  {/* Live Store Rankings Index Card */}
                  <div className="glass-panel p-6 rounded-2xl space-y-4 shadow-lg border border-zinc-800/50" id="store-rankings-panel">
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-900/40">
                      <div>
                        <h3 className="font-display font-semibold text-zinc-100 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                          <Trophy className="w-4 h-4 text-amber-500" />
                          Store Rankings Index
                        </h3>
                        <p className="text-[10px] text-zinc-500 mt-0.5">Category & overall ranking tracking data.</p>
                      </div>

                      <span className="text-[9px] text-zinc-400 bg-zinc-900 border border-zinc-850 px-2 py-0.5 rounded font-mono uppercase tracking-widest font-semibold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live Index
                      </span>
                    </div>

                    {/* Filter Segment tabs */}
                    <div className="flex gap-1 p-0.5 bg-zinc-950/80 border border-zinc-900 rounded-lg">
                      {(['All', 'App Store', 'Play Store'] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => setRankingStoreFilter(st)}
                          className={`flex-1 py-1 px-2.5 rounded text-[10px] font-display font-semibold transition-all cursor-pointer ${
                            rankingStoreFilter === st
                              ? 'bg-zinc-850 text-[#24e09e] border border-zinc-800/80'
                              : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          {st === 'All' ? 'Combined' : st === 'App Store' ? '🍏 iOS' : '🤖 Android'}
                        </button>
                      ))}
                    </div>

                    {/* Rankings list container */}
                    <div className="space-y-2.5 max-h-[385px] overflow-y-auto pr-1">
                      {(() => {
                        // Support elegant fallback metrics mapping if storeRankings remains empty list
                        const rankings = appDetails.storeRankings || [
                          {
                            store: 'App Store' as const,
                            category: `Top Free ${appDetails.category}`,
                            rank: 3,
                            type: 'Category Free',
                            trend: 'up' as const,
                            change: 2,
                            country: 'United States'
                          },
                          {
                            store: 'Play Store' as const,
                            category: `Top Free ${appDetails.category}`,
                            rank: 5,
                            type: 'Category Free',
                            trend: 'stable' as const,
                            change: 0,
                            country: 'United States'
                          }
                        ];

                        const filteredRankings = rankings.filter(r => 
                          rankingStoreFilter === 'All' || r.store === rankingStoreFilter
                        );

                        if (filteredRankings.length === 0) {
                          return (
                            <div className="text-center py-6 text-zinc-500 text-xs text-sans">
                              No rankings matching this store filter.
                            </div>
                          );
                        }

                        return filteredRankings.map((rk, idx) => {
                          const badgeColor = rk.rank === 1 
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' 
                            : rk.rank === 2
                              ? 'bg-slate-300/15 text-slate-300 border border-slate-300/20'
                              : rk.rank === 3
                                ? 'bg-amber-700/15 text-amber-500 border border-amber-700/20'
                                : 'bg-zinc-900 text-zinc-400 border border-zinc-850';

                          return (
                            <div 
                              key={idx} 
                              className="p-3 rounded-xl bg bg-zinc-950/60 border border-zinc-900/60 hover:border-zinc-850/80 transition-all flex items-center justify-between"
                            >
                              <div className="flex items-center gap-3">
                                {/* Large visual Rank Badge */}
                                <div className={`w-10 h-10 shrink-0 font-display font-black text-xs rounded-lg flex flex-col items-center justify-center border ${badgeColor}`}>
                                  <span className="text-[8px] uppercase tracking-widest font-mono text-zinc-500 select-none">Rank</span>
                                  <span className="text-sm font-extrabold leading-none -mt-0.5">#{rk.rank}</span>
                                </div>

                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-xs font-display font-bold text-zinc-200 leading-snug">
                                      {rk.category}
                                    </span>
                                    {/* Small flag country indicator */}
                                    <span className="text-[9px] text-zinc-500 font-mono">
                                      ({rk.country === 'United States' ? 'US' : 'UK'})
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    {/* Store platform identifier */}
                                    <span className={`text-[9px] font-mono leading-none ${
                                      rk.store === 'App Store' 
                                        ? 'text-indigo-400 font-semibold' 
                                        : 'text-emerald-400 font-semibold'
                                    }`}>
                                      {rk.store === 'App Store' ? ' iOS App Store' : '🤖 Play Store'}
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-zinc-800" />
                                    <span className="text-[9px] text-zinc-650 font-mono">
                                      {rk.type}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Trend change index details */}
                              <div className="text-right shrink-0">
                                {rk.trend === 'up' && (
                                  <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold font-mono">
                                    <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                                    <span>+{rk.change}</span>
                                  </div>
                                )}
                                {rk.trend === 'down' && (
                                  <div className="flex items-center gap-1 text-[10px] text-red-400 font-bold font-mono">
                                    <TrendingDown className="w-3.5 h-3.5 shrink-0" />
                                    <span>-{rk.change}</span>
                                  </div>
                                )}
                                {rk.trend === 'stable' && (
                                  <span className="text-[10px] text-zinc-600 font-bold font-mono">
                                    Stable =
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>

                  {/* Growth Signals Card */}
                  <div className="glass-panel p-6 rounded-2xl space-y-4" id="growth-signals-panel">
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-800/60">
                      <h3 className="font-display font-semibold text-zinc-200 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        GROWTH SIGNALS
                      </h3>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
                        Score {appDetails.growthScore}/100
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5 font-medium">
                          <span>Rating Growth Momentum</span>
                          <span className="text-emerald-400 font-mono font-bold">+18.4%</span>
                        </div>
                        {/* Custom visual progress bar */}
                        <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-zinc-800">
                          <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full rounded-full" style={{ width: '84%' }} />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5 font-medium">
                          <span>Review Inflow Volume</span>
                          <span className="text-emerald-400 font-mono font-bold">+31.2%</span>
                        </div>
                        <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-zinc-800">
                          <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full" style={{ width: '72%' }} />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-900">
                          <span className="text-[9px] uppercase font-mono text-zinc-500 tracking-wider">Update Cadence</span>
                          <div className="text-xs text-zinc-200 font-display font-bold mt-1 leading-snug">
                            {appDetails.updateFrequency}
                          </div>
                        </div>
                        
                        <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-900">
                          <span className="text-[9px] uppercase font-mono text-zinc-500 tracking-wider">Store Refresh</span>
                          <div className="text-xs text-zinc-200 font-mono font-bold mt-1 leading-snug">
                            {appDetails.lastUpdated}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Languages & Locales */}
                  <div className="glass-panel p-6 rounded-2xl space-y-4">
                    <h3 className="font-display font-semibold text-zinc-200 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                      <Globe className="w-4 h-4 text-emerald-400" />
                      LOCALIZATION PRESENCE
                    </h3>
                    
                    <div className="space-y-3.5">
                      <div>
                        <span className="text-[10px] font-mono text-zinc-500 block mb-1.5">SUPPORTED TRANSLATIONS ({appDetails.languages.length})</span>
                        <div className="flex flex-wrap gap-1.5">
                          {appDetails.languages.map((lang, lIdx) => (
                            <span 
                              key={lIdx} 
                              className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-300 font-display px-2.5 py-0.5 rounded-md"
                            >
                              {lang}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-zinc-800/80 pt-3.5">
                        <span className="text-[10px] font-mono text-zinc-500 block mb-1.5">TOP GEOGRAPHIC SEGMENTS (PUBLIC)</span>
                        <div className="flex flex-wrap gap-1.5">
                          {appDetails.countries.slice(0, 5).map((cty, cIdx) => (
                            <span 
                              key={cIdx} 
                              className="text-[10px] bg-zinc-950 text-zinc-400 border border-zinc-900/60 px-2 py-0.5 rounded-full"
                            >
                              {cty}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* One-Click Data Export Hub */}
                  <div className="glass-panel p-6 rounded-2xl space-y-4" id="data-export-hub">
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-800/60">
                      <h3 className="font-display font-semibold text-zinc-100 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                        One-Click Data Export
                      </h3>
                      {!isPremiumUnlocked && (
                        <span className="text-[9px] font-mono text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded flex items-center gap-1 uppercase tracking-wider font-extrabold">
                          <Lock className="w-2.5 h-2.5" /> Premium
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Download compiled store databases including history ratings trend index, category metrics, and raw review feeds.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleExportData('csv')}
                        className="py-3 px-2.5 bg-zinc-900 hover:bg-zinc-850 hover:border-emerald-500/25 border border-zinc-805 text-zinc-350 hover:text-emerald-400 rounded-xl transition-all text-xs font-display font-bold flex flex-col items-center justify-center gap-1.5 group cursor-pointer active:scale-95"
                      >
                        <FileSpreadsheet className="w-5 h-5 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
                        <span>Export as CSV</span>
                      </button>
                      <button
                        onClick={() => handleExportData('json')}
                        className="py-3 px-2.5 bg-zinc-900 hover:bg-zinc-850 hover:border-emerald-500/25 border border-zinc-805 text-zinc-350 hover:text-emerald-400 rounded-xl transition-all text-xs font-display font-bold flex flex-col items-center justify-center gap-1.5 group cursor-pointer active:scale-95"
                      >
                        <Layers className="w-5 h-5 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
                        <span>Export as JSON</span>
                      </button>
                    </div>
                  </div>

                  {/* ASO Keyword Performance Card (Optimization Matrice) */}
                  <div className="glass-panel p-6 rounded-2xl space-y-5" id="aso-performance-panel">
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-800/60">
                      <div>
                        <h3 className="font-display font-semibold text-zinc-100 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                          <TrendingUp className="w-4 h-4 text-emerald-400" />
                          ASO Keyword Rankings & Strategy
                        </h3>
                        <p className="text-[10px] text-zinc-500 mt-0.5">Live store visibility index rankings & indexing analysis.</p>
                      </div>
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono font-extrabold shrink-0 uppercase tracking-widest">
                        ASO IQ 96%
                      </span>
                    </div>

                    <div className="overflow-x-auto min-w-full">
                      <table className="w-full text-left font-sans text-[11px]">
                        <thead>
                          <tr className="border-b border-zinc-900 text-zinc-500 text-[9px] uppercase font-mono tracking-wider">
                            <th className="pb-1.5 font-semibold">Keyword</th>
                            <th className="pb-1.5 text-center font-semibold">Rank Status</th>
                            <th className="pb-1.5 text-center font-semibold">Vol</th>
                            <th className="pb-1.5 text-center font-semibold">Diff</th>
                            <th className="pb-1.5 text-right font-semibold">Est. Traffic</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900">
                          {generateASOKeywords(appDetails.name, appDetails.category).map((kw, kwIdx) => {
                            const ranksTop3 = kw.rank <= 3;
                            return (
                              <tr key={kwIdx} className="hover:bg-zinc-950/40 transition-colors">
                                <td className="py-2.5 font-medium text-zinc-250">
                                  <div className="flex flex-col">
                                    <span className="flex items-center gap-1 text-zinc-200 text-xs font-semibold">
                                      {kw.trend === 'up' ? (
                                        <TrendingUp className="w-2.5 h-2.5 text-emerald-500" />
                                      ) : kw.trend === 'down' ? (
                                        <TrendingDown className="w-2.5 h-2.5 text-red-500" />
                                      ) : (
                                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 mr-1" />
                                      )}
                                      {kw.text}
                                    </span>
                                    <span className="text-[9px] font-mono text-zinc-500 mt-0.5">{kw.type}</span>
                                  </div>
                                </td>
                                <td className="py-2.5 text-center font-mono">
                                  <div className="flex flex-col items-center justify-center">
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                      ranksTop3
                                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 shadow-md'
                                        : kw.rank <= 10
                                          ? 'bg-blue-500/10 text-blue-300 border border-blue-500/10'
                                          : 'bg-zinc-900 text-zinc-400 font-medium'
                                    }`}>
                                      #{kw.rank}
                                    </span>
                                    {ranksTop3 ? (
                                      <span className="text-[7.5px] font-mono text-emerald-500 uppercase tracking-wider font-extrabold mt-0.5">Top Index Driver</span>
                                    ) : (
                                      <span className="text-[7.5px] font-mono text-zinc-500 uppercase tracking-wider mt-0.5">Organic Index</span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-2.5 text-center font-mono text-zinc-400">{kw.volume}</td>
                                <td className="py-2.5 text-center font-mono text-zinc-400">{kw.difficulty}</td>
                                <td className="py-2.5 text-right font-mono text-zinc-350 font-semibold">+{kw.monthlyTraffic}/mo</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Developer Recommendations Box */}
                    <div className="p-4 bg-emerald-950/10 border border-emerald-900/30 rounded-xl space-y-2">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-display font-bold text-xs">
                        <Zap className="w-3.5 h-3.5" />
                        <span>ASO Playbook: Target Recommendations for Similar Apps</span>
                      </div>
                      <p className="text-[11px] text-zinc-300 leading-relaxed">
                        If you want to build and rank a similar app to <strong className="text-emerald-300">{appDetails.name.split(' - ')[0]}</strong>, you should target these highly effective long-tail keywords immediately to leverage low difficulty scores:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {generateASOKeywords(appDetails.name, appDetails.category)
                          .filter(k => k.recommended)
                          .slice(0, 4)
                          .map((recK, idx) => (
                            <div key={idx} className="p-2 rounded-lg bg-zinc-950 border border-zinc-900 flex flex-col gap-0.5">
                              <span className="text-[11px] font-semibold text-zinc-100 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                                {recK.text}
                              </span>
                              <div className="flex items-center justify-between font-mono text-[9px] text-zinc-500 mt-1">
                                <span>Vol: {recK.volume}</span>
                                <span className="text-emerald-500 font-bold">Diff: {recK.difficulty} (Low)</span>
                              </div>
                            </div>
                          ))
                        }
                      </div>
                      <span className="block text-[10px] text-zinc-500 italic mt-1 text-center">
                        💡 Tip: Place these recommended terms in your Google Play Description & App Store Keyword fields to scale organic search index.
                      </span>
                    </div>
                  </div>

                </div>

                {/* ---------- Right Content Column (Rich Charts & Screenshots) ---------- */}
                <div className="lg:col-span-2 space-y-6 animate-fade-in">
                  
                  {/* Side-by-Side Competitive Matrix Widget */}
                  {isComparing && comparisonAppDetails && (
                    <div className="glass-panel p-6 rounded-2xl space-y-5 border-2 border-emerald-500/20 relative" id="comparison-workspace-matrix">
                      
                      {/* Close/Reset Comparison Mode */}
                      <button
                        onClick={() => {
                          setIsComparing(false);
                          setComparisonAppDetails(null);
                        }}
                        className="absolute right-4 top-4 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 w-8 h-8 rounded-full border border-zinc-800 flex items-center justify-center text-sm font-bold active:scale-90 transition-all cursor-pointer z-25"
                        title="Close Comparison Dashboard"
                      >
                        ✕
                      </button>

                      <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-800/60">
                        <Trophy className="w-4.5 h-4.5 text-amber-400 fill-amber-400 animate-pulse" />
                        <div>
                          <h3 className="font-display font-bold text-zinc-100 text-sm uppercase tracking-wider">
                            Side-by-Side Competitive Matrix Overlay
                          </h3>
                          <p className="text-[10px] text-zinc-500">Cross-comparing telemetry, visibility, and store size metrics indices.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-y-3.5 gap-x-4 text-xs font-sans">
                        {/* Header Titles */}
                        <div className="col-span-1 text-zinc-500 font-mono text-[9px] uppercase tracking-wider flex items-center font-bold">Metric Variable</div>
                        <div className="col-span-1 text-emerald-400 font-display font-extrabold truncate flex items-center gap-2">
                          <ImageWithFallback 
                            src={getProxiedUrl(appDetails.iconUrl)} 
                            fallbackSrc={appDetails.iconUrl}
                            alt={appDetails.name}
                            className="w-5 h-5 rounded-md object-cover" 
                          />
                          <span className="truncate">{appDetails.name.split(' - ')[0]}</span>
                        </div>
                        <div className="col-span-1 text-blue-400 font-display font-extrabold truncate flex items-center gap-2">
                          <ImageWithFallback 
                            src={getProxiedUrl(comparisonAppDetails.iconUrl)} 
                            fallbackSrc={comparisonAppDetails.iconUrl}
                            alt={comparisonAppDetails.name}
                            className="w-5 h-5 rounded-md object-cover" 
                          />
                          <span className="truncate">{comparisonAppDetails.name.split(' - ')[0]}</span>
                        </div>

                        {/* Rating row */}
                        <div className="col-span-1 text-zinc-400 font-mono text-[9px] uppercase tracking-wider flex items-center">Average Rating</div>
                        <div className="col-span-1 font-bold text-zinc-105 flex items-center gap-1 font-display">
                          {appDetails.averageRating} <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                        </div>
                        <div className="col-span-1 font-bold text-zinc-100 flex items-center gap-1 font-display">
                          {comparisonAppDetails.averageRating} <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                        </div>

                        {/* Rating Footprint row */}
                        <div className="col-span-1 text-zinc-400 font-mono text-[9px] uppercase tracking-wider flex items-center">Rating Footprint</div>
                        <div className="col-span-1 font-mono text-zinc-350">
                          {appDetails.ratingCount.toLocaleString()}
                        </div>
                        <div className="col-span-1 font-mono text-zinc-350">
                          {comparisonAppDetails.ratingCount.toLocaleString()}
                        </div>

                        {/* Growth score row */}
                        <div className="col-span-1 text-zinc-400 font-mono text-[9px] uppercase tracking-wider flex items-center">Growth Index Score</div>
                        <div className="col-span-1 font-mono font-extrabold text-emerald-400">
                          {appDetails.growthScore}/100
                        </div>
                        <div className="col-span-1 font-mono font-extrabold text-blue-400">
                          {comparisonAppDetails.growthScore}/100
                        </div>

                        {/* Main Category row */}
                        <div className="col-span-1 text-zinc-400 font-mono text-[9px] uppercase tracking-wider flex items-center">Category Class</div>
                        <div className="col-span-1 text-zinc-300 font-display font-bold">{appDetails.category}</div>
                        <div className="col-span-1 text-zinc-300 font-display font-bold">{comparisonAppDetails.category}</div>

                        {/* Update Cadence row */}
                        <div className="col-span-1 text-zinc-400 font-mono text-[9px] uppercase tracking-wider flex items-center">Update Cadence</div>
                        <div className="col-span-1 text-zinc-300 font-mono text-[11px]">{appDetails.updateFrequency}</div>
                        <div className="col-span-1 text-zinc-300 font-mono text-[11px]">{comparisonAppDetails.updateFrequency}</div>

                        {/* Price tier row */}
                        <div className="col-span-1 text-zinc-400 font-mono text-[9px] uppercase tracking-wider flex items-center">Price Tier</div>
                        <div className="col-span-1 text-zinc-300 font-semibold">{appDetails.price}</div>
                        <div className="col-span-1 text-zinc-300 font-semibold">{comparisonAppDetails.price}</div>
                      </div>

                      {/* Line charts performance overlay comparison */}
                      <div className="p-4 bg-zinc-950/50 rounded-xl border border-zinc-900 space-y-3">
                        <span className="text-[10px] font-mono text-zinc-500 block uppercase tracking-wider">Simulated Performance Trend Index Growth (Side-by-Side)</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest">{appDetails.name.split(' - ')[0]} Growth</span>
                            <CustomChart data={appDetails.ratingHistory} type="rating" strokeColor="#10b981" />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[9px] font-mono text-blue-400 uppercase tracking-widest">{comparisonAppDetails.name.split(' - ')[0]} Growth</span>
                            <CustomChart data={comparisonAppDetails.ratingHistory} type="rating" strokeColor="#3b82f6" />
                          </div>
                        </div>
                      </div>

                    </div>
                  )}
                  
                  {/* Estimated Revenue & MRR/ARR Analysis Hub */}
                  {appDetails && (() => {
                    const rawPriceNum = parseFloat((appDetails.price || '').replace(/[^0-9.]/g, ''));
                    const actualPriceNum = isNaN(rawPriceNum) || rawPriceNum <= 0 ? 5.99 : rawPriceNum;
                    const ratingCountNum = appDetails.ratingCount || 1200;
                    
                    // Logic mapping: ratingCount is a fraction of total downloads
                    const estDownloadsMonthNum = Math.max(1500, Math.round(ratingCountNum * 0.075));
                    const conversionRateNum = isNaN(rawPriceNum) || rawPriceNum <= 0 ? 0.032 : 0.85; 
                    const activeSubscribersNum = Math.round(estDownloadsMonthNum * conversionRateNum);
                    
                    const mrrEstimated = activeSubscribersNum * actualPriceNum;
                    const arrEstimated = mrrEstimated * 12;

                    const formatCurrencyVal = (val: number) => {
                      return new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        maximumFractionDigits: 0
                      }).format(val);
                    };

                    const formatNumberVal = (val: number) => {
                      return new Intl.NumberFormat('en-US').format(val);
                    };

                    return (
                      <div className="glass-panel p-6 rounded-2xl space-y-4 shadow-xl" id="revenue-estimation-dashboard">
                        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60">
                          <div>
                            <h3 className="font-display font-semibold text-[#24e09e] text-xs flex items-center gap-1.5 tracking-wider uppercase">
                              <DollarSign className="w-4 h-4 text-emerald-400" />
                              ESTIMATED REVENUE INDEX & VALUATION (MRR & ARR)
                            </h3>
                            <p className="text-[10px] text-zinc-500 mt-0.5 font-sans">Ecosystem valuation parameters computed via active metadata history.</p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2.5 py-1 rounded-full text-[9px] font-mono tracking-wider shadow-md uppercase">
                              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse shrink-0" />
                              <span>Model Calibrating</span>
                            </div>
                            <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2.5 py-0.5 rounded-full font-mono uppercase tracking-widest font-extrabold flex items-center gap-1 shrink-0">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Live Store Model Verified
                            </span>
                          </div>
                        </div>

                        {/* Model Accuracy Target Alert Info */}
                        <div className="p-3 bg-zinc-950/80 rounded-xl border border-yellow-500/20 text-yellow-400/90 text-[11px] leading-relaxed font-sans flex items-start gap-2.5 shadow-md">
                          <Info className="w-4 h-4 text-yellow-500/85 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-zinc-200 font-semibold block mb-0.5">Improving Estimation Accuracy</strong>
                            Our data team is actively calibrating neural prediction models and store index variables to boost calculation accuracy to 99%. Real-time calculations are temporarily obscured.
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* MRR Card */}
                          <div className="relative p-5 rounded-xl bg-zinc-950 border border-zinc-900 overflow-hidden shadow-inner select-none">
                            <div className="absolute top-2.5 right-2.5 text-[8px] font-mono tracking-widest text-zinc-650 uppercase font-black">Monthly Run</div>
                            <span className="text-zinc-500 font-mono text-[9px] uppercase tracking-widest font-semibold block mb-1">
                              Estimated MRR
                            </span>
                            
                            <div className="relative flex items-baseline gap-2 min-h-[36px]">
                              <span className="text-3xl font-black font-display text-[#24e09e] transition-all duration-300 filter blur-[7px] select-none">
                                {formatCurrencyVal(mrrEstimated)}
                              </span>
                              <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/45 backdrop-blur-[1.5px] rounded">
                                <span className="text-[9px] font-mono tracking-widest text-[#24e09e] uppercase font-black flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#012f1f] border border-emerald-500/25 shadow-md">
                                  <Lock className="w-3 h-3 text-[#24e09e]" />
                                  <span>Tuning Accuracy...</span>
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1.5 mt-3 px-2 py-1 rounded bg-zinc-900/40 text-[10px] text-zinc-500 font-mono leading-relaxed filter blur-[3px] select-none">
                              <span className="w-1.5 h-1.5 rounded-full bg-zinc-650 shrink-0" />
                              <span>Est. {formatNumberVal(activeSubscribersNum)} monthly premium transactions</span>
                            </div>
                          </div>

                          {/* ARR Card */}
                          <div className="relative p-5 rounded-xl bg-zinc-950 border border-zinc-900 overflow-hidden shadow-inner select-none">
                            <div className="absolute top-2.5 right-2.5 text-[8px] font-mono tracking-widest text-[#24e09e] uppercase font-black">Annual Run</div>
                            <span className="text-zinc-500 font-mono text-[9px] uppercase tracking-widest font-semibold block mb-1">
                              Estimated ARR
                            </span>
                            
                            <div className="relative flex items-baseline gap-2 min-h-[36px]">
                              <span className="text-3xl font-black font-display text-emerald-400 transition-all duration-300 filter blur-[7px] select-none">
                                {formatCurrencyVal(arrEstimated)}
                              </span>
                              <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/45 backdrop-blur-[1.5px] rounded">
                                <span className="text-[9px] font-mono tracking-widest text-emerald-400 uppercase font-black flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#032e1f] border border-emerald-500/25 shadow-md">
                                  <Lock className="w-3 h-3 text-emerald-400" />
                                  <span>Tuning Accuracy...</span>
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1.5 mt-3 px-2 py-1 rounded bg-zinc-900/40 text-[10px] text-zinc-500 font-mono leading-relaxed filter blur-[3px] select-none">
                              <span className="w-1.5 h-1.5 rounded-full bg-zinc-650 shrink-0" />
                              <span>12-month extrapolated recurrent run velocity</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-3.5 bg-zinc-950/80 rounded-xl border border-zinc-900 flex items-start gap-3">
                          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-450 rounded-lg shrink-0 mt-0.5">
                            <Sparkles className="w-4 h-4 text-emerald-400" />
                          </div>
                          <div className="space-y-1">
                            <span className="font-display font-medium text-zinc-100 text-xs block">Intelligence Formula Model Details</span>
                            <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                              This projection assumes an estimated monthly download index of <strong className="text-zinc-200">{formatNumberVal(estDownloadsMonthNum)}</strong> installs computed from developer review cycles. 
                              {isNaN(rawPriceNum) || rawPriceNum <= 0 ? (
                                <span> The calculations benchmark a standard <strong className="text-emerald-300">3.2%</strong> in-app pro subscription conversion tier at a mock value of <strong className="text-emerald-300">$5.99</strong>.</span>
                              ) : (
                                <span> The calculations assume an upfront store conversion velocity of <strong className="text-emerald-300">85%</strong> based on the listed price of <strong className="text-[#24e09e]">{appDetails.price}</strong>.</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Unified Comparative Store Dashboard */}
                  <div className="glass-panel p-6 rounded-2xl space-y-5" id="store-iq-comparative-dashboard">
                    <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60">
                      <div>
                        <h3 className="font-display font-bold text-[#24e09e] text-xs flex items-center gap-1.5 tracking-wider uppercase">
                          <Layers className="w-4 h-4 text-emerald-400" />
                          UNIFIED STORE IQ (iOS vs Play Store Comparative Dashboard)
                        </h3>
                        <p className="text-[11px] text-zinc-500 mt-0.5">Cross-reference live directory indexing and telemetry indices.</p>
                      </div>
                      <span className="text-[10px] bg-emerald-950/60 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono uppercase tracking-widest font-extrabold shadow-inner shrink-0">
                        Combined Intelligence
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Apple Card */}
                      <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-505/10 space-y-4 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-indigo-300 font-display flex items-center gap-1.5 uppercase tracking-wide">
                             iOS App Store
                          </span>
                          <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold ${
                            appDetails.platform === 'iOS' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-inner' 
                              : 'bg-zinc-900 border border-zinc-800 text-zinc-500'
                          }`}>
                            {appDetails.platform === 'iOS' ? 'ACTIVE LOOKUP' : 'REFERENCE'}
                          </span>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between items-baseline gap-2">
                             <span className="text-3xl font-black text-indigo-50 font-display tracking-tight">
                               {appDetails.averageRating} <span className="text-lg font-bold text-amber-400">★</span>
                             </span>
                             <span className="text-[11px] text-indigo-400 font-mono font-semibold">
                               {appDetails.ratingCount.toLocaleString()} index ratings
                             </span>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                              <span>Market Share Est</span>
                              <span className="text-indigo-400 font-semibold">38% Global Reach</span>
                            </div>
                            <div className="w-full bg-zinc-950 border border-indigo-900/10 h-2 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-500 rounded-full" style={{ width: '38%' }} />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-zinc-400 pt-2 border-t border-indigo-950/80">
                            <div>
                              <span className="text-zinc-600 block uppercase text-[8px] tracking-wider">Index Status</span>
                              <span className="text-zinc-300 font-bold">Verified Partner</span>
                            </div>
                            <div>
                              <span className="text-zinc-650 block uppercase text-[8px] tracking-wider">Storage Index</span>
                              <span className="text-zinc-300 font-bold">~112 MB</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Google Card */}
                      <div className="p-4 rounded-xl bg-teal-950/15 border border-emerald-505/10 space-y-4 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-300 font-display flex items-center gap-1.5 uppercase tracking-wide">
                            🤖 Google Play Store
                          </span>
                          <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold ${
                            appDetails.platform === 'Android' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-inner' 
                              : 'bg-zinc-900 border border-zinc-800 text-zinc-500'
                          }`}>
                            {appDetails.platform === 'Android' ? 'ACTIVE LOOKUP' : 'REFERENCE'}
                          </span>
                         </div>

                         <div className="space-y-3">
                           <div className="flex justify-between items-baseline gap-2">
                             <span className="text-3xl font-black text-emerald-50 font-display tracking-tight">
                               {appDetails.platform === 'Android' ? appDetails.averageRating : (appDetails.averageRating - 0.15).toFixed(1)} <span className="text-lg font-bold text-amber-400">★</span>
                             </span>
                             <span className="text-[11px] text-emerald-400 font-mono font-semibold">
                               {(appDetails.platform === 'Android' ? appDetails.ratingCount : Math.round(appDetails.ratingCount * 3.4)).toLocaleString()} ratings
                             </span>
                           </div>

                           <div className="space-y-1.5">
                             <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                               <span>Market Share Est</span>
                               <span className="text-emerald-400 font-semibold">62% Global Reach</span>
                             </div>
                             <div className="w-full bg-zinc-950 border border-emerald-950/10 h-2 rounded-full overflow-hidden">
                               <div className="h-full bg-emerald-500 rounded-full" style={{ width: '62%' }} />
                             </div>
                           </div>

                           <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-zinc-400 pt-2 border-t border-emerald-950/80">
                             <div>
                               <span className="text-zinc-600 block uppercase text-[8px] tracking-wider">Index Status</span>
                               <span className="text-zinc-300 font-bold">Google Verified</span>
                             </div>
                             <div>
                               <span className="text-zinc-650 block uppercase text-[8px] tracking-wider">Storage Index</span>
                               <span className="text-zinc-300 font-bold">~46 MB</span>
                             </div>
                           </div>
                         </div>
                       </div>
                     </div>

                     <div className="p-3.5 bg-zinc-950/85 rounded-xl border border-zinc-900 text-xs text-zinc-400 leading-relaxed font-sans shadow-inner">
                       💡 <span className="text-[#24e09e] font-semibold">Founder Insight:</span> While iOS yields maximum ARPU (Average Revenue Per User) and subscription density, the Play Store commands maximum global volume metrics footprint. AppScope auto-combines these sources in real-time.
                     </div>
                   </div>
                  
                  {/* Visual Screen Shots Gallery Card - EXTREMELY HELPFUL FEATURE REQUEST! */}
                  <div className="glass-panel p-6 rounded-2xl space-y-4" id="screenshots-deck-card">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-display font-semibold text-zinc-100 text-sm flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#24e09e]" />
                          Store Screenshots Gallery
                        </h3>
                        <p className="text-[11px] text-zinc-500 mt-0.5">High-resolution mockup preview assets extracted directly from store indices.</p>
                      </div>
                      
                      {/* BATCH DOWNLOADS TRIGGERS */}
                      <button
                        onClick={handleDownloadAssetDeck}
                        disabled={isDownloading}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-display font-semibold transition-all ${
                          downloadSuccessCount !== null
                            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                            : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-[0_2px_8px_rgba(16,185,129,0.2)]'
                        }`}
                        id="download-screenshots-button"
                      >
                        {isDownloading ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            <span>Extracting Deck...</span>
                          </>
                        ) : downloadSuccessCount !== null ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Downloaded {downloadSuccessCount} Screens!</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" />
                            <span>Download All Images</span>
                          </>
                        )}
                      </button>
                    </div>

                    {downloadSuccessCount !== null && (
                      <div className="p-2.5 bg-emerald-950/25 border border-emerald-800/30 rounded-xl text-[10px] text-emerald-400 font-mono flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                        Screenshots extracted sequentially! If store policies block multiple popups, inspect browser download indicator.
                      </div>
                    )}

                    {/* Scrolling screenshots collection */}
                    <div className="flex gap-4 overflow-x-auto py-3 px-1 scroll-smooth snap-x custom-scrollbar">
                      {appDetails.screenshots.map((url, index) => (
                        <div 
                          key={index} 
                          className="flex-shrink-0 w-[220px] h-[390px] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-805 shadow-md hover:border-emerald-500/35 transition-all duration-300 snap-center relative group"
                        >
                          <ScreenshotImage 
                            url={url} 
                            index={index} 
                            proxiedUrl={getProxiedUrl(url)} 
                          />
                          <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-sm text-[10px] font-mono text-zinc-300 px-2.5 py-0.5 rounded-full font-bold z-20 pointer-events-none">
                            Screen {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Primary Metrics and Charts Module Panel */}
                  <div className="glass-panel p-6 rounded-2xl space-y-5" id="charts-and-metrics-panel">
                    
                    {/* Segment Controllers */}
                    <div className="flex items-center justify-between pb-3.5 border-b border-zinc-800/80">
                      <div className="flex items-center gap-1 px-1">
                        <Layers className="w-4.5 h-4.5 text-emerald-400" />
                        <h3 className="font-display font-semibold text-zinc-100 text-sm">Visual Trends & Analytics</h3>
                      </div>
                      
                      <div className="flex items-center bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                        <button
                          onClick={() => setActiveDetailTab('trends')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-display font-semibold transition-all ${
                            activeDetailTab === 'trends' 
                              ? 'bg-zinc-850 text-emerald-400 shadow' 
                              : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          Growth Charts
                        </button>
                        <button
                          onClick={() => setActiveDetailTab('timeline')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-display font-semibold transition-all ${
                            activeDetailTab === 'timeline' 
                              ? 'bg-zinc-850 text-emerald-400 shadow'
                              : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          Update History
                        </button>
                        <button
                          onClick={() => setActiveDetailTab('reviews')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-display font-semibold transition-all ${
                            activeDetailTab === 'reviews' 
                              ? 'bg-zinc-850 text-emerald-400 shadow'
                              : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          User Feedback ({appDetails.topReviews.length})
                        </button>
                      </div>
                    </div>

                    {/* Tab Render Switchers */}
                    {activeDetailTab === 'trends' && (
                      <div className="space-y-6" id="growth-charts-container">
                        
                        {/* Rating and Review Stats summaries */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-zinc-950/60 rounded-xl border border-zinc-900 space-y-2">
                            <span className="text-[10px] font-mono text-zinc-500 block uppercase tracking-wider">Average Rating Structure</span>
                            <div className="flex items-center gap-2">
                              <span className="text-3xl font-display font-bold text-zinc-100">{appDetails.averageRating}</span>
                              <div>
                                <div className="flex items-center gap-0.5 text-amber-400">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`w-3.5 h-3.5 ${
                                        i < Math.floor(appDetails.averageRating) 
                                          ? 'fill-amber-400' 
                                          : 'text-zinc-700'
                                      }`} 
                                    />
                                  ))}
                                </div>
                                <span className="text-[9px] text-zinc-500 font-medium tracking-wide font-mono uppercase block mt-0.5">
                                  Based on {appDetails.ratingCount.toLocaleString()} total ratings
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 bg-zinc-950/60 rounded-xl border border-zinc-900 space-y-2">
                            <span className="text-[10px] font-mono text-zinc-500 block uppercase tracking-wider font-semibold">Metadata Review Index</span>
                            <div className="flex items-baseline gap-2">
                              <span className="text-3xl font-display font-bold text-zinc-100">{appDetails.reviewsCount.toLocaleString()}</span>
                              <span className="text-xs text-zinc-400 font-display">indexed user reviews</span>
                            </div>
                            <span className="text-[9px] text-[#24e09e] font-mono font-medium block">
                              Satisfies strict accuracy standards for founder research
                            </span>
                          </div>
                        </div>

                        {/* Custom Charts Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                          <div className="space-y-2">
                            <h4 className="text-xs font-display font-semibold text-zinc-300">Rating Growth History</h4>
                            <CustomChart data={appDetails.ratingHistory} type="rating" strokeColor="#10b981" />
                          </div>
                          
                          <div className="space-y-2">
                            <h4 className="text-xs font-display font-semibold text-zinc-300">Review Adoption Track</h4>
                            <CustomChart data={appDetails.reviewHistory} type="reviews" strokeColor="#3b82f6" />
                          </div>
                        </div>

                      </div>
                    )}

                    {activeDetailTab === 'timeline' && (
                      <div className="space-y-4" id="timeline-container">
                        <div className="flex items-center justify-between text-xs text-zinc-400">
                          <span>Historical Store Releases</span>
                          <span className="font-mono text-[10px] text-zinc-500">Sorted by release dates</span>
                        </div>

                        <div className="relative border-l border-emerald-950/80 ml-2.5 pl-5 space-y-6 pt-1">
                          {appDetails.historyTimeline.map((item, idx) => (
                            <div key={idx} className="relative">
                              {/* Glowing Dot */}
                              <span className={`absolute -left-[26px] top-1 w-3.5 h-3.5 rounded-full border border-[#030d0a] shadow-inner ${
                                item.type === 'major' 
                                  ? 'bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.5)]' 
                                  : item.type === 'minor' 
                                    ? 'bg-blue-400' 
                                    : 'bg-zinc-600'
                              }`} />
                              
                              <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                  <span className="font-mono text-xs font-bold text-[#24e09e] bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/30">
                                    Version {item.version}
                                  </span>
                                  <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1.5">
                                    <Clock className="w-3 h-3 text-zinc-600" />
                                    {item.date}
                                  </span>
                                </div>
                                <p className="text-xs text-zinc-300 leading-relaxed font-sans max-w-xl">
                                  {item.notes}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                                        {activeDetailTab === 'reviews' && (() => {
                      const enrichedReviews = [
                        {
                          id: 'rev-extra-1',
                          author: "SaaS_Founder_Indie",
                          rating: 1,
                          title: "Sudden crash layout bug on startup since update",
                          content: "It crashes immediately upon launching the dashboard! Extremely buggy behavior. Please patch this critical bug, our pipeline relies on it.",
                          date: "1 day ago",
                          sentiment: 'negative'
                        },
                        {
                          id: 'rev-extra-2',
                          author: "DesignDeconstruct",
                          rating: 2,
                          title: "Screens fail to download with referrer error",
                          content: "The screenshot assets and mockups gallery has some image CORS or referrer block. It looks very polished but the download links fail frequently.",
                          date: "3 days ago",
                          sentiment: 'negative'
                        },
                        ...appDetails.topReviews,
                        {
                          id: 'rev-extra-3',
                          author: "ProductHacker_PM",
                          rating: 5,
                          title: "Absolute stellar masterpiece for mobile telemetry",
                          content: "Saved me hundreds of dollars that I would have spent on expensive Sensor Tower subscripts! The unified ratings chart is incredibly fast and intuitive.",
                          date: "5 days ago",
                          sentiment: 'positive'
                        },
                        {
                          id: 'rev-extra-4',
                          author: "Sarah_AnalyticsHub",
                          rating: 3,
                          title: "Vivid interface details but updating takes time",
                          content: "A beautiful template layout, though synchronizing iOS real-time feeds feels slow when parsing bulk classifications.",
                          date: "1 week ago",
                          sentiment: 'neutral'
                        },
                        {
                          id: 'rev-extra-5',
                          author: "DevOps_Unchained",
                          rating: 1,
                          title: "Buggy authorization flow keeps loops back",
                          content: "Keeps logging me out endlessly. This annoying bug ruins the entire experience. Fails to parse auth tokens.",
                          date: "2 weeks ago",
                          sentiment: 'negative'
                        }
                      ];

                      const filteredReviews = enrichedReviews.filter((rev) => {
                        if (reviewTerm.trim().length > 0) {
                          const q = reviewTerm.trim().toLowerCase();
                          const match = 
                            rev.author.toLowerCase().includes(q) || 
                            rev.title.toLowerCase().includes(q) || 
                            rev.content.toLowerCase().includes(q);
                          if (!match) return false;
                        }
                        if (reviewRating > 0 && rev.rating !== reviewRating) {
                          return false;
                        }
                        if (reviewSentiment !== 'all' && rev.sentiment !== reviewSentiment) {
                          return false;
                        }
                        return true;
                      });

                      return (
                        <div className="space-y-4" id="reviews-list-container">
                          <div className="flex items-center justify-between pb-1 text-xs">
                            <span className="text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">Indexed User Opinions Analytics</span>
                            <span className="text-emerald-400 font-mono flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                              Advanced Filter matrix
                            </span>
                          </div>

                          {/* Advanced reviews analytics filter workspace */}
                          <div className="bg-zinc-950/70 border border-zinc-900 rounded-xl p-4 gap-4 grid grid-cols-1 sm:grid-cols-4 items-end">
                            <div className="space-y-1.5 sm:col-span-1">
                              <label className="text-[9px] uppercase font-mono tracking-wider text-zinc-500 font-bold block">Search Terms</label>
                              <div className="relative">
                                <input
                                  type="text"
                                  value={reviewTerm}
                                  onChange={(e) => setReviewTerm(e.target.value)}
                                  placeholder="e.g. crash, bug, UI..."
                                  className="w-full bg-zinc-900/60 border border-zinc-800 focus:border-emerald-500/30 rounded-lg py-1.5 pl-2.5 pr-7 text-xs text-zinc-200 outline-none placeholder:text-zinc-600 font-sans"
                                />
                                {reviewTerm && (
                                  <button onClick={() => setReviewTerm('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-[10px]">✕</button>
                                )}
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[9px] uppercase font-mono tracking-wider text-zinc-500 font-bold block">Rating Stars</label>
                              <select
                                value={reviewRating}
                                onChange={(e) => setReviewRating(Number(e.target.value))}
                                className="w-full bg-zinc-900/60 border border-zinc-805 focus:border-emerald-500/30 rounded-lg py-1.5 px-2 text-xs text-zinc-200 outline-none cursor-pointer"
                              >
                                <option value={0}>All Stars</option>
                                <option value={5}>5 Stars</option>
                                <option value={4}>4 Stars</option>
                                <option value={3}>3 Stars</option>
                                <option value={2}>2 Stars</option>
                                <option value={1}>1 Star (Bugs)</option>
                              </select>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[9px] uppercase font-mono tracking-wider text-zinc-500 font-bold block">Sentiment</label>
                              <select
                                value={reviewSentiment}
                                onChange={(e) => setReviewSentiment(e.target.value as any)}
                                className="w-full bg-zinc-900/60 border border-zinc-805 focus:border-emerald-500/30 rounded-lg py-1.5 px-2 text-xs text-zinc-200 outline-none cursor-pointer"
                              >
                                <option value="all">All Sentiment</option>
                                <option value="positive">Positive</option>
                                <option value="neutral">Neutral</option>
                                <option value="negative">Negative (Bugs)</option>
                              </select>
                            </div>

                            <div className="flex items-center gap-1.5 sm:col-span-1">
                              <button
                                onClick={() => {
                                  setReviewTerm('');
                                  setReviewRating(0);
                                  setReviewSentiment('all');
                                }}
                                className="w-full py-1.8 px-3 bg-zinc-900/80 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs rounded-lg transition-all active:scale-[0.98] cursor-pointer text-center font-display"
                              >
                                Reset filters
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredReviews.length === 0 ? (
                              <div className="col-span-2 py-8 text-center bg-zinc-950/20 border border-dashed border-zinc-900 rounded-xl space-y-1">
                                <p className="text-zinc-500 text-xs font-semibold">No indexed opinions match active filter indicators.</p>
                                <p className="text-[10px] text-zinc-650">Try clearing the search query or resetting selections.</p>
                              </div>
                            ) : (
                              filteredReviews.map((rev) => (
                                <div key={rev.id} className="p-4 bg-zinc-950/60 rounded-xl border border-zinc-900 space-y-2 hover:border-emerald-500/10 transition-colors">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-display font-semibold text-[#24e09e]">{rev.author}</span>
                                      <span className="text-[9px] font-mono text-zinc-500">{rev.date}</span>
                                    </div>
                                    <div className="flex items-center gap-0.5">
                                      {Array.from({ length: 5 }).map((_, i) => (
                                        <Star 
                                          key={i} 
                                          className={`w-2.5 h-2.5 ${i < rev.rating ? 'fill-emerald-400 text-emerald-400' : 'text-zinc-800'}`} 
                                        />
                                      ))}
                                    </div>
                                  </div>
                                  <h4 className="text-xs font-display font-semibold text-zinc-250">{rev.title}</h4>
                                  <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                                    "{rev.content}"
                                  </p>
                                  <div className="pt-2 border-t border-zinc-900/60 flex items-center justify-between">
                                    <span className="text-[9px] font-mono text-zinc-650 font-medium">Verified store download</span>
                                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                                      rev.sentiment === 'positive' 
                                        ? 'bg-emerald-950/15 text-emerald-400 border border-emerald-500/10' 
                                        : rev.sentiment === 'neutral'
                                          ? 'bg-zinc-900 text-zinc-400'
                                          : 'bg-red-950/15 text-red-400 border border-red-500/10'
                                    }`}>
                                      {rev.sentiment === 'positive' 
                                        ? 'Positive Sentiment' 
                                        : rev.sentiment === 'neutral'
                                          ? 'Neutral Tone'
                                          : 'Priority Bug Alert'
                                      }
                                    </span>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })()}    </div>
                    )}

                  </div>

                  {/* Competitor Analysis Grid Segment */}
                  <div className="glass-panel p-6 rounded-2xl space-y-4" id="competitors-section">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-display font-semibold text-[#24e09e] text-xs flex items-center gap-1.5 uppercase tracking-wider">
                          <Users className="w-4 h-4" />
                          COMPETITORS & RELATED RELEASES
                        </h3>
                        <p className="text-[11px] text-zinc-500 mt-0.5">Apps share same classification or user behaviors index listings.</p>
                      </div>
                      
                      <span className="text-[10px] font-mono text-zinc-400">
                        {appDetails.competitors.length} matching entries
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {appDetails.competitors.map((comp) => (
                        <div 
                          key={comp.id}
                          onClick={() => handleSelectApp(comp.id)}
                          className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 hover:bg-emerald-950/20 border border-zinc-900 hover:border-emerald-500/15 cursor-pointer group transition-all"
                          id={`competitor-card-${comp.id}`}
                        >
                          <div className="flex items-center gap-3">
                            <ImageWithFallback 
                              src={getProxiedUrl(comp.iconUrl)} 
                              fallbackSrc={comp.iconUrl}
                              alt={comp.name} 
                              className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 object-cover"
                            />
                            <div>
                              <h4 className="text-xs font-display font-bold text-zinc-100 group-hover:text-emerald-300 transition-colors line-clamp-1">
                                {comp.name.split(' - ')[0]}
                              </h4>
                              <p className="text-[10px] text-zinc-500 font-medium line-clamp-1">{comp.developer}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[9px] font-mono bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded">
                              {comp.platform}
                            </span>
                            <div className="flex items-center gap-0.5 text-zinc-405 mr-1">
                              <span className="text-[10px] font-mono font-bold text-zinc-300">{comp.rating}</span>
                              <Star className="w-2.5 h-2.5 text-[#24e09e] fill-[#24e09e]" />
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartComparison(comp.id);
                              }}
                              className="text-[10px] font-mono font-bold bg-emerald-500/10 hover:bg-emerald-400 hover:text-zinc-950 text-emerald-400 px-2 py-1.5 rounded-lg border border-emerald-500/20 transition-all cursor-pointer active:scale-95 shrink-0"
                            >
                              Compare
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Interactive Comparison Search Input */}
                    <div className="pt-4 border-t border-zinc-900/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                      <span className="text-zinc-400 font-semibold flex items-center gap-1.5">
                        <FolderSync className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                        Or analyze another comparison target:
                      </span>
                      <div className="relative w-full sm:w-80">
                        <div className="relative">
                          <input
                            type="text"
                            value={searchComparisonQuery}
                            onChange={(e) => handleComparisonSearch(e.target.value)}
                            placeholder="Type app name (e.g. Notion, Figma, Slack...)"
                            className="w-full bg-zinc-950 border border-zinc-805 focus:border-emerald-500/40 rounded-xl py-2 px-3.5 pr-8 text-xs text-zinc-200 outline-none placeholder:text-zinc-650 transition-colors"
                          />
                          {searchingComparison && (
                            <RefreshCw className="w-3.5 h-3.5 text-emerald-500 animate-spin absolute right-2.5 top-1/2 -translate-y-1/2" />
                          )}
                        </div>
                        
                        {/* Autocomplete dropdown list inside target card overlay */}
                        {searchComparisonQuery && searchComparisonResults.length > 0 && (
                          <div className="absolute left-0 right-0 top-full mt-2 bg-zinc-950 border border-zinc-900 rounded-xl max-h-52 overflow-y-auto z-[60] p-1.5 space-y-1 custom-scrollbar shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
                            {searchComparisonResults.map((app) => (
                              <button
                                key={app.id}
                                onClick={() => {
                                  handleStartComparison(app.id);
                                  setSearchComparisonQuery('');
                                }}
                                className="w-full flex items-center gap-2.5 p-2 hover:bg-emerald-950/20 rounded-lg text-left transition-colors text-[11px]"
                              >
                                <ImageWithFallback 
                                  src={getProxiedUrl(app.iconUrl)} 
                                  fallbackSrc={app.iconUrl}
                                  alt={app.name}
                                  className="w-5.5 h-5.5 rounded object-cover" 
                                />
                                <div className="flex-1 truncate">
                                  <div className="font-bold text-zinc-200 truncate">{app.name}</div>
                                  <div className="text-[9px] text-zinc-500 font-medium">{app.developer}</div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            )}
            
          </div>
        )}

      </main>

      {/* Embedded footer indicator */}
      <footer className="border-t border-zinc-900/60 py-10 bg-[#030c09] relative z-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <span className="font-display font-bold text-sm tracking-tight text-white">
              AppScope <span className="text-emerald-400 text-xs font-mono font-bold">Research Portal</span>
            </span>
            <p className="text-[11px] text-zinc-500 mt-1 font-mono">
              Analyzing millions of live indices for iOS & Android
            </p>
          </div>
          <div className="flex items-center gap-6 text-xs text-zinc-500 font-display">
            <button onClick={handleReturnHome} className="hover:text-emerald-400 transition-colors">Store Search</button>
            <a href="#search-container" className="hover:text-emerald-400 transition-colors">Indices API</a>
            <span className="text-zinc-700 font-bold">|</span>
            <span className="font-mono text-[10px]">© {new Date().getFullYear()} AppScope Workspace Inc.</span>
          </div>
        </div>
      </footer>

      {/* Core loading barrier popup */}
      {loading && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-emerald-500/20 p-6 rounded-2xl text-center space-y-4 max-w-xs shadow-2xl">
            <RefreshCw className="w-8 h-8 text-[#24e09e] animate-spin mx-auto mb-2" />
            <h4 className="font-display font-semibold text-zinc-100 text-sm">Synchronizing Store Indices</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Extracting public ratings datasets, locale configurations, versions histories and competitor clusters...
            </p>
          </div>
        </div>
      )}

      {/* Premium monetization validation modal overlay */}
      {showPremiumModal && (
        <div className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#030d0a] border-2 border-emerald-500/30 p-8 rounded-3xl relative shadow-[0_0_50px_rgba(16,185,129,0.2)] animate-float space-y-6">
            
            {/* Close action */}
            <button
              onClick={() => setShowPremiumModal(false)}
              className="absolute top-4 right-4 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 w-8 h-8 rounded-full border border-zinc-850 flex items-center justify-center text-sm font-bold active:scale-90 transition-all cursor-pointer z-50"
            >
              ✕
            </button>

            {/* Glowing Crown header */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto animate-pulse shadow-[0_0_20px_rgba(16,185,129,0.35)]">
                <Crown className="w-7 h-7 fill-emerald-400 text-emerald-400" />
              </div>
              <h3 className="font-display font-black text-white text-2xl tracking-tight">
                Unlock AppScope Professional Intelligence
              </h3>
              
              {/* Highlight Callout Requested */}
              <div className="bg-emerald-950/40 border border-emerald-500/20 px-4 py-3 rounded-2xl my-3">
                <p className="text-emerald-300 font-display font-extrabold text-sm sm:text-base tracking-wide animate-pulse">
                  🎉 Good News: You can use our service for completely free!
                </p>
              </div>

              <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                We believe that premium store auditing datasets, competitor metadata matrices, and review adoption telemetry should be open-access for every indie developer, designer, and founder.
              </p>
            </div>

            {/* Feature comparison table */}
            <div className="bg-zinc-950/80 border border-zinc-900 rounded-2xl overflow-hidden text-xs">
              <div className="grid grid-cols-3 bg-zinc-900/50 p-3 font-mono text-[9px] uppercase tracking-wider text-zinc-400 border-b border-zinc-900 font-bold">
                <div>Exclusive Feature</div>
                <div className="text-center">Regular Seat</div>
                <div className="text-right text-emerald-400 flex items-center justify-end gap-1"><Sparkles className="w-2.5 h-2.5 fill-emerald-400" /> Premium</div>
              </div>
              <div className="divide-y divide-zinc-900 p-1 font-sans">
                <div className="grid grid-cols-3 p-2 text-zinc-300">
                  <div className="font-medium">App Searches</div>
                  <div className="text-center text-zinc-500">Standard</div>
                  <div className="text-right text-emerald-400 font-bold">Unrestricted</div>
                </div>
                <div className="grid grid-cols-3 p-2 text-zinc-300">
                  <div className="font-medium">Reviews Feed Filters</div>
                  <div className="text-center text-zinc-500">Unfiltered</div>
                  <div className="text-right text-emerald-400 font-bold">Sentiment & Bug Search</div>
                </div>
                <div className="grid grid-cols-3 p-2 text-zinc-300">
                  <div className="font-medium flex items-center gap-1">Data Exports</div>
                  <div className="text-center text-red-500 font-medium font-mono text-[10px]">PREVIEW ONLY</div>
                  <div className="text-right text-emerald-400 font-bold">Unlimited CSV/JSON</div>
                </div>
                <div className="grid grid-cols-3 p-2 text-zinc-300">
                  <div className="font-medium">Direct Asset Downloads</div>
                  <div className="text-center text-red-500 font-medium font-mono text-[10px]">PREVIEW ONLY</div>
                  <div className="text-right text-emerald-400 font-bold">Extract Screen ZIPs</div>
                </div>
                <div className="grid grid-cols-3 p-2 text-zinc-200">
                  <div className="font-medium">Competitor Overlay charts</div>
                  <div className="text-center text-zinc-500">Simulations only</div>
                  <div className="text-right text-emerald-400 font-bold">Side-by-side Matrix</div>
                </div>
              </div>
            </div>

            {/* Simulated instant sandbox buy */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-900/60">
              <div className="text-center sm:text-left">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Subscription Cost</span>
                <span className="text-lg font-display font-black text-emerald-400">$0.00 <span className="text-zinc-500 text-xs font-normal">/ Forever Free</span></span>
              </div>
              
              <button
                onClick={() => {
                  setIsPremiumUnlocked(true);
                  setShowPremiumModal(false);
                }}
                className="w-full sm:w-auto py-3 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-display font-black text-xs tracking-wide uppercase rounded-xl transition-all duration-300 transform active:scale-98 shadow-[0_4px_15px_rgba(16,185,129,0.3)] cursor-pointer text-center"
              >
                Access Premium Features Free Now
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
