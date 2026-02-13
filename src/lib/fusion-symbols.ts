export type FusionSymbolType = 'crypto' | 'stock' | 'fx' | 'commodity' | 'index';

export interface FusionSymbol {
  symbol: string;
  name: string;
  basePrice: number;
  type: FusionSymbolType;
  aliases?: string[];
}

const FUSION_SYMBOLS: FusionSymbol[] = [
  // Crypto
  { symbol: 'BTC/USD', name: 'Bitcoin', basePrice: 67500, type: 'crypto', aliases: ['BTC-USD'] },
  { symbol: 'ETH/USD', name: 'Ethereum', basePrice: 3450, type: 'crypto', aliases: ['ETH-USD'] },
  { symbol: 'SOL/USD', name: 'Solana', basePrice: 178, type: 'crypto', aliases: ['SOL-USD'] },
  { symbol: 'XRP/USD', name: 'Ripple', basePrice: 0.52, type: 'crypto', aliases: ['XRP-USD'] },
  { symbol: 'BNB/USD', name: 'Binance Coin', basePrice: 580, type: 'crypto', aliases: ['BNB-USD'] },
  { symbol: 'ADA/USD', name: 'Cardano', basePrice: 0.45, type: 'crypto', aliases: ['ADA-USD'] },
  { symbol: 'DOGE/USD', name: 'Dogecoin', basePrice: 0.12, type: 'crypto', aliases: ['DOGE-USD'] },
  { symbol: 'DOT/USD', name: 'Polkadot', basePrice: 7.2, type: 'crypto', aliases: ['DOT-USD'] },

  // Stocks
  { symbol: 'AAPL', name: 'Apple Inc.', basePrice: 189, type: 'stock' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', basePrice: 420, type: 'stock' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', basePrice: 175, type: 'stock', aliases: ['GOOG'] },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', basePrice: 185, type: 'stock' },
  { symbol: 'TSLA', name: 'Tesla Inc.', basePrice: 248, type: 'stock' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', basePrice: 880, type: 'stock' },
  { symbol: 'META', name: 'Meta Platforms Inc.', basePrice: 505, type: 'stock' },
  { symbol: 'NFLX', name: 'Netflix Inc.', basePrice: 605, type: 'stock' },
  { symbol: 'AMD', name: 'Advanced Micro Devices', basePrice: 166, type: 'stock' },
  { symbol: 'INTC', name: 'Intel Corp.', basePrice: 46, type: 'stock' },
  { symbol: 'CRM', name: 'Salesforce Inc.', basePrice: 318, type: 'stock' },
  { symbol: 'DIS', name: 'Walt Disney Co.', basePrice: 104, type: 'stock' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', basePrice: 198, type: 'stock' },
  { symbol: 'V', name: 'Visa Inc.', basePrice: 280, type: 'stock' },
  { symbol: 'MA', name: 'Mastercard Inc.', basePrice: 488, type: 'stock' },
  { symbol: 'WMT', name: 'Walmart Inc.', basePrice: 172, type: 'stock' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', basePrice: 158, type: 'stock' },
  { symbol: 'PFE', name: 'Pfizer Inc.', basePrice: 29, type: 'stock' },
  { symbol: 'KO', name: 'Coca-Cola Co.', basePrice: 64, type: 'stock' },
  { symbol: 'SAP', name: 'SAP SE', basePrice: 175, type: 'stock' },
  { symbol: 'ASML', name: 'ASML Holding', basePrice: 950, type: 'stock' },

  // Forex
  { symbol: 'EUR/USD', name: 'Euro / US Dollar', basePrice: 1.085, type: 'fx', aliases: ['EUR-USD'] },
  { symbol: 'GBP/USD', name: 'British Pound / US Dollar', basePrice: 1.27, type: 'fx', aliases: ['GBP-USD'] },
  { symbol: 'USD/CHF', name: 'US Dollar / Swiss Franc', basePrice: 0.88, type: 'fx', aliases: ['USD-CHF'] },
  { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', basePrice: 155, type: 'fx', aliases: ['USD-JPY'] },
  { symbol: 'AUD/USD', name: 'Australian Dollar / US Dollar', basePrice: 0.66, type: 'fx', aliases: ['AUD-USD'] },
  { symbol: 'USD/CAD', name: 'US Dollar / Canadian Dollar', basePrice: 1.36, type: 'fx', aliases: ['USD-CAD'] },
  { symbol: 'EUR/CHF', name: 'Euro / Swiss Franc', basePrice: 0.955, type: 'fx', aliases: ['EUR-CHF'] },
  { symbol: 'GBP/EUR', name: 'British Pound / Euro', basePrice: 1.18, type: 'fx', aliases: ['GBP-EUR'] },

  // Commodities
  { symbol: 'XAU/USD', name: 'Gold', basePrice: 2350, type: 'commodity' },
  { symbol: 'XAG/USD', name: 'Silver', basePrice: 28, type: 'commodity' },
  { symbol: 'CL', name: 'Crude Oil WTI', basePrice: 78, type: 'commodity' },

  // Indices
  { symbol: 'SPX', name: 'S&P 500', basePrice: 5200, type: 'index' },
  { symbol: 'NDX', name: 'Nasdaq 100', basePrice: 18100, type: 'index' },
  { symbol: 'DJI', name: 'Dow Jones', basePrice: 39000, type: 'index' },
  { symbol: 'DAX', name: 'DAX 40', basePrice: 18500, type: 'index' },
  { symbol: 'FTSE', name: 'FTSE 100', basePrice: 7700, type: 'index' },
  { symbol: 'N225', name: 'Nikkei 225', basePrice: 38600, type: 'index' },
  { symbol: 'HSI', name: 'Hang Seng Index', basePrice: 16200, type: 'index' },
  { symbol: 'IXIC', name: 'NASDAQ Composite', basePrice: 16500, type: 'index' },
];

export const ALL_FUSION_SYMBOLS: FusionSymbol[] = FUSION_SYMBOLS;

export const WATCHLIST_CATEGORIES = {
  crypto: FUSION_SYMBOLS.filter((s) => s.type === 'crypto'),
  stocks: FUSION_SYMBOLS.filter((s) => s.type === 'stock'),
  forex: FUSION_SYMBOLS.filter((s) => s.type === 'fx'),
  commodities: FUSION_SYMBOLS.filter((s) => s.type === 'commodity'),
  indices: FUSION_SYMBOLS.filter((s) => s.type === 'index'),
};

function normalizeForMatch(value: string): string {
  return value.toUpperCase().replace(/-/g, '/').trim();
}

export function searchFusionSymbols(query: string, limit: number = 10): FusionSymbol[] {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  const upper = trimmed.toUpperCase();
  const normalized = normalizeForMatch(trimmed);

  return FUSION_SYMBOLS.filter((symbol) => {
    const candidates = [symbol.symbol, symbol.name, ...(symbol.aliases ?? [])];
    return candidates.some((candidate) => {
      const cUpper = candidate.toUpperCase();
      return cUpper.includes(upper) || normalizeForMatch(candidate).includes(normalized);
    });
  }).slice(0, limit);
}
