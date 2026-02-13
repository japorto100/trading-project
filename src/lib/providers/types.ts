// Market Data Provider Types
// Based on research: Alpha Vantage, Finnhub, Twelve Data, ECB

export type AssetType = 'stock' | 'crypto' | 'fx' | 'index' | 'etf' | 'commodity';
export type TimeframeValue = '1m' | '5m' | '15m' | '30m' | '1H' | '4H' | '1D' | '1W' | '1M';

export interface OHLCVData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface SymbolResult {
  symbol: string;
  name: string;
  type: AssetType;
  exchange?: string;
  currency?: string;
}

export interface QuoteData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  volume: number;
  timestamp: number;
}

export interface ProviderInfo {
  name: string;
  displayName: string;
  supportedAssets: AssetType[];
  requiresAuth: boolean;
  rateLimit: {
    requests: number;
    period: string;
  };
  freePlan: boolean;
  documentation: string;
}

export interface MarketDataProvider {
  readonly info: ProviderInfo;
  
  // Core Methods
  fetchOHLCV(
    symbol: string, 
    timeframe: TimeframeValue, 
    limit?: number
  ): Promise<OHLCVData[]>;
  
  searchSymbols(query: string): Promise<SymbolResult[]>;
  
  getQuote(symbol: string): Promise<QuoteData>;
  
  // Optional Methods
  isAvailable(): Promise<boolean>;
}

// Provider Registry
export const PROVIDER_REGISTRY: Record<string, ProviderInfo> = {
  alphavantage: {
    name: 'alphavantage',
    displayName: 'Alpha Vantage',
    supportedAssets: ['stock', 'fx', 'crypto', 'index'],
    requiresAuth: true,
    rateLimit: { requests: 25, period: 'day' },
    freePlan: true,
    documentation: 'https://www.alphavantage.co/documentation/',
  },
  finnhub: {
    name: 'finnhub',
    displayName: 'Finnhub',
    supportedAssets: ['stock', 'crypto', 'fx'],
    requiresAuth: true,
    rateLimit: { requests: 60, period: 'minute' },
    freePlan: true,
    documentation: 'https://finnhub.io/docs/api',
  },
  twelvedata: {
    name: 'twelvedata',
    displayName: 'Twelve Data',
    supportedAssets: ['stock', 'etf', 'fx', 'crypto', 'index'],
    requiresAuth: true,
    rateLimit: { requests: 800, period: 'day' },
    freePlan: true,
    documentation: 'https://twelvedata.com/docs',
  },
  ecb: {
    name: 'ecb',
    displayName: 'European Central Bank',
    supportedAssets: ['fx'],
    requiresAuth: false,
    rateLimit: { requests: 100, period: 'day' },
    freePlan: true,
    documentation: 'https://data-api.ecb.europa.eu/help',
  },
  demo: {
    name: 'demo',
    displayName: 'Demo Data',
    supportedAssets: ['stock', 'crypto', 'fx', 'index', 'etf', 'commodity'],
    requiresAuth: false,
    rateLimit: { requests: 999999, period: 'day' },
    freePlan: true,
    documentation: 'Internal demo data generator',
  },
};

// Timeframe Mapping for different APIs
export const TIMEFRAME_MAP: Record<string, Record<TimeframeValue, string>> = {
  alphavantage: {
    '1m': '1min',
    '5m': '5min',
    '15m': '15min',
    '30m': '30min',
    '1H': '60min',
    '4H': '60min', // Alpha Vantage doesn't support 4H
    '1D': 'daily',
    '1W': 'weekly',
    '1M': 'monthly',
  },
  finnhub: {
    '1m': '1',
    '5m': '5',
    '15m': '15',
    '30m': '30',
    '1H': '60',
    '4H': '240',
    '1D': 'D',
    '1W': 'W',
    '1M': 'M',
  },
  twelvedata: {
    '1m': '1min',
    '5m': '5min',
    '15m': '15min',
    '30m': '30min',
    '1H': '1h',
    '4H': '4h',
    '1D': '1day',
    '1W': '1week',
    '1M': '1month',
  },
  ecb: {
    '1D': 'D',
    '1W': 'W',
    '1M': 'M',
    '1m': 'D',
    '5m': 'D',
    '15m': 'D',
    '30m': 'D',
    '1H': 'D',
    '4H': 'D',
  },
  demo: {
    '1m': '1m',
    '5m': '5m',
    '15m': '15m',
    '30m': '30m',
    '1H': '1H',
    '4H': '4H',
    '1D': '1D',
    '1W': '1W',
    '1M': '1M',
  },
};
