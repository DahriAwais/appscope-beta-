/**
 * AppScope Core TypeScript Types
 */

export interface AppSearchResult {
  id: string; // unique ID across AppScope
  trackId: number; // original store ID (if iOS or synced)
  name: string;
  developer: string;
  iconUrl: string;
  platform: 'iOS' | 'Android';
  category: string;
  rating: number;
  ratingCount: number;
  price: string; // "Free" or e.g. "$4.99"
  storeUrl: string;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface ReviewItem {
  id: string;
  author: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface TimelineEvent {
  version: string;
  date: string;
  notes: string;
  type: 'major' | 'minor' | 'patch';
}

export interface AppDetails {
  id: string;
  trackId: number;
  name: string;
  developer: string;
  iconUrl: string;
  platform: 'iOS' | 'Android';
  category: string;
  version: string;
  lastUpdated: string;
  contentRating: string; // Age rating (e.g., "4+", "Teen")
  price: string; // Free/Paid
  priceValue: number;
  averageRating: number;
  ratingCount: number;
  reviewsCount: number;
  languages: string[];
  countries: string[];
  storeUrl: string;
  description: string;
  screenshots: string[];
  
  // Growth indicators & Metrics
  updateFrequency: string; // e.g. "Every 12 days on average"
  growthScore: number; // 0-100 analytics score
  
  // Historical data for Custom Line & Trend Charts
  ratingHistory: ChartDataPoint[];
  reviewHistory: ChartDataPoint[];
  downloadEstimateHistory?: ChartDataPoint[];
  
  // Update timeline
  historyTimeline: TimelineEvent[];
  
  // Reviews List
  topReviews: ReviewItem[];
  
  // Competitor list
  competitors: AppSearchResult[];

  // Store Rankings positions
  storeRankings?: StoreRanking[];
}

export interface StoreRanking {
  store: 'App Store' | 'Play Store';
  category: string;
  rank: number;
  type: string; // e.g. "Top Free", "Top Paid", "Top Grossing"
  trend: 'up' | 'down' | 'stable';
  change: number;
  country: string;
}

