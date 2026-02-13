'use client';

import { useState, useCallback, useMemo, useSyncExternalStore, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { TimeframeSelector } from '@/components/TimeframeSelector';
import { IndicatorPanel, IndicatorSettings } from '@/components/IndicatorPanel';
import { SettingsPanel } from '@/components/SettingsPanel';
import { AlertPanel } from '@/components/AlertPanel';
import { DrawingToolbar } from '@/components/DrawingToolbar';
import { ChartTypeSelector } from '@/components/ChartTypeSelector';
import { CompareSymbol } from '@/components/CompareSymbol';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  BarChart3, 
  RefreshCw,
  Star,
  StarOff,
  Fullscreen,
  Camera,
  Layout,
  Clock,
  Zap,
  Menu,
  X,
  Sun,
  Moon,
  List,
  SlidersHorizontal,
  Newspaper,
  ClipboardList
} from 'lucide-react';
import { OHLCVData, TimeframeValue } from '@/lib/providers/types';
import { ChartType } from '@/chart/types';
import { generateDemoCandles } from '@/lib/demoData';
import {
  ALL_FUSION_SYMBOLS,
  FusionSymbol,
  WATCHLIST_CATEGORIES,
  searchFusionSymbols,
} from '@/lib/fusion-symbols';
import { SymbolSearch } from '@/components/fusion/SymbolSearch';
import { WatchlistPanel } from '@/components/fusion/WatchlistPanel';

// Dynamic import for chart
const TradingChart = dynamic(
  () => import('@/components/TradingChart').then(mod => mod.TradingChart),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-slate-900/50 rounded-lg">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-blue-500 animate-pulse" />
          <p className="text-slate-400">Loading chart...</p>
        </div>
      </div>
    )
  }
);

const DEFAULT_INDICATORS: IndicatorSettings = {
  sma: { enabled: false, period: 20 },
  ema: { enabled: false, period: 20 },
  rsi: { enabled: false, period: 14 },
  macd: { enabled: false },
  bollinger: { enabled: false, period: 20, stdDev: 2 },
};

type SidebarPanel = 'watchlist' | 'indicators' | 'news' | 'orders';

export default function Home() {
  // State
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currentSymbol, setCurrentSymbol] = useState<FusionSymbol>(WATCHLIST_CATEGORIES.crypto[0]);
  const [currentTimeframe, setCurrentTimeframe] = useState<TimeframeValue>('1H');
  const [chartType, setChartType] = useState<ChartType>('candlestick');
  const [indicators, setIndicators] = useState<IndicatorSettings>(DEFAULT_INDICATORS);
  const [candleData, setCandleData] = useState<OHLCVData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [layout, setLayout] = useState<'single' | '2h' | '2v' | '4'>('single');
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === 'undefined') {
      return [];
    }
    const saved = localStorage.getItem('tradeview_favorites');
    if (!saved) {
      return [];
    }
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [activeTab, setActiveTab] = useState('all');
  const [activeSidebarPanel, setActiveSidebarPanel] = useState<SidebarPanel>('watchlist');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showDrawingToolbar, setShowDrawingToolbar] = useState(false);
  const [compareSymbol, setCompareSymbol] = useState<string | null>(null);
  
  // Client-side only check
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Generate data when symbol/timeframe changes
  const generateData = useCallback(() => {
    if (!mounted) return;
    
    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      const data = generateDemoCandles(currentSymbol, currentTimeframe, 300);
      setCandleData(data);
      setLoading(false);
    }, 300);
  }, [currentSymbol, currentTimeframe, mounted]);

  // Initial data load.
  useEffect(() => {
    if (mounted) {
      const timer = window.setTimeout(() => generateData(), 0);
      return () => window.clearTimeout(timer);
    }
  }, [mounted, generateData]);

  // Refresh data
  const handleRefresh = useCallback(() => {
    generateData();
  }, [generateData]);

  // Theme toggle
  const handleThemeToggle = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  const openSidebarPanel = useCallback((panel: SidebarPanel) => {
    setActiveSidebarPanel(panel);
    if (!sidebarOpen) {
      setSidebarOpen(true);
    }
  }, [sidebarOpen]);

  const setCoreIndicatorEnabled = useCallback(
    (key: 'sma' | 'ema' | 'rsi', enabled: boolean) => {
      setIndicators((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          enabled,
        },
      }));
    },
    []
  );

  const setCoreIndicatorPeriod = useCallback(
    (key: 'sma' | 'ema' | 'rsi', period: number) => {
      setIndicators((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          period,
        },
      }));
    },
    []
  );

  const setMacdEnabled = useCallback((enabled: boolean) => {
    setIndicators((prev) => ({
      ...prev,
      macd: {
        ...(prev.macd ?? { enabled: false }),
        enabled,
      },
    }));
  }, []);

  const setBollingerEnabled = useCallback((enabled: boolean) => {
    setIndicators((prev) => ({
      ...prev,
      bollinger: {
        ...(prev.bollinger ?? { enabled: false, period: 20, stdDev: 2 }),
        enabled,
      },
    }));
  }, []);

  const setBollingerPeriod = useCallback((period: number) => {
    setIndicators((prev) => ({
      ...prev,
      bollinger: {
        ...(prev.bollinger ?? { enabled: false, period: 20, stdDev: 2 }),
        period,
      },
    }));
  }, []);

  const setBollingerStdDev = useCallback((stdDev: number) => {
    setIndicators((prev) => ({
      ...prev,
      bollinger: {
        ...(prev.bollinger ?? { enabled: false, period: 20, stdDev: 2 }),
        stdDev,
      },
    }));
  }, []);

  // Symbol change
  const handleSymbolChange = useCallback((symbol: FusionSymbol) => {
    setCurrentSymbol(symbol);
    setSearchQuery('');
    setShowSearch(false);
  }, []);

  // Timeframe change
  const handleTimeframeChange = useCallback((timeframe: TimeframeValue) => {
    setCurrentTimeframe(timeframe);
  }, []);

  // Toggle favorite
  const toggleFavorite = useCallback((symbol: string) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(symbol)
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol];
      localStorage.setItem('tradeview_favorites', JSON.stringify(newFavorites));
      return newFavorites;
    });
  }, []);

  // Export chart
  const handleExport = useCallback(() => {
    // Find canvas and export
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `${currentSymbol.symbol}_${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  }, [currentSymbol]);

  // Fullscreen toggle
  const handleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  }, []);

  // Calculate stats
  const stats = useMemo(() => {
    if (candleData.length === 0) {
      return { change: 0, percent: 0, high24h: 0, low24h: 0, volume24h: 0, lastPrice: 0 };
    }
    
    const lastCandle = candleData[candleData.length - 1];
    const prevCandle = candleData[candleData.length - 2] || lastCandle;
    const change = lastCandle.close - prevCandle.close;
    const percent = prevCandle.close > 0 ? (change / prevCandle.close) * 100 : 0;
    
    const sliceCount = Math.min(24, candleData.length);
    const recentData = candleData.slice(-sliceCount);
    
    return {
      change,
      percent,
      high24h: Math.max(...recentData.map((c) => c.high)),
      low24h: Math.min(...recentData.map((c) => c.low)),
      volume24h: recentData.reduce((sum: number, c) => sum + c.volume, 0),
      lastPrice: lastCandle.close,
    };
  }, [candleData]);

  // Format helpers
  const formatPrice = (price: number) => {
    if (price < 0.01) return price.toFixed(6);
    if (price < 1) return price.toFixed(4);
    if (price < 100) return price.toFixed(2);
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return (volume / 1e9).toFixed(2) + 'B';
    if (volume >= 1e6) return (volume / 1e6).toFixed(2) + 'M';
    if (volume >= 1e3) return (volume / 1e3).toFixed(2) + 'K';
    return volume.toString();
  };

  // Get all symbols for search
  const allSymbols = useMemo(() => {
    return ALL_FUSION_SYMBOLS;
  }, []);

  // Filter symbols by search
  const filteredSymbols = useMemo(() => {
    return searchFusionSymbols(searchQuery, 10);
  }, [searchQuery]);

  const popularSymbols = useMemo(() => {
    const preferred = ['AAPL', 'BTC/USD', 'EUR/USD', 'NVDA'];
    return preferred
      .map((symbol) => allSymbols.find((item) => item.symbol === symbol))
      .filter((item): item is FusionSymbol => Boolean(item));
  }, [allSymbols]);

  // Get watchlist by tab
  const watchlistSymbols = useMemo(() => {
    if (activeTab === 'favorites') {
      return allSymbols.filter(s => favorites.includes(s.symbol));
    }
    if (activeTab === 'all') {
      return allSymbols;
    }
    return WATCHLIST_CATEGORIES[activeTab as keyof typeof WATCHLIST_CATEGORIES] || [];
  }, [activeTab, favorites, allSymbols]);

  if (!mounted) {
    return (
      <div className="h-screen flex flex-col bg-slate-950 text-white">
        <div className="h-14 border-b border-slate-800 bg-slate-900/50 flex items-center px-4">
          <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg px-3 py-1.5">
            <BarChart3 className="h-5 w-5 text-white" />
            <span className="font-bold text-white text-lg">TradeView Pro</span>
          </div>
        </div>
        <div className="flex-1 flex">
          <div className="w-64 border-r border-slate-800 bg-slate-900/30 p-4" />
          <div className="flex-1 p-4" />
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col overflow-hidden ${isDarkMode ? 'dark bg-slate-950 text-white' : 'bg-white text-slate-900'}`}>
      {/* Top Menu Bar */}
      <div className="h-8 border-b border-border bg-card/50 flex items-center px-2 text-xs">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
            File
          </Button>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
            View
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 px-2 text-xs"
            onClick={() => setShowDrawingToolbar(!showDrawingToolbar)}
          >
            Draw
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => openSidebarPanel('indicators')}
          >
            Indicators
          </Button>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
            Settings
          </Button>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            {new Date().toLocaleTimeString()}
          </Badge>
          <Badge variant="outline" className="text-xs text-emerald-500">
            <Zap className="h-3 w-3 mr-1" />
            Live
          </Badge>
        </div>
      </div>

      {/* Header */}
      <div className="h-14 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg px-3 py-1.5">
            <BarChart3 className="h-5 w-5 text-white" />
            <span className="font-bold text-white text-lg">TradeView Pro</span>
          </div>

          {/* Symbol Search */}
          <SymbolSearch
            query={searchQuery}
            open={showSearch}
            results={filteredSymbols}
            favorites={favorites}
            popularSymbols={popularSymbols}
            onQueryChange={setSearchQuery}
            onOpenChange={setShowSearch}
            onSelect={handleSymbolChange}
            onToggleFavorite={toggleFavorite}
          />

          {/* Current Symbol */}
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold">{currentSymbol.symbol}</h2>
            <Badge variant="outline" className={
              currentSymbol.type === 'crypto' 
                ? 'border-amber-500/50 text-amber-500' 
                : currentSymbol.type === 'stock'
                ? 'border-blue-500/50 text-blue-500'
                : 'border-purple-500/50 text-purple-500'
            }>
              {currentSymbol.type.toUpperCase()}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => toggleFavorite(currentSymbol.symbol)}
            >
              {favorites.includes(currentSymbol.symbol) ? (
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              ) : (
                <StarOff className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Timeframe */}
          <TimeframeSelector 
            currentTimeframe={currentTimeframe}
            onTimeframeChange={handleTimeframeChange}
          />
        </div>
        
        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {/* Chart Type */}
          <ChartTypeSelector 
            chartType={chartType}
            onChartTypeChange={setChartType}
          />

          {/* Compare */}
          <CompareSymbol
            onCompare={setCompareSymbol}
            currentCompare={compareSymbol}
          />

          <Separator orientation="vertical" className="h-6" />

          {/* Layout */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Layout className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setLayout('single')}>Single Chart</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLayout('2h')}>2 Charts (Horizontal)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLayout('2v')}>2 Charts (Vertical)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLayout('4')}>4 Charts</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Indicators */}
          <IndicatorPanel 
            indicators={indicators}
            onIndicatorsChange={setIndicators}
          />

          <Separator orientation="vertical" className="h-6" />

          {/* Refresh */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>

          {/* Export */}
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Camera className="h-4 w-4" />
          </Button>

          {/* Fullscreen */}
          <Button variant="outline" size="sm" onClick={handleFullscreen}>
            <Fullscreen className="h-4 w-4" />
          </Button>

          {/* Alerts */}
          <AlertPanel />

          {/* Settings */}
          <SettingsPanel />

          {/* Theme Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleThemeToggle}
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-2 top-1/2 z-50 bg-card/80"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>

        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-72 border-r border-border bg-card/30 flex flex-col h-full">
            <div className="grid grid-cols-4 border-b border-border">
              <Button
                variant={activeSidebarPanel === 'watchlist' ? 'secondary' : 'ghost'}
                className="h-10 rounded-none"
                onClick={() => setActiveSidebarPanel('watchlist')}
              >
                <List className="h-4 w-4 mr-1" />
                <span className="text-[11px]">Watch</span>
              </Button>
              <Button
                variant={activeSidebarPanel === 'indicators' ? 'secondary' : 'ghost'}
                className="h-10 rounded-none"
                onClick={() => setActiveSidebarPanel('indicators')}
              >
                <SlidersHorizontal className="h-4 w-4 mr-1" />
                <span className="text-[11px]">Indic</span>
              </Button>
              <Button
                variant={activeSidebarPanel === 'news' ? 'secondary' : 'ghost'}
                className="h-10 rounded-none"
                onClick={() => setActiveSidebarPanel('news')}
              >
                <Newspaper className="h-4 w-4 mr-1" />
                <span className="text-[11px]">News</span>
              </Button>
              <Button
                variant={activeSidebarPanel === 'orders' ? 'secondary' : 'ghost'}
                className="h-10 rounded-none"
                onClick={() => setActiveSidebarPanel('orders')}
              >
                <ClipboardList className="h-4 w-4 mr-1" />
                <span className="text-[11px]">Orders</span>
              </Button>
            </div>

            {activeSidebarPanel === 'watchlist' && (
              <>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="w-full justify-start px-2 pt-2">
                    <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                    <TabsTrigger value="favorites" className="text-xs">Fav</TabsTrigger>
                    <TabsTrigger value="crypto" className="text-xs">Crypto</TabsTrigger>
                    <TabsTrigger value="stocks" className="text-xs">Stocks</TabsTrigger>
                    <TabsTrigger value="forex" className="text-xs">FX</TabsTrigger>
                  </TabsList>
                </Tabs>
                <WatchlistPanel
                  symbols={watchlistSymbols}
                  currentSymbol={currentSymbol.symbol}
                  favorites={favorites}
                  onSelectSymbol={handleSymbolChange}
                  onToggleFavorite={toggleFavorite}
                />
              </>
            )}

            {activeSidebarPanel === 'indicators' && (
              <div className="flex-1 overflow-y-auto p-3 space-y-4">
                <div className="space-y-2 rounded-md border border-border p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">SMA</p>
                      <p className="text-xs text-muted-foreground">Simple Moving Average</p>
                    </div>
                    <Switch
                      checked={indicators.sma.enabled}
                      onCheckedChange={(checked) => setCoreIndicatorEnabled('sma', checked)}
                    />
                  </div>
                  {indicators.sma.enabled && (
                    <div className="flex flex-wrap gap-1">
                      {[5, 10, 20, 50, 100, 200].map((period) => (
                        <Button
                          key={`sma-${period}`}
                          variant={indicators.sma.period === period ? 'secondary' : 'ghost'}
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => setCoreIndicatorPeriod('sma', period)}
                        >
                          {period}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2 rounded-md border border-border p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">EMA</p>
                      <p className="text-xs text-muted-foreground">Exponential Moving Average</p>
                    </div>
                    <Switch
                      checked={indicators.ema.enabled}
                      onCheckedChange={(checked) => setCoreIndicatorEnabled('ema', checked)}
                    />
                  </div>
                  {indicators.ema.enabled && (
                    <div className="flex flex-wrap gap-1">
                      {[5, 10, 20, 50, 100, 200].map((period) => (
                        <Button
                          key={`ema-${period}`}
                          variant={indicators.ema.period === period ? 'secondary' : 'ghost'}
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => setCoreIndicatorPeriod('ema', period)}
                        >
                          {period}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2 rounded-md border border-border p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">RSI</p>
                      <p className="text-xs text-muted-foreground">Relative Strength Index</p>
                    </div>
                    <Switch
                      checked={indicators.rsi.enabled}
                      onCheckedChange={(checked) => setCoreIndicatorEnabled('rsi', checked)}
                    />
                  </div>
                  {indicators.rsi.enabled && (
                    <div className="flex flex-wrap gap-1">
                      {[7, 14, 21, 28].map((period) => (
                        <Button
                          key={`rsi-${period}`}
                          variant={indicators.rsi.period === period ? 'secondary' : 'ghost'}
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => setCoreIndicatorPeriod('rsi', period)}
                        >
                          {period}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2 rounded-md border border-border p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">MACD</p>
                      <p className="text-xs text-muted-foreground">Momentum oscillator</p>
                    </div>
                    <Switch
                      checked={indicators.macd?.enabled ?? false}
                      onCheckedChange={setMacdEnabled}
                    />
                  </div>
                </div>

                <div className="space-y-2 rounded-md border border-border p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Bollinger Bands</p>
                      <p className="text-xs text-muted-foreground">Volatility bands</p>
                    </div>
                    <Switch
                      checked={indicators.bollinger?.enabled ?? false}
                      onCheckedChange={setBollingerEnabled}
                    />
                  </div>
                  {indicators.bollinger?.enabled && (
                    <>
                      <div className="flex flex-wrap gap-1">
                        {[10, 20, 30, 50].map((period) => (
                          <Button
                            key={`bb-period-${period}`}
                            variant={indicators.bollinger?.period === period ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => setBollingerPeriod(period)}
                          >
                            P{period}
                          </Button>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {[1, 1.5, 2, 2.5, 3].map((std) => (
                          <Button
                            key={`bb-std-${std}`}
                            variant={indicators.bollinger?.stdDev === std ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => setBollingerStdDev(std)}
                          >
                            x{std}
                          </Button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {activeSidebarPanel === 'news' && (
              <div className="flex flex-1 items-center justify-center p-6 text-center">
                <div>
                  <Newspaper className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">News Panel</p>
                  <p className="text-xs text-muted-foreground">Next step: live news feed integration.</p>
                </div>
              </div>
            )}

            {activeSidebarPanel === 'orders' && (
              <div className="flex flex-1 items-center justify-center p-6 text-center">
                <div>
                  <ClipboardList className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">Orders Panel</p>
                  <p className="text-xs text-muted-foreground">Next step: broker/order API integration.</p>
                </div>
              </div>
            )}
          </aside>
        )}

        {/* Main Chart Area */}
        <main className="flex-1 flex flex-col overflow-hidden bg-background">
          {/* Drawing Toolbar (if active) */}
          {showDrawingToolbar && (
            <DrawingToolbar />
          )}

          {/* Chart */}
          <div className="flex-1 min-h-0">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
              </div>
            ) : candleData.length > 0 ? (
              <TradingChart 
                candleData={candleData}
                indicators={indicators}
                isDarkMode={isDarkMode}
                chartType={chartType}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No data available</p>
              </div>
            )}
          </div>

          {/* Bottom Panel - Stats */}
          <div className="h-28 border-t border-border bg-card/30 p-2">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 h-full">
              <Card className="bg-background/50 border-border">
                <CardHeader className="p-2 pb-0">
                  <CardTitle className="text-xs font-medium text-muted-foreground">Price</CardTitle>
                </CardHeader>
                <CardContent className="p-2 pt-0">
                  <div className="text-base font-bold">{formatPrice(stats.lastPrice)}</div>
                </CardContent>
              </Card>

              <Card className="bg-background/50 border-border">
                <CardHeader className="p-2 pb-0">
                  <CardTitle className="text-xs font-medium text-muted-foreground">24h Change</CardTitle>
                </CardHeader>
                <CardContent className="p-2 pt-0">
                  <div className={`text-base font-bold ${stats.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {stats.change >= 0 ? '+' : ''}{stats.percent.toFixed(2)}%
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-background/50 border-border">
                <CardHeader className="p-2 pb-0">
                  <CardTitle className="text-xs font-medium text-muted-foreground">24h High</CardTitle>
                </CardHeader>
                <CardContent className="p-2 pt-0">
                  <div className="text-base font-bold text-emerald-500">{formatPrice(stats.high24h)}</div>
                </CardContent>
              </Card>

              <Card className="bg-background/50 border-border">
                <CardHeader className="p-2 pb-0">
                  <CardTitle className="text-xs font-medium text-muted-foreground">24h Low</CardTitle>
                </CardHeader>
                <CardContent className="p-2 pt-0">
                  <div className="text-base font-bold text-red-500">{formatPrice(stats.low24h)}</div>
                </CardContent>
              </Card>

              <Card className="bg-background/50 border-border">
                <CardHeader className="p-2 pb-0">
                  <CardTitle className="text-xs font-medium text-muted-foreground">24h Volume</CardTitle>
                </CardHeader>
                <CardContent className="p-2 pt-0">
                  <div className="text-base font-bold">{formatVolume(stats.volume24h)}</div>
                </CardContent>
              </Card>

              <Card className="bg-background/50 border-border">
                <CardHeader className="p-2 pb-0">
                  <CardTitle className="text-xs font-medium text-muted-foreground">Data Source</CardTitle>
                </CardHeader>
                <CardContent className="p-2 pt-0">
                  <div className="text-base font-bold capitalize">Demo</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
