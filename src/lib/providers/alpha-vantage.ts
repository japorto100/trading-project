// Alpha Vantage API Provider
// Free Plan: 25 requests/day, 5 requests/minute
// Supports: Stocks, FX, Crypto, Indices

import { MarketDataProvider, ProviderInfo, OHLCVData, SymbolResult, QuoteData, TimeframeValue, TIMEFRAME_MAP } from './types';

export class AlphaVantageProvider implements MarketDataProvider {
  readonly info: ProviderInfo = {
    name: 'alphavantage',
    displayName: 'Alpha Vantage',
    supportedAssets: ['stock', 'fx', 'crypto', 'index'],
    requiresAuth: true,
    rateLimit: { requests: 25, period: 'day' },
    freePlan: true,
    documentation: 'https://www.alphavantage.co/documentation/',
  };

  private apiKey: string;
  private baseUrl = 'https://www.alphavantage.co/query';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.ALPHA_VANTAGE_API_KEY || 'demo';
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}?function=TIME_SERIES_INTRADAY&symbol=IBM&interval=5min&apikey=${this.apiKey}`
      );
      const data = await response.json();
      return !data['Error Message'] && !data['Note'];
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
    const isFX = quote && base?.length === 3;
    const isCrypto = quote && (quote === 'USD' || quote === 'EUR' || quote === 'BTC') && base?.length > 3;

    let function_name: string;
    let params: Record<string, string> = {
      apikey: this.apiKey,
    };

    if (isCrypto) {
      function_name = 'DIGITAL_CURRENCY_INTRADAY';
      params.symbol = base;
      params.market = quote;
      params.interval = TIMEFRAME_MAP.alphavantage[timeframe] || '5min';
    } else if (isFX) {
      function_name = timeframe === '1D' || timeframe === '1W' || timeframe === '1M' 
        ? 'FX_DAILY' 
        : 'FX_INTRADAY';
      params.from_symbol = base;
      params.to_symbol = quote;
      if (function_name === 'FX_INTRADAY') {
        params.interval = TIMEFRAME_MAP.alphavantage[timeframe] || '5min';
      }
    } else {
      // Stock
      if (timeframe === '1D' || timeframe === '1W' || timeframe === '1M') {
        function_name = `TIME_SERIES_${timeframe === '1D' ? 'DAILY' : timeframe === '1W' ? 'WEEKLY' : 'MONTHLY'}`;
      } else {
        function_name = 'TIME_SERIES_INTRADAY';
        params.interval = TIMEFRAME_MAP.alphavantage[timeframe] || '5min';
      }
      params.symbol = symbol;
    }

    params.function = function_name;

    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${this.baseUrl}?${queryString}`);
    const data = await response.json();

    if (data['Error Message'] || data['Note']) {
      throw new Error(data['Error Message'] || data['Note']);
    }

    // Parse response
    const timeSeriesKey = Object.keys(data).find(k => k.includes('Time Series'));
    if (!timeSeriesKey) {
      throw new Error('No time series data found');
    }

    const timeSeries = data[timeSeriesKey];
    const result: OHLCVData[] = [];

    for (const [timestamp, values] of Object.entries(timeSeries).slice(0, limit) as [string, any][]) {
      const date = new Date(timestamp);
      result.push({
        time: Math.floor(date.getTime() / 1000),
        open: parseFloat(values['1. open'] || values['1a. open (USD)'] || 0),
        high: parseFloat(values['2. high'] || values['2a. high (USD)'] || 0),
        low: parseFloat(values['3. low'] || values['3a. low (USD)'] || 0),
        close: parseFloat(values['4. close'] || values['4a. close (USD)'] || 0),
        volume: parseFloat(values['5. volume'] || values['6. market cap (USD)'] || 0),
      });
    }

    return result.reverse();
  }

  async searchSymbols(query: string): Promise<SymbolResult[]> {
    const params = new URLSearchParams({
      function: 'SYMBOL_SEARCH',
      keywords: query,
      apikey: this.apiKey,
    });

    const response = await fetch(`${this.baseUrl}?${params}`);
    const data = await response.json();

    if (!data.bestMatches) return [];

    return data.bestMatches.slice(0, 20).map((match: any) => ({
      symbol: match['1. symbol'],
      name: match['2. name'],
      type: match['3. type'].toLowerCase() as any,
      exchange: match['4. region'],
      currency: match['8. currency'],
    }));
  }

  async getQuote(symbol: string): Promise<QuoteData> {
    const [base, quote] = symbol.split('/');
    const isFX = quote && base?.length === 3;

    let params: Record<string, string> = {
      apikey: this.apiKey,
    };

    if (isFX) {
      params.function = 'CURRENCY_EXCHANGE_RATE';
      params.from_currency = base;
      params.to_currency = quote;
    } else {
      params.function = 'GLOBAL_QUOTE';
      params.symbol = symbol;
    }

    const response = await fetch(`${this.baseUrl}?${new URLSearchParams(params)}`);
    const data = await response.json();

    if (isFX) {
      const rate = data['Realtime Currency Exchange Rate'];
      if (!rate) throw new Error('No quote data found');
      
      return {
        symbol,
        price: parseFloat(rate['5. Exchange Rate']),
        change: 0,
        changePercent: 0,
        high: parseFloat(rate['5. Exchange Rate']),
        low: parseFloat(rate['5. Exchange Rate']),
        open: parseFloat(rate['5. Exchange Rate']),
        volume: 0,
        timestamp: Date.now(),
      };
    }

    const quoteData = data['Global Quote'];
    if (!quoteData) throw new Error('No quote data found');

    const price = parseFloat(quoteData['05. price']);
    const prevClose = parseFloat(quoteData['08. previous close']);

    return {
      symbol,
      price,
      change: price - prevClose,
      changePercent: ((price - prevClose) / prevClose) * 100,
      high: parseFloat(quoteData['03. high']),
      low: parseFloat(quoteData['04. low']),
      open: parseFloat(quoteData['02. open']),
      volume: parseFloat(quoteData['06. volume']),
      timestamp: Date.now(),
    };
  }
}

export default AlphaVantageProvider;
