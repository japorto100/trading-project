# TradeView Pro - Professional Trading Platform

A modern, open-source trading platform built with Next.js 15, featuring real-time market data, interactive charts, and technical analysis tools.

## 🚀 Features

### Charting
- **Interactive Candlestick Charts** - Powered by TradingView's Lightweight Charts
- **Multiple Timeframes** - 1m, 5m, 15m, 30m, 1H, 4H, 1D, 1W, 1M
- **Crosshair with OHLCV Display** - Hover to see detailed price info
- **Volume Bars** - Color-coded volume display

### Technical Indicators
- **Moving Averages**: SMA, EMA, WMA
- **Oscillators**: RSI, Stochastic
- **Trend**: MACD, Bollinger Bands
- **Volatility**: ATR (Average True Range)
- **Volume**: VWAP, Volume Profile

### Market Data Providers
| Provider | Coverage | Free Plan | Auth Required |
|----------|----------|-----------|---------------|
| Twelve Data | Stocks, ETFs, FX, Crypto | 800 credits/day | Yes |
| Alpha Vantage | Stocks, FX, Crypto | 25 requests/day | Yes |
| Finnhub | Stocks, Crypto, Forex | 60 calls/min | Yes |
| FMP | Stocks, ETFs, Indices | 250 requests/day | Yes |
| EODHD | Stocks, ETFs, FX, Indices | 20 requests/day | Yes |
| Marketstack | Stocks, ETFs, Indices | 100 requests/month | Yes |
| Polygon.io | US-centric stocks/indices (+ FX/Crypto by plan) | 5 requests/min (free tier) | Yes |
| CoinMarketCap | Crypto | plan-dependent (API key required) | Yes |
| Finage | Stocks/FX/Crypto/Indices (plan-dependent) | plan-dependent | Yes |
| FRED | Economic/Macro series | Effectively high/unlimited for practical app use | Yes |
| Yahoo (Unofficial) | Stocks, ETFs, FX, Crypto, Indices | Yes (best effort) | No |
| yfinance Bridge | Stocks, ETFs, FX, Crypto, Indices | Yes (best effort) | No |
| ECB | FX Rates | Unlimited | No |
| Demo | All assets | Unlimited | No |

### Additional Features
- **Price Alerts** - Set alerts for price targets
- **Symbol Search** - Search across multiple exchanges
- **Watchlist** - Track your favorite symbols
- **Dark/Light Theme** - Easy on the eyes
- **Responsive Design** - Works on all screen sizes

## 📦 Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd my-project

# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env

# Add your API keys (optional)
# Edit .env and add your API keys

# Start development server
pnpm dev
```

## ⚙️ Configuration

### API Keys (Optional)

The platform works out-of-the-box with demo data. To get real market data:

1. **Twelve Data** (Recommended)
   - Visit: https://twelvedata.com/pricing
   - Sign up for free plan (800 credits/day)
   - Add key to `.env`: `TWELVE_DATA_API_KEY=your_key`

2. **Alpha Vantage**
   - Visit: https://www.alphavantage.co/support/#api-key
   - Get free API key (25 requests/day)
   - Add key to `.env`: `ALPHA_VANTAGE_API_KEY=your_key`

3. **Finnhub**
   - Visit: https://finnhub.io/register
   - Get free API key (60 calls/minute)
   - Add key to `.env`: `FINNHUB_API_KEY=your_key`

4. **yfinance Bridge (optional wrapper)**
   - Set up a local/remote bridge service (see `python-backend/services/finance-bridge/README.md`)
   - Add URL to `.env`: `YFINANCE_BRIDGE_URL=http://localhost:8081`
   - Useful as fallback source for unofficial Yahoo-backed data

5. **Geopolitical Soft-Signals (optional FastAPI sidecar)**
   - Service docs: `python-backend/services/geopolitical-soft-signals/README.md`
   - Recommended env:
     - `GEOPOLITICAL_SOFT_SIGNAL_ENABLED=false` (default unless service is running)
     - `GEOPOLITICAL_SOFT_SIGNAL_URL=http://127.0.0.1:8091`
     - `GEOPOLITICAL_SOFT_SIGNAL_TIMEOUT_MS=8000`
     - `GEOPOLITICAL_SOFT_SIGNAL_MAX_CANDIDATES=6`

Notes on unofficial Yahoo sources:
- Direct Yahoo endpoints can return `401/403` depending on region/network policy.
- Keep `yahoo` as optional fallback and prefer `yfinance` bridge where needed.

6. **Additional optional APIs**
   - FMP: `FMP_API_KEY`
   - EODHD: `EODHD_API_KEY`
   - Marketstack: `MARKETSTACK_API_KEY`
   - Polygon: `POLYGON_API_KEY`
   - CoinMarketCap: `COINMARKETCAP_API_KEY`
   - Finage: `FINAGE_API_KEY`
   - FRED: `FRED_API_KEY`

7. **News APIs (optional, for headline aggregation)**
   - NewsData.io: `NEWSDATA_API_KEY`
   - NewsAPI.ai / EventRegistry: `NEWSAPIAI_API_KEY`
   - GNews: `GNEWS_API_KEY`
   - Webz.io News API Lite: `WEBZ_API_KEY`
   - Optional:
     - `NEWS_PROVIDER_PRIORITY=newsdata,gnews,newsapi_ai,webz,reddit`
     - `NEWS_DEFAULT_LANGUAGE=en`
     - `NEWS_DEFAULT_LIMIT=24`
     - `NEWS_FETCH_TIMEOUT_MS=7000`
     - `NEWS_CACHE_TTL_MS=120000`

### Provider Priority

Configure the order in which providers are tried:

```env
DEFAULT_PROVIDER=twelvedata,finnhub,alphavantage,polygon,fmp,eodhd,marketstack,coinmarketcap,finage,yahoo,yfinance,fred,ecb,demo
```

### Local rate/circuit protection

The app enforces local safety guards to avoid hammering free tiers:

```env
PROVIDER_TIMEOUT_MS=7000
PROVIDER_CIRCUIT_FAILURE_THRESHOLD=3
PROVIDER_CIRCUIT_OPEN_MS=60000
PROVIDER_QUOTES_CONCURRENCY=6
```

## 🏗️ Architecture

```
src/
├── app/
│   ├── api/
│   │   └── market/
│   │       ├── ohlcv/route.ts      # OHLCV data endpoint
│   │       ├── quote/route.ts      # Quote data endpoint
│   │       ├── search/route.ts     # Symbol search endpoint
│   │       └── providers/route.ts  # Provider status endpoint
│   ├── layout.tsx
│   └── page.tsx                    # Main page
├── components/
│   ├── TradingChart.tsx            # Chart component
│   ├── Header.tsx                  # App header
│   ├── Sidebar.tsx                 # Watchlist sidebar
│   ├── TimeframeSelector.tsx       # Timeframe buttons
│   ├── IndicatorPanel.tsx          # Indicator settings
│   ├── SettingsPanel.tsx           # API key settings
│   └── AlertPanel.tsx              # Price alerts
├── lib/
│   ├── providers/                  # Market data providers
│   │   ├── types.ts                # Provider interfaces
│   │   ├── index.ts                # Provider manager
│   │   ├── alpha-vantage.ts
│   │   ├── finnhub.ts
│   │   ├── twelve-data.ts
│   │   ├── ecb.ts
│   │   └── demo.ts
│   ├── indicators/                 # Technical indicators
│   │   └── index.ts
│   └── alerts/                     # Alert system
│       └── index.ts
└── components/ui/                  # shadcn/ui components
```

## 🔌 API Endpoints

### GET /api/market/ohlcv
Fetch OHLCV candlestick data.

```
GET /api/market/ohlcv?symbol=BTC/USD&timeframe=1H&limit=300
```

Response:
```json
{
  "success": true,
  "symbol": "BTC/USD",
  "timeframe": "1H",
  "provider": "twelvedata",
  "count": 300,
  "data": [
    { "time": 1704067200, "open": 42000, "high": 42100, "low": 41900, "close": 42050, "volume": 1000000 }
  ]
}
```

### GET /api/market/quote
Get current quote for a symbol.

```
GET /api/market/quote?symbol=BTC/USD
```

### GET /api/market/search
Search for symbols.

```
GET /api/market/search?q=bitcoin
```

### GET /api/market/providers
Get provider status and info.

```
GET /api/market/providers
```

## 📊 Supported Assets

### Crypto
- BTC/USD, ETH/USD, SOL/USD, XRP/USD, BNB/USD, ADA/USD, DOGE/USD, DOT/USD

### US Stocks
- AAPL, GOOGL, MSFT, TSLA, NVDA, AMZN, META, JPM, V, JNJ

### European Stocks
- NESN.SW (Nestlé), ROG.SW (Roche), NOVN.SW (Novartis), SAP, ASML

### Indices
- SPX (S&P 500), DJI (Dow Jones), IXIC (NASDAQ), SMI.SW, DAX

### Forex
- EUR/USD, GBP/USD, USD/CHF, USD/JPY, EUR/CHF

### Commodities
- XAU/USD (Gold), XAG/USD (Silver), CL (Crude Oil)

## 🧪 Technical Indicators Usage

```typescript
import { 
  calculateSMA, 
  calculateEMA, 
  calculateRSI, 
  calculateMACD,
  calculateBollingerBands 
} from '@/lib/indicators';

// Simple Moving Average
const sma = calculateSMA(candleData, 20);

// Exponential Moving Average
const ema = calculateEMA(candleData, 20);

// RSI
const rsi = calculateRSI(candleData, 14);

// MACD
const macd = calculateMACD(candleData, 12, 26, 9);

// Bollinger Bands
const bb = calculateBollingerBands(candleData, 20, 2);
```

## 🛡️ Important Notes

### Data Usage Terms
- **Free API plans** are for personal/internal use only
- **Redistribution** requires proper licensing from exchanges
- **Rate limits** vary by provider - check their documentation

Reference links tracked in this repo:
- Insightsentry: `https://insightsentry.com`
- LSE fee waiver note: `https://www.londonstockexchange.com/equities-trading/market-data/retail-investor-market-data-end-user-fee-waiver`

### Legal Disclaimer
This software is provided for educational and research purposes only. It is NOT financial advice. Always do your own research before making investment decisions.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Charts**: lightweight-charts (TradingView)
- **State**: React hooks + localStorage

## 📝 License

MIT License - feel free to use for personal or commercial projects.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and feature requests, please open a GitHub issue.

---

Built with ❤️ for traders and developers


