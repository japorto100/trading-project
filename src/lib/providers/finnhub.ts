// Finnhub API Provider
// Free Plan: 60 calls/minute
// Supports: Stocks, Crypto, Forex

import { MarketDataProvider, ProviderInfo, OHLCVData, SymbolResult, QuoteData, TimeframeValue, TIMEFRAME_MAP } from './types';

export class FinnhubProvider implements MarketDataProvider {
  readonly info: ProviderInfo = {
    name: 'finnhub',
    displayName: 'Finnhub',
    supportedAssets: ['stock', 'crypto', 'fx'],
    requiresAuth: true,
    rateLimit: { requests: 60, period: 'minute' },
    freePlan: true,
    documentation: 'https://finnhub.io/docs/api',
  };

  private apiKey: string;
  private baseUrl = 'https://finnhub.io/api/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.FINNHUB_API_KEY || '';
  }

  async isAvailable(): Promise<boolean> {
    if (!this.apiKey) return false;
    try {
      const response = await fetch(
        `${this.baseUrl}/quote?symbol=AAPL&token=${this.apiKey}`
      );
      const data = await response.json();
      return data.c !== undefined;
    } catch {
      return false;
    }
  }

  async fetchOHLCV(
    symbol: string,
    timeframe: TimeframeValue,
    limit: number = 300
  ): Promise<OHLCVData[]> {
    const [base, quote] = symbol.split('/');
    const isCrypto = quote && (quote === 'USD' || quote === 'EUR' || quote === 'BTC');
    const isFX = quote && base?.length === 3;

    const resolution = TIMEFRAME_MAP.finnhub[timeframe] || '60';
    const now = Math.floor(Date.now() / 1000);
    const timeframeMs: Record<TimeframeValue, number> = {
      '1m': 60, '5m': 300, '15m': 900, '30m': 1800,
      '1H': 3600, '4H': 14400, '1D': 86400, '1W': 604800, '1M': 2592000
    };
    const from = now - (limit * timeframeMs[timeframe]);

    let endpoint: string;
    let params: string;

    if (isCrypto) {
      endpoint = '/crypto/candle';
      params = `symbol=BINANCE:${base}${quote}&resolution=${resolution}&from=${from}&to=${now}&token=${this.apiKey}`;
    } else if (isFX) {
      endpoint = '/forex/candle';
      params = `symbol=OANDA:${base}_${quote}&resolution=${resolution}&from=${from}&to=${now}&token=${this.apiKey}`;
    } else {
      endpoint = '/stock/candle';
      params = `symbol=${symbol}&resolution=${resolution}&from=${from}&to=${now}&token=${this.apiKey}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}?${params}`);
    const data = await response.json();

    if (data.s === 'no_data' || !data.t) {
      throw new Error('No data available');
    }

    const result: OHLCVData[] = [];
    for (let i = 0; i < data.t.length && i < limit; i++) {
      result.push({
        time: data.t[i],
        open: data.o[i],
        high: data.h[i],
        low: data.l[i],
        close: data.c[i],
        volume: data.v?.[i] || 0,
      });
    }

    return result;
  }

  async searchSymbols(query: string): Promise<SymbolResult[]> {
    const response = await fetch(
      `${this.baseUrl}/search?q=${encodeURIComponent(query)}&token=${this.apiKey}`
    );
    const data = await response.json();

    if (!data.result) return [];

    return data.result.slice(0, 20).map((item: any) => ({
      symbol: item.symbol,
      name: item.description,
      type: 'stock' as const,
      exchange: item.type,
    }));
  }

  async getQuote(symbol: string): Promise<QuoteData> {
    const [base, quote] = symbol.split('/');
    const isCrypto = quote && (quote === 'USD' || quote === 'EUR' || quote === 'BTC');

    let endpoint: string;
    let params: string;

    if (isCrypto) {
      endpoint = '/crypto/quote';
      params = `symbol=BINANCE:${base}${quote}&token=${this.apiKey}`;
    } else {
      endpoint = '/quote';
      params = `symbol=${symbol}&token=${this.apiKey}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}?${params}`);
    const data = await response.json();

    if (!data.c) {
      throw new Error('No quote data available');
    }

    return {
      symbol,
      price: data.c,
      change: data.d || 0,
      changePercent: data.dp || 0,
      high: data.h || data.c,
      low: data.l || data.c,
      open: data.o || data.c,
      volume: 0,
      timestamp: data.t || Date.now(),
    };
  }
}

export default FinnhubProvider;
