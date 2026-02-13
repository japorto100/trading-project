'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Volume2, 
  Clock,
  ChevronUp,
  ChevronDown,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { 
  IndicatorSettings,
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateMACD,
  calculateBollingerBands,
} from '@/lib/indicators';
import { ChartType } from '@/chart/types';

interface TradingChartProps {
  candleData: any[];
  indicators: IndicatorSettings;
  isDarkMode: boolean;
  chartType?: ChartType;
}

// Simple format helpers
const formatPrice = (price: number): string => {
  if (price < 0.01) return price.toFixed(6);
  if (price < 1) return price.toFixed(4);
  if (price < 100) return price.toFixed(2);
  return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatVolume = (volume: number): string => {
  if (volume >= 1e9) return (volume / 1e9).toFixed(2) + 'B';
  if (volume >= 1e6) return (volume / 1e6).toFixed(2) + 'M';
  if (volume >= 1e3) return (volume / 1e3).toFixed(2) + 'K';
  return volume.toString();
};

export function TradingChart({ 
  candleData, 
  indicators,
  isDarkMode,
  chartType = 'candlestick'
}: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const rsiChartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const rsiChartRef = useRef<any>(null);
  
  const [chartLoaded, setChartLoaded] = useState(false);
  const [chartError, setChartError] = useState<string | null>(null);
  
  const [hoveredPrice, setHoveredPrice] = useState<{
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    time: string;
  } | null>(null);

  const lastCandle = candleData[candleData.length - 1];
  const prevCandle = candleData[candleData.length - 2];
  const priceChange = lastCandle ? lastCandle.close - (prevCandle?.close || lastCandle.open) : 0;
  const priceChangePercent = prevCandle ? ((priceChange / prevCandle.close) * 100).toFixed(2) : '0.00';
  const isPositive = priceChange >= 0;

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Convert candleData to OHLCV format for indicators
  const ohlcvData = candleData.map(d => ({
    time: d.time,
    open: d.open,
    high: d.high,
    low: d.low,
    close: d.close,
    volume: d.volume,
  }));

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current || candleData.length === 0) return;

    let isMounted = true;

    const initChart = async () => {
      try {
        const lightweightCharts = await import('lightweight-charts');
        const { createChart, CrosshairMode, ColorType } = lightweightCharts;

        if (!isMounted) return;

        // Clean up existing chart
        if (chartRef.current) {
          chartRef.current.remove();
          chartRef.current = null;
        }
        if (rsiChartRef.current) {
          rsiChartRef.current.remove();
          rsiChartRef.current = null;
        }

        const backgroundColor = isDarkMode ? '#0f172a' : '#ffffff';
        const textColor = isDarkMode ? '#94a3b8' : '#475569';
        const gridColor = isDarkMode ? '#1e293b' : '#e2e8f0';

        // Main chart
        const chart = createChart(chartContainerRef.current, {
          layout: {
            background: { type: ColorType.Solid, color: backgroundColor },
            textColor: textColor,
          },
          grid: {
            vertLines: { color: gridColor },
            horzLines: { color: gridColor },
          },
          width: chartContainerRef.current.clientWidth,
          height: indicators.rsi.enabled ? 320 : 400,
          crosshair: {
            mode: CrosshairMode.Normal,
            vertLine: {
              color: isDarkMode ? '#3b82f6' : '#2563eb',
              width: 1,
              style: 2,
              labelBackgroundColor: isDarkMode ? '#3b82f6' : '#2563eb',
            },
            horzLine: {
              color: isDarkMode ? '#3b82f6' : '#2563eb',
              width: 1,
              style: 2,
              labelBackgroundColor: isDarkMode ? '#3b82f6' : '#2563eb',
            },
          },
          rightPriceScale: {
            borderColor: gridColor,
            scaleMargins: { top: 0.1, bottom: 0.15 },
          },
          timeScale: {
            borderColor: gridColor,
            timeVisible: true,
            secondsVisible: false,
          },
        });

        chartRef.current = chart;
        const addCandlestickSeriesCompat = (options: Record<string, unknown>) => {
          if (typeof chart.addCandlestickSeries === 'function') {
            return chart.addCandlestickSeries(options);
          }
          return chart.addSeries(lightweightCharts.CandlestickSeries, options);
        };
        const addAreaSeriesCompat = (options: Record<string, unknown>) => {
          if (typeof chart.addAreaSeries === 'function') {
            return chart.addAreaSeries(options);
          }
          return chart.addSeries(lightweightCharts.AreaSeries, options);
        };
        const addHistogramSeriesCompat = (options: Record<string, unknown>) => {
          if (typeof chart.addHistogramSeries === 'function') {
            return chart.addHistogramSeries(options);
          }
          return chart.addSeries(lightweightCharts.HistogramSeries, options);
        };
        const addLineSeriesCompat = (options: Record<string, unknown>) => {
          if (typeof chart.addLineSeries === 'function') {
            return chart.addLineSeries(options);
          }
          return chart.addSeries(lightweightCharts.LineSeries, options);
        };

        // Add series based on chart type
        let mainSeries: any;
        
        if (chartType === 'line' || chartType === 'area') {
          mainSeries = addAreaSeriesCompat({
            topColor: chartType === 'area' ? 'rgba(34, 197, 94, 0.4)' : 'transparent',
            bottomColor: chartType === 'area' ? 'rgba(34, 197, 94, 0)' : 'transparent',
            lineColor: '#22c55e',
            lineWidth: 2,
          });
          mainSeries.setData(candleData.map((d: any) => ({ time: d.time, value: d.close })));
        } else {
          // Candlestick (default, heikinashi, hollow)
          mainSeries = addCandlestickSeriesCompat({
            upColor: '#22c55e',
            downColor: '#ef4444',
            borderDownColor: '#ef4444',
            borderUpColor: '#22c55e',
            wickDownColor: '#ef4444',
            wickUpColor: '#22c55e',
          });

          // Transform data for Heikin Ashi
          if (chartType === 'heikinashi') {
            const haData = calculateHeikinAshi(candleData);
            mainSeries.setData(haData);
          } else {
            mainSeries.setData(candleData);
          }
        }

        // Volume series
        const volumeSeries = addHistogramSeriesCompat({
          color: '#3b82f6',
          priceFormat: { type: 'volume' },
          priceScaleId: '',
        });

        volumeSeries.priceScale().applyOptions({
          scaleMargins: { top: 0.85, bottom: 0 },
        });

        const volumeData = candleData.map((d: any) => ({
          time: d.time,
          value: d.volume,
          color: d.close >= d.open ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)',
        }));
        volumeSeries.setData(volumeData);

        // Add indicators
        // SMA
        if (indicators.sma.enabled) {
          const smaData = calculateSMA(ohlcvData, indicators.sma.period);
          if (smaData.length > 0) {
            const smaSeries = addLineSeriesCompat({
              color: '#3b82f6',
              lineWidth: 2,
              title: `SMA ${indicators.sma.period}`,
            });
            smaSeries.setData(smaData.map(d => ({ time: d.time, value: d.value })));
          }
        }

        // EMA
        if (indicators.ema.enabled) {
          const emaData = calculateEMA(ohlcvData, indicators.ema.period);
          if (emaData.length > 0) {
            const emaSeries = addLineSeriesCompat({
              color: '#f59e0b',
              lineWidth: 2,
              title: `EMA ${indicators.ema.period}`,
            });
            emaSeries.setData(emaData.map(d => ({ time: d.time, value: d.value })));
          }
        }

        // Bollinger Bands
        if (indicators.bollinger?.enabled) {
          const bb = calculateBollingerBands(ohlcvData, indicators.bollinger.period || 20, indicators.bollinger.stdDev || 2);
          
          const upperSeries = addLineSeriesCompat({
            color: '#8b5cf6',
            lineWidth: 1,
            title: 'BB Upper',
          });
          upperSeries.setData(bb.map(d => ({ time: d.time, value: d.upper })));
          
          const middleSeries = addLineSeriesCompat({
            color: '#8b5cf6',
            lineWidth: 1,
            lineStyle: 2,
          });
          middleSeries.setData(bb.map(d => ({ time: d.time, value: d.middle })));
          
          const lowerSeries = addLineSeriesCompat({
            color: '#8b5cf6',
            lineWidth: 1,
          });
          lowerSeries.setData(bb.map(d => ({ time: d.time, value: d.lower })));
        }

        // RSI Chart (separate)
        if (indicators.rsi.enabled && rsiChartContainerRef.current) {
          const rsiChart = createChart(rsiChartContainerRef.current, {
            layout: {
              background: { type: ColorType.Solid, color: backgroundColor },
              textColor: textColor,
            },
            grid: {
              vertLines: { color: gridColor },
              horzLines: { color: gridColor },
            },
            width: rsiChartContainerRef.current.clientWidth,
            height: 120,
            rightPriceScale: {
              borderColor: gridColor,
              scaleMargins: { top: 0.1, bottom: 0.1 },
            },
            timeScale: {
              borderColor: gridColor,
              visible: false,
            },
          });

          rsiChartRef.current = rsiChart;
          const addRsiLineSeriesCompat = (options: Record<string, unknown>) => {
            if (typeof rsiChart.addLineSeries === 'function') {
              return rsiChart.addLineSeries(options);
            }
            return rsiChart.addSeries(lightweightCharts.LineSeries, options);
          };

          const rsiData = calculateRSI(ohlcvData, indicators.rsi.period);
          if (rsiData.length > 0) {
            const rsiSeries = addRsiLineSeriesCompat({
              color: '#a855f7',
              lineWidth: 2,
            });
            rsiSeries.setData(rsiData.map(d => ({ time: d.time, value: d.value })));
          }

          // Sync time scales
          chart.timeScale().subscribeVisibleTimeRangeChange(() => {
            const range = chart.timeScale().getVisibleRange();
            if (range && rsiChartRef.current) {
              rsiChartRef.current.timeScale().setVisibleRange(range);
            }
          });
        }

        // Crosshair handler
        chart.subscribeCrosshairMove((param: any) => {
          if (!param.time || !param.seriesData) {
            setHoveredPrice(null);
            return;
          }

          const candlePoint = param.seriesData.get(mainSeries);
          const volumePoint = param.seriesData.get(volumeSeries);

          if (candlePoint && 'open' in candlePoint) {
            setHoveredPrice({
              open: candlePoint.open as number,
              high: candlePoint.high as number,
              low: candlePoint.low as number,
              close: candlePoint.close as number,
              volume: volumePoint && 'value' in volumePoint ? volumePoint.value as number : 0,
              time: formatTime(param.time as number),
            });
          }
        });

        chart.timeScale().fitContent();
        setChartLoaded(true);
        setChartError(null);

      } catch (error: any) {
        console.error('Chart init error:', error);
        setChartError(error.message || 'Failed to load chart');
      }
    };

    initChart();

    return () => {
      isMounted = false;
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
      if (rsiChartRef.current) {
        rsiChartRef.current.remove();
        rsiChartRef.current = null;
      }
    };
  }, [candleData, isDarkMode, indicators, chartType]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
      if (rsiChartContainerRef.current && rsiChartRef.current) {
        rsiChartRef.current.applyOptions({
          width: rsiChartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (chartError) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-900/50 rounded-lg">
        <div className="text-center p-8">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <p className="text-red-400 mb-2">Chart Error</p>
          <p className="text-slate-400 text-sm">{chartError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Price Header */}
      <div className="p-3 border-b border-border bg-card/30">
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">
                {hoveredPrice ? formatPrice(hoveredPrice.close) : formatPrice(lastCandle?.close || 0)}
              </span>
              <Badge className={isPositive ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}>
                {isPositive ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
                {isPositive ? '+' : ''}{priceChangePercent}%
              </Badge>
            </div>
          </div>

          {/* OHLCV */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">O</span>
              <span className="font-mono">{formatPrice(hoveredPrice?.open || lastCandle?.open || 0)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">H</span>
              <span className="font-mono text-emerald-500">{formatPrice(hoveredPrice?.high || lastCandle?.high || 0)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">L</span>
              <span className="font-mono text-red-500">{formatPrice(hoveredPrice?.low || lastCandle?.low || 0)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">C</span>
              <span className="font-mono">{formatPrice(hoveredPrice?.close || lastCandle?.close || 0)}</span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-1">
              <Volume2 className="h-3 w-3 text-muted-foreground" />
              <span className="font-mono">{formatVolume(hoveredPrice?.volume || lastCandle?.volume || 0)}</span>
            </div>
            {hoveredPrice && (
              <>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="font-mono text-muted-foreground">{hoveredPrice.time}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 relative min-h-0">
        {!chartLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 z-10">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 mx-auto mb-2 text-blue-500 animate-spin" />
              <p className="text-slate-400 text-sm">Loading chart...</p>
            </div>
          </div>
        )}
        <div ref={chartContainerRef} className="w-full h-full" />
      </div>

      {/* RSI */}
      {indicators.rsi.enabled && (
        <div className="h-[120px] border-t border-border">
          <div className="px-3 py-1 text-xs text-muted-foreground flex items-center gap-2">
            <Badge variant="outline" className="text-purple-500 border-purple-500/50">RSI({indicators.rsi.period})</Badge>
            <span className="font-mono">
              {(() => {
                const rsiData = calculateRSI(ohlcvData, indicators.rsi.period);
                const lastValue = rsiData[rsiData.length - 1]?.value;
                return lastValue ? lastValue.toFixed(2) : 'N/A';
              })()}
            </span>
            <span className="text-xs">(70 overbought, 30 oversold)</span>
          </div>
          <div ref={rsiChartContainerRef} className="w-full h-[90px]" />
        </div>
      )}
    </div>
  );
}

// Heikin Ashi calculation
function calculateHeikinAshi(data: any[]): any[] {
  const result: any[] = [];
  
  for (let i = 0; i < data.length; i++) {
    const d = data[i];
    
    if (i === 0) {
      result.push({
        time: d.time,
        open: d.open,
        high: d.high,
        low: d.low,
        close: (d.open + d.high + d.low + d.close) / 4,
      });
    } else {
      const prev = result[i - 1];
      const close = (d.open + d.high + d.low + d.close) / 4;
      const open = (prev.open + prev.close) / 2;
      
      result.push({
        time: d.time,
        open,
        high: Math.max(d.high, open, close),
        low: Math.min(d.low, open, close),
        close,
      });
    }
  }
  
  return result;
}

export default TradingChart;
