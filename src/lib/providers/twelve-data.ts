// Twelve Data API Provider
// Free Plan: 800 credits/day
// Supports: Stocks, ETFs, Forex, Crypto, Indices

import { MarketDataProvider, ProviderInfo, OHLCVData, SymbolResult, QuoteData, TimeframeValue, TIMEFRAME_MAP } from './types';

export class TwelveDataProvider implements MarketDataProvider {
  readonly info: ProviderInfo = {
    name: 'twelvedata',
    displayName: 'Twelve Data',
    supportedAssets: ['stock', 'etf', 'fx', 'crypto', 'index'],
    requiresAuth: true,
    rateLimit: { requests: 800, period: 'day' },
    freePlan: true,
    documentation: 'https://twelvedata.com/docs',
  };

  private apiKey: string;
  private baseUrl = 'https://api.twelvedata.com';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.TWELVE_DATA_API_KEY || '';
  }

  async isAvailable(): Promise<boolean> {
    if (!this.apiKey) return false;
    try {
      const response = await fetch(
        `${this.baseUrl}/quote?symbol=AAPL&apikey=${this.apiKey}`
      );
      const data = await response.json();
      return data.symbol !== undefined;
    } catch {
      return false;
    }
  }

  async fetchOHLCV(
    symbol: string,
    timeframe: TimeframeValue,
    limit: number = 300
  ): Promise<OHLCVData[]> {
    const interval = TIMEFRAME_MAP.twelvedata[timeframe] || '1h';
    
    const params = new URLSearchParams({
      symbol: symbol,
      interval: interval,
      outputsize: limit.toString(),
      apikey: this.apiKey,
    });

    const response = await fetch(`${this.baseUrl}/time_series?${params}`);
    const data = await response.json();

    if (data.status === 'error') {
      throw new Error(data.message || 'API Error');
    }

    if (!data.values || data.values.length === 0) {
      throw new Error('No data available');
    }

    return data.values.map((item: any) => ({
      time: Math.floor(new Date(item.datetime).getTime() / 1000),
      open: parseFloat(item.open),
      high: parseFloat(item.high),
      low: parseFloat(item.low),
      close: parseFloat(item.close),
      volume: parseFloat(item.volume || 0),
    }));
  }

  async searchSymbols(query: string): Promise<SymbolResult[]> {
    const params = new URLSearchParams({
      symbol: query,
      apikey: this.apiKey,
    });

    const response = await fetch(`${this.baseUrl}/symbol_search?${params}`);
    const data = await response.json();

    if (!data.data) return [];

    return data.data.slice(0, 20).map((item: any) => ({
      symbol: item.symbol,
      name: item.instrument_name,
      type: this.mapInstrumentType(item.instrument_type),
      exchange: item.exchange,
      currency: item.currency,
    }));
  }

  async getQuote(symbol: string): Promise<QuoteData> {
    const params = new URLSearchParams({
      symbol: symbol,
      apikey: this.apiKey,
    });

    const response = await fetch(`${this.baseUrl}/quote?${params}`);
    const data = await response.json();

    if (data.status === 'error') {
      throw new Error(data.message || 'API Error');
    }

    return {
      symbol,
      price: parseFloat(data.close),
      change: parseFloat(data.change),
      changePercent: parseFloat(data.percent_change),
      high: parseFloat(data.high),
      low: parseFloat(data.low),
      open: parseFloat(data.open),
      volume: parseFloat(data.volume || 0),
      timestamp: Math.floor(new Date(data.timestamp).getTime() / 1000),
    };
  }

  private mapInstrumentType(type: string): 'stock' | 'etf' | 'fx' | 'crypto' | 'index' {
    const typeMap: Record<string, 'stock' | 'etf' | 'fx' | 'crypto' | 'index'> = {
      'Common Stock': 'stock',
      'ETF': 'etf',
      'Currency Pair': 'fx',
      'Digital Currency': 'crypto',
      'Index': 'index',
    };
    return typeMap[type] || 'stock';
  }
}

export default TwelveDataProvider;
