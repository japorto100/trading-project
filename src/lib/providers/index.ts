// Market Data Provider Index
// Exports all providers and a unified provider manager

export * from './types';
export { AlphaVantageProvider } from './alpha-vantage';
export { FinnhubProvider } from './finnhub';
export { TwelveDataProvider } from './twelve-data';
export { ECBProvider } from './ecb';
export { DemoProvider } from './demo';

import { MarketDataProvider, OHLCVData, SymbolResult, QuoteData, TimeframeValue, PROVIDER_REGISTRY } from './types';
import { AlphaVantageProvider } from './alpha-vantage';
import { FinnhubProvider } from './finnhub';
import { TwelveDataProvider } from './twelve-data';
import { ECBProvider } from './ecb';
import { DemoProvider } from './demo';

// Provider Priority Configuration
const DEFAULT_PRIORITY = ['twelvedata', 'alphavantage', 'finnhub', 'ecb', 'demo'];

export interface ProviderConfig {
  priority: string[];
  apiKeys: Record<string, string>;
}

export class ProviderManager {
  private providers: Map<string, MarketDataProvider> = new Map();
  private priority: string[];
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTTL = 60000; // 1 minute cache

  constructor(config?: Partial<ProviderConfig>) {
    this.priority = config?.priority || DEFAULT_PRIORITY;
    
    // Initialize providers with API keys
    const apiKeys = config?.apiKeys || {};
    
    this.providers.set('alphavantage', new AlphaVantageProvider(apiKeys.alphavantage));
    this.providers.set('finnhub', new FinnhubProvider(apiKeys.finnhub));
    this.providers.set('twelvedata', new TwelveDataProvider(apiKeys.twelvedata));
    this.providers.set('ecb', new ECBProvider());
    this.providers.set('demo', new DemoProvider());
  }

  getProvider(name: string): MarketDataProvider | undefined {
    return this.providers.get(name);
  }

  getAllProviders(): { name: string; provider: MarketDataProvider }[] {
    return Array.from(this.providers.entries()).map(([name, provider]) => ({ name, provider }));
  }

  async getAvailableProviders(): Promise<string[]> {
    const available: string[] = [];
    
    for (const [name, provider] of this.providers) {
      try {
        if (await provider.isAvailable()) {
          available.push(name);
        }
      } catch {
        // Provider not available
      }
    }
    
    return available;
  }

  private getCached<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data as T;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  async fetchOHLCV(
    symbol: string,
    timeframe: TimeframeValue,
    limit: number = 300
  ): Promise<{ data: OHLCVData[]; provider: string }> {
    const cacheKey = `ohlcv:${symbol}:${timeframe}:${limit}`;
    const cached = this.getCached<{ data: OHLCVData[]; provider: string }>(cacheKey);
    if (cached) return cached;

    const errors: string[] = [];

    for (const providerName of this.priority) {
      const provider = this.providers.get(providerName);
      if (!provider) continue;

      try {
        const data = await provider.fetchOHLCV(symbol, timeframe, limit);
        if (data && data.length > 0) {
          const result = { data, provider: providerName };
          this.setCache(cacheKey, result);
          return result;
        }
      } catch (error: any) {
        errors.push(`${providerName}: ${error.message}`);
      }
    }

    throw new Error(`All providers failed for ${symbol}: ${errors.join('; ')}`);
  }

  async searchSymbols(query: string): Promise<SymbolResult[]> {
    const cacheKey = `search:${query}`;
    const cached = this.getCached<SymbolResult[]>(cacheKey);
    if (cached) return cached;

    const results: SymbolResult[] = [];
    const seen = new Set<string>();

    for (const providerName of this.priority) {
      const provider = this.providers.get(providerName);
      if (!provider) continue;

      try {
        const symbols = await provider.searchSymbols(query);
        for (const s of symbols) {
          const key = `${s.symbol}:${s.type}`;
          if (!seen.has(key)) {
            seen.add(key);
            results.push({ ...s, exchange: s.exchange || providerName.toUpperCase() });
          }
        }
      } catch {
        // Continue with next provider
      }
    }

    this.setCache(cacheKey, results);
    return results;
  }

  async getQuote(symbol: string): Promise<{ data: QuoteData; provider: string }> {
    const cacheKey = `quote:${symbol}`;
    const cached = this.getCached<{ data: QuoteData; provider: string }>(cacheKey);
    if (cached) return cached;

    const errors: string[] = [];

    for (const providerName of this.priority) {
      const provider = this.providers.get(providerName);
      if (!provider) continue;

      try {
        const data = await provider.getQuote(symbol);
        const result = { data, provider: providerName };
        this.setCache(cacheKey, result);
        return result;
      } catch (error: any) {
        errors.push(`${providerName}: ${error.message}`);
      }
    }

    throw new Error(`All providers failed for ${symbol}: ${errors.join('; ')}`);
  }

  // Get quotes for multiple symbols
  async getQuotes(symbols: string[]): Promise<Map<string, QuoteData>> {
    const results = new Map<string, QuoteData>();
    
    await Promise.all(
      symbols.map(async (symbol) => {
        try {
          const { data } = await this.getQuote(symbol);
          results.set(symbol, data);
        } catch {
          // Skip failed symbols
        }
      })
    );

    return results;
  }

  // Get provider info
  getProviderInfo(): Record<string, { info: any; available: boolean | null }> {
    const info: Record<string, { info: any; available: boolean | null }> = {};
    
    for (const [name, provider] of this.providers) {
      info[name] = {
        info: provider.info,
        available: null, // Will be checked async
      };
    }

    return info;
  }
}

// Singleton instance
let managerInstance: ProviderManager | null = null;

export function getProviderManager(config?: Partial<ProviderConfig>): ProviderManager {
  if (!managerInstance) {
    managerInstance = new ProviderManager(config);
  }
  return managerInstance;
}

export function resetProviderManager(): void {
  managerInstance = null;
}
